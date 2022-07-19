import {Graph, Node} from './Graph'
/**
 * Model for representing LTS in code
 */
export default class LTSController {
    graph: Graph<string>;
    current: string[];  //the states/processes we are currently in, can be more than one eg. when we compare two processes

    constructor(comparator: (a: string, b: string) => number) {
        this.graph = new Graph((a, b) => {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
        })
        this.current = [];
    }

    addState(data: string): void {
        this.graph.addNode(data);
    }

    removeState(data: string): void {
        let removed = this.graph.removeNode(data);
        if(removed == null) {
            try {
                throw new Error("removeNode: node \"" + data + "\" doesn't exist");
            } catch (e) {
                console.log(e)
            }
        } else {
            //cleanup current states list so it is consistent with the graph
            for(let i = 0; i < this.current.length; i++) {
                if(data == this.current[i]) {
                    this.current.splice(i, 1);
                    i--;
                }
            }
        }
    }

    addTransition(source: string, destination: string, edgeLabel: string): void {
        this.graph.addEdge(source, destination, edgeLabel);
    }

    removeTransition(source: string, destination: string, edgeLabel: string): void {
        this.graph.addEdge(source, destination, edgeLabel);
    }

    /**
     * Set state/process we are currently in
     * if one current process is already the desired state, nothing happens
     * returns -1 if current state could not be set (for feedback purposes eg. visual feedback in UI)
     * @param state 
     * @param index optional parameter, specify an index if you want to look at multiple states at once, otherwise index 0 is used
     */
    setCurrentState(state: string, index?: number): number {
        let node = this.graph.getNode(state);

        //graph has node
        if(node != null) {
            //state isn't already current
            if(!this.current.some((element) => state == element)) {
                if(typeof index !== 'undefined') {
                    this.current[index] = state;
                } else {
                    this.current[0] = state
                }
            } else {
                return -1;
            }
        } else {
            try {
                throw new Error('setCurrentState: node \"' + state + "\" doesn't exist");
            } catch(e) {
                console.log(e);
            }
            return -1;
        }
        return 0;
    }

    /**
     * moves from one state to another if the action is possible 
     * returns -1 if action could not be performed (for feedback purposes eg. visual feedback in UI)
     * @param source 
     * @param destination 
     * @param action 
     */
    performAction(source: string, destination: string, action: string): number {
        let currentIndex = this.current.findIndex(state => source == state);

        //if source is current state
        if(typeof currentIndex !== 'undefined') {
            let sourceNode = this.graph.getNode(source);
            //if source exists in graph
            if(sourceNode != null) {
                //if such an edge exists
                if(sourceNode.hasEdge(destination, action)) {
                    this.current[currentIndex] = destination;
                    return 0;
                }
            }
        }
        return -1;
    }
}