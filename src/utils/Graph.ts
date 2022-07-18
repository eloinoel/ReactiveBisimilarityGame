/**
 * Graph class with labelled nodes and edges
 * The core of this code originally stems from Ricardo Borges (https://ricardoborges.dev/data-structures-in-typescript-graph, last accessed: 18.07.2022)
 * I slightly modified it to fit my needs
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
    addEdge(source: T, destination: T): void {
        const sourceNode = this.nodes.get(source);
        const destinationNode = this.nodes.get(destination);

        if(sourceNode && destinationNode) {
            sourceNode.addAdjacent(destinationNode);
        } else {
            console.log('ERROR: addEdge: One or two nodes do not exist\nsource: ' + sourceNode + ', destination: ' + destinationNode);
        }
    }

    removeEdge(source: T, destination: T): void {
        const sourceNode = this.nodes.get(source);
        const destinationNode = this.nodes.get(destination);

        if(sourceNode && destinationNode) {
            sourceNode.removeAdjacent(destination);
        } else {
            console.log('ERROR: removeEdge: One or two nodes do not exist\nsource: ' + sourceNode + ', destination: ' + destinationNode);
        }
    }


    getSize(): number {
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
}

export class Node <T>{
    data: T;
    private adjacent: Node<T>[];
    private comparator : (a: T, b: T) => number; //used to differentiate nodes using their data

    constructor(data: T, comparator: (a: T, b: T) => number) {
        this.data = data;
        this.adjacent = []
        this.comparator = comparator;
    }

    addAdjacent(node: Node<T>): void {
        this.adjacent.push(node);
    }

    removeAdjacent(data: T): Node<T> | null {
        const index = this.adjacent.findIndex(
            (node) => this.comparator(node.data, data) === 0
        );
        
        if(index > -1) {
            return this.adjacent.splice(index, 1)[0];
        }

        return null;
    }
}