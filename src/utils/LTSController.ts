import {Graph, Node} from './Graph'
/**
 * Model for representing LTS in code
 */
export default class LTSController {
    graph: Graph<string>;
    current: string[];  //the state/process we are currently in

    constructor(comparator: (a: string, b: string) => number) {
        this.graph = new Graph((a, b) => {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
        })
        this.current = [];
    }


}