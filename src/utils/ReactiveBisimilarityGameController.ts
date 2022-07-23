import { LTSController } from './LTSController';
import { Constants } from './Constants';
import { AttackerNode, GamePosition, RestrictedAttackerNode, RestrictedSimulationDefenderNode, SimulationDefenderNode, Player } from './GamePosition';
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
     * @action action to perform, supply an empty string for symmetry moves
     * @returns 
     */
    isMovePossible(action: string, nextPosition: GamePosition, curPosition?: GamePosition, environment?: Set<string>): boolean {
        let A = this.lts.getAllActions();

        //deal with some optional arguments
        if(curPosition === undefined) {
            curPosition = this.play[this.play.length - 1]; //get last element in move history
        }
        if(environment === undefined) {
            environment = this.environment; //TODO: check if this ruins anything 
        }

        //check if environment is viable
        if(!SetOps.isSubsetEq(environment, A)) {
            this.printError('isMovePossible: environment is not a subset of all the possible actions in the LTS.')
            return false;
        }

        //check if action is viable
        if(!(action === Constants.NO_ACTION)) {  //empty action means symmetry move
            if(!environment?.has(action) || !A.has(action)) {
                return false;
            }
        }
        
        //check if processes of positions exist in LTS
        if(curPosition == null || curPosition.process1 == null || curPosition.process2 == null 
        || !this.lts.hasState(curPosition.process1) || !this.lts.hasState(curPosition.process2)) {
            return false;
        }
        if(nextPosition == null || nextPosition.process1 == null || !this.lts.hasState(nextPosition.process1)
        || nextPosition.process2 == null || !this.lts.hasState(nextPosition.process2)) {
            return false;
        }

        /* check all game move cases */
        //- check if action is possible from p or q
        if(curPosition instanceof AttackerNode) {
            //symmetry move
            if(action === Constants.NO_ACTION) {
                return true;
            //does process1 have the action it is supposed to execute
            } else if(this.lts.getInitialActions(curPosition.process1).has(action)) {
                //simulation challenge
                if(nextPosition instanceof SimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2) {
                    //check conditions of move, may be redundant with other code but for clarity's sake
                    if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && (A.has(action) || action === Constants.HIDDEN_ACTION)) {
                        return true;
                    }
                //timeout simulation challenge
                } else if(nextPosition instanceof RestrictedSimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2
                     && environment === nextPosition.environment && nextPosition.previousAction === Constants.TIMEOUT_ACTION) {
                    //check move conditions
                    if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && this.initialsEmpty(curPosition.process1, environment) 
                    && SetOps.isSubsetEq(environment, A)) {
                        return true;
                    }
                }
            }
        } else if(curPosition instanceof SimulationDefenderNode) {
            if(action !== Constants.NO_ACTION) {
                //simulation answer
                if(nextPosition instanceof AttackerNode && curPosition.process1 === nextPosition.process1 && action === curPosition.previousAction) {
                    if(this.lts.hasTransition(curPosition.process2, nextPosition.process2, action)) {
                        return true;
                    }
                }
            }
        } else if(curPosition instanceof RestrictedAttackerNode) {
            //restricted symmetry move
            if(action === Constants.NO_ACTION) {
                return true;
            } else if(this.lts.getInitialActions(curPosition.process1).has(action)) {
                //restricted simulation challenge
                if(nextPosition instanceof SimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2) {
                    if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && A.has(action) && (environment.has(action) || this.initialsEmpty(curPosition.process1, environment))) {
                        return true;
                    }
                //invisible simulation challenge
                } else if(nextPosition instanceof RestrictedSimulationDefenderNode && nextPosition.previousAction === action && action === Constants.HIDDEN_ACTION && curPosition.process2 === nextPosition.process2) {
                    if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action)) {
                        return true;
                    }
                //timeouted timeout simulation challenge
                } else if(nextPosition instanceof RestrictedSimulationDefenderNode && nextPosition.previousAction === action && action === Constants.TIMEOUT_ACTION && curPosition.process2 === nextPosition.process2) {
                    if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && this.initialsEmpty(curPosition.process1, SetOps.union(curPosition.environment, environment)) && SetOps.isSubsetEq(environment, A)) {
                        return true;
                    }
                }
            }
        } else if(curPosition instanceof RestrictedSimulationDefenderNode) {
            if(action !== Constants.NO_ACTION) {
                //timeout simulation answer and invisible simulation answer
                if(nextPosition instanceof RestrictedAttackerNode && curPosition.process1 == nextPosition.process1 && SetOps.areEqual(curPosition.environment, nextPosition.environment) && action === curPosition.previousAction) {
                    if(this.lts.hasTransition(curPosition.process2, nextPosition.process2, action)) {
                        return true;
                    }
                }
            }
        } else {
            this.printError('isMovePossible: unknown game position type')
            return false;
        }
        return false;
    }

    /**
     * perform a move in the current play
     * @param action 
     * @param nextPosition 
     * @param curPosition 
     * @returns -1 if the move could not be carried out
     */
    performMove(action: string, nextPosition: GamePosition): number {

        //check if move is possible
        let curPosition = this.play[this.play.length - 1];
        let legalMove = this.isMovePossible(action, nextPosition, curPosition, this.environment);
        if(!legalMove) {
            return -1;
        }

        //update currents
        let process1Index = this.lts.getCurrentIndexOf(curPosition.process1);
        let process2Index = this.lts.getCurrentIndexOf(curPosition.process2);
        if(process1Index === -1 || process2Index === -1) {
            this.printError('performMove: current states from LTS differ from current game position.');
        }
        this.lts.setCurrentState(nextPosition.process1, process1Index);
        this.lts.setCurrentState(nextPosition.process2, process2Index);

        //update move history
        this.play.push(nextPosition);

        return 0;
    }

    /**
     * 
     * @param error throws an error message that prints in red to the console
     */
    printError(error: string) {
        try {
            throw(error);
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * returns true if: initialActions(process) <intersect> (environment <union> {hidden action}) == empty set
     * @param process 
     * @param environment 
     * @returns 
     */
    initialsEmpty(process: string, environment: Set<string>): boolean {
        if(this.lts.hasState(process)) {
            let initials = this.lts.getInitialActions(process);
            let union = SetOps.union(environment, new Set<string>([...Constants.HIDDEN_ACTION]));
            if(SetOps.isEmpty(SetOps.intersect(initials, union))) {
                return true;
            }
        }
        return false;
    }

    /**
     * The environment can change at any time
     * @param newEnv new Environment
     */
    setEnvironment(newEnv: Set<string>) {
        this.environment = newEnv;
    }


}