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
    private graph!: Graph<[GamePosition, GamePosition[], boolean]>;

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
            this.graph = new Graph<[GamePosition, GamePosition[], boolean]>((a: [GamePosition, GamePosition[], boolean], b: [GamePosition, GamePosition[], boolean]) => {
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
    private appendNodesRecursively(node: Node<[GamePosition, GamePosition[], boolean]>): void {
        if(this.graphHasNode(node.data[0])) {
            //generate moves
            let possibleMoves = this.game.possibleMoves(node.data[0], true);

            console.log("current node: " + node.data[0].toString() + ",         possible moves: " + possibleMoves);

            //create nodes for moves
            for(let i = 0; i < possibleMoves.length; i++) {
                //cycle detection/next node already in graph --> update predecessors of node and return to break cycle
                
                let graphNode = this.graphHasNode(possibleMoves[i]);
                if(graphNode !== undefined) {
                    //does predecessor list already contain previous node? only relevant when two nodes have multiple edges between them
                    if(graphNode.data[1].find((position) => (position.samePosition(node.data[0]))) === undefined) {
                        //if not, add it to predecessors
                        graphNode.data[1].push(node.data[0])
                        this.graph.addEdge(node.data, graphNode.data, "");
                    } 
                    continue;
                //node not in graph --> add new node
                } else {
                    let predecessors: GamePosition[] = [];
                    predecessors.push(node.data[0]);
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

    private graphHasNode(move: GamePosition): Node<[GamePosition, GamePosition[], boolean]> | undefined {
        let nodes = this.graph.getNodes();
        let existing_node = nodes.find((node) => (node.data[0].samePosition(move)));
        return existing_node;
    }

    printGraph() {
        console.log("-------------------- GAME MOVE GRAPH --------------------")
        console.log("Graph: <Vertex>: <(edgeLabel, destinationNode)> ...");
        this.graph.getNodes().forEach((node) => {
            let edgestring = "Vertex " + node.data[0].toString() + ": ";
            for(let j = 0; j < node.adjacent.length; j++) {
                edgestring = edgestring.concat(node.adjacent[j].node.data[0].toString(), ", ");
            }
            //print predecessors 
            edgestring = edgestring.concat("            predecessors: ")
            for(let j = 0; j < node.data[1].length; j++) {
                edgestring = edgestring.concat(node.data[1][j].toString() + ", ");
            }
            console.log(edgestring);
        })
    }

    /**
     * calculates next move
     */
    getNextMove(player: Player) {
        //check if game environment and visible actions A are still the same between copy and real game
        //TODO:
    }

    /**
     * returns in a number of moves in which the player can win in
     */
    getShortestPathLength() {
        //TODO:
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