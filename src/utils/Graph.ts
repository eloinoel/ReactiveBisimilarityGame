export class Graph {
    private nodes: Node[];
    private adjMatrix: number[][];

    constructor(nodes: Node[], adjMatrix: number[][]) {
        this.nodes = [];
        this.adjMatrix = [];
    }

    getSize(): number {
        return this.nodes.length;
    }

    getNode(index: number): Node {
        return this.nodes[index];
    }

    /* insertNode(name: string) : Node {

    } */

}

class Node {
    private name: string;

    constructor(public nodeName: string) {
        this.name = nodeName;
    }

}