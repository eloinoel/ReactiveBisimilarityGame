import {LTSController} from './LTSController';

export default class ReactiveBisimilarityGame {

    lts: LTSController; //lts for the game to be played on
    //moveHistory
    environment: Set<string>; //set of currently possible actions, can be triggered to change at any time

    constructor() {
        this.lts = new LTSController();
        this.environment = new Set<string>();
    }

    /**
     * init currents and other data structures
     * @returns -1 if something went wrong
     */
    startNewGame(): Number {
        return -1;
    }

    /**
     * check if any kind of move from the definition is possible
     * @returns 
     */
    isMovePossible(): boolean {
        return false;
    }

    performMove(): Number {
        return -1;
    }

}