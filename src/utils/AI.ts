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
    private graph!: Graph<[GamePosition, Node<GamePosition>[], boolean]>;

    constructor(game: ReactiveBisimilarityGame) {
        this.game = game.copy();    //TODO: test if this creates a completely independant copy of the game
        this.consoleLogSignature = console.log;
    }

    /**
     * generate a graph with all possible game positions branching from the starting position in the lts @this.game.lts,
     * annotates each vertex with whether it is in the winning region of the attacker or not
     */
    generateGraph() {
        //game initialized?
        if(this.game.getPlay.length === 0) {
            this.printError("generateGraph: Cannot generate graph for uninitialized game")
            return
        }

        //construct graph
        this.graph = new Graph<[GamePosition, Node<GamePosition>[], boolean]>((a: [GamePosition, Node<GamePosition>[], boolean], b: [GamePosition, Node<GamePosition>[], boolean]) => {
            if(a[0] !== b[0]) { //comparator, removeNode when Gamepositions differ
                return 1;
            }
            return 0;
        });
        this.graph.addNode([this.game.getPlay()[0], [], false]) //first node
        this.appendNodesRecursively(this.graph.getNodes()[0])
    }

    //TODO:
    private appendNodesRecursively(node: Node<[GamePosition, Node<GamePosition>[], boolean]>) {
        if(this.graph.hasNode(node)) {
            //generate moves
            let possibleMoves = this.game.possibleMoves(node.data[0], true);

            //create nodes for moves

            //cycle detection/node already in graph --> update predecessors of node

            //add edges to moves

            //recursive call

        } else {
            this.printError("appendNodesRecursively: Called function with node that doesn't exist.");
        }
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