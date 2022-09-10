import { Constants } from "./Constants";
import { GamePosition, Player } from "./GamePosition";
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

            //console.log("current node: " + node.data[0].toString() + ",         possible moves: " + possibleMoves); //TODO: remove debug
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
                    continue;
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
     * Algorithm by Benjamin Bisping, see Master's Thesis "Computing Coupled Similarity" or sources in Bachelor's Thesis accompanying this software in github repository
     * Computes winning regions on game move graphs in simple games
     */
    determineWinningRegion() {
        //game graph is initialized
        if(this.graph !== undefined) {
            //recursion starts at defender nodes without winning moves
            let G_d = this.graph.getNodes().sort((a, b) => a.adjacent.length - b.adjacent.length);
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
    modifiedBfs(curPosition?: GamePosition): [Node<any>, Map<Node<any>, Node<any>>, Map<Node<any>, number>] | undefined {
        if(this.graph !== undefined) {

            let nodes = this.graph.getNodes();

            //graph contains position
            if(curPosition === undefined) {
                curPosition = this.game.getPlay()[0];
            }
            let sourceNode = nodes.find(node => (node.data[0].samePosition(curPosition!)))
            if(sourceNode === undefined) {
                return undefined;
            }
            

            //initiate
            let visited = new Map<Node<[GamePosition, Node<any>[], number]>, boolean>();
            let dist = new Map<Node<[GamePosition, Node<any>[], number]>, number>();
            let pred = new Map<Node<[GamePosition, Node<any>[], number]>, Node<[GamePosition, Node<any>[], number]>>(); //construct path from destination to source

            let queue: Node<[GamePosition, Node<any>[], number]>[] = [];

            //all vertices unvisited, path not yet constructed
            for(let i = 0; i < nodes.length; i++) {
                dist.set(nodes[i], Infinity);
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
                        }
                    } else {
                        this.printError("modifiedBfs: visited list returned undefined node")
                    }
                }
            }
        } else {
            this.printError("modifiedBfs: graph uninitialized")
        }
        return undefined;
    }





    /**
     * TODO:
     * traverses the game graph and assigns every node a blunder score in the interval [0, 1], 
     * 0 meaning that the node is in the winning region of the defender and 1 meaning that the attacker only has winning moves to choose from with no possibility of losing, 
     * essentially functions like the common minimax algorithm when in the winning region of the defender
     * @param node 
     * @param depth 
     */
    calculateBlunderScore(node: Node<[GamePosition, Node<any>[], number]>) {
        //graph initialized
        if(this.graph !== undefined) {
            //terminal node (leaf)
            if(node.adjacent.length === 0) {
                //Defender stuck
                if(node.data[0].activePlayer === Player.Defender) {
                    node.data[2] = 1;
                    return 1;
                //Attacker stuck
                } else {
                    this.printError("calculateBlunderScore: Attacker stuck but this should not be possible (Symmetry Move)")
                    node.data[2] = 0;
                    return 0;
                }
            }
            //TODO: cycle


            //maximizing player === attacker
            if(node.data[0].activePlayer === Player.Attacker) {
                let maxEvaluation = 0;
                //
                for(let i = 0; i < node.adjacent.length; i++) {

                }
            //minimizing player === defender
            } else {
                let minEvaluation = 1;
            }

        } else {
            this.printError("calculateBlunderScore: graph not initialized");
        }
    }

    /**
     * calculate the next "best" move
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
        let bfs_result = this.modifiedBfs(curPosition);
        if(bfs_result !== undefined && bfs_result[0] !== undefined) {
            //traverse graph on path until pred === current position 
            let current = bfs_result[0];
            let path: Node<[GamePosition, Node<any>[], number]>[] = []; //path from destination to source (curPosition)
            while(current !== undefined) {
                path.push(current);
                current = bfs_result[1].get(current)!;
            }
            console.log("Shortest path: " + this.getShortestPathString(path));
            return path[path.length - 2].data[0];
        } else {
            //if no defender winning region node is reachable, return any adjacent node
            let node = this.graphHasNode(curPosition);
            if(node !== undefined && node.adjacent.length > 0) {
                let random_number = Math.floor(Math.random() * (node.adjacent.length));
                return node.adjacent[random_number].node.data[0];  //return "random" node
            }

            //no move --> return undefined
            console.log("getNextMove: could not find any next move")
            return undefined;
        }
    }

    private getShortestPathString(path: Node<[GamePosition, Node<any>[], number]>[]): string {
        let path_string = "";
        for(let i = 0; i < path.length; i++) {
            path_string = path_string.concat(path[i].data[0].toString() + ", ");
        }
        return path_string;
    }

    /**
     * returns in a number of moves in which the player can win in
     */
    getShortestPathLength(curPosition?: GamePosition): number {
        if(curPosition === undefined && this.game.getPlay().length > 0) {
            curPosition = this.game.getPlay()[this.game.getPlay().length - 1];
        }

        if(curPosition !== undefined) {
            let bfs_result = this.modifiedBfs(curPosition);
            let sourceNode = this.graphHasNode(curPosition);
            if(bfs_result !== undefined && sourceNode !== undefined) {
                return bfs_result[2].get(bfs_result[0])!;
            }
        }
        return -1;
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

    
    /**
     * TODO: delete if not needed
     * Dijkstra calculates the distance to each node in game graph
     * @param startingPosition 
     * @returns 
     */
     private dijkstra(startingPosition: GamePosition): Map<GamePosition, number> | undefined {
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
    }
}