import { Graph } from "./Graph";
import { LTSController } from "./LTSController";
import { SetOps } from "./SetOps";
import { Constants } from "./Constants";
import { AttackerNode, GamePosition, RestrictedAttackerNode, RestrictedSimulationDefenderNode, SimulationDefenderNode } from "./GamePosition";
import { ReactiveBisimilarityGame } from "./ReactiveBisimilarityGameController";
import { AI } from "./AI";

export class Tests {

    testReactiveBisimgame0() {
        let lts = this.getReactiveBisimLTS();
        const game0 = new ReactiveBisimilarityGame("0", "0", lts);
        //console.log("currents: " + lts.current);
        //lts.graph.print();

        console.log("----------------- TESTS -----------------")
        //simulation challenge
        game0.setEnvironment(new Set(["c"]));
        console.log("isMovePossible(0-b->P ): " + game0.isMovePossible("b", new SimulationDefenderNode("P", "0'", "b")) + ", expected: false (environment doesn't allow)");
        game0.resetEnvironment();
        //console.log("isMovePossible(0-b->P ): " + game0.isMovePossible("b", new SimulationDefenderNode("P", "0'", "b"), new Set(["c"])) + ", expected: false (custom environment {c} doesn't allow)");
        console.log("isMovePossible(0-b->P ): " + game0.isMovePossible("b", new SimulationDefenderNode("P", "0'", "b")) + ", expected: true");
        //timeout simulation challenge
        console.log("Timeout action: " + game0.isMovePossible(Constants.TIMEOUT_ACTION, new RestrictedSimulationDefenderNode("2", "0'", Constants.TIMEOUT_ACTION, game0.getEnvironment())) + ", expected false");
        lts.addVisibleActionToA("c");
        game0.resetEnvironment()
        //console.log("Timeout action, env: {c}: " + game0.isMovePossible(Constants.TIMEOUT_ACTION, new RestrictedSimulationDefenderNode("2", "0'", Constants.TIMEOUT_ACTION, new Set(["c"])), new Set(["c"])) + ", expected true");
        console.log("Timeout action, wrong nextNode: " + game0.isMovePossible(Constants.TIMEOUT_ACTION, new SimulationDefenderNode("2", "0'", Constants.TIMEOUT_ACTION)) + ", expected false");
        
        //game0.performMove("b", new AttackerNode("P", "P'"));
        console.log("possible moves:");
        console.log(game0.possibleMoves());
        game0.performMove("b", new SimulationDefenderNode("P", "0'", "b"));
        console.log(game0.possibleMoves());
    }

    testIsMovePossible() {
        let game = this.getReactiveLTS01();
        console.log("----------------- isMovePossible TESTS -----------------")

        //Timeout Simulation Challenge
        console.log("----------------- Timeout Simulation Challenge -----------------");
        game.startNewGame("p0", "q0", new AttackerNode("p0", "q0"));
        console.log("Current position: " + game.getPlay()[game.getPlay().length - 1].toString());
        console.log("isMovePossible(p0-t->p1): " + game.getMoveStringFromCode(game.isMovePossible("t", new RestrictedSimulationDefenderNode("p1", "q0", "t", new Set("b")))) + ", should not be possible, b still in environment");
        console.log("isMovePossible(p0-t->p1): " + game.getMoveStringFromCode(game.isMovePossible("t", new RestrictedSimulationDefenderNode("p1", "q0", "t", new Set("a")))) + ", should be possible");

        //Restricted Simulation Challenge
        console.log("----------------- Restricted Simulation Challenge -----------------")
        game.startNewGame("p1", "q1", new RestrictedAttackerNode("p1", "q1", game.getEnvironment()));
        console.log("Current position: " + game.getPlay()[game.getPlay().length - 1].toString());
        console.log("isMovePossible(p1 -a-> p3): " + game.getMoveStringFromCode(game.isMovePossible("a", new SimulationDefenderNode("p3", "q1", "a"))) + ", should work, because initialsEmpty");
        game.startNewGame("p1", "q1", new RestrictedAttackerNode("p1", "q1", new Set("a")));
        console.log("Current position: " + game.getPlay()[game.getPlay().length - 1].toString());
        console.log("isMovePossible(p1 -a-> p3): " + game.getMoveStringFromCode(game.isMovePossible("a", new SimulationDefenderNode("p3", "q1", "a"))) + ", should work, environment allows action");
        console.log("isMovePossible(p1 -b-> p4): " + game.getMoveStringFromCode(game.isMovePossible("b", new SimulationDefenderNode("p4", "q1", "b"))) + ", should not work, environment doesn't allow action");

        //Invisible Simulation Challenge
        console.log("----------------- Invisible Simulation Challenge -----------------")

        //Timeouted Timeout Simulation Challenges
        console.log("----------------- Timeouted Timeout Simulation Challenge -----------------")

        //Restricted Symmetry Moves
        console.log("----------------- Restricted Symmetry Moves -----------------")
    }

    testAI() {
        console.log("----------------- AI Tests -----------------");
        let game  = this.getReactiveLTS01();
        let ai_controller = new AI(game);
        ai_controller.generateGraph();
        ai_controller.determineWinningRegion();
        ai_controller.printGraph();
        console.log("----------------- BFS Result Tests-----------------");
        console.log("** - Test for starting position: " + game.getPlay()[game.getPlay().length - 1].toString() + ", in attacker winning region");
        let result = ai_controller.modifiedBfs();
        if(result === undefined) {
            console.log("undefined");
        } else {
            console.log("nearest defender winning region node: " + result[0].data[0].toString() + ", distance: " + result[2].get(result[0]));
        }
        let nextMove = ai_controller.getNextMove(game.getPlay()[game.getPlay().length - 1]);
        if(nextMove !== undefined) {
            console.log("nextMove: " + nextMove?.toString());
        } else {
            console.log("nextMove: undefined" );
        }
        let shortestPathLength = ai_controller.getShortestPathLength(game.getPlay()[game.getPlay().length - 1]);
        console.log("shortestPathLength: " + shortestPathLength);

        //TODO: Test position in defender winning region, or when no reachable defender winning region node
        console.log("** - Test for game position: " + (new RestrictedSimulationDefenderNode("p1", "q0", Constants.TIMEOUT_ACTION, new Set("a"))).toString() + ", in defender winning region")
        let result_defender_winning = ai_controller.modifiedBfs(new RestrictedSimulationDefenderNode("p1", "q0", Constants.TIMEOUT_ACTION, new Set("a")));
        console.log("destination node: " + result_defender_winning![0].data[0].toString());
        console.log("nextMove: " + ai_controller.getNextMove(new RestrictedSimulationDefenderNode("p1", "q0", Constants.TIMEOUT_ACTION, new Set("a"))))
        console.log("shortestPathLength: " + ai_controller.getShortestPathLength(new RestrictedSimulationDefenderNode("p1", "q0", Constants.TIMEOUT_ACTION, new Set("a"))))

        console.log("** - Test for game position: " + (new SimulationDefenderNode("p4", "q1", "b")) + ", defender has no moves")
        let result_no_move = ai_controller.modifiedBfs();
        console.log("destination node: " + result_no_move![0].data[0].toString());
        console.log("nextMove: " + ai_controller.getNextMove(new SimulationDefenderNode("p4", "q1", "b")))
        console.log("shortestPathLength: " + ai_controller.getShortestPathLength(new SimulationDefenderNode("p4", "q1", "b")))

        console.log("** - Test for game with no reachable winning defender nodes: ");
        let game_attacker_winning = this.getAttackerWinningLTS();
        let ai_controller2 = new AI(game_attacker_winning);
        ai_controller2.generateGraph();
        ai_controller2.determineWinningRegion();
        ai_controller2.printGraph();
        console.log("*** starting position: " + game_attacker_winning.getPlay()[game_attacker_winning.getPlay().length - 1].toString());
        let result_not_reachable = ai_controller2.modifiedBfs();
        if(result_not_reachable === undefined) {
            console.log("bfs returned undefined");
        } else {
            console.log("destination node: " + result_not_reachable[0].data[0].toString() + ", distance: " + result_not_reachable[2].get(result_not_reachable[0]));
        }
        console.log("nextMove: " + ai_controller2.getNextMove());
        console.log("shortestPathLength: " + ai_controller2.getShortestPathLength());
        //console.log("shortestPathLength: " + ai_controller.getShortestPathLength())        
    }

    /**
     * generate basic non reactive bisimilar LTS
     * @returns 
     */
    getReactiveLTS01() : ReactiveBisimilarityGame {
        /**
         *         p0                    q0
         *       t/  \b                t/  \b
         *      p1    p2              q1    q2
         *    a/  \b                a/  \a
         *   p3    p4              q3    q4
         */
        let lts = new LTSController
        lts.addState("p0");
        lts.addState("p1");
        lts.addState("p2");
        lts.addState("p3");
        lts.addState("p4");

        lts.addTransition("p0", "p1", Constants.TIMEOUT_ACTION);
        lts.addTransition("p0", "p2", "b");
        lts.addTransition("p1", "p3", "a");
        lts.addTransition("p1", "p4", "b");

        lts.addState("q0");
        lts.addState("q1");
        lts.addState("q2");
        lts.addState("q3");
        lts.addState("q4");

        lts.addTransition("q0", "q1", Constants.TIMEOUT_ACTION);
        lts.addTransition("q0", "q2", "b");
        lts.addTransition("q1", "q3", "a");
        lts.addTransition("q1", "q4", "a");

        return new ReactiveBisimilarityGame("p0", "q0", lts, true, true);
    }

    /**
     * generate very simple lts to test AI class
     * @returns 
     */
    getReactiveLTS00(): ReactiveBisimilarityGame {
        /**
         *         p0                    q0
         *       t/  \b                t/  \b
         *      p1    p2              q1    q2
         */
         let lts = new LTSController
         lts.addState("p0");
         lts.addState("p1");
         lts.addState("p2");
 
         lts.addTransition("p0", "p1", Constants.TIMEOUT_ACTION);
         lts.addTransition("p0", "p2", "b");
 
         lts.addState("q0");
         lts.addState("q1");
         lts.addState("q2");

         lts.addTransition("q0", "q1", Constants.TIMEOUT_ACTION);
         lts.addTransition("q0", "q2", "b");
 
         return new ReactiveBisimilarityGame("p0", "q0", lts, true, true);
    }

    /**
     * generate very simple lts to test AI class
     * @returns 
     */
     getAttackerWinningLTS(): ReactiveBisimilarityGame {
        /**
         *          p0                    q0
         *          | a                   | a
         *          p1                    q1
         *          | b                   | a
         *          p2                    q2
         */
         let lts = new LTSController
         lts.addState("p0");
         lts.addState("p1");
         lts.addState("p2");
 
         lts.addTransition("p0", "p1", "a");
         lts.addTransition("p1", "p2", "b");
 
         lts.addState("q0");
         lts.addState("q1");
         lts.addState("q2");

         lts.addTransition("q0", "q1", "a");
         lts.addTransition("q1", "q2", "a");
 
         return new ReactiveBisimilarityGame("p0", "q0", lts, true, true);
    }

    /**
     * Constructs the first reactive bisimilar LTS from the van Glabbeek Paper
     * @returns 
     */
    getReactiveBisimLTS(): LTSController {
        const lts = new LTSController();
        lts.addState("0");
        lts.addState("P");
        lts.addState("2");
        lts.addState("3");
        lts.addState("Q");
        lts.addState("5");
        lts.addState("6");
        lts.addState("R");
        lts.addState("S");

        lts.addTransition("0", "P", "b");
        lts.addTransition("0", "2", Constants.TIMEOUT_ACTION);
        lts.addTransition("0", "3", Constants.TIMEOUT_ACTION);
        lts.addTransition("2", "Q", "a");
        lts.addTransition("2", "5", Constants.HIDDEN_ACTION);
        lts.addTransition("3", "6", Constants.HIDDEN_ACTION);
        lts.addTransition("5", "R", "b");
        lts.addTransition("5", "S", "a");
        lts.addTransition("6", "S", "a");

        lts.addState("0'");
        lts.addState("P'");
        lts.addState("2'");
        lts.addState("3'");
        lts.addState("Q'");
        lts.addState("5'");
        lts.addState("6'");
        lts.addState("R'");
        lts.addState("S'");

        lts.addTransition("0'", "P'", "b");
        lts.addTransition("0'", "2'", Constants.TIMEOUT_ACTION);
        lts.addTransition("0'", "3'", Constants.TIMEOUT_ACTION);
        lts.addTransition("2'", "Q'", "a");
        lts.addTransition("2'", "6'", Constants.HIDDEN_ACTION);
        lts.addTransition("3'", "5'", Constants.HIDDEN_ACTION);
        lts.addTransition("5'", "R'", "b");
        lts.addTransition("5'", "S'", "a");
        lts.addTransition("6'", "S'", "a");

        return lts;
    }

    testSetOps() {
        let a = new Set(["1", "2", "3", "4", "5"]);
        let b = new Set(["2", "3", "6", "7", "8"]);
        let c = new Set(["3", "6"]);
        let d = new Set(["3", "6"]);

        console.log("isSubset: " + SetOps.isSubset(c, b) +  ", expected: true");
        console.log("isSubset: " + SetOps.isSubset(c, a) +  ", expected: false");
        console.log("isSubsetEq: " + SetOps.isSubsetEq(c, b) +  ", expected: true");
        console.log("isSubsetEq: " + SetOps.isSubsetEq(c, d) +  ", expected: true");
        console.log("isSubsetEq: " + SetOps.isSubsetEq(c, a) +  ", expected: false");
        console.log("intersect: " + SetOps.toArray(SetOps.intersect(a, b)) + ", expected: [2, 3]");
        console.log("union: " + SetOps.toArray(SetOps.union(a, b)) + ", expected: [1, 2, 3, 4, 5, 6, 7, 8]");
        console.log("difference: " + SetOps.toArray(SetOps.difference(a, b)) + ", expected: [1, 4, 5]");
    }

    testLTSController() {
        const lts = new LTSController();
        lts.addState("0");
        lts.addState("1");
        lts.addState("2");
        lts.addState("3");
        lts.addState("4");
        lts.addTransition("0", "1", 'a');
        lts.addTransition("0", "2", 't');
        lts.addTransition("1", "3", 'tau');
        lts.addTransition("2", "4", "b");
        lts.addTransition("0", "3", 'tau');
        lts.addTransition("0", "4", "b");
        lts.addTransition("1", "3", "t");
        lts.setCurrentState("0");
        console.log("current: " + lts.current);
        lts.graph.print();
        console.log("-------------------------------------------------------");
        console.log("performing actions: 0-a->1 (possible), 1-a->2 (not possible), 1-tau->3 (possible)")
        lts.performAction("0", "1", "a");   //possible
        lts.performAction("1", "2", "a");   //not possible
        lts.performAction("1", "3", "tau"); //possible
        console.log("current: " + lts.current);
        lts.setCurrentState("3", 1);
        console.log("set current to 3: ")
        console.log(lts.current);
        lts.graph.print();
        console.log(lts.getActionsAndDestinations("0"));
    }

    testGraph() {
        const graph = new Graph(this.comparator0);
        graph.addNode(0);
        graph.addNode(1);
        graph.addNode(2);
        graph.addNode(3);
        graph.addNode(4);
        graph.addEdge(0, 1, 'a');
        graph.addEdge(0, 2, 't');
        graph.addEdge(1, 3, 'tau');
        graph.addEdge(2, 4, "b");
        graph.addEdge(0, 3, 'tau');
        graph.addEdge(0, 4, "b");
        graph.addEdge(1, 3, "t");
        console.log("NodeAmount: " + graph.getNodeAmount(), + ", expected: 5");
        console.log("vertices: " + graph.getNodes().toString()) + "expected: 0, 1, 2, 3, 4";
        console.log("edges: " + graph.getEdgesAsString() );
        graph.print();
        console.log("-------------------------------------------------------");
        graph.removeNode(3);
        graph.removeEdge(0, 4, 'b');
        graph.print();
    }

    comparator0(a: number, b: number) {
        if (a < b) return -1;
      
        if (a > b) return 1;
      
        return 0;
    }
}
