import { Constants } from "./Constants";
import { SetOps } from "./SetOps";

/**
 * Data Class representing the current or previous game position
 */
export abstract class GamePosition {
    readonly process1: string;
    readonly process2: string;
    readonly activePlayer: Player;

    constructor(process1: string, process2: string, activePlayer: Player) {
        this.process1 = process1;
        this.process2 = process2;
        this.activePlayer = activePlayer;
    }

    abstract invertProcesses(): GamePosition;

    abstract toString(): string;

    abstract copy(): GamePosition;

    /**
     * returns true if the two nodes are the same
     */
    abstract samePosition(otherNode: GamePosition): boolean;

    /**
     * 
     * @param otherPosition 
     * @returns returns true if @otherPosition is a symmetric position to this
     */
    isSymmetryMove(otherPosition: GamePosition) : boolean {
        if(otherPosition.process1 === this.process2 && otherPosition.process2 === this.process1 && this.constructor === otherPosition.constructor) {
            if(this instanceof RestrictedAttackerNode) {
                if(SetOps.areEqual((this as RestrictedAttackerNode).environment, (otherPosition as RestrictedAttackerNode).environment)) {
                    return true;
                }
                return false;
            }
            return true;
        }
        return false;
    }
}

export enum Player {
    Attacker,
    Defender,
}

/**
 * @process1 is a Process
 * @process2 is a Process
 */
export class AttackerNode extends GamePosition { 
    constructor(process1: string, process2: string) {
        super(process1, process2, Player.Attacker);
    }

    invertProcesses(): GamePosition {
        return new AttackerNode(this.process2, this.process1);
    }

    toString(): string {
        return "(" + this.process1 + ", " + this.process2 + ")_a"
    }

    copy() {
        return new AttackerNode(this.process1, this.process2);
    }

    samePosition(otherNode: GamePosition): boolean {
        if(otherNode instanceof AttackerNode && otherNode.process1 === this.process1 && otherNode.process2 === this.process2) {
            return true;
        } else {
            return false;
        }
    }
}

/**
 * for situations where a simulation challenge for <previousAction> has been formulated
 * @previousAction can't be timeout action, test before instantiating
 */
export class SimulationDefenderNode extends GamePosition {
    readonly previousAction: string;

    constructor(process1: string, process2: string, previousAction: string) {
        super(process1, process2, Player.Defender);
        this.previousAction = previousAction;
    }

    invertProcesses(): GamePosition {
        return new SimulationDefenderNode(this.process2, this.process1, this.previousAction);
    }

    toString(): string {
        return "(" + this.previousAction + ", " + this.process1 + ", " + this.process2 + ")_d"
    }

    copy() {
        return new SimulationDefenderNode(this.process1, this.process2, this.previousAction);  
    }

    samePosition(otherNode: GamePosition): boolean {
        if(otherNode instanceof SimulationDefenderNode && otherNode.process1 === this.process1 && otherNode.process2 === this.process2 && otherNode.previousAction === this.previousAction) {
            return true;
        } else {
            return false;
        }
    }
}

/**
 * @environment subseteq of all possible actions
 */
export class RestrictedAttackerNode extends GamePosition {
    readonly environment: Set<string>;

    constructor(process1: string, process2: string, environment: Set<string>) {
        super(process1, process2, Player.Attacker);
        this.environment = new Set(environment);
    }

    invertProcesses(): GamePosition {
        return new RestrictedAttackerNode(this.process2, this.process1, this.environment);
    }

    toString(): string {
        let env_string = "{";
        let i = 0;
        this.environment.forEach( elem => {
            //last element
            if(i == this.environment.size - 1) {
                env_string = env_string.concat(elem);
            } else {
                env_string = env_string.concat(elem, ",");
            }
            i++;
        })
        env_string = env_string.concat("}");
        return "(" + this.process1 + ", " + env_string + ", " + this.process2 + ")_a"
    }

    copy() {
        return new RestrictedAttackerNode(this.process1, this.process2, this.environment);
    }

    samePosition(otherNode: GamePosition): boolean {
        if(otherNode instanceof RestrictedAttackerNode && otherNode.process1 === this.process1 && otherNode.process2 === this.process2 && SetOps.areEqual(otherNode.environment, this.environment)) {
            return true;
        } else {
            return false;
        }
    }
}

/**
 * for situations where a simulation challenge for <previousAction> has been formulated
 * @previousAction can only be timeout action or hidden action, test before instantiating
 * @environment subseteq of all possible actions
 */
export class RestrictedSimulationDefenderNode extends GamePosition {
    readonly environment: Set<string>;
    readonly previousAction: string;

    constructor(process1: string, process2:string, previousAction: string, environment: Set<string>) {
        super(process1, process2, Player.Defender);
        this.previousAction = previousAction;
        this.environment = new Set(environment);
    }

    invertProcesses(): GamePosition {
        return new RestrictedSimulationDefenderNode(this.process2, this.process1, this.previousAction, this.environment);
    }

    toString(): string {
        let env_string = "{";
        let i = 0;
        this.environment.forEach( elem => {
            //last element
            if(i == this.environment.size - 1) {
                env_string = env_string.concat(elem);
            } else {
                env_string = env_string.concat(elem, ",");
            }
            i++;
        })
        env_string = env_string.concat("}");
        return "(" + this.previousAction + ", " +  this.process1 + ", " + env_string + ", " + this.process2 + ")_d"
    }

    copy() {
        return new RestrictedSimulationDefenderNode(this.process1, this.process2, this.previousAction, this.environment);
    }

    samePosition(otherNode: GamePosition): boolean {
        if(otherNode instanceof RestrictedSimulationDefenderNode && otherNode.process1 === this.process1 && otherNode.process2 === this.process2 && otherNode.previousAction === this.previousAction && SetOps.areEqual(otherNode.environment, this.environment)) {
            return true;
        } else {
            return false;
        }
    }
}