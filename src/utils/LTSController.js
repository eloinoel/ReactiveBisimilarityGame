"use strict";
exports.__esModule = true;
var Constants_1 = require("./Constants");
var Graph_1 = require("./Graph");
var SetOps_1 = require("./SetOps");
/**
 * Model for representing LTS in code
 */
var LTSController = /** @class */ (function () {
    function LTSController() {
        this.graph = new Graph_1.Graph(function (a, b) {
            if (a < b)
                return -1;
            if (a > b)
                return 1;
            return 0;
        });
        this.current = [];
        this.A = new Set();
    }
    LTSController.prototype.addState = function (data) {
        this.graph.addNode(data);
    };
    LTSController.prototype.removeState = function (data) {
        var removed = this.graph.removeNode(data);
        if (removed == null) {
            try {
                throw new Error("removeNode: node \"" + data + "\" doesn't exist");
            }
            catch (e) {
                console.log(e);
            }
        }
        else {
            //cleanup current states list so it is consistent with the graph
            for (var i = 0; i < this.current.length; i++) {
                if (data == this.current[i]) {
                    this.current.splice(i, 1);
                    i--;
                }
            }
        }
    };
    LTSController.prototype.addTransition = function (source, destination, edgeLabel) {
        if (edgeLabel !== "") {
            this.graph.addEdge(source, destination, edgeLabel);
            if (!Constants_1.Constants.isSpecialAction(edgeLabel)) {
                this.A.add(edgeLabel);
            }
        }
        else {
            try {
                throw new Error('addTransition: given edgelabel is empty');
            }
            catch (error) {
                console.error(error);
            }
        }
    };
    LTSController.prototype.removeTransition = function (source, destination, edgeLabel) {
        this.graph.removeEdge(source, destination, edgeLabel);
    };
    /**
     * Set state/process we are currently in
     * if one current process is already the desired state, nothing happens
     * returns -1 if current state could not be set (for feedback purposes eg. visual feedback in UI)
     * @param state
     * @param index optional parameter, specify an index if you want to look at multiple states at once, otherwise index 0 is used
     */
    LTSController.prototype.setCurrentState = function (state, index) {
        var node = this.graph.getNode(state);
        //graph has node
        if (node != null) {
            //state isn't already current
            if (!this.current.some(function (element) { return state == element; })) {
                if (index !== undefined) {
                    this.current[index] = state;
                }
                else {
                    this.current[0] = state;
                }
            }
            else {
                return -1;
            }
        }
        else {
            try {
                throw new Error('setCurrentState: node \"' + state + "\" doesn't exist");
            }
            catch (e) {
                console.log(e);
            }
            return -1;
        }
        return 0;
    };
    /**
     * moves from one state to another if the action is possible
     * returns -1 if action could not be performed (for feedback purposes eg. visual feedback in UI)
     * @param source
     * @param destination
     * @param action
     */
    LTSController.prototype.performAction = function (source, destination, action) {
        var currentIndex = this.current.findIndex(function (state) { return source == state; });
        //if source is current state
        if (currentIndex !== undefined) {
            var sourceNode = this.graph.getNode(source);
            //if source exists in graph
            if (sourceNode != null) {
                //if such an edge exists
                if (sourceNode.hasEdge(destination, action)) {
                    this.current[currentIndex] = destination;
                    return 0;
                }
            }
        }
        return -1;
    };
    LTSController.prototype.getCurrentIndexOf = function (process) {
        return this.current.findIndex(function (value) { return value == process; });
    };
    /**
     *
     * @param node
     * @returns a set of all the outgoing transitions a process/state has except timeout actions
     */
    LTSController.prototype.getInitialActions = function (node) {
        var actionList = [];
        var nodeObj = this.graph.getNode(node);
        if (nodeObj != null) {
            for (var i = 0; i < nodeObj.adjacent.length; i++) {
                if (nodeObj.adjacent[i].edgeLabel !== Constants_1.Constants.TIMEOUT_ACTION) {
                    actionList.push(nodeObj.adjacent[i].edgeLabel);
                }
            }
        }
        return new Set(actionList);
    };
    LTSController.prototype.getActionsAndDestinations = function (node) {
        var edgeList = [];
        var edge = [];
        var nodeObj = this.graph.getNode(node);
        if (nodeObj != null) {
            for (var i = 0; i < nodeObj.adjacent.length; i++) {
                edge = [nodeObj.adjacent[i].edgeLabel, nodeObj.adjacent[i].node.data];
                edgeList.push(edge);
            }
        }
        return edgeList;
    };
    /**
     * searches the entire graph for all actions and returns a set of all the non special ones
     * @returns
     */
    LTSController.prototype.getAllVisibleActions = function () {
        var edgesInGraph = this.graph.getEdgesList();
        var edgeLabelsInGraph = [];
        for (var i = 0; i < edgesInGraph.length; i++) {
            for (var j = 0; j < edgesInGraph[i].length; j++) {
                if (edgesInGraph[i][j].edgeLabel !== Constants_1.Constants.HIDDEN_ACTION && edgesInGraph[i][j].edgeLabel !== Constants_1.Constants.TIMEOUT_ACTION) {
                    edgeLabelsInGraph.push(edgesInGraph[i][j].edgeLabel);
                }
            }
        }
        return new Set(edgeLabelsInGraph);
    };
    /**
     *
     * @param node
     * @returns a set of all outgoing transitions
     */
    LTSController.prototype.getOutgoingActions = function (node) {
        var actionList = [];
        var nodeObj = this.graph.getNode(node);
        if (nodeObj != null) {
            for (var i = 0; i < nodeObj.adjacent.length; i++) {
                actionList.push(nodeObj.adjacent[i].edgeLabel);
            }
        }
        return new Set(actionList);
    };
    /**
     *
     * @returns a set of all the action labels in the lts
     */
    LTSController.prototype.getAllActions = function () {
        var edgesInGraph = this.graph.getEdgesList();
        var edgeLabelsInGraph = [];
        for (var i = 0; i < edgesInGraph.length; i++) {
            for (var j = 0; j < edgesInGraph[i].length; j++) {
                //if edgeLabelsInGraph doesn't already contain the label
                edgeLabelsInGraph.push(edgesInGraph[i][j].edgeLabel);
            }
        }
        return new Set(edgeLabelsInGraph);
    };
    /**
     *
     * @param name
     * @returns true if a state exists in the lts
     */
    LTSController.prototype.hasState = function (name) {
        var node = this.graph.getNode(name);
        if (node != null) {
            return true;
        }
        return false;
    };
    LTSController.prototype.hasTransition = function (source, destination, edgeLabel) {
        var node1 = this.graph.getNode(source);
        if (node1 != null) {
            if (node1.hasEdge(destination, edgeLabel)) {
                return true;
            }
        }
        return false;
    };
    LTSController.prototype.setVisibleActions = function (A) {
        var B = this.getAllVisibleActions();
        if (SetOps_1.SetOps.isSubsetEq(B, A) && !SetOps_1.SetOps.hasSpecialAction(A)) {
            this.A = A;
        }
    };
    LTSController.prototype.addVisibleActionToA = function (action) {
        if (!Constants_1.Constants.isSpecialAction(action)) {
            this.A.add(action);
        }
    };
    /**
     * getter Method for A
     * @returns
     */
    LTSController.prototype.getVisibleActions = function () {
        return this.A;
    };
    return LTSController;
}());
exports.LTSController = LTSController;
