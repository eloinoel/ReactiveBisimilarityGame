"use strict";
exports.__esModule = true;
var Constants_1 = require("./Constants");
var GamePosition_1 = require("./GamePosition");
var SetOps_1 = require("./SetOps");
var ReactiveBisimilarityGame = /** @class */ (function () {
    function ReactiveBisimilarityGame(process1, process2, lts) {
        this.lts = lts;
        this.environment = new Set();
        this.play = [];
        this.startNewGame(process1, process2);
    }
    /**
     * init currents and other data structures
     * @startingPosition if the game starts with a position other than an attacker node
     * @returns -1 if something went wrong
     */
    ReactiveBisimilarityGame.prototype.startNewGame = function (process1, process2, startingPosition) {
        if (this.lts.hasState(process1) && this.lts.hasState(process2)) {
            this.lts.setCurrentState(process1, 0);
            this.lts.setCurrentState(process2, 1);
            this.environment = this.lts.getVisibleActions();
            if (startingPosition !== undefined && startingPosition !== null
                && startingPosition.process1 === process1 && startingPosition.process2 === process2) {
                this.play.push(startingPosition);
                if (startingPosition instanceof GamePosition_1.RestrictedAttackerNode || startingPosition instanceof GamePosition_1.RestrictedSimulationDefenderNode) {
                    this.environment = startingPosition.environment;
                }
            }
            else {
                this.play.push(new GamePosition_1.AttackerNode(process1, process2));
            }
        }
        else {
            try {
                throw new Error('Could not start new game: some of the processes do not exist.');
            }
            catch (error) {
                console.log(error);
            }
            return -1;
        }
        return 0;
    };
    /**
     * check if any kind of move from the definition is possible in a position
     * @position if evaluation for an other position than the current position is needed
     * @action action to perform, supply an empty string for symmetry moves
     * @returns
     */
    ReactiveBisimilarityGame.prototype.isMovePossible = function (action, nextPosition, environment, curPosition) {
        var A = this.lts.getVisibleActions();
        //deal with some optional arguments
        if (curPosition === undefined) {
            curPosition = this.play[this.play.length - 1]; //get last element in move history
        }
        if (environment === undefined) {
            //console.log("environment undefined")    //TODO: debug
            environment = this.environment; //TODO: check if this ruins anything 
        }
        //check if action is viable
        if (!Constants_1.Constants.isSpecialAction(action) && (!(environment === null || environment === void 0 ? void 0 : environment.has(action)) || !A.has(action))) { //empty action means symmetry move
            //this.printError('False: action not viable');    //TODO: delete debug
            return false;
        }
        //check if processes of positions exist in LTS
        if (curPosition == null || curPosition.process1 == null || curPosition.process2 == null
            || !this.lts.hasState(curPosition.process1) || !this.lts.hasState(curPosition.process2)) {
            //this.printError('False: curPosition not viable'); //TODO: delete debug
            return false;
        }
        if (nextPosition == null || nextPosition.process1 == null || !this.lts.hasState(nextPosition.process1)
            || nextPosition.process2 == null || !this.lts.hasState(nextPosition.process2)) {
            //this.printError('False: nextPosition not viable'); //TODO: delete debug
            return false;
        }
        /* check all game move cases */
        //- check if action is possible from p or q
        if (curPosition instanceof GamePosition_1.AttackerNode) {
            //this.printError('isMovePossible: curPosition AttackerNode if case'); //TODO: delete debug
            //console.log("outgoing actions: " + SetOps.toArray(this.lts.getOutgoingActions(curPosition.process1))); //TODO: delete debug
            //symmetry move
            if (action === Constants_1.Constants.NO_ACTION) {
                //this.printError('isMovePossible: Empty Action if case'); //TODO: delete debug
                return true;
                //does process1 have the action it is supposed to execute
            }
            else if (this.lts.getOutgoingActions(curPosition.process1).has(action)) {
                //this.printError('isMovePossible: process has action if case'); //TODO: delete debug
                //console.log("environment:" +  SetOps.toArray(environment)); //TODO: delete debug
                //console.log("environment:" +  SetOps.toArray((nextPosition as RestrictedSimulationDefenderNode).environment)); //TODO: delete debug
                //simulation challenge
                if (nextPosition instanceof GamePosition_1.SimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2) {
                    //this.printError('isMovePossible: simulation challenge if case'); //TODO: delete debug
                    //check conditions of move, may be redundant with other code but for clarity's sake
                    if (this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && (A.has(action) || action === Constants_1.Constants.HIDDEN_ACTION)) {
                        return true;
                    }
                    //timeout simulation challenge
                }
                else if (nextPosition instanceof GamePosition_1.RestrictedSimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2
                    && SetOps_1.SetOps.areEqual(environment, nextPosition.environment) && nextPosition.previousAction === Constants_1.Constants.TIMEOUT_ACTION) {
                    //this.printError('isMovePossible: timeout simulation challenge if case'); //TODO: delete debug
                    //check move conditions
                    if (this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && this.initialsEmpty(curPosition.process1, environment)
                        && SetOps_1.SetOps.isSubsetEq(environment, A)) {
                        return true;
                    }
                }
            }
        }
        else if (curPosition instanceof GamePosition_1.SimulationDefenderNode) {
            if (action !== Constants_1.Constants.NO_ACTION) {
                //simulation answer
                if (nextPosition instanceof GamePosition_1.AttackerNode && curPosition.process1 === nextPosition.process1 && action === curPosition.previousAction) {
                    if (this.lts.hasTransition(curPosition.process2, nextPosition.process2, action)) {
                        return true;
                    }
                }
            }
        }
        else if (curPosition instanceof GamePosition_1.RestrictedAttackerNode) {
            //restricted symmetry move
            if (action === Constants_1.Constants.NO_ACTION) {
                return true;
            }
            else if (this.lts.getOutgoingActions(curPosition.process1).has(action)) {
                //restricted simulation challenge
                if (nextPosition instanceof GamePosition_1.SimulationDefenderNode && nextPosition.previousAction === action && curPosition.process2 === nextPosition.process2) {
                    if (this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && A.has(action) && (environment.has(action) || this.initialsEmpty(curPosition.process1, environment))) {
                        return true;
                    }
                    //invisible simulation challenge
                }
                else if (nextPosition instanceof GamePosition_1.RestrictedSimulationDefenderNode && nextPosition.previousAction === action && action === Constants_1.Constants.HIDDEN_ACTION && curPosition.process2 === nextPosition.process2) {
                    if (this.lts.hasTransition(curPosition.process1, nextPosition.process1, action)) {
                        return true;
                    }
                    //timeouted timeout simulation challenge
                }
                else if (nextPosition instanceof GamePosition_1.RestrictedSimulationDefenderNode && nextPosition.previousAction === action && action === Constants_1.Constants.TIMEOUT_ACTION && curPosition.process2 === nextPosition.process2) {
                    if (this.lts.hasTransition(curPosition.process1, nextPosition.process1, action) && this.initialsEmpty(curPosition.process1, SetOps_1.SetOps.union(curPosition.environment, environment)) && SetOps_1.SetOps.isSubsetEq(environment, A)) {
                        return true;
                    }
                }
            }
        }
        else if (curPosition instanceof GamePosition_1.RestrictedSimulationDefenderNode) {
            if (action !== Constants_1.Constants.NO_ACTION) {
                //timeout simulation answer and invisible simulation answer
                if (nextPosition instanceof GamePosition_1.RestrictedAttackerNode && curPosition.process1 == nextPosition.process1 && SetOps_1.SetOps.areEqual(curPosition.environment, nextPosition.environment) && action === curPosition.previousAction) {
                    if (this.lts.hasTransition(curPosition.process2, nextPosition.process2, action)) {
                        return true;
                    }
                }
            }
        }
        else {
            this.printError('isMovePossible: unknown game position type');
            return false;
        }
        return false;
    };
    /**
     * perform a move in the current play
     * @param action
     * @param nextPosition
     * @param curPosition
     * @returns -1 if the move could not be carried out
     */
    ReactiveBisimilarityGame.prototype.performMove = function (action, nextPosition) {
        //check if move is possible
        var curPosition = this.play[this.play.length - 1];
        var legalMove = this.isMovePossible(action, nextPosition, this.environment, curPosition);
        if (!legalMove) {
            console.log("performMove: move not possible: (" + curPosition.process1 + ", " + curPosition.process2 + ") --" +
                action + "-> (" + nextPosition.process1 + ", " + nextPosition.process2 + ")");
            return -1;
        }
        //update currents
        var process1Index = this.lts.getCurrentIndexOf(curPosition.process1);
        var process2Index = this.lts.getCurrentIndexOf(curPosition.process2);
        if (process1Index === -1 || process2Index === -1) {
            this.printError('performMove: current states from LTS differ from current game position.');
        }
        this.lts.setCurrentState(nextPosition.process1, process1Index);
        this.lts.setCurrentState(nextPosition.process2, process2Index);
        //update move history
        this.play.push(nextPosition);
        console.log("Performed move from (" + curPosition.process1 + ", " + curPosition.process2 + ") --" +
            action + "-> (" + nextPosition.process1 + ", " + nextPosition.process2 + ")");
        return 0;
    };
    /**
     *
     * @param error throws an error message that prints in red to the console
     */
    ReactiveBisimilarityGame.prototype.printError = function (error) {
        try {
            throw (error);
        }
        catch (error) {
            console.log(error);
        }
    };
    /**
     * returns true if: initialActions(process) <intersect> (environment <union> {hidden action}) == empty set
     * @param process
     * @param environment
     * @returns
     */
    ReactiveBisimilarityGame.prototype.initialsEmpty = function (process, environment) {
        if (this.lts.hasState(process)) {
            var initials = this.lts.getInitialActions(process);
            var union = SetOps_1.SetOps.union(environment, new Set([Constants_1.Constants.HIDDEN_ACTION]));
            if (SetOps_1.SetOps.isEmpty(SetOps_1.SetOps.intersect(initials, union))) {
                return true;
            }
        }
        return false;
    };
    /**
     * The environment can change at any time
     * @param newEnv new Environment
     */
    ReactiveBisimilarityGame.prototype.setEnvironment = function (newEnv) {
        if (!newEnv.has(Constants_1.Constants.HIDDEN_ACTION) && !newEnv.has(Constants_1.Constants.NO_ACTION) && !newEnv.has(Constants_1.Constants.TIMEOUT_ACTION)) {
            var tmp = SetOps_1.SetOps.toArray(newEnv).sort();
            this.environment = new Set(tmp);
            console.log("Environment was set to {" + SetOps_1.SetOps.toArray(this.environment) + "}.");
        }
        else {
            this.printError('setEnvironment: Error: some illegal action in given environment');
        }
    };
    ReactiveBisimilarityGame.prototype.getEnvironment = function () {
        return this.environment;
    };
    ReactiveBisimilarityGame.prototype.resetEnvironment = function () {
        this.environment = new Set(SetOps_1.SetOps.toArray(this.lts.getVisibleActions()).sort());
        console.log("Environment was reset to {" + SetOps_1.SetOps.toArray(this.environment) + "}.");
    };
    /**
     * TODO:
     * good for debugging purposes
     * @param process
     */
    ReactiveBisimilarityGame.prototype.possibleMoves = function (curPosition) {
        var moves = [];
        if (!this.lts.hasState(curPosition.process1) || !this.lts.hasState(curPosition.process2)) {
            this.printError('possibleMoves: some process from given game position does not exist');
            return moves;
        }
        if (curPosition.activePlayer === GamePosition_1.Player.Attacker) {
            //symmetry move
            if (this.isMovePossible(Constants_1.Constants.NO_ACTION, curPosition.invertProcesses(), this.environment, curPosition)) {
                moves.push(curPosition.invertProcesses());
            }
            //other moves
            var actions = this.lts.getInitialActions(curPosition.process1); //TODO: outgoing or initials
            if (curPosition instanceof GamePosition_1.AttackerNode) {
            }
            else if (curPosition instanceof GamePosition_1.RestrictedAttackerNode) {
            }
            //TODO: LTS or this class should have generate moves function, to just call isMovePossible() upon 
        }
        else {
        }
        var pos = new GamePosition_1.AttackerNode("TO", "DO");
        return [pos];
    };
    return ReactiveBisimilarityGame;
}());
exports.ReactiveBisimilarityGame = ReactiveBisimilarityGame;
