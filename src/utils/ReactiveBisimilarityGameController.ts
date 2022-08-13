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
            this.environment = this.lts.getVisibleActions();

            if(startingPosition !== undefined && startingPosition !== null 
                && startingPosition.process1 === process1 && startingPosition.process2 === process2) {
                this.play.push(startingPosition!);
                if(startingPosition instanceof RestrictedAttackerNode || startingPosition instanceof RestrictedSimulationDefenderNode) {
                    this.environment = startingPosition.environment;
                }
            } else {
                this.play.push(new AttackerNode(process1, process2));
            }
        } else if (process1 === "" && process2 === "") {
            return 1;
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
        let A = this.lts.getVisibleActions();

        //deal with some optional arguments
        if(curPosition === undefined) {
            curPosition = this.play[this.play.length - 1]; //get last element in move history
        }
        if(environment === undefined) {
            //console.log("environment undefined")    //TODO: debug
            environment = this.environment; //TODO: check if this ruins anything 
        }

        //check if action is viable
        if(!Constants.isSpecialAction(action) && (!environment?.has(action) || !A.has(action))) {  //empty action means symmetry move
            //this.printError('False: action not viable');    //TODO: delete debug
            return false;
        }
        
        //check if processes of positions exist in LTS
        if(curPosition == null || curPosition.process1 == null || curPosition.process2 == null 
        || !this.lts.hasState(curPosition.process1) || !this.lts.hasState(curPosition.process2)) {
            //this.printError('False: curPosition not viable'); //TODO: delete debug
            return false;
        }
        if(nextPosition == null || nextPosition.process1 == null || !this.lts.hasState(nextPosition.process1)
        || nextPosition.process2 == null || !this.lts.hasState(nextPosition.process2)) {
            //this.printError('False: nextPosition not viable'); //TODO: delete debug
            return false;
        }

        /* check all game move cases */
        //- check if action is possible from p or q
        if(curPosition instanceof AttackerNode) {
            //this.printError('isMovePossible: curPosition AttackerNode if case'); //TODO: delete debug
            //console.log("outgoing actions: " + SetOps.toArray(this.lts.getOutgoingActions(curPosition.process1))); //TODO: delete debug
            //symmetry move
            if(action === Constants.NO_ACTION) {
                //this.printError('isMovePossible: Empty Action if case'); //TODO: delete debug
                return true;
            //does process1 have the action it is supposed to execute
            } else if(this.lts.getOutgoingActions(curPosition.process1).has(action)) {
                //this.printError('isMovePossible: process has action if case'); //TODO: delete debug
                //console.log("environment:" +  SetOps.toArray(environment)); //TODO: delete debug
                //console.log("environment:" +  SetOps.toArray((nextPosition as RestrictedSimulationDefenderNode).environment)); //TODO: delete debug
                //simulation challenge
                if(nextPosition instanceof SimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2) {
                    //this.printError('isMovePossible: simulation challenge if case'); //TODO: delete debug
                    //check conditions of move, may be redundant with other code but for clarity's sake
                    if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && (A.has(action) || action === Constants.HIDDEN_ACTION)) {
                        return true;
                    }
                //timeout simulation challenge
                } else if(nextPosition instanceof RestrictedSimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2
                     && SetOps.areEqual(environment, nextPosition.environment) && nextPosition.previousAction === Constants.TIMEOUT_ACTION) {
                    //this.printError('isMovePossible: timeout simulation challenge if case'); //TODO: delete debug
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
            } else if(this.lts.getOutgoingActions(curPosition.process1).has(action)) {
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
            console.log("performMove: move not possible: (" + curPosition.process1 + ", " + curPosition.process2 + ") --" + 
            action + "-> (" + nextPosition.process1 + ", " + nextPosition.process2 + ")");
            return -1;
        }

        //update currents
        let process1Index = this.lts.getCurrentIndexOf(curPosition.process1);
        let process2Index = this.lts.getCurrentIndexOf(curPosition.process2);
        if(process1Index === -1 || process2Index === -1) {
            this.printError('performMove: current states from LTS differ from current game position.');
            return -1;
        }
        this.lts.setCurrentState(nextPosition.process1, process1Index);
        this.lts.setCurrentState(nextPosition.process2, process2Index);

        //update move history
        this.play.push(nextPosition);
        console.log("Performed move from (" + curPosition.process1 + ", " + curPosition.process2 + ") --" + 
        action + "-> (" + nextPosition.process1 + ", " + nextPosition.process2 + ")");

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
     * @returns -1 if the given env contained illegal actions
     */
    setEnvironment(newEnv: Set<string>): number {
        if(!newEnv.has(Constants.HIDDEN_ACTION) && !newEnv.has(Constants.NO_ACTION) && !newEnv.has(Constants.TIMEOUT_ACTION)) {
            let tmp = SetOps.toArray(newEnv).sort();
            this.environment = new Set(tmp);
            console.log("Environment was set to {" + SetOps.toArray(this.environment) + "}.");
            return 0;
        } else {
            this.printError('setEnvironment: Error: some illegal action in given environment');
            return -1
        }
    }

    getEnvironment(): Set<string> {
        return this.environment;
    }

    getEnvironmentString(): string {
        let env = Array.from(this.environment).sort();
        let str = "";
        for(let i = 0; i < env.length - 1; i++) {
            str = str.concat(String(env[i]), ",");
        }
        if(env.length >= 1) {
            str = str.concat(String(env[env.length - 1]));
        }
        return str;
    }

    resetEnvironment() {
        this.environment = new Set(SetOps.toArray(this.lts.getVisibleActions()).sort());
        console.log("Environment was reset to {" + SetOps.toArray(this.environment) + "}.");
    }

    /**
     * TODO: to test
     * TODO: does put an action into possible moves for empty environments even when performing timeout action
     * good for debugging purposes
     * @param process 
     */
    possibleMoves(curPosition?: GamePosition): GamePosition[] {
        if(curPosition === undefined) {
            curPosition = this.play[this.play.length - 1];
        }

        let moves: GamePosition[] = []

        if(!this.lts.hasState(curPosition.process1) || !this.lts.hasState(curPosition.process2)) {
            this.printError('possibleMoves: some process from given game position does not exist');
            return moves;
        }

        let potentialMoves = this.generateMoves(curPosition);

        for(let i = 0; i < potentialMoves.length; i++) {
            if(curPosition.activePlayer === Player.Attacker) {
                //symmetry moves
                if(potentialMoves[i] instanceof AttackerNode || potentialMoves[i] instanceof RestrictedAttackerNode) {
                    if(this.isMovePossible(Constants.NO_ACTION, potentialMoves[i], this.environment, curPosition)) {
                        moves.push(potentialMoves[i]);
                    }
                //all other moves
                } else if(potentialMoves[i] instanceof SimulationDefenderNode || potentialMoves[i] instanceof RestrictedSimulationDefenderNode) {
                    if(this.isMovePossible((potentialMoves[i] as SimulationDefenderNode).previousAction, potentialMoves[i], this.environment, curPosition)) {
                        moves.push(potentialMoves[i]);
                    }
                } else {
                    this.printError('possibleMoves: type of potential node illegal: ');
                }
            } else if(curPosition.activePlayer === Player.Defender) {
                if(potentialMoves[i] instanceof AttackerNode || potentialMoves[i] instanceof RestrictedAttackerNode) {
                    if(this.isMovePossible((curPosition as SimulationDefenderNode).previousAction, potentialMoves[i], this.environment, curPosition)) {
                        moves.push(potentialMoves[i]);
                    }
                } else {
                    this.printError('possibleMoves: type of potential node illegal: ' + potentialMoves[i]);
                }
            }
        }

        return moves;
    }

    /**
     * 
     * @param curPosition 
     * @param charactersPerLine default is 0, if > 0 the function will break line after a move if it exceeds the specified amount of characters
     * @param breakAfterMoves set to true if you want a linebreak after every move
     * @returns 
     */
    getPossibleMovesString(curPosition?: GamePosition, charactersPerLine: number = 0, breakAfterMoves: boolean = false): string {
        let text = "";
        let moves;
        if(curPosition !== undefined) {
            moves = this.possibleMoves(curPosition);
        } else {
            moves = this.possibleMoves();
        }
        
        let counter = 0;
        for(let i = 0; i < moves.length - 1; i++) {
            if((charactersPerLine > 0 && counter >= charactersPerLine) || (breakAfterMoves && i !== 0)) {
                counter = 0;
                text = text.concat("\n");
            }
            let m = moves[i].toString();
            text = text.concat(m, ", ");
            counter += m.length + 2;
        }
        if(moves.length > 0) {
            if((charactersPerLine > 0 && counter >= charactersPerLine) || (breakAfterMoves && moves.length > 1)) {
                counter = 0;
                text = text.concat("\n");
            }
            text = text.concat(moves[moves.length - 1].toString());
        }
        return text;
    }

    /**
     * generates moves based on current position and edges in the lts
     * these moves are potentially not possible and should be channeled into isMovePossible()-method
     * to not float the returned moves with environment combinations, the maximal possible invironment is added
     * @param curPosition 
     * @returns 
     */
    private generateMoves(curPosition: GamePosition): GamePosition[] {
        let moves: GamePosition[] = [];
        let A = this.lts.getVisibleActions();

        //valid arguments
        if(!this.lts.hasState(curPosition.process1) || !this.lts.hasState(curPosition.process2)) {
            this.printError('possibleMoves: some process from given game position does not exist');
            return moves;
        } 

        if(curPosition instanceof AttackerNode) {
            //symmetry move
            moves.push(curPosition.invertProcesses());

            let edges = this.lts.getActionsAndDestinations(curPosition.process1);   //[[actionLabel, destination], ...]
            //get maximal environment to allow timeout
            let maxEnvForTimeout = new Set(A);
            for(let j = 0; j < edges.length; j++) {
                if(!Constants.isSpecialAction(edges[j][0])) {
                    maxEnvForTimeout.delete(edges[j][0]);
                }
            }

            for(let i = 0; i < edges.length; i++) {
                //simulation challenge
                if(edges[i][0] !== Constants.TIMEOUT_ACTION && edges[i][0] !== Constants.NO_ACTION) {
                    moves.push(new SimulationDefenderNode(edges[i][1], curPosition.process2, edges[i][0]));
                
                //timeout simulation challenge
                } else if(edges[i][0] === Constants.TIMEOUT_ACTION) {
                    moves.push(new RestrictedSimulationDefenderNode(edges[i][1], curPosition.process2, Constants.TIMEOUT_ACTION, maxEnvForTimeout));
                }
            }
        } else if(curPosition instanceof RestrictedAttackerNode) {
            //restricted symmetry move
            moves.push(curPosition.invertProcesses());

            let edges = this.lts.getActionsAndDestinations(curPosition.process1);
            //get maximal environment to allow timeout
            let maxEnvForTimeout = new Set(A);
            for(let j = 0; j < edges.length; j++) {
                if(!Constants.isSpecialAction(edges[j][0])) {
                    maxEnvForTimeout.delete(edges[j][0]);
                }
            }

            for(let i = 0; i < edges.length; i++) {
                //restricted simulation challenge
                if(!Constants.isSpecialAction(edges[i][0])) {
                    moves.push(new SimulationDefenderNode(edges[i][1], curPosition.process2, edges[i][0]));
                
                //invisible simulation challenge
                } else if(edges[i][0] === Constants.HIDDEN_ACTION) {
                    moves.push(new RestrictedSimulationDefenderNode(edges[i][1], curPosition.process2, Constants.HIDDEN_ACTION, curPosition.environment));
                
                //timeouted timeout simulation challenge
                } else if(edges[i][0] === Constants.TIMEOUT_ACTION) {
                    moves.push(new RestrictedSimulationDefenderNode(edges[i][1], curPosition.process2, Constants.TIMEOUT_ACTION, maxEnvForTimeout));
                }
            }
        } else if(curPosition instanceof SimulationDefenderNode) {
            //simulation answer
            let edges = this.lts.getActionsAndDestinations(curPosition.process2);
            for(let i = 0; i < edges.length; i++) {
                if(edges[i][0] === curPosition.previousAction) {
                    moves.push(new AttackerNode(curPosition.process1, edges[i][1]));
                }
            }
        } else if(curPosition instanceof RestrictedSimulationDefenderNode) {
            //invisible simulation answer & timeout simulation answer
            let edges = this.lts.getActionsAndDestinations(curPosition.process2);
            for(let i = 0; i < edges.length; i++) {
                if(edges[i][0] === curPosition.previousAction) {
                    moves.push(new RestrictedAttackerNode(curPosition.process1, edges[i][1], curPosition.environment));
                }
            }
        } else {
            this.printError('generateMoves: unknown game position type')
        }
        return moves;
    }

    getCurrent(index: number): string {
        if(index === 0 && this.lts.current.length > 0) {
            return this.lts.current[0];
        } else if (index === 1 && this.lts.current.length > 1) {
            return this.lts.current[1];
        } else {
            return "";
        }
    }


}