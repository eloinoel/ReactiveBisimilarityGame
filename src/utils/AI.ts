import { Constants } from "./Constants";
import { GamePosition, Player } from "./GamePosition";
import { Graph, Node } from "./Graph";
import { ReactiveBisimilarityGame } from "./ReactiveBisimilarityGameController";

/**
 * this class is used to calculate the "optimal" next move
 * "optimal" because as long as the player doesn't make a wrong move, he will always win
 */
export class AI {
    
    /** copy of the game at initialization time */
    private game: ReactiveBisimilarityGame;

    /** to disable/reenable printing in console */
    private consoleLogSignature;
    /**graph of all branching game positions, with all predecessors and, with a boolean for whether game position vertex is in the winning region of attacker*/
    private graph!: Graph<[GamePosition, Node<any>[], boolean]>;

    constructor(game: ReactiveBisimilarityGame) {
        this.game = game.copy();
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
            this.graph = new Graph<[GamePosition, Node<any>[], boolean]>((a: [GamePosition, Node<any>[], boolean], b: [GamePosition, Node<any>[], boolean]) => {
                if(a[0] !== b[0]) { //comparator, removeNode when Gamepositions differ
                    return 1;
                }
                return 0;
            });
            let node = this.graph.addNode([this.game.getPlay()[0], [], false]) //first node
            this.appendNodesRecursively(node)
        }
    }

        

    /**
     * used to generate game graph from an lts
     * @param node 
     * @returns 
     */
    private appendNodesRecursively(node: Node<[GamePosition, Node<any>[], boolean]>): void {
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
                    let predecessors: Node<[GamePosition, Node<any>[], boolean]>[] = [];
                    predecessors.push(node);
                    graphNode = this.graph.addNode([possibleMoves[i], predecessors, false])
                    //add edge to move
                    this.graph.addEdge(node.data, graphNode.data, ""); //don't need edgeLabels
                    this.appendNodesRecursively(graphNode);
                }
            }
        } else {
            this.printError("appendNodesRecursively: Called function with node that doesn't exist.");
        }
    }

    private graphHasNode(move: GamePosition): Node<[GamePosition, Node<any>[], boolean]> | undefined {
        let nodes = this.graph.getNodes();
        let existing_node = nodes.find((node) => (node.data[0].samePosition(move)));
        return existing_node;
    }

    /**
     * calculate the next "best" move
     */
    getNextMove(curPosition: GamePosition) {
        //check if game environment and visible actions A are still the same between copy and real game
        //TODO:
    }

    /**
     * returns in a number of moves in which the player can win in
     */
    getShortestPathLength() {
        //TODO:
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
            let num_map = new Map<Node<[GamePosition, Node<any>[], boolean]>, number>();


            //init num_map
            for(let i = 0; i < G_d.length; i++) {
                num_map.set(G_d[i], G_d[i].adjacent.length);
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
    private propagateAttackerWin(node: Node<[GamePosition, Node<any>[], boolean]>, num_map: Map<Node<[GamePosition, Node<any>[], boolean]>, number>) {    //TODO: delete defender winning region from args
        if(node.data[2] === false) {
            //set node to attacker winning region
            node.data[2] = true;

            //for all predecessors of node
            for(let j = 0; j < node.data[1].length; j++) {
                let predecessor = this.graphHasNode(node.data[1][j].data[0]);
                if(predecessor !== undefined) {
                    num_map.set(predecessor, num_map.get(predecessor)! - 1);

                    //if predecessor is in attacker winning region
                    if(predecessor.data[0].activePlayer === Player.Attacker || predecessor.adjacent.length === 0 || predecessor.data[2] || num_map.get(predecessor) === 0) {
                        //propagate attacker region up
                        this.propagateAttackerWin(predecessor, num_map);
                    }
                } else {
                    this.printError("propagateAttackerWin: undefined predecessor (not in num_map)")
                }
            }
        }
    }

    printGraph() {
        console.log("-------------------- GAME MOVE GRAPH --------------------")
        console.log("Graph: <Vertex>: <(edgeLabel, destinationNode)> ...");
        this.graph.getNodes().forEach((node) => {
            let edgestring = "Vertex " + node.data[0].toString() + " (" + node.data[2] + "): ";
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