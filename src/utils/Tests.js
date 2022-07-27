"use strict";
exports.__esModule = true;
var Graph_1 = require("./Graph");
var LTSController_1 = require("./LTSController");
var SetOps_1 = require("./SetOps");
var ReactiveBisimilarityGameController_1 = require("./ReactiveBisimilarityGameController");
var Constants_1 = require("./Constants");
var GamePosition_1 = require("./GamePosition");
var Tests = /** @class */ (function () {
    function Tests() {
    }
    Tests.prototype.testReactiveBisimGame = function () {
        var lts = this.getReactiveBisimLTS();
        var game = new ReactiveBisimilarityGameController_1.ReactiveBisimilarityGame("0", "0'", lts);
        //console.log("currents: " + lts.current);
        //lts.graph.print();
        console.log("----------------- TESTS -----------------");
        //simulation challenge
        game.setEnvironment(new Set(["c"]));
        console.log("isMovePossible(0-b->P ): " + game.isMovePossible("b", new GamePosition_1.SimulationDefenderNode("P", "0'", "b")) + ", expected: false (environment doesn't allow)");
        game.resetEnvironment();
        console.log("isMovePossible(0-b->P ): " + game.isMovePossible("b", new GamePosition_1.SimulationDefenderNode("P", "0'", "b"), new Set(["c"])) + ", expected: false (custom environment {c} doesn't allow)");
        console.log("isMovePossible(0-b->P ): " + game.isMovePossible("b", new GamePosition_1.SimulationDefenderNode("P", "0'", "b")) + ", expected: true");
        //timeout simulation challenge
        console.log("Timeout action: " + game.isMovePossible(Constants_1.Constants.TIMEOUT_ACTION, new GamePosition_1.RestrictedSimulationDefenderNode("2", "0'", Constants_1.Constants.TIMEOUT_ACTION, game.getEnvironment())) + ", expected false");
        lts.addVisibleActionToA("c");
        game.resetEnvironment();
        console.log("Timeout action, env: {c}: " + game.isMovePossible(Constants_1.Constants.TIMEOUT_ACTION, new GamePosition_1.RestrictedSimulationDefenderNode("2", "0'", Constants_1.Constants.TIMEOUT_ACTION, new Set(["c"])), new Set(["c"])) + ", expected true");
        console.log("Timeout action, wrong nextNode: " + game.isMovePossible(Constants_1.Constants.TIMEOUT_ACTION, new GamePosition_1.SimulationDefenderNode("2", "0'", Constants_1.Constants.TIMEOUT_ACTION)) + ", expected false");
        //game.performMove("b", new SimulationDefenderNode("P", "0'", "b"));
        //game.performMove("b", new AttackerNode("P", "P'"));
        //console.log("currents: " + lts.current);
        //game.isMovePossible("b", new RestrictedSimulationDefenderNode("P", "0'", "b", game.getEnvironment()));
        //TODO: Test with possibleMoves() function
    };
    /**
     * Constructs the first reactive bisimilar LTS from the van Glabbeek Paper
     * @returns
     */
    Tests.prototype.getReactiveBisimLTS = function () {
        var lts = new LTSController_1.LTSController();
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
        lts.addTransition("0", "2", Constants_1.Constants.TIMEOUT_ACTION);
        lts.addTransition("0", "3", Constants_1.Constants.TIMEOUT_ACTION);
        lts.addTransition("2", "Q", "a");
        lts.addTransition("2", "5", Constants_1.Constants.HIDDEN_ACTION);
        lts.addTransition("3", "6", Constants_1.Constants.HIDDEN_ACTION);
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
        lts.addTransition("0'", "2'", Constants_1.Constants.TIMEOUT_ACTION);
        lts.addTransition("0'", "3'", Constants_1.Constants.TIMEOUT_ACTION);
        lts.addTransition("2'", "Q'", "a");
        lts.addTransition("2'", "6'", Constants_1.Constants.HIDDEN_ACTION);
        lts.addTransition("3'", "5'", Constants_1.Constants.HIDDEN_ACTION);
        lts.addTransition("5'", "R'", "b");
        lts.addTransition("5'", "S'", "a");
        lts.addTransition("6'", "S'", "a");
        return lts;
    };
    Tests.prototype.testSetOps = function () {
        var a = new Set(["1", "2", "3", "4", "5"]);
        var b = new Set(["2", "3", "6", "7", "8"]);
        var c = new Set(["3", "6"]);
        var d = new Set(["3", "6"]);
        console.log("isSubset: " + SetOps_1.SetOps.isSubset(c, b) + ", expected: true");
        console.log("isSubset: " + SetOps_1.SetOps.isSubset(c, a) + ", expected: false");
        console.log("isSubsetEq: " + SetOps_1.SetOps.isSubsetEq(c, b) + ", expected: true");
        console.log("isSubsetEq: " + SetOps_1.SetOps.isSubsetEq(c, d) + ", expected: true");
        console.log("isSubsetEq: " + SetOps_1.SetOps.isSubsetEq(c, a) + ", expected: false");
        console.log("intersect: " + SetOps_1.SetOps.toArray(SetOps_1.SetOps.intersect(a, b)) + ", expected: [2, 3]");
        console.log("union: " + SetOps_1.SetOps.toArray(SetOps_1.SetOps.union(a, b)) + ", expected: [1, 2, 3, 4, 5, 6, 7, 8]");
        console.log("difference: " + SetOps_1.SetOps.toArray(SetOps_1.SetOps.difference(a, b)) + ", expected: [1, 4, 5]");
    };
    Tests.prototype.testLTSController = function () {
        var lts = new LTSController_1.LTSController();
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
        console.log("performing actions: 0-a->1 (possible), 1-a->2 (not possible), 1-tau->3 (possible)");
        lts.performAction("0", "1", "a"); //possible
        lts.performAction("1", "2", "a"); //not possible
        lts.performAction("1", "3", "tau"); //possible
        console.log("current: " + lts.current);
        lts.setCurrentState("3", 1);
        console.log("set current to 3: ");
        console.log(lts.current);
        lts.graph.print();
    };
    Tests.prototype.testGraph = function () {
        var graph = new Graph_1.Graph(this.comparator0);
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
        console.log("NodeAmount: " + graph.getNodeAmount(), +", expected: 5");
        console.log("vertices: " + graph.getNodes().toString()) + "expected: 0, 1, 2, 3, 4";
        console.log("edges: " + graph.getEdgesAsString());
        graph.print();
        console.log("-------------------------------------------------------");
        graph.removeNode(3);
        graph.removeEdge(0, 4, 'b');
        graph.print();
    };
    Tests.prototype.comparator0 = function (a, b) {
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    };
    return Tests;
}());
exports.Tests = Tests;
//----------------------------------- Testing -----------------------------------
var test = new Tests();
//test.testSetOps();
test.testReactiveBisimGame();
