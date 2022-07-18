"use strict";
/**
 * Graph class with labelled nodes and edges
 * The core of this code originally stems from Ricardo Borges (https://ricardoborges.dev/data-structures-in-typescript-graph, last accessed: 18.07.2022)
 * I slightly modified it to feature labelled edges
 */
exports.__esModule = true;
/**
 * Graph uses adjacency lists
 */
var Graph = /** @class */ (function () {
    /*------------------ EXAMPLE ------------------
    
    function comparator(a: number, b: number) {
        if (a < b) return -1;
      
        if (a > b) return 1;
      
        return 0;
    }
      
    const graph = new Graph(comparator);
    -----------------------------------------------*/
    function Graph(comparator) {
        this.nodes = new Map();
        this.comparator = comparator;
    }
    /**
     * Add a new node if it was not added before
     * @param {T} data
     * @returns {Node<T>}
     */
    Graph.prototype.addNode = function (data) {
        var node = this.nodes.get(data);
        if (node)
            return node;
        node = new Node(data, this.comparator);
        this.nodes.set(data, node);
        return node;
    };
    /**
     *
     * @param data Remove a node from the graph and all nodes' adjacency lists
     * @returns
     */
    Graph.prototype.removeNode = function (data) {
        var nodeToRemove = this.nodes.get(data);
        if (!nodeToRemove)
            return null;
        this.nodes.forEach(function (node) {
            node.removeAdjacent(nodeToRemove.data);
        });
        this.nodes["delete"](data);
        return nodeToRemove;
    };
    /**
     * Create an edge between two nodes
     *
     * @param source
     * @param destination
     */
    Graph.prototype.addEdge = function (source, destination, edgeLabel) {
        var sourceNode = this.nodes.get(source);
        var destinationNode = this.nodes.get(destination);
        if (sourceNode && destinationNode) {
            sourceNode.addAdjacent(destinationNode, edgeLabel);
        }
        else {
            console.log('ERROR: addEdge: One or two nodes do not exist\nsource: ' + sourceNode + ', destination: ' + destinationNode);
        }
    };
    Graph.prototype.removeEdge = function (source, destination, edgeLabel) {
        var sourceNode = this.nodes.get(source);
        var destinationNode = this.nodes.get(destination);
        if (sourceNode && destinationNode) {
            sourceNode.removeAdjacentEdge(destination, edgeLabel);
        }
        else {
            console.log('ERROR: removeEdge: One or two nodes do not exist\nsource: ' + sourceNode + ', destination: ' + destinationNode);
        }
    };
    Graph.prototype.getNodeAmount = function () {
        return this.nodes.size;
    };
    Graph.prototype.getNode = function (data) {
        var node = this.nodes.get(data);
        if (node) {
            return node;
        }
        else {
            return null;
        }
    };
    Graph.prototype.getNodes = function () {
        var entries = [];
        this.nodes.forEach(function (node) {
            entries.push(node);
        });
        return entries;
    };
    Graph.prototype.getEdgesList = function () {
        var edges = [];
        this.nodes.forEach(function (node) {
            edges.push(node.adjacent);
        });
        return edges;
    };
    Graph.prototype.getEdgesAsString = function () {
        var edgeListList = this.getEdgesList();
        var edgeString = "";
        edgeListList.forEach(function (edgeList) {
            edgeString = edgeString.concat("[ ");
            edgeList.forEach(function (edge) {
                edgeString = edgeString.concat("(" + edge.edgeLabel + ", " + edge.node.toString() + ") ");
            });
            edgeString = edgeString.concat("]\n");
        });
        return edgeString;
    };
    /**
     * Disgustingly written print method, that is here purely for testing purposes
     */
    Graph.prototype.print = function () {
        console.log("vertices: " + this.getNodes().toString());
        console.log("edges: " + this.getEdgesAsString());
        var i = 0;
        this.nodes.forEach(function (node) {
            var edgestring = "Vertex " + i + ": ";
            for (var j = 0; j < node.adjacent.length; j++) {
                edgestring = edgestring.concat("(", node.adjacent[j].edgeLabel, ", ", node.adjacent[j].node.toString(), "), ");
            }
            console.log(edgestring);
            i++;
        });
    };
    return Graph;
}());
exports.Graph = Graph;
var Node = /** @class */ (function () {
    function Node(data, comparator) {
        var _this = this;
        this.toString = function () {
            var toPrint = "";
            if (_this.getType(_this.data) === "string") {
                toPrint = String(_this.data);
            }
            else if (_this.getType(_this.data) === "number") {
                toPrint = Number(_this.data).toString();
            }
            else if (_this.getType(_this.data) === "boolean") {
                toPrint = Boolean(_this.data).toString();
            }
            else {
                toPrint = "<Unknown Type>";
            }
            return toPrint;
        };
        this.data = data;
        this.adjacent = [];
        this.comparator = comparator;
    }
    Node.prototype.addAdjacent = function (node, edge) {
        this.adjacent.push({ node: node, edgeLabel: edge });
    };
    /**
     * remove an edge with a label to a node
     * @param data
     * @param edge
     * @returns
     */
    Node.prototype.removeAdjacentEdge = function (data, edge) {
        var _this = this;
        var index = 0;
        this.adjacent.forEach(function (_a) {
            var node = _a.node, edgeLabel = _a.edgeLabel;
            //find adjacent node
            if (_this.comparator(node.data, data) === 0) {
                if (edgeLabel === edge) {
                    return _this.adjacent.splice(index, 1)[0].node;
                }
            }
            index++;
        });
        //if no edge is found, return null
        return null;
    };
    /**
     * remove all edges to a node
     * @param data
     * @returns
     */
    Node.prototype.removeAdjacent = function (data) {
        var _this = this;
        var index = 0;
        var node = null;
        this.adjacent.forEach(function (_a) {
            var node = _a.node, edgeLabel = _a.edgeLabel;
            //find adjacent node
            if (_this.comparator(node.data, data) === 0) {
                node = _this.adjacent.splice(index, 1)[0].node; //will always be the same node but overwritten multiple times if multiple edges
            }
            index++;
        });
        //if no edge is found, return null
        return node;
    };
    Node.prototype.getType = function (type) {
        return typeof type;
    };
    Node.prototype.printEdge = function (edge) {
        var tmp = "[";
        tmp.concat(edge.edgeLabel, ", ");
        tmp.concat(edge.node.toString(), "]");
        return tmp;
    };
    return Node;
}());
exports.Node = Node;
//----------------------------------------- TESTING -----------------------------------------
function comparator0(a, b) {
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}
var graph = new Graph(comparator0);
graph.addNode(0);
graph.addNode(1);
graph.addNode(2);
graph.addEdge(0, 1, 'a');
graph.addEdge(0, 2, 't');
graph.print();
