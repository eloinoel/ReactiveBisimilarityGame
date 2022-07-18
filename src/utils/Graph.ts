/**
 * Graph class with labelled nodes and edges
 * The core of this code originally stems from Ricardo Borges (https://ricardoborges.dev/data-structures-in-typescript-graph, last accessed: 18.07.2022)
 * I slightly modified it to feature labelled edges
 */

/**
 * Graph uses adjacency lists
 */
export class Graph<T> {
    private nodes: Map<T, Node<T>> = new Map();
    private comparator: (a: T, b: T) => number; //used in Node<T> class to differentiate nodes
    /*------------------ EXAMPLE ------------------
    
    function comparator(a: number, b: number) {
        if (a < b) return -1;
      
        if (a > b) return 1;
      
        return 0;
    }
      
    const graph = new Graph(comparator);
    -----------------------------------------------*/

    constructor(comparator: (a: T, b: T) => number) {
        this.comparator = comparator;
    }

    /**
     * Add a new node if it was not added before
     * @param {T} data
     * @returns {Node<T>}
     */
    addNode(data: T): Node<T> {
        let node = this.nodes.get(data);
        if(node) return node;

        node = new Node(data, this.comparator);
        this.nodes.set(data, node);
        return node;
    }

    /**
     * 
     * @param data Remove a node from the graph and all nodes' adjacency lists
     * @returns 
     */
    removeNode(data: T): Node<T> | null {
        const nodeToRemove = this.nodes.get(data);

        if(!nodeToRemove) return null;

        this.nodes.forEach((node) => {
            node.removeAdjacent(nodeToRemove.data);
        })
        this.nodes.delete(data);

        return nodeToRemove;
    }

    /**
     * Create an edge between two nodes
     * 
     * @param source 
     * @param destination 
     */
    addEdge(source: T, destination: T, edgeLabel: string): void {
        const sourceNode = this.nodes.get(source);
        const destinationNode = this.nodes.get(destination);

        if(sourceNode && destinationNode) {
            sourceNode.addAdjacent(destinationNode, edgeLabel);
        } else {
            console.log('ERROR: addEdge: One or two nodes do not exist\nsource: ' + sourceNode + ', destination: ' + destinationNode);
        }
    }

    removeEdge(source: T, destination: T, edgeLabel: string): void {
        const sourceNode = this.nodes.get(source);
        const destinationNode = this.nodes.get(destination);

        if(sourceNode && destinationNode) {
            sourceNode.removeAdjacentEdge(destination, edgeLabel);
        } else {
            console.log('ERROR: removeEdge: One or two nodes do not exist\nsource: ' + sourceNode + ', destination: ' + destinationNode);
        }
    }


    getNodeAmount(): number {
        return this.nodes.size;
    }

    getNode(data: T): Node<T> | null {
        let node = this.nodes.get(data);
        if(node) {
            return node;
        } else {
            return null;
        }
    }

    getNodes(): Node<T>[] {
        let entries: Node<T>[] = [];
        this.nodes.forEach((node) => { //(value, key)
            entries.push(node);
        })
        return entries;
    }

    getEdgesList(): {node: Node<T>, edgeLabel: string}[][] {
        let edges: {node: Node<T>, edgeLabel: string}[][] = [];
        this.nodes.forEach((node) => {
            edges.push(node.adjacent);
        })
        return edges;
    }

    getEdgesAsString(): string {
        let edgeListList = this.getEdgesList();
        let edgeString = "";
        edgeListList.forEach((edgeList) => {
            edgeString = edgeString.concat("[ ")
            edgeList.forEach((edge) => {
                edgeString = edgeString.concat("(" + edge.edgeLabel + ", " + edge.node.toString() +  ") ");
            })
            edgeString = edgeString.concat("]\n");
        });
        return edgeString;
    }

    /**
     * Disgustingly written print method, that is here purely for testing purposes
     */
    print(): void {
        console.log("vertices: " + this.getNodes().toString());
        console.log("edges: " + this.getEdgesAsString());
            

        let i = 0;
        this.nodes.forEach((node) => {
            let edgestring = "Vertex " + i + ": ";
            for(let j = 0; j < node.adjacent.length; j++) {
                edgestring = edgestring.concat("(", node.adjacent[j].edgeLabel, ", ", node.adjacent[j].node.toString(), "), ");
            }
            console.log(edgestring);
            i++;
        })

    }
}

export class Node <T>{
    data: T;
    adjacent: {node: Node<T>, edgeLabel: string}[];
    private comparator : (a: T, b: T) => number; //used to differentiate nodes using their data

    constructor(data: T, comparator: (a: T, b: T) => number) {
        this.data = data;
        this.adjacent = [];
        this.comparator = comparator;
    }

    addAdjacent(node: Node<T>, edge: string): void {
        this.adjacent.push({node: node, edgeLabel: edge});
    }

    /**
     * remove an edge with a label to a node
     * @param data 
     * @param edge
     * @returns 
     */
    removeAdjacentEdge(data: T, edge: string): Node<T> | null {
        let index = 0;
        this.adjacent.forEach( ({node, edgeLabel}) => {
            //find adjacent node
            if(this.comparator(node.data, data) === 0) {
                if(edgeLabel === edge) {
                    return this.adjacent.splice(index, 1)[0].node;
                }
            }
            index++;
        })

        //if no edge is found, return null
        return null;
    }

    /**
     * remove all edges to a node
     * @param data 
     * @returns 
     */
    removeAdjacent(data: T): Node<T> | null {
        let index = 0;
        let node = null;
        this.adjacent.forEach(({node, edgeLabel}) => {
            //find adjacent node
            if(this.comparator(node.data, data) === 0) {
                node = this.adjacent.splice(index, 1)[0].node; //will always be the same node but overwritten multiple times if multiple edges
            }
            index++;
        })

        //if no edge is found, return null
        return node;
    }

    getType<T>(type: T): string {
        return typeof type;
    }

    printEdge(edge: {node: Node<T>, edgeLabel: string}): string {
        let tmp = "[";
        tmp.concat(edge.edgeLabel, ", "); 
        tmp.concat(edge.node.toString(), "]");
        return tmp;
    }

    public toString = () : string => {
        let toPrint = "";
        if(this.getType(this.data) === "string") {
            toPrint = String(this.data);
        } else if (this.getType(this.data) === "number") {
            toPrint = Number(this.data).toString();
        } else if (this.getType(this.data) === "boolean") {
            toPrint = Boolean(this.data).toString();
        } else {
            toPrint = "<Unknown Type>";
        }

        return toPrint;
    }
}


//----------------------------------------- TESTING -----------------------------------------
function comparator0(a: number, b: number) {
    if (a < b) return -1;
  
    if (a > b) return 1;
  
    return 0;
}
  
const graph = new Graph(comparator0);
graph.addNode(0);
graph.addNode(1);
graph.addNode(2);
graph.addEdge(0, 1, 'a');
graph.addEdge(0, 2, 't');
graph.print();


