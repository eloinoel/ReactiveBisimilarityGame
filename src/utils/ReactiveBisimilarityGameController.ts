import { LTSController } from './LTSController';
import { Constants } from './Constants';
import { AttackerNode, GamePosition, RestrictedAttackerNode, RestrictedSimulationDefenderNode, SimulationDefenderNode, Player } from './GamePosition';
import { SetOps } from './SetOps';

export class ReactiveBisimilarityGame {

    lts: LTSController; //lts for the game to be played on
    play: GamePosition[];
    private environment: Set<string>; //set of currently possible actions, can be triggered to change at any time

    constructor(process1: string, process2: string, lts: LTSController) {
        this.lts = lts;
        this.environment = new Set<string>();
        this.play = [];
        this.startNewGame(process1, process2);
    }

    /**
     * init currents and other data structures
     * @startingPosition if the game starts with a position other than an attacker node
     * @returns -1 if something went wrong
     */
    startNewGame(process1: string, process2:string, startingPosition?: GamePosition): Number {
        if(this.lts.hasState(process1) && this.lts.hasState(process2)) {
            this.lts.setCurrentState(process1, 0);
            this.lts.setCurrentState(process2, 1);
            this.environment = this.getAllNormalActions();

            if(startingPosition !== undefined && startingPosition !== null 
                && startingPosition.process1 === process1 && startingPosition.process2 === process2) {
                this.play.push(startingPosition!);
                if(startingPosition instanceof RestrictedAttackerNode || startingPosition instanceof RestrictedSimulationDefenderNode) {
                    this.environment = startingPosition.environment;
                }
            } else {
                this.play.push(new AttackerNode(process1, process2));
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
    isMovePossible(action: string, nextPosition: GamePosition, environment?: Set<string>, curPosition?: GamePosition,): boolean {
        let A = this.getAllNormalActions();

        //deal with some optional arguments
        if(curPosition === undefined) {
            curPosition = this.play[this.play.length - 1]; //get last element in move history
        }
        if(environment === undefined) {
            environment = this.environment; //TODO: check if this ruins anything 
        }

        //check if action is viable
        if(!Constants.isSpecialAction(action) && (!environment?.has(action) || !A.has(action))) {  //empty action means symmetry move
            this.printError('False: action not viable');
            return false;
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
        let legalMove = this.isMovePossible(action, nextPosition, this.environment, curPosition);
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

    getAllNormalActions(): Set<string> {
        let a = SetOps.toArray(this.lts.getAllActions());
        for(let i = 0; i < a.length; i++) {
            if(Constants.isSpecialAction(a[i])) {
                a.splice(i, 1);
                i--;
            }
        }
        return new Set(a);
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
            let union = SetOps.union(environment, new Set<string>([Constants.HIDDEN_ACTION]));
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
        if(!newEnv.has(Constants.HIDDEN_ACTION) && !newEnv.has(Constants.NO_ACTION) && !newEnv.has(Constants.TIMEOUT_ACTION)) {
            let tmp = SetOps.toArray(newEnv).sort();
            this.environment = new Set(tmp);
            console.log("Environment was set to {" + SetOps.toArray(this.environment) + "}.");
        } else {
            this.printError('setEnvironment: Error: some illegal action in given environment');
        }
    }

    getEnvironment(): Set<string> {
        return this.environment;
    }

    resetEnvironment() {
        this.environment = new Set(SetOps.toArray(this.getAllNormalActions()).sort());
        console.log("Environment was reset to {" + SetOps.toArray(this.environment) + "}.");
    }

    /**
     * TODO:
     * good for debugging purposes
     * @param process 
     */
    possibleMoves(curPosition: GamePosition): GamePosition[] {
        let moves: GamePosition[] = []

        if(!this.lts.hasState(curPosition.process1) || !this.lts.hasState(curPosition.process2)) {
            this.printError('possibleMoves: some process from given game position does not exist');
            return moves;
        }
        if(curPosition.activePlayer === Player.Attacker) {
            //symmetry move
            if(this.isMovePossible(Constants.NO_ACTION, curPosition.invertProcesses(), this.environment, curPosition)) {
                moves.push(curPosition.invertProcesses());
            }
            //other moves
            let actions = this.lts.getInitialActions(curPosition.process1)
            if(curPosition instanceof AttackerNode) {

            } else if(curPosition instanceof RestrictedAttackerNode) {

            }
            //TODO: LTS or this class should have generate moves function, to just call isMovePossible() upon 

        } else {

        }


        let pos = new AttackerNode("TO", "DO");
        return [pos];
    } 


}