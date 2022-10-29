import { Constants } from "./Constants";
import { AttackerNode, GamePosition, Player } from "./GamePosition";
import { Graph, Node } from "./Graph";
import { ReactiveBisimilarityGame } from "./ReactiveBisimilarityGameController";

/**
 * this class is used to calculate the "optimal" next move
 * "optimal" because as long as the player doesn't make a wrong move, he will always win in a non reactive bisimilar LTS
 */
export class AI {
    
    /** copy of the game at initialization time */
    readonly game: ReactiveBisimilarityGame;

    /** to disable/reenable printing in console */
    private consoleLogSignature;
    /**graph of all branching game positions, with all predecessors and, with a number for whether game position vertex is in the winning region of attacker (1), or defender (0),
     * or a number [0,1] indicating how likely a player will blunder */
    private graph!: Graph<[GamePosition, Node<any>[], number]>;

    constructor(game: ReactiveBisimilarityGame) {
        this.game = game; //game.copy() as an option if we want to simulate a game, but then play has to be updated, when original game progresses
        this.consoleLogSignature = console.log;
    }

    /**
     * generate a graph with all possible game positions branching from the starting position in the lts @this.game.lts,
     * annotates each vertex with whether it is in the winning region of the attacker or not
     */
    generateGraph() {
        //game initialized?
        if(this.game.getPlay().length === 0) {
            this.printError("generateGraph: Cannot generate graph for uninitialized game")
            return
        } else {
            //construct graph
            this.graph = new Graph<[GamePosition, Node<any>[], number]>((a: [GamePosition, Node<any>[], number], b: [GamePosition, Node<any>[], number]) => {
                if(a[0] !== b[0]) { //comparator, removeNode when Gamepositions differ
                    return 1;
                }
                return 0;
            });
            let node = this.graph.addNode([this.game.getPlay()[0], [], 0]) //first node
            this.appendNodesRecursively(node)
        }
    }

        

    /**
     * used to generate game graph from an lts
     * @param node 
     * @returns 
     */
    private appendNodesRecursively(node: Node<[GamePosition, Node<any>[], number]>): void {
        if(this.graphHasNode(node.data[0])) {
            //generate moves
            let possibleMoves = this.game.possibleMoves(node.data[0], true);

            //create nodes for moves
            for(let i = 0; i < possibleMoves.length; i++) {
                //cycle detection/next node already in graph --> update predecessors of node and return to break cycle
                
                let graphNode = this.graphHasNode(possibleMoves[i]);
                if(graphNode !== undefined) {
                    //does predecessor list already contain previous node? only relevant when two nodes have multiple edges between them
                    if(graphNode.data[1].find((position) => (position.data[0].samePosition(node.data[0]))) === undefined) {
                        //if not, add it to predecessors
                        graphNode.data[1].push(node)
                        this.graph.addEdge(node.data, graphNode.data, "");
                    } 
                    //continue;
                //node not in graph --> add new node
                } else {
                    let predecessors: Node<[GamePosition, Node<any>[], number]>[] = [];
                    predecessors.push(node);
                    graphNode = this.graph.addNode([possibleMoves[i], predecessors, 0])
                    //add edge to move
                    this.graph.addEdge(node.data, graphNode.data, ""); //don't need edgeLabels
                    this.appendNodesRecursively(graphNode);
                }
            }
        } else {
            this.printError("appendNodesRecursively: Called function with node that doesn't exist.");
        }
    }

    private graphHasNode(move: GamePosition): Node<[GamePosition, Node<any>[], number]> | undefined {
        let nodes = this.graph.getNodes();
        let existing_node = nodes.find((node) => (node.data[0].samePosition(move)));
        return existing_node;
    }

    /**
     * 
     * @param position 
     * @returns true if in attacker winning region
     */
    getWinningRegionOfPosition(position?: GamePosition): boolean | undefined{
        if(this.graph !== undefined && this.game.getPlay().length > 0) {
            if(position == undefined) {
                position = this.game.getPlay()[this.game.getPlay().length - 1];
            }
            let node = this.graphHasNode(position);
            if(node !== undefined) {
                return Boolean(node.data[2])
            }
        }
        return undefined;
    }

    /**
     * Algorithm by Benjamin Bisping, see Master's Thesis "Computing Coupled Similarity" or sources in Bachelor's Thesis accompanying this software in github repository
     * Computes winning regions on game move graphs in simple games
     */
    determineWinningRegion() {
        //game graph is initialized
        if(this.graph !== undefined) {
            //recursion starts at defender nodes without winning moves
            let G_d = this.graph.getNodes().sort((a, b) => a.adjacent.length - b.adjacent.length).filter(node => (node.data[0].activePlayer === Player.Defender));
            let num_map = new Map<Node<[GamePosition, Node<any>[], number]>, number>();

            //init num_map and reset nodes
            for(let i = 0; i < G_d.length; i++) {
                num_map.set(G_d[i], G_d[i].adjacent.length);
                G_d[i].data[2] = 0;
            }

            //iterate through nodes
            for(let i = 0; i < G_d.length; i++) {
                if(num_map.get(G_d[i]) === 0) {
                    this.propagateAttackerWin(G_d[i], num_map);
                }
            }
        }
    }

    /**
     * called in determineWinningRegion() algorithm to propagate the attacker winning region in the game graph
     * @param node 
     * @param num_map 
     */
    private propagateAttackerWin(node: Node<[GamePosition, Node<any>[], number]>, num_map: Map<Node<[GamePosition, Node<any>[], number]>, number>) {    //TODO: delete defender winning region from args
        if(node.data[2] === 0) {
            //set node to attacker winning region
            node.data[2] = 1;

            //for all predecessors of node
            for(let j = 0; j < node.data[1].length; j++) {
                let predecessor = this.graphHasNode(node.data[1][j].data[0]);
                if(predecessor !== undefined) {
                    num_map.set(predecessor, num_map.get(predecessor)! - 1);

                    //if predecessor is in attacker winning region or current player is attacker
                    if(predecessor.data[0].activePlayer === Player.Attacker || num_map.get(predecessor) === 0) {
                        //propagate attacker region up
                        this.propagateAttackerWin(predecessor, num_map);
                    }
                } else {
                    this.printError("propagateAttackerWin: undefined predecessor (not in num_map)")
                }
            }
        }
    }

    /**
     * performs breadths first search and returns shortest path to defender winning region node
     * requires winning region algorithm to be performed before
     * @param curPosition 
     * @returns (nearest defender winning region node, predecessor path, distance to source)
     */
    private modifiedBfs(curPosition?: GamePosition): [Node<any>, Map<Node<any>, Node<any>>, Map<Node<any>, number>] | undefined {
        if(this.graph !== undefined) {

            let nodes = this.graph.getNodes();

            //graph contains position
            if(curPosition === undefined) {
                curPosition = this.game.getPlay()[0];
            }
            let sourceNode = nodes.find(node => (node.data[0].samePosition(curPosition!)))
            if(sourceNode === undefined || sourceNode.adjacent.length === 0) {
                return undefined;
            }
            

            //initiate
            let visited = new Map<Node<[GamePosition, Node<any>[], number]>, boolean>();
            let dist = new Map<Node<[GamePosition, Node<any>[], number]>, number>();
            let pred = new Map<Node<[GamePosition, Node<any>[], number]>, Node<[GamePosition, Node<any>[], number]>>(); //construct path from destination to source

            let queue: Node<[GamePosition, Node<any>[], number]>[] = [];

            //all vertices unvisited, path not yet constructed
            for(let i = 0; i < nodes.length; i++) {
                dist.set(nodes[i], -1);
                visited.set(nodes[i], false);
                pred.set(nodes[i], undefined!);
            }

            //start bfs at source
            visited.set(sourceNode, true);
            dist.set(sourceNode, 0);
            queue.push(sourceNode);

            while(queue.length !== 0) {
                let current = queue.shift()!;

                //for every neighbor
                for(let i = 0; i < current.adjacent.length; i++) {
                    let visited_neighbor_yet = visited.get(current.adjacent[i].node);
                    if(visited_neighbor_yet !== undefined) {
                        if(!visited_neighbor_yet) {
                            visited.set(current.adjacent[i].node, true);    //visited node
                            dist.set(current.adjacent[i].node, dist.get(current)! + 1); //update dist
                            pred.set(current.adjacent[i].node, current);    //update predecessor on shortest path

                            //found node in defender winning region
                            if(current.adjacent[i].node.data[2] === 0) {
                                return [current.adjacent[i].node, pred, dist]
                            }

                            queue.push(current.adjacent[i].node);
                        } else {
                            dist.set(current.adjacent[i].node, Infinity)    //TODO: this isnt categorically a cycle
                            //reached starting node of bfs, which has no predecessor
                            if(pred.get(current.adjacent[i].node) === undefined) {
                                pred.set(current.adjacent[i].node, current);
                            }
                        }
                    } else {
                        this.printError("modifiedBfs: visited list returned undefined node")
                    }
                }
            }

            //if no winning region node was found, return the longest path, doesn't count cycles as infinity
            let max_node = sourceNode;
            let dist_array = Array.from(dist.entries());

            for(let i = 0; i < dist.size; i++) {
                if(dist.get(max_node)! < dist_array[i][1]) {
                    max_node = dist_array[i][0];
                }
            }
            return [max_node, pred, dist];
        } else {
            this.printError("modifiedBfs: graph uninitialized")
        }
        return undefined;
    }


    /**
     * calculate the next "best" move for the defender
     * @returns undefined if there is no next move
     */
     getNextMove(curPosition?: GamePosition): GamePosition | undefined {
        if(curPosition === undefined && this.game.getPlay().length > 0) {
            curPosition = this.game.getPlay()[this.game.getPlay().length - 1];
        }

        if(curPosition === undefined) {
            this.printError("getNextMove: current Position undefined")
            return undefined;
        }

        let node = this.graphHasNode(curPosition);

        if(node === undefined) {
            return undefined;
        }
        
        //in attacker winning region
        if(Boolean(node.data[2]) === true && node.adjacent.length > 0) {
            let path = this.launchModifiedMinMax(curPosition);
            if(path !== undefined && path.length > 1) { //first element of path is current node
                return path[1];
            } else {
                this.printError("getNextMove: minimax returned undefined path. Choosing move at random...")
                let random_number = Math.floor(Math.random() * (node.adjacent.length));
                return node.adjacent[random_number].node.data[0];  //return "random" node
            }

        //defender winning region
        } else if(Boolean(node.data[2]) === false && node.adjacent.length > 0) {
            //pick move that is also in defender winning region
            let moves = [];
            for(let i = 0; i < node.adjacent.length; i++) {
                if(Boolean(node.adjacent[i].node.data[2]) === false) {
                    moves.push(node.adjacent[i].node.data[0]);
                }
            }

            if(moves.length === 0) {
                this.printError("getNextMoves: modifiedMiniMax returned undefined, current in defender winning region but no defender winning region neighbour, this should be impossible")
                let random_number = Math.floor(Math.random() * (node.adjacent.length));
                return node.adjacent[random_number].node.data[0];
            } else {
                let random_number = Math.floor(Math.random() * (moves.length));
                return moves[random_number];
            }
        }

        //no move --> return undefined
        console.log("getNextMove: could not find any next move")
        return undefined;

        /* OLD BFS CODE
         let bfs_result = this.modifiedBfs(curPosition);
        if(bfs_result !== undefined && bfs_result[0] !== undefined) {
            //traverse graph on path until pred === current position 
            let current = bfs_result[0] as Node<[GamePosition, Node<any>[], number]>;
            let path: Node<[GamePosition, Node<any>[], number]>[] = []; //path from destination to source (curPosition)
            let visited_starting_node = false;
            while(current !== undefined) {
                path.push(current);
                current = bfs_result[1].get(current)!;
                //if destination is source (cycle), build path but break the cycle when reaching node again
                if(current !== undefined && current.data[0].samePosition(curPosition)) {    
                    if(visited_starting_node) {
                        path.push(current);
                        break;
                    } else {
                        visited_starting_node = true;
                    }
                }
            }
            //console.log("AI: Current node: " + curPosition.toString() + ", path: " + this.getShortestPathString(path));  // TODO: Delete debug
            return path[path.length - 2].data[0];
        } else {
            //return any node if bfs results in undefined, shouldn't happen though hahaaaa
            let node = this.graphHasNode(curPosition);
            if(node !== undefined && node.adjacent.length > 0) {
                let random_number = Math.floor(Math.random() * (node.adjacent.length));
                this.printError("getNextMove: bfs returned undefined but there are adjacent nodes");
                return node.adjacent[random_number].node.data[0];  //return "random" node
            }

            //no move --> return undefined
            console.log("getNextMove: could not find any next move")
            return undefined;
        } */
    }


    private getShortestPathString(path: Node<[GamePosition, Node<any>[], number]>[]): string {
        let path_string = "";
        for(let i = 0; i < path.length; i++) {
            path_string = path_string.concat(path[i].data[0].toString() + ", ");
        }
        return path_string;
    }

    /**
     * gets shortest path to attacker winning region leaf node given that the defender tries to delay the attacker as much as possible
     * requires defender winning region algorithm to be performed beforehand
     * @param curPosition 
     * @returns 
     */
    launchModifiedMinMax(curPosition?: GamePosition): GamePosition[] | undefined {
        if(this.graph !== undefined) {

            let nodes = this.graph.getNodes();

            //graph contains position
            if(curPosition === undefined) {
                curPosition = this.game.getPlay()[0];
            }
            let sourceNode = nodes.find(node => (node.data[0].samePosition(curPosition!)))
            if(sourceNode === undefined || sourceNode.adjacent.length === 0) {
                return undefined;
            }


            let callpath: Node<[GamePosition, Node<any>[], number]>[] = [];

            /* let shortestWorstCasePath = this.minMaxAttackerCost(sourceNode, callpath);
            console.log("ShortestMinMaxPath moves number: " +  shortestWorstCasePath) */

            let minMaxResult = this.minMax(sourceNode, callpath);
            let gamepos_path = [];
            for(let i = 0; i < minMaxResult.path.length; i++) {
                if(minMaxResult.path[i] !== undefined) {
                    gamepos_path.push(minMaxResult.path[i].data[0]);
                } else {
                    gamepos_path.push(undefined);
                }
            }

            return gamepos_path.reverse();
        } else {
            this.printError("modifiedMinMax: graph uninitialized")
        }
        return undefined;
    }

    /**
     * returns the total number of game moves on the (optimal) shortest path to a attacker winning region leaf if the defender tries to delay the attacker as much as possible (worst case)
     * @param node 
     * @param path 
     * @returns 
     */
    private minMax(node: Node<[GamePosition, Node<any>[], number]>, path: Node<[GamePosition, Node<any>[], number]>[]): {cost: number, path: Node<any>[]} {
        //node in current expansion path, cycle
        if(path.find((entry) => (entry.data[0].samePosition(node.data[0])))) {
            return {cost: Infinity, path: []}
        }
        //leaf
        if(node.adjacent.length === 0) {
            let pth = [];
            pth.push(node)
            return {cost: 1, path: pth};   //0 + dist to previous node
        }

        //maximizing player - defender
        if(node.data[0].activePlayer === Player.Defender) {
            let maxEval = 0;
            let bestPath: Node<any>[] = [];
            for(let i = 0; i < node.adjacent.length; i++) {
                //child in defender winning region, probably unreachable
                if(Boolean(node.adjacent[i].node.data[2]) === false) {
                    continue;
                }
                path.push(node);
                let tmpeval = this.minMax(node.adjacent[i].node, path);
                path.pop();
                if(tmpeval.cost > maxEval) {
                    maxEval = tmpeval.cost;
                    bestPath = tmpeval.path;
                }
            }
            bestPath.push(node);
            return {cost: maxEval + 1, path: bestPath};
    
        //minimizing player - attacker
        } else if(node.data[0].activePlayer === Player.Attacker) {
            let minEval = Infinity;
            let bestPath: Node<any>[] = [];
            for(let i = 0; i < node.adjacent.length; i++) {
                //child in defender winning region, skip
                if(Boolean(node.adjacent[i].node.data[2]) === false) {
                    continue;
                }
                path.push(node);
                let tmpeval = this.minMax(node.adjacent[i].node, path);
                path.pop();
                if(tmpeval.cost < minEval) {
                    minEval = tmpeval.cost;
                    bestPath = tmpeval.path                    
                }
            }
            bestPath.push(node)
            return {cost: minEval + 1, path: bestPath};
        } else {
            this.printError("minMax: error occured that should not be possible :D")
            return {cost: -1, path: []};
        }
    }


    /**
     * returns the optimal number of moves the attacker has to perform to win the game if the defender tries to maximize this number
     * @param node 
     * @param path 
     * @returns 
     */
    private minMaxAttackerCost(node: Node<[GamePosition, Node<any>[], number]>, path: Node<[GamePosition, Node<any>[], number]>[]): number {
        //node in current expansion path, cycle
        if(path.find((entry) => (entry.data[0].samePosition(node.data[0])))) {
            return Infinity
        }
        //leaf
        if(node.adjacent.length === 0) {
            //only count attacker moves
            if(node.data[0].activePlayer === Player.Attacker) {
                return 1;   //useless case as not explored by the algorithm
            } else {
                return 0;
            }
        }

        //maximizing player - defender
        if(node.data[0].activePlayer === Player.Defender) {
            let maxEval = 0;
            for(let i = 0; i < node.adjacent.length; i++) {
                //child in defender winning region, probably unreachable
                if(Boolean(node.adjacent[i].node.data[2]) === false) {
                    continue;
                }
                path.push(node);
                let tmpeval = this.minMaxAttackerCost(node.adjacent[i].node, path);
                path.pop();
                if(tmpeval > maxEval) {
                    maxEval = tmpeval;
                }
            }
            return maxEval;
    
        //minimizing player - attacker
        } else if(node.data[0].activePlayer === Player.Attacker) {
            let minEval = Infinity;
            for(let i = 0; i < node.adjacent.length; i++) {
                //child in defender winning region, skip
                if(Boolean(node.adjacent[i].node.data[2]) === false) {
                    continue;
                }
                path.push(node);
                let tmpeval = this.minMaxAttackerCost(node.adjacent[i].node, path);
                path.pop();
                if(tmpeval < minEval) {
                    minEval = tmpeval;
                }
            }
            return minEval + 1;
        } else {
            this.printError("minMax: error occured that should not be possible :D")
            return -1;
        }
    }



     /**
     * performs breadths first search and returns shortest paths to attacker winning region leafs
     * requires winning region algorithm to be performed before
     * DOESNT TAKE INTO ACCOUNT DEFENDERS CHOICES AND THEREFORE IS A BAD IMPLEMENTATION
     * @param curPosition 
     * @returns (Array of winning leafs, predecessor path, distance to source)
     */
      private BFS_attacker(curPosition?: GamePosition): [Node<any>[], Map<Node<any>, Node<any>>, Map<Node<any>, number>] | undefined {
        if(this.graph !== undefined) {

            let nodes = this.graph.getNodes();

            //graph contains position
            if(curPosition === undefined) {
                curPosition = this.game.getPlay()[0];
            }
            let sourceNode = nodes.find(node => (node.data[0].samePosition(curPosition!)))
            if(sourceNode === undefined || sourceNode.adjacent.length === 0) {
                return undefined;
            }
            

            //initiate
            let visited = new Map<Node<[GamePosition, Node<any>[], number]>, boolean>();
            let dist = new Map<Node<[GamePosition, Node<any>[], number]>, number>();
            let pred = new Map<Node<[GamePosition, Node<any>[], number]>, Node<[GamePosition, Node<any>[], number]>>(); //construct path from destination to source

            let queue: Node<[GamePosition, Node<any>[], number]>[] = [];
            let winning_leafs: Node<any>[] = [];

            //all vertices unvisited, path not yet constructed
            for(let i = 0; i < nodes.length; i++) {
                dist.set(nodes[i], -1);
                visited.set(nodes[i], false);
                pred.set(nodes[i], undefined!);
            }

            //start bfs at source
            visited.set(sourceNode, true);
            dist.set(sourceNode, 0);
            queue.push(sourceNode);

            while(queue.length !== 0) {
                let current = queue.shift()!;

                if(current.adjacent.length === 0 && Boolean(current.data[2]) === true) {
                    winning_leafs.push(current);
                }

                //for every neighbor
                for(let i = 0; i < current.adjacent.length; i++) {
                    let visited_neighbor_yet = visited.get(current.adjacent[i].node);
                    if(visited_neighbor_yet !== undefined) {
                        if(!visited_neighbor_yet) {
                            visited.set(current.adjacent[i].node, true);    //visited node
                            dist.set(current.adjacent[i].node, dist.get(current)! + 1); //update dist
                            pred.set(current.adjacent[i].node, current);    //update predecessor on shortest path
                            queue.push(current.adjacent[i].node);

                        } else {
                            //reached starting node of bfs, which has no predecessor
                            if(pred.get(current.adjacent[i].node) === undefined) {
                                pred.set(current.adjacent[i].node, current);
                            }
                        }
                    } else {
                        this.printError("Bfs_attacker: visited list returned undefined node")
                    }
                }
            }

            return [winning_leafs, pred, dist];
        } else {
            this.printError("Bfs_attacker: graph uninitialized")
        }
        return undefined;
    }

    /** method doesnt return desired solution, always chooses optimal path for the attacker even if the defender wouldnt choose same path
     * returns shortest path of moves in which the player can win in
     */
     getShortestPathFromBfs(curPosition?: GamePosition): Node<any>[] | undefined {
        if(curPosition === undefined && this.game.getPlay().length > 0) {
            curPosition = this.game.getPlay()[this.game.getPlay().length - 1];
        }

        let bfs_result = this.BFS_attacker(curPosition);
        if(bfs_result !== undefined) {
            let winning_leafs = bfs_result[0];
            let dist_map = bfs_result[2];
            let min = Infinity;
            let index = -1;

            //get min path
            for(let i = 0; i < winning_leafs.length; i++) {
                if(dist_map.get(winning_leafs[i])! < min) {
                    index = i;
                    min = dist_map.get(winning_leafs[i])!;
                }
            }

            //build path
            let path = [];
            let current = winning_leafs[index];
            let pred_map = bfs_result[1];
            while(true) {
                path.push(current);
                if(current.data[0].samePosition(curPosition)) {
                    break;
                }
                current = pred_map.get(current)!;
            }
            
            return path;
        }
        return undefined;
    }


    private max(val0: number, val1: number) {
        if(val0 > val1) {
            return val0;
        } else {
            return val1;
        }
    }

    private min(val0: number, val1: number) {
        if(val0 <= val1) {
            return val0;
        } else {
            return val1;
        }
    }
    
    printGraph() {
        console.log("-------------------- GAME MOVE GRAPH --------------------")
        console.log("Graph: <Vertex>: <(edgeLabel, destinationNode)> ...");
        this.graph.getNodes().forEach((node) => {
            let edgestring = "Vertex " + node.data[0].toString() + ", score = " + node.data[2] + ": ";
            for(let j = 0; j < node.adjacent.length; j++) {
                edgestring = edgestring.concat(node.adjacent[j].node.data[0].toString(), ", ");
            }
            //print predecessors 
            edgestring = edgestring.concat("            predecessors: ")
            for(let j = 0; j < node.data[1].length; j++) {
                edgestring = edgestring.concat(node.data[1][j].data[0].toString() + ", ");
            }
            console.log(edgestring);
        })
    }

    private disableConsole() {
        console.log = () => {};
    }

    private enableConsole() {
        console.log = this.consoleLogSignature;
    }

    /**
     * 
     * @param error throws an error message that prints in red to the console
     */
     printError(error: string) {
        try {
            throw(error);
        } catch (error) {
            console.log(error);
        }
    }
}
    
    


/**---------------------------------------------- GARBAGE COLLECTION OF OLD ALGORITHMS TO STEAL CODE FROM  ----------------------------------------------**/

/**
     * Dijkstra calculates the distance to each node in game graph
     * @param startingPosition 
     * @returns 
     */
 /* private dijkstra(startingPosition: GamePosition): Map<GamePosition, number> | undefined {
    //graph initialized
    if(this.graph !== undefined) {
        let startingNode = this.graphHasNode(startingPosition);
        if(startingNode === undefined) {
            return undefined;
        }

        //initiate
        let dist_map = new Map<GamePosition, number>(); //contains distances for each node in game graph
        let queue: Node<[GamePosition, Node<any>[], number]>[] = [];
        let nodes = this.graph.getNodes();
        for(let i = 0; i < nodes.length; i++) {
            if(nodes[i] === startingNode) {
                dist_map.set(startingNode.data[0], 0);
            } else {
                dist_map.set(nodes[i].data[0], Infinity);
            }
            queue.push(nodes[i]);
        }

        //iterate through queue to visit nodes
        while(queue.length !== 0) {
            //get node with minimum distance to the destination
            let minIndex = 0;
            for(let i = 1; i < queue.length; i++) {
                if(dist_map.get(queue[i].data[0])! < dist_map.get(queue[minIndex].data[0])!) {
                    minIndex = i;
                }
            }
            let minNode = queue.splice(minIndex, 1)[0];

            //for every neighbor that is still in queue
            for(let i = 0; i < minNode.adjacent.length; i++) {
                let neighbor = minNode.adjacent[i].node;
                //if neighbor has not yet been removed from queue
                if(queue.some(node => (node.data[0].samePosition(neighbor.data[0])))) {
                    let alt = dist_map.get(minNode.data[0])! + 1;   //edges are all 1
                    if(alt < dist_map.get(neighbor.data[0])!) {
                        dist_map.set(neighbor.data[0], alt);
                    }
                }
            }
        }

        return dist_map;
    }
    return undefined
} */

/* private propagatePathCost(leaf_node: Node<[GamePosition, Node<any>[], number]>, pred: Map<Node<[GamePosition, Node<any>[], number]>, Node<[GamePosition, Node<any>[], number]>>, succ_values: Map<Node<[GamePosition, Node<any>[], number]>, {bestValue: number, attackerWinningRegion: boolean, successors: {node: Node<any>, cost: number, attackerWinningRegion: boolean}[]}>) {
    let successor = leaf_node
    let current = pred.get(leaf_node)!;
    let node_entry = succ_values.get(leaf_node);

    let debug = []
    debug.push(leaf_node.data[0].toString()); //TODO:remove debug

    if(node_entry === undefined) {
        this.printError("propagatePathCost: called with undefined leaf node");
        return;
    }
    
    while(current !== undefined) {

        debug.push(current.data[0].toString())  //TODO: remove debug

        let successor_values_to_update_with = succ_values.get(successor)!;
        let succ_list = succ_values.get(current)!.successors;
        let succ_entry = succ_list.find((succ) => (succ.node.data[0].samePosition(successor.data[0])));
        //successor not in list
        if(succ_entry === undefined) {
            succ_list.push({node: successor, cost: successor_values_to_update_with.bestValue, attackerWinningRegion: successor_values_to_update_with.attackerWinningRegion})
        //update values
        } else {
            succ_entry.cost = successor_values_to_update_with.bestValue;
            succ_entry.attackerWinningRegion = successor_values_to_update_with.attackerWinningRegion;
        }

        //if the new path changed anything in the current node's evaluation, propagate further
        let best_changed = this.updateBest(succ_values, current);
        if(!best_changed) {
            break;
        }

        successor = current;
        current = pred.get(current)!;
    }
    console.log(debug); //TODO: remove debug
    
    let tmp = "last updated node: "
    let tmp_result = succ_values.get(successor)!;
    tmp = tmp.concat(successor.data[0].toString() + " = bestValue: " + tmp_result.bestValue + ", attackerWinning: " + tmp_result.attackerWinningRegion + ", successors(" + tmp_result.successors.length + "): ")
    let succ_list = tmp_result.successors
    for(let j = 0; j < succ_list.length; j++) {
        tmp = tmp.concat("node: " + succ_list[j].node.data[0].toString() + ", cost: " + succ_list[j].cost + ", winning: " + succ_list[j].attackerWinningRegion + " | ")
    }
    console.log(tmp)
} */

/* private updateBest(succ_values: Map<Node<[GamePosition, Node<any>[], number]>, {bestValue: number, attackerWinningRegion: boolean, successors: {node: Node<any>, cost: number, attackerWinningRegion: boolean}[]}>, current: Node<[GamePosition, Node<any>[], number]>): boolean {
    let current_succ_entry = succ_values.get(current)!;
    let curBest = current_succ_entry.bestValue;
    let curWinning = current_succ_entry.attackerWinningRegion;
    let succ_list = current_succ_entry.successors;

    let atk_win = succ_list.filter(succ => (succ.attackerWinningRegion === true));
    let def_win = succ_list.filter(succ => (succ.attackerWinningRegion === false))

    //minimizing player
    if(current.data[0].activePlayer === Player.Attacker) {

        if(atk_win.length > 0) {
            //find min value
            let min = atk_win[0].cost;
            for(let i = 1; i < atk_win.length; i++) {
                if(atk_win[i].cost < min) {
                    min = atk_win[i].cost;
                }
            }
            current_succ_entry.bestValue = min;
            current_succ_entry.attackerWinningRegion = true;
        } else {
            if(def_win.length === 0) {
                this.printError("updateBest: no successors in list")
                return false
            }
            let min = def_win[0].cost;
            for(let i = 1; i < def_win.length; i++) {
                if(def_win[i].cost < min) {
                    min = def_win[i].cost;
                }
            }
            current_succ_entry.bestValue = min;
            current_succ_entry.attackerWinningRegion = false;
        }
    //maximizing player
    } else {
        if(def_win.length > 0) {
            //find max value
            let max = def_win[0].cost;
            for(let i = 1; i < def_win.length; i++) {
                if(def_win[i].cost > max) {
                    max = def_win[i].cost;
                }
            }
            current_succ_entry.bestValue = max;
            current_succ_entry.attackerWinningRegion = false;
        } else {
            if(atk_win.length === 0) {
                this.printError("updateBest: no successors in list")
                return false
            }
            let max = atk_win[0].cost;
            for(let i = 1; i < atk_win.length; i++) {
                if(atk_win[i].cost > max) {
                    max = atk_win[i].cost;
                }
            }
            current_succ_entry.bestValue = max;
            current_succ_entry.attackerWinningRegion = true;
        }
    }

    //check if something changed
    if(curBest !== current_succ_entry.bestValue || curWinning !== current_succ_entry.attackerWinningRegion) {
        return true;
    }
    return false;
} */

/* private minMaxBfs(curPosition?: GamePosition) {
    console.log("---------------MINMAX Debug----------------")
    if(this.graph !== undefined) {

        let nodes = this.graph.getNodes();

        //graph contains position
        if(curPosition === undefined) {
            curPosition = this.game.getPlay()[0];
        }
        let sourceNode = nodes.find(node => (node.data[0].samePosition(curPosition!)))
        if(sourceNode === undefined || sourceNode.adjacent.length === 0) {
            return undefined;
        }

        //initiate
        let visited = new Map<Node<[GamePosition, Node<any>[], number]>, boolean>();
        let dist = new Map<Node<[GamePosition, Node<any>[], number]>, number>();
        //let curBestPath = new Map<Node<[GamePosition, Node<any>[], number]>, [number, boolean, Node<any>]>(); //maps to current best path length, if the path leads to an attacker winning region leaf and the next adjacent node on this path
        let curBestPath = new Map<Node<[GamePosition, Node<any>[], number]>, {bestValue: number, attackerWinningRegion: boolean, successors: {node: Node<any>, cost: number, attackerWinningRegion: boolean}[]}>();
        let pred = new Map<Node<[GamePosition, Node<any>[], number]>, Node<[GamePosition, Node<any>[], number]>>(); //construct path from destination to source

        //all vertices unvisited, path not yet constructed
        for(let i = 0; i < nodes.length; i++) {
            dist.set(nodes[i], -1);
            visited.set(nodes[i], false);
            pred.set(nodes[i], undefined!);
            let succ_list: {node: Node<any>, cost: number, attackerWinningRegion: boolean}[] = []
            curBestPath.set(nodes[i], {bestValue: -1, attackerWinningRegion: Boolean(nodes[i].data[2]), successors: succ_list});
        }

        //start bfs at source
        visited.set(sourceNode, true);
        dist.set(sourceNode, 0);

        let queue: Node<[GamePosition, Node<any>[], number]>[] = [];
        queue.push(sourceNode);

        while(queue.length !== 0) {
            let current = queue.shift()!;

            //leaf
            if(current!.adjacent.length === 0 && current!.data[2] === 1) {
                console.log("bfs: leaf case " + current.data[0].toString() + ", dist: " + dist.get(current));
                //curBestPath.set(current, [dist.get(current)!, Boolean(current.data[2]), current]);
                curBestPath.set(current, {bestValue: dist.get(current)!, attackerWinningRegion: Boolean(current.data[2]), successors: []});
                this.propagatePathCost(current, pred, curBestPath);
                continue;
            }
            //in defender winning region
            else if(current!.data[2] === 0) {
                console.log("bfs: defender winning region case " + current.data[0].toString() + ", dist: " + dist.get(current))
                //dist.set(current!, Infinity);
                //curBestPath.set(current, [Infinity, Boolean(current.data[2]), current]);
                curBestPath.set(current, {bestValue: dist.get(current)!, attackerWinningRegion: false, successors: []});
                this.propagatePathCost(current, pred, curBestPath);
                continue;
            }

            for(let i = 0; i < current.adjacent.length; i++) {
                let visited_neighbor_yet = visited.get(current.adjacent[i].node);
                //let count = current.adjacent.length;
                if(visited_neighbor_yet !== undefined) {
                    if(!visited_neighbor_yet) {
                        visited.set(current.adjacent[i].node, true);    //visited node
                        dist.set(current.adjacent[i].node, dist.get(current!)! + 1); //update dist
                        pred.set(current.adjacent[i].node, current);    //update predecessor on shortest path
                        queue.push(current.adjacent[i].node);
                    } else {
                        //console.log("visited case: " + current.adjacent[i].node.data[0].toString() + ", current: " + current.data[0].toString())
                        //count--;
                        //reached starting node of bfs, which has no predecessor
                        //dont treat as leaf
                        //if(i has path to current) --> cycle
                    }
                } else {
                    this.printError("Bfs_attacker: visited list returned undefined node")
                }
                
            }
        }



        return curBestPath;
    } else {
        this.printError("MinMaxBFS: graph uninitialized")
    }

    return undefined;
}
 */
/* printBestPathResults(curPosition?: GamePosition) {

    if(curPosition === undefined) {
        curPosition = this.game.getPlay()[this.game.getPlay().length - 1]
    }

    let result = this.minMaxBfs(curPosition);

    if(result === undefined) {
        console.log("bestPathResult: undefined");
    } else {
        let current = this.graphHasNode(curPosition!)!;
        let root = result.get(current!)
        console.log("------------Root-----------")
        console.log(root);

        console.log("------------Result-----------")
        //console.log(result)
        console.log(this.resultToString(result))


    }
} */

/* getMinMaxAttackerPath(curPosition?: GamePosition) {
    let path = [];
    if(curPosition === undefined) {
        curPosition = this.game.getPlay()[this.game.getPlay().length - 1]
    }

    let result = this.minMaxBfs(curPosition);
    

    if(result === undefined) {
        console.log("bestPathResult: undefined");
    } else {
        let current = this.graphHasNode(curPosition!)!;
        let root = result.get(current!)
        
        
        path.push(current.data[0])
        let next = result.get(current!)!.successors.find(succ => (succ.cost === root!.bestValue && succ.attackerWinningRegion === root!.attackerWinningRegion))
        while(next != undefined) {
            path.push(next.node.data[0])
            next = result.get(next!.node)!.successors.find(succ => (succ.cost === root!.bestValue && succ.attackerWinningRegion === root!.attackerWinningRegion))

        }

        console.log(this.resultToString(result))
    }

    return path;
} */

/* private resultToString(result: Map<Node<[GamePosition, Node<any>[], number]>, {bestValue: number, attackerWinningRegion: boolean, successors: {node: Node<any>, cost: number, attackerWinningRegion: boolean}[]}>) {
    let tmp = "";
    result.forEach((value, key) => {
        tmp = tmp.concat(key.data[0].toString() + " = bestValue: " + value.bestValue + ", attackerWinning: " + value.attackerWinningRegion + ", real winning region: " + key.data[2] + ", successors(" + value.successors.length + "): ")
        let succ_list = value.successors
        for(let j = 0; j < succ_list.length; j++) {
            tmp = tmp.concat("node: " + succ_list[j].node.data[0].toString() + ", cost: " + succ_list[j].cost + ", winning: " + succ_list[j].attackerWinningRegion + " | ")
        }
        tmp = tmp.concat("\n")
    })
    return tmp
}
 */
/* printAttackerShortestMinMaxPath() {
    let path = this.getMinMaxAttackerPath();        
    let length = 0;
    let path_string = "";
    let previous = undefined;   //for detecting symmetry moves
    for(let i = 0; i < path.length; i++) {
        if(path[i].activePlayer === Player.Defender || (previous === Player.Attacker && path[i].activePlayer === Player.Attacker)) {
            length++;
        }
        previous = path[i].activePlayer;
        path_string = path_string.concat(path[i].toString() + ", ");
    }
    path_string = path_string.concat("; moves: " + length + "; pathlen: " + (path.length - 1));
    console.log(path_string);
}
 */


/* OLDEST VERSION OF BFS MIN MAX 
private propagatePathCost(node: Node<[GamePosition, Node<any>[], number]>, pred: Map<Node<[GamePosition, Node<any>[], number]>, Node<[GamePosition, Node<any>[], number]>>, curBestPath: Map<Node<[GamePosition, Node<any>[], number]>, [number, boolean, Node<any>]>) {
        
        let current = pred.get(node)!;
        let nodeBestPath = curBestPath.get(node)!;
        console.log("----------------propagate(" + node.data[0].toString() + "), dist = " + nodeBestPath[0] +"------------")    //TODO: remove debug
        //console.log(nodeBestPath)
        let previous: Node<[GamePosition, Node<any>[], number]> = node;

        let debug = []
        debug.push(node.data[0])    //TODO:remove debug
        //propagate result on shortest path to root
        while(current !== undefined) {
            let currentBest = curBestPath.get(current)!;
            //console.log(currentBest)

            //no entry for current node yet
            if(currentBest[0] === -1) {
                curBestPath.set(current, [nodeBestPath[0], nodeBestPath[1], previous])
            }

            //current is defender - maximizing player
            else if(current.data[0].activePlayer === Player.Defender) {
                //leaf node in attacker winning region
                if(Boolean(node.data[2]) === true) {

                    //current best path leads to attacker winning region
                    if(Boolean(currentBest[1])) {
                        curBestPath.set(current, [nodeBestPath[0], nodeBestPath[1], previous])

                    //current best path leads to defender winning region
                    } else if(!Boolean(currentBest[1])) {
                        let max = this.max(nodeBestPath[0], currentBest[0]);
                        //take the maximum path
                        if(max === nodeBestPath[0]) {
                            curBestPath.set(current, [nodeBestPath[0], nodeBestPath[1], previous])
                        } else {
                            //attacker will never take worse path
                            break;
                        }
                    } else {
                        console.log("works as intended, remove debug")
                    }

                //leaf node in defender winning region
                } else {
                    //current best path leads to attacker winning region
                    if(Boolean(currentBest[1])) {
                        let max = this.max(nodeBestPath[0], currentBest[0]);
                        //take the maximum path
                        if(max === nodeBestPath[0]) {
                            curBestPath.set(current, [nodeBestPath[0], nodeBestPath[1], previous])
                        } else {
                            //attacker will never take worse path
                            break;
                        }
                        
                    }//else case not relevant
                }

            //attacker node - minimizing player
            } else if(current.data[0].activePlayer === Player.Attacker) {
                //node in attacker winning region?
                if(Boolean(node.data[2]) === true) {

                    //not leaf node
                    //if(!currentBest[2].data[0].samePosition(node.data[0])) {
                        let min = this.min(nodeBestPath[0], currentBest[0]);
                        //take the maximum path
                        if(min === nodeBestPath[0]) {
                            curBestPath.set(current, [nodeBestPath[0], nodeBestPath[1], previous])
                        } else {
                            //defender will never take worse path
                            break;
                        }
                   // }
                //node in defender winning region
                } else {
                    //egal, weil Algorithmus in attacker winning region beginnt
                    break;
                }
            } else {
                this.printError("propagatePathCost: Error in node");
                return;
            }

            debug.push(current.data[0]) //TODO: remove debug
            previous = current;
            current = pred.get(current)!;
        }
        console.log(debug)
    } */