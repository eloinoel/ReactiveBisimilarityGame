import { LTSController } from './LTSController';
import { Constants } from './Constants';
import { AttackerNode, GamePosition, RestrictedAttackerNode, RestrictedSimulationDefenderNode, SimulationDefenderNode, Player } from './GamePosition';
import { SetOps } from './SetOps';

export class ReactiveBisimilarityGame {

    lts: LTSController; //lts for the game to be played on
    /** contains history of all game moves, last element is the current position */
    private play: GamePosition[];
    /** set of possible actions for the next game position, it is only used to generate possible moves in @generateMoves()*/
    private environment: Set<string>;
    /** if true, the game will be reactive bisimilar */
    private reactive: boolean;
    /** if true and @reactive is false, the game will be bisimilar */
    private bisimilar: boolean;
    


    /**
     * creates an instance of this class and starts a game
     * @param process1 compared to @process2
     * @param process2 
     * @param lts lts to play the game on
     * @param reactive starts a reactive bisimilar game if true
     * @param bisimilar starts a bisimilar game if true and @reactive is false
     */
    constructor(process1: string, process2: string, lts: LTSController, reactive: boolean = true, bisimilar: boolean = true) {
        this.lts = lts;
        this.environment = new Set<string>();
        this.play = [];
        this.reactive = reactive;
        this.bisimilar = bisimilar;
        this.startNewGame(process1, process2, undefined, reactive, bisimilar);
    }

    /**
     * sets play of this instance to the same contents as given play,
     * call by value (new references created)
     * @param play 
     */
    setPlay(play: GamePosition[]) {
        this.play = [];
        for(let i = 0; i < play.length; i++) {
            this.play.push(play[i].copy());
        }
    }
    /**
     * init currents and other data structures
     * @startingPosition if the game starts with a position other than an attacker node
     * @returns -1 if something went wrong
     */
    startNewGame(process1: string, process2: string, startingPosition?: GamePosition, reactive: boolean = true, bisimilar: boolean = true): Number {
        if(this.lts.hasState(process1) && this.lts.hasState(process2)) {
            //flush play
            this.play = [];

            //set data structures
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
        } else {
            //console.log("startNewGame failed");
            return -1;
        }
        return 0;
    }

    /**
     * check if any kind of move from the definition is possible in a position
     * @position if evaluation for an other position than the current position is needed
     * @action action to perform, supply an empty string for symmetry moves
     * @returns a number indicating which type of move was given
     * 0: move not possible, 1: simulation challenge, 2: simulation answer, 3: symmetry move, 4: timeout simulation challenge,
     * 5: timeout simulation answer, 6: restricted simulation challenge, 7: invisible simulation challenge, 8: invisible simulation answer,
     * 9: timeouted timeout simulation challenge, 10: restricted symmetry move
     */
    isMovePossible(action: string, nextPosition: GamePosition, curPosition?: GamePosition): number {
        let A = this.lts.getVisibleActions();

        //deal with some optional arguments
        if(curPosition === undefined) {
            curPosition = this.play[this.play.length - 1]; //get last element in move history
        }

        //check if action is viable
        if(this.reactive && !Constants.isSpecialAction(action) && (!A.has(action))) {  //empty action means symmetry move
            return this.getCodeFromMoveString("Illegal Move");
        }
        
        //check if processes of positions exist in LTS
        if(curPosition === undefined || curPosition == null || curPosition.process1 == null || curPosition.process2 == null 
        || !this.lts.hasState(curPosition.process1) || !this.lts.hasState(curPosition.process2)) {
            return this.getCodeFromMoveString("IllegalMove");
        }
        if(nextPosition === undefined || nextPosition == null || nextPosition.process1 == null || !this.lts.hasState(nextPosition.process1)
        || nextPosition.process2 == null || !this.lts.hasState(nextPosition.process2)) {
            return this.getCodeFromMoveString("IllegalMove");
        }

        /************************************************ BISIMULATION AND SIMULATION ************************************************/
        if(!this.reactive) {
            if(curPosition instanceof AttackerNode) {
                //symmetry move
                if(this.bisimilar) {
                    if(action === Constants.NO_ACTION && curPosition.isSymmetryMove(nextPosition)) {
                        return this.getCodeFromMoveString("Symmetry Move");
                    }
                }
                //simulation challenge
                if(action !== Constants.NO_ACTION) {
                    //check arguments
                    if(nextPosition instanceof SimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2) {
                        //check conditions of move
                        if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action)) {
                            return this.getCodeFromMoveString("Simulation Challenge");
                        }
                    }
                }
            } else if(curPosition instanceof SimulationDefenderNode) {
                if(action !== Constants.NO_ACTION) {
                    //simulation answer
                    if(nextPosition instanceof AttackerNode && curPosition.process1 === nextPosition.process1 && action === curPosition.previousAction) {
                        if(this.lts.hasTransition(curPosition.process2, nextPosition.process2, action)) {
                            return this.getCodeFromMoveString("Simulation Answer");
                        }
                    }
                }
            } else {
                this.printError(('isMovePossible: unknown game position type ' + curPosition.constructor.name) as string);
                return this.getCodeFromMoveString("Illegal Move");
            }
        /************************************************ REACTIVE BISIMULATION GAME ************************************************/
        } else {
            /* check all game move cases */
            //- check if action is possible from p or q
            if(curPosition instanceof AttackerNode) {
                //symmetry move
                if(action === Constants.NO_ACTION && curPosition.isSymmetryMove(nextPosition)) {
                    return this.getCodeFromMoveString("Symmetry Move");
                //does process1 have the action it is supposed to execute
                } else if(action !== Constants.NO_ACTION  && this.lts.getOutgoingActions(curPosition.process1).has(action)) {
                    //simulation challenge
                    if(nextPosition instanceof SimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2) {
                        //check conditions of move, may be redundant with other code but for my clarity's sake
                        if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && (A.has(action) || action === Constants.HIDDEN_ACTION)) {
                            return this.getCodeFromMoveString("Simulation Challenge");
                        }
                    //timeout simulation challenge
                    } else if(nextPosition instanceof RestrictedSimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2
                        && nextPosition.previousAction === Constants.TIMEOUT_ACTION) {
                        //console.log("isMovePossible: Timeout Simulation Challenge") //TODO: remove debug
                        //check move conditions
                        if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && this.initialsEmpty(curPosition.process1, nextPosition.environment) 
                        && SetOps.isSubsetEq(nextPosition.environment, A)) {
                            return this.getCodeFromMoveString("Timeout Simulation Challenge");
                        }
                    }
                }
            } else if(curPosition instanceof SimulationDefenderNode) {
                if(action !== Constants.NO_ACTION) {
                    //simulation answer
                    if(nextPosition instanceof AttackerNode && curPosition.process1 === nextPosition.process1 && action === curPosition.previousAction) {
                        if(this.lts.hasTransition(curPosition.process2, nextPosition.process2, action)) {
                            return this.getCodeFromMoveString("Simulation Answer");
                        }
                    }
                }
            } else if(curPosition instanceof RestrictedAttackerNode) {
                //restricted symmetry move
                if(action === Constants.NO_ACTION && curPosition.isSymmetryMove(nextPosition)) {
                    return this.getCodeFromMoveString("Restricted Symmetry Move");
                } else if(action !== Constants.NO_ACTION && this.lts.getOutgoingActions(curPosition.process1).has(action)) {
                    //restricted simulation challenge
                    if(nextPosition instanceof SimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2) {
                        //console.log("isMovePossible: Restricted Simulation Challenge") //TODO: remove debug
                        if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && A.has(action) && (curPosition.environment.has(action) || this.initialsEmpty(curPosition.process1, curPosition.environment))) {
                            return this.getCodeFromMoveString("Restricted Simulation Challenge");
                        }
                    //invisible simulation challenge
                    } else if(nextPosition instanceof RestrictedSimulationDefenderNode && nextPosition.previousAction === action && action === Constants.HIDDEN_ACTION && curPosition.process2 === nextPosition.process2 &&  SetOps.areEqual(curPosition.environment, nextPosition.environment)) {
                        //console.log("isMovePossible: Invisible Simulation Challenge") //TODO: remove debug
                        if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action)) {
                            return this.getCodeFromMoveString("Invisible Simulation Challenge");
                        }
                    //timeouted timeout simulation challenge
                    } else if(nextPosition instanceof RestrictedSimulationDefenderNode && nextPosition.previousAction === action && action === Constants.TIMEOUT_ACTION && curPosition.process2 === nextPosition.process2) {
                        //console.log("isMovePossible: Timeouted Timeout Simulation Challenge") //TODO: remove debug
                        if(this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && this.initialsEmpty(curPosition.process1, SetOps.union(curPosition.environment, nextPosition.environment)) && SetOps.isSubsetEq(nextPosition.environment, A)) {
                            return this.getCodeFromMoveString("Timeouted Timeout Simulation Challenge");
                        }
                    }
                }
            } else if(curPosition instanceof RestrictedSimulationDefenderNode) {
                if(action !== Constants.NO_ACTION) {
                    //timeout simulation answer and invisible simulation answer
                    if(nextPosition instanceof RestrictedAttackerNode && curPosition.process1 == nextPosition.process1 && SetOps.areEqual(curPosition.environment, nextPosition.environment) && action === curPosition.previousAction && action === Constants.HIDDEN_ACTION) {
                        if(this.lts.hasTransition(curPosition.process2, nextPosition.process2, action)) {
                            return this.getCodeFromMoveString("Invisible Simulation Answer");
                        }
                    } else if(nextPosition instanceof RestrictedAttackerNode && curPosition.process1 == nextPosition.process1 && SetOps.areEqual(curPosition.environment, nextPosition.environment) && action === curPosition.previousAction && action === Constants.TIMEOUT_ACTION) {
                        if(this.lts.hasTransition(curPosition.process2, nextPosition.process2, action)) {
                            return this.getCodeFromMoveString("Timeout Simulation Answer");
                        }
                    }
                }
            } else {
                this.printError('isMovePossible: unknown game position type')
                return this.getCodeFromMoveString("Illegal move");
            }
        }
        
        return this.getCodeFromMoveString("Illegal move");
    }

    /**
     * @returns a move string from given number,
     * 0: move not possible, 1: simulation challenge, 2: simulation answer, 3: symmetry move, 4: timeout simulation challenge,
     * 5: timeout simulation answer, 6: restricted simulation challenge, 7: invisible simulation challenge, 8: invisible simulation answer,
     * 9: timeouted timeout simulation challenge, 10: restricted symmetry move
     */
    getMoveStringFromCode(code: number): string {
        switch(code) {
            case 0:
                return "Illegal move";
            case 1:
                return "Simulation Challenge";
            case 2:
                return "Simulation Answer";
            case 3:
                return "Symmetry Move";
            case 4:
                return "Timeout Simulation Challenge";
            case 5:
                return "Timeout Simulation Answer";
            case 6:
                return "Restricted Simulation Challenge";
            case 7:
                return "Invisible Simulation Challenge";
            case 8:
                return "Invisible Simulation Answer";
            case 9:
                return "Timeouted Timeout Simulation Challenge";
            case 10:
                return "Restricted Symmetry Move"
            default:
                return "Unknown move"
        }
    }

    /**
     * @returns a number code for given move,
     * 0: Illegal move, 1: Simulation Challenge, 2: Simulation Answer, 3: Symmetry Move, 4: Timeout Simulation Challenge,
     * 5: Timeout Simulation Answer, 6: Restricted Simulation Challenge, 7: Invisible Simulation Challenge, 8: Invisible Simulation Answer,
     * 9: Timeouted Timeout Simulation Challenge, 10: Restricted Symmetry Move
     */
    getCodeFromMoveString(move: string): number {
        switch(move) {
            case "Illegal move":
                return 0;
            case "Simulation Challenge":
                return 1;
            case "Simulation Answer":
                return 2;
            case "Symmetry Move":
                return 3;
            case "Timeout Simulation Challenge":
                return 4;
            case "Timeout Simulation Answer":
                return 5;
            case "Restricted Simulation Challenge":
                return 6;
            case "Invisible Simulation Challenge":
                return 7;
            case "Invisible Simulation Answer":
                return 8;
            case "Timeouted Timeout Simulation Challenge":
                return 9;
            case "Restricted Symmetry Move":
                return 10;
            default:
                return -1
        }
    }

    /**
     * perform a move in the current play
     * @param action can be undefined if symmetry
     * @param nextPosition 
     * @param curPosition 
     * @returns -1 if the move could not be carried out
     */
    performMove(action: string, nextPosition: GamePosition): number {
        //check if move is possible
        let curPosition = this.play[this.play.length - 1];
        let legalMove = this.isMovePossible(action, nextPosition, curPosition);
        let curPlayer = curPosition.activePlayer;
        if(!legalMove) {
            console.log("performMove: move not possible:" + curPosition.toString() + " --" + 
            action + "-> " + nextPosition.toString());
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

        //only attacker can change the environment
        if(curPosition instanceof RestrictedAttackerNode && nextPosition instanceof SimulationDefenderNode) {
            this.resetEnvironment();
        }

        //update move history
        this.play.push(nextPosition);
        console.log(Player[curPlayer] + " performed " + this.getMoveStringFromCode(legalMove) + " from " + curPosition.toString() + " --" +
        action + "-> " + nextPosition.toString());

        return 0;
    }

    /**
     * enable (true) or disable (false) the reactive bisimilarity game
     * @param reactive
     * @returns 0 if no problem occured, -1 otherwise 
     */
    setReactive(reactive: boolean): number {
        if(reactive) {
            this.reactive = true;
            return 0;
        } else {
            if(this.play.length === 0 || (this.play[this.play.length - 1] instanceof AttackerNode || this.play[this.play.length - 1] instanceof SimulationDefenderNode)) {
                this.reactive = false;
                return 0;
            } else if(this.play[this.play.length - 1] instanceof RestrictedAttackerNode || this.play[this.play.length - 1] instanceof RestrictedSimulationDefenderNode) {
                this.printError("setReactive: Can't disable reactive nature because current game position is restrictive.");
                return -1;
            } else {
                this.printError("setReactive: current position is illegal");
                return -1;
            }
        }
    }

    /**
     * enable (true) or disable (false) bisimilarity in the game, if @reactive is set to true, the game will be bisimilar either way
     * @param bisimilar
     * @returns 0 if no problem occured, -1 otherwise 
     */
    setBisimilar(bisimilar: boolean) {
        this.bisimilar = bisimilar;
    }

    isReactive() {
        return this.reactive;
    }

    isBisimilar() {
        return this.bisimilar;
    }

    getPlay(): GamePosition[] {
        return this.play;
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
        if(this.reactive === false) {
            this.printError("initialsEmpty: method was called but game is not reactive.");
        }
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
     * Set environment of this instance to the given environment,
     * operates call by value (makes a copy)
     * @param newEnv new Environment
     * @returns -1 if the given env contained illegal actions or it wasn't the attackers turn
     */
    setEnvironment(newEnv: Set<string>, disablePrint = false): number {
        if(this.reactive === false) {
            this.printError("setEnvironment: method was called but game is not reactive.");
            return -1;
        } else {
            if(!newEnv.has(Constants.HIDDEN_ACTION) && !newEnv.has(Constants.NO_ACTION) && !newEnv.has(Constants.TIMEOUT_ACTION)) {
                let tmp = SetOps.toArray(newEnv).sort();
                //add new actions to A
                for(let i = 0; i < tmp.length; i++) {
                    this.lts.addVisibleActionToA(tmp[i]);
                }
                this.environment = new Set(tmp);
                if(!disablePrint) {
                    console.log("Environment was set to {" + SetOps.toArray(this.environment) + "}.");
                }
                return 0;
            } else {
                this.printError('setEnvironment: Error: some illegal action in given environment or not attackers turn');
                return -1
            }
        }
    }

    getEnvironment(): Set<string> {
        if(this.reactive === false) {
            this.printError("getEnvironment: method was called but game is not reactive.");
        }
        return new Set(this.environment);
    }

    getEnvironmentString(): string {
        if(this.reactive === false) {
            this.printError("getEnvironmentString: method was called but game is not reactive.");
        }
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

    resetEnvironment(disablePrint = false) : number {
        if(this.reactive === false) {
            this.printError("resetEnvironment: method was called but game is not reactive.");
            return -1;
        } else {
            this.environment = new Set(SetOps.toArray(this.lts.getVisibleActions()).sort());
            if(!disablePrint) {
                console.log("Environment was reset to {" + SetOps.toArray(this.environment) + "}.");
            }
            return 0;
        }
    }

    /**
     * generates all following game positions for a given position
     * good for debugging purposes
     * @param process 
     */
    possibleMoves(curPosition?: GamePosition, allEnvironmentCombinations: boolean = false): GamePosition[] {
        if(curPosition === undefined) {
            curPosition = this.play[this.play.length - 1];
        }

        let moves: GamePosition[] = []

        if(!this.lts.hasState(curPosition.process1) || !this.lts.hasState(curPosition.process2)) {
            this.printError('possibleMoves: some process from given game position does not exist');
            return moves;
        }

        let potentialMoves = this.generateMoves(curPosition, allEnvironmentCombinations);


        for(let i = 0; i < potentialMoves.length; i++) {
            if(curPosition.activePlayer === Player.Attacker) {
                //symmetry moves
                if(potentialMoves[i] instanceof AttackerNode || potentialMoves[i] instanceof RestrictedAttackerNode) {
                    if(this.isMovePossible(Constants.NO_ACTION, potentialMoves[i], curPosition)) {
                        moves.push(potentialMoves[i]);
                    }
                //all other moves
                } else if(potentialMoves[i] instanceof SimulationDefenderNode || potentialMoves[i] instanceof RestrictedSimulationDefenderNode) {
                    if(this.isMovePossible((potentialMoves[i] as SimulationDefenderNode).previousAction, potentialMoves[i], curPosition)) {
                        moves.push(potentialMoves[i]);
                    }
                } else {
                    this.printError('possibleMoves: type of potential node illegal: ');
                }
            } else if(curPosition.activePlayer === Player.Defender) {
                if(potentialMoves[i] instanceof AttackerNode || potentialMoves[i] instanceof RestrictedAttackerNode) {
                    if(this.isMovePossible((curPosition as SimulationDefenderNode).previousAction, potentialMoves[i], curPosition)) {
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
     * generates possible moves and returns it as a string with optional linebreaks
     * @param curPosition 
     * @param charactersPerLine default is 0, if > 0 the function will break line after a move if it exceeds the specified amount of characters
     * @param breakAfterMoves set to true if you want a linebreak after every move
     * @returns 
     */
    getPossibleMovesString(curPosition?: GamePosition, charactersPerLine: number = 0, breakAfterMoves: boolean = false): string {
        let text = "";
        let moves;
        if(curPosition !== undefined) {
            moves = this.possibleMoves(curPosition, true);
            //moves = this.generateMoves(curPosition, true)
        } else {
            moves = this.possibleMoves(undefined, true);
            //moves = this.generateMoves(this.play[this.play.length - 1], true)
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
     * generates moves based on current position and edges in the lts, 
     * these moves are potentially not possible and should be channeled into isMovePossible()-method, 
     * @notice only function that uses @this.@environment, 
     * 
                * README: only generating one restricted move for the current environment, 
                * This is theoretically not correct as one could choose any environment that allows a timeout in a state, 
                * But calculating all permutations and throwing them into the isMovePossible()-method could technically explode the time complexity of the game, 
     * 
     * @param curPosition 
     * @returns 
     */
    private generateMoves(curPosition: GamePosition, allEnvironmentCombinations: boolean = false): GamePosition[] {
        let moves: GamePosition[] = [];
        let A = this.lts.getVisibleActions();

        //valid arguments
        if(!this.lts.hasState(curPosition.process1) || !this.lts.hasState(curPosition.process2)) {
            this.printError('possibleMoves: some process from given game position does not exist');
            return moves;
        } 

        /************************************************ BISIMULATION AND SIMULATION ************************************************/
        if(!this.reactive) {
            if(curPosition instanceof AttackerNode) {
                //symmetry move
                if(this.bisimilar) {
                    moves.push(curPosition.invertProcesses());
                }

                //simulation challenge
                let edges = this.lts.getActionsAndDestinations(curPosition.process1);   //[[actionLabel, destination], ...]
                for(let i = 0; i < edges.length; i++) {
                    if(edges[i][0] !== Constants.NO_ACTION) {
                        moves.push(new SimulationDefenderNode(edges[i][1], curPosition.process2, edges[i][0]));
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
            } else {
                this.printError('generateMoves: unknown game position type ' + curPosition.constructor.name);
            }
        /************************************************ REACTIVE BISIMULATION GAME ************************************************/ 
        } else {
            if(curPosition instanceof AttackerNode) {
                //symmetry move
                moves.push(curPosition.invertProcesses());
    
                let edges = this.lts.getActionsAndDestinations(curPosition.process1);   //[[actionLabel, destination], ...]
                
                for(let i = 0; i < edges.length; i++) {
                    //simulation challenge
                    if(edges[i][0] !== Constants.TIMEOUT_ACTION && edges[i][0] !== Constants.NO_ACTION) {
                        moves.push(new SimulationDefenderNode(edges[i][1], curPosition.process2, edges[i][0]));
                    
                    //timeout simulation challenge
                    } else if(edges[i][0] === Constants.TIMEOUT_ACTION) {
                        if(allEnvironmentCombinations) {
                            let environments = this.generateAllTimeoutEnvironmentCombinations(curPosition.process1);
                            for(let j = 0; j < environments.length; j++) {
                                moves.push(new RestrictedSimulationDefenderNode(edges[i][1], curPosition.process2, Constants.TIMEOUT_ACTION, environments[j]));
                            }
                        } else {
                            moves.push(new RestrictedSimulationDefenderNode(edges[i][1], curPosition.process2, Constants.TIMEOUT_ACTION, new Set(this.environment)));
                        }
                    }
                }
            } else if(curPosition instanceof RestrictedAttackerNode) {
                //restricted symmetry move
                moves.push(curPosition.invertProcesses());
    
                let edges = this.lts.getActionsAndDestinations(curPosition.process1);
    
                for(let i = 0; i < edges.length; i++) {
                    //restricted simulation challenge
                    if(!Constants.isSpecialAction(edges[i][0])) {
                        moves.push(new SimulationDefenderNode(edges[i][1], curPosition.process2, edges[i][0]));
                    
                    //invisible simulation challenge
                    } else if(edges[i][0] === Constants.HIDDEN_ACTION) {
                        moves.push(new RestrictedSimulationDefenderNode(edges[i][1], curPosition.process2, Constants.HIDDEN_ACTION, curPosition.environment));
                    
                    //timeouted timeout simulation challenge
                    } else if(edges[i][0] === Constants.TIMEOUT_ACTION) {
                        if(allEnvironmentCombinations) {
                            let environments = this.generateAllTimeoutEnvironmentCombinations(curPosition.process1);
                            for(let j = 0; j < environments.length; j++) {
                                moves.push(new RestrictedSimulationDefenderNode(edges[i][1], curPosition.process2, Constants.TIMEOUT_ACTION, environments[j]));
                            }
                        } else {
                            moves.push(new RestrictedSimulationDefenderNode(edges[i][1], curPosition.process2, Constants.TIMEOUT_ACTION, new Set(this.environment)));
                        }
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
        }
        return moves;
    }

    /**
     * generate every possible environment for a process to execute timeout action
     */
    generateAllTimeoutEnvironmentCombinations(sourceProcess: string) {
        let actionsOfProcess = this.lts.getOutgoingActions(sourceProcess);
        let visibleActions = SetOps.toArray(this.lts.getVisibleActions());
        let max_environment = [];

        //get minimal environment for timeout
        for(let i = 0; i < visibleActions.length; i++) {
            if(!actionsOfProcess.has(visibleActions[i])) {
                max_environment.push(visibleActions[i]);
            }
        }
        //get power set
        return SetOps.powerSet(max_environment);
    }

    getCurrent(index?: number): string {
        if(index === 0 && this.lts.current.length > 0) {
            return this.lts.current[0];
        } else if (index === 1 && this.lts.current.length > 1) {
            return this.lts.current[1];
        } else {
            return "";
        }
    }

    /**
     * returns true if given action is a visible, normal action or a tau action
     */
    isVisibleOrHiddenAction(action: string) {
        if(this.lts.getVisibleActions().has(action) || action === Constants.HIDDEN_ACTION) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * makes a new reference while copying the same values as this game
     * copies are created call by value
     * @returns 
     */
    copy() {
        let g = new ReactiveBisimilarityGame(this.play[0].process1, this.play[0].process2, this.lts.copy(), this.reactive, this.bisimilar);
        g.setEnvironment(this.environment, true);
        g.setPlay(this.play);
        if(this.play.length === 0) {
            console.log("Warning: copying uninitialized game.");
        }
        return g;
    }

}