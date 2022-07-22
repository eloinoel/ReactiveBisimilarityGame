import { LTSController } from './LTSController';
import { Constants } from './Constants';
import { AttackerNode, GamePosition } from './GamePosition';
import { SetOps } from './SetOps';

export default class ReactiveBisimilarityGame {

    lts: LTSController; //lts for the game to be played on
    play: GamePosition[];
    environment: Set<string>; //set of currently possible actions, can be triggered to change at any time

    constructor(process1: string, process2: string, lts: LTSController) {
        this.lts = lts;
        this.environment = new Set<string>();
        this.play = [];
        this.startNewGame(process1, process2);
    }

    /**
     * init currents and other data structures
     * @returns -1 if something went wrong
     */
    startNewGame(process1: string, process2:string, startingPosition?: GamePosition): Number {
        if(this.lts.hasState(process1) && this.lts.hasState(process2)) {
            this.lts.setCurrentState(process1, 0);
            this.lts.setCurrentState(process2, 1);
            this.environment = this.lts.getAllActions();

            if(startingPosition !== undefined) {
                this.play.push(new AttackerNode(process1, process2));
            } else {
                this.play.push(startingPosition!);
            }
        } else {
            try {
                throw new Error('Could not start new game: some of the processes do not exist.');
            } catch (error) {
                console.log(error);
            }
            return -1;
        }
        return 0;
    }

    /**
     * check if any kind of move from the definition is possible in a position
     * @position if evaluation for an other position than the current position is needed
     * @action action to perform
     * @returns 
     */
    isMovePossible(action: string, curPosition?: GamePosition, environment?: Set<string>): boolean {
        if(curPosition === undefined) {
            curPosition = this.play[this.play.length - 1]; //get last element in move history
        }
        if(environment === undefined) {
            environment = this.lts.getAllActions();
        }
        //check if action is in environment
        if(!environment?.has(action)) {
            return false;
        }

        /* check all game position cases */
        //simulation challenge


        return false;
    }

    /**
     * The environment can change at any time
     * @param newEnv new Environment
     */
    setEnvironment(newEnv: Set<string>) {
        this.environment = newEnv;
    }

    performMove(): Number {
        return -1;
    }



}