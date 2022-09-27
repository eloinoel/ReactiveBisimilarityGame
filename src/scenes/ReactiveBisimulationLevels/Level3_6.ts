import BaseScene from "../BaseScene";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";
import { LevelDescription } from "../../ui_elements/LevelDescription";
import { RulesPopUp } from "../../ui_elements/RulesPopUp";

/**
 * Introducing hidden action
 */
export default class Level3_6 extends BaseScene {

    

    constructor() {
        super('ReBisim_Level6');
    }

    preload() {

    }

    create() {
        this.fade(true);

        let bg = this.add.image(0, 0, "background_demo").setOrigin(0).setDepth(0);
        bg.scale = this.renderer.width / bg.width;
        this.background = bg;

        /** 0: simulation, 1: bisimulation, 2: reactive bisimulation, 3: reactive bisimulation with tau-actions */
        this.scene.launch("GUIScene", { otherRunningScene: this, levelType: 3})

        let tmp = new RulesPopUp(this, 3)

        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {

        let level_description = new LevelDescription(this, this.renderer.width/2, 50, "3.6", "Reactive Bisimulation", true);
        let game_controller = new PhaserGameController(this, Constants.lts_xy_offset, Constants.first_coordinates.clone().subtract(new Phaser.Math.Vector2(50, 75)), Constants.second_coordinates.clone().subtract(new Phaser.Math.Vector2(-50, 75)), level_description)
        
        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, -1);
        game_controller.addState("p2", 0, 1, 1);
        game_controller.addState("p3", 0, 2, 0);
        game_controller.addState("p4", 0, 3,-1);
        game_controller.addState("p5", 0, 3, 1);

        game_controller.addTransition("p0", "p1", "a");
        game_controller.addTransition("p0", "p2", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p2", "p3", Constants.HIDDEN_ACTION);
        game_controller.addTransition("p3", "p4", "a");
        game_controller.addTransition("p3", "p5", "b");

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, -1);
        game_controller.addState("q2", 1, 1, 1);
        game_controller.addState("q3", 1, 2, 0);
        game_controller.addState("q4", 1, 3, -1);
        game_controller.addState("q5", 1, 3, 1);

        game_controller.addTransition("q0", "q1", "a");
        game_controller.addTransition("q0", "q2", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q2", "q3", Constants.HIDDEN_ACTION);
        game_controller.addTransition("q3", "q4", "a");
        game_controller.addTransition("q3", "q5", "c");

        game_controller.startGame(this, "p0", "q0", true, true, [4, 3]);
    }
}