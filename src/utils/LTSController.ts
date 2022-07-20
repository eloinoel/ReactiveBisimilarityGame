import {Graph, Node} from './Graph'
/**
 * Model for representing LTS in code
 */
export default class LTSController {
    graph: Graph<string>;
    current: string[];  //the states/processes we are currently in, can be more than one eg. when we compare two processes

    constructor() {
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

//----------------------------------------- TESTING -----------------------------------------

/*
  
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
lts.performAction("0", "1", "a");   //possible
lts.performAction("1", "2", "a");   //not possible
lts.performAction("1", "3", "tau"); //possible
console.log("current: " + lts.current);
lts.setCurrentState("3", 1);
console.log(lts.current);
lts.graph.print();

*/