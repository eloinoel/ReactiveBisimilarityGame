import { Constants } from './Constants';
import {Graph} from './Graph';
import { SetOps } from './SetOps';
/**
 * Model for representing LTS in code
 */
export class LTSController {
    graph: Graph<string>;
    current: string[];  //the states/processes we are currently in, can be more than one eg. when we compare two processes
    private A: Set<string>; //set of visible actions

    constructor() {
        this.graph = new Graph((a, b) => {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
        })
        this.current = [];
        this.A = new Set<string>();
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
        if(edgeLabel !== "") {
            this.graph.addEdge(source, destination, edgeLabel);
            if(!Constants.isSpecialAction(edgeLabel)) {
                this.A.add(edgeLabel);
            }
        } else {
            try {
                throw new Error('addTransition: given edgelabel is empty');
            } catch (error) {
                console.error(error);
            }
        }
    }

    removeTransition(source: string, destination: string, edgeLabel: string): void {
        this.graph.removeEdge(source, destination, edgeLabel);
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
            if(index !== undefined) {
                this.current[index] = state;
            } else {
                this.current[0] = state
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
        if(currentIndex !== undefined) {
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

    getCurrentIndexOf(process: string): number {
        return this.current.findIndex( value => value == process);
    }

    /**
     * 
     * @param node 
     * @returns a set of all the outgoing transitions a process/state has except timeout actions
     */
    getInitialActions(node: string): Set<string> {
        let actionList: string[] = [];
        let nodeObj = this.graph.getNode(node);

        if(nodeObj != null) {
            for(let i = 0; i < nodeObj.adjacent.length; i++) {
                if(nodeObj.adjacent[i].edgeLabel !== Constants.TIMEOUT_ACTION) {
                    actionList.push(nodeObj.adjacent[i].edgeLabel);
                }
            }
        }

        return new Set<string>(actionList);
    }

    /**
     * returns an array of tupels (edge list) containing the edgelabel and destination of a transition from the given node
     * @param node 
     * @returns 
     */
    getActionsAndDestinations(node: string): string[][] {
        let edgeList = [];
        let edge: string[] = [];
        let nodeObj = this.graph.getNode(node);

        if(nodeObj != null) {
            for(let i = 0; i < nodeObj.adjacent.length; i++) {
                edge = [nodeObj.adjacent[i].edgeLabel, nodeObj.adjacent[i].node.data as string] 
                edgeList.push(edge);
            }
        }
        return edgeList;
    }

    /**
     * returns undefined if there is no action between the two processes
     * @param node1 
     * @param node2 
     */
    getActionBetweenTwoProcesses(source: string, destination: string): string | undefined {
        let edges = this.getActionsAndDestinations(source);
        let e = edges.filter((edge) => (edge[1] === destination));
        if (e.length === 0) {
            return undefined;
        } else {
            return e[0][0];
        } 
    }

    /**
     * searches the entire graph for all actions and returns a set of all the non special ones
     * @returns 
     */
    private getAllVisibleActions(): Set<string> {
        let edgesInGraph = this.graph.getEdgesList();
        let edgeLabelsInGraph: string[] = [];

        for(let i = 0; i < edgesInGraph.length; i++) {
            for(let j = 0; j < edgesInGraph[i].length; j++) {
                if(edgesInGraph[i][j].edgeLabel !== Constants.HIDDEN_ACTION && edgesInGraph[i][j].edgeLabel !== Constants.TIMEOUT_ACTION) {
                    edgeLabelsInGraph.push(edgesInGraph[i][j].edgeLabel);
                }
            }
        }

        return new Set<string>(edgeLabelsInGraph);
    }

    /**
     * 
     * @param node 
     * @returns a set of all outgoing transitions of a node
     */
    getOutgoingActions(node: string): Set<string> {
        let actionList: string[] = [];
        let nodeObj = this.graph.getNode(node);

        if(nodeObj != null) {
            for(let i = 0; i < nodeObj.adjacent.length; i++) {
                actionList.push(nodeObj.adjacent[i].edgeLabel);
            }
        }

        return new Set<string>(actionList);
    }

    /**
     * 
     * @returns a set of all the action labels in the lts
     */
    getAllActions(): Set<string> {
        let edgesInGraph = this.graph.getEdgesList();
        let edgeLabelsInGraph: string[] = [];

        for(let i = 0; i < edgesInGraph.length; i++) {
            for(let j = 0; j < edgesInGraph[i].length; j++) {
                //if edgeLabelsInGraph doesn't already contain the label
                edgeLabelsInGraph.push(edgesInGraph[i][j].edgeLabel);
            }
        }

        return new Set<string>(edgeLabelsInGraph);
    }

    /**
     * 
     * @param name 
     * @returns true if a state exists in the lts
     */
    hasState(name: string): boolean {
        let node = this.graph.getNode(name);
        if(node != null) {
            return true
        }
        return false;
    }

    /**
     * if @edgeLabel is undefined, function will return true if @source has any edge to @destination
     * @param source 
     * @param destination 
     * @param edgeLabel 
     * @returns 
     */
    hasTransition(source: string, destination: string, edgeLabel?: string): boolean {
        let node1 = this.graph.getNode(source);
        if(node1 != null) {
            //if edgeLabel is undefined, hasEdge will return true if source has any edge to destination
            if(node1.hasEdge(destination, edgeLabel)) {
                return true;
            }
        }
        return false;
    }

    setVisibleActions(A: Set<string>): void {
        let B = this.getAllVisibleActions();
        if(SetOps.isSubsetEq(B, A) && !SetOps.hasSpecialAction(A)) {
            this.A = A;
        }
    }

    addVisibleActionToA(action: string): void {
        if(!Constants.isSpecialAction(action)) {
            this.A.add(action);
        }
    }

    /**
     * getter Method for A
     * @returns 
     */
    getVisibleActions(): Set<string> {
        return new Set(this.A);
    }

    copy(): LTSController {
        let clone = new LTSController();
        clone.graph = this.graph.copy();
        clone.current = [];
        for(let i = 0; i < this.current.length; i++) {
            clone.current.push(this.current[i])
        }
        this.A.forEach((value) => {
            clone.addVisibleActionToA(value);
        })
        return clone;
    }
}

