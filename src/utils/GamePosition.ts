import { Constants } from "./Constants";

/**
 * Data Class representing the current or previous game state
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
}