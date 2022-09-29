import BaseScene from "../BaseScene";
import { UI_Button } from "../../ui_elements/Button";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";
import { LevelDescription } from "../../ui_elements/LevelDescription";

export default class Level1_4 extends BaseScene {
    constructor() {
        super('Sim_Level4');
    }

    preload() {

    }

    create() {
        this.fade(true);

        let bg = this.add.image(0, 0, "background_demo").setOrigin(0).setDepth(0);
        bg.scale = this.renderer.width / bg.width;
        this.background = bg;

        /** 0: simulation, 1: bisimulation, 2: reactive bisimulation, 3: reactive bisimulation with tau-actions */
        this.scene.launch("GUIScene", { otherRunningScene: this, levelType: 0})

        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {

        let level_description = new LevelDescription(this, this.renderer.width/2, 50, "1.4", "Simulation", true);
        let game_controller = new PhaserGameController(this, Constants.lts_xy_offset, Constants.first_coordinates.clone().add(new Phaser.Math.Vector2(0, 50)), Constants.second_coordinates.clone().add(new Phaser.Math.Vector2(0, 50)), level_description)

        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, 0);


        game_controller.addTransition("p0", "p1", "a");
        game_controller.addTransition("p1", "p0", "a");
        game_controller.addTransition("p0", "p0", "b");
        game_controller.addTransition("p1", "p1", "b");

        game_controller.addState("q0", 1, 0, -1);
        game_controller.addState("q1", 1, 0, 1);
        game_controller.addState("q2", 1, 1, -1);
        game_controller.addState("q3", 1, 1, 1);

        game_controller.addTransition("q0", "q2", "a");
        game_controller.addTransition("q3", "q1", "a");
        game_controller.addTransition("q0", "q1", "b");
        game_controller.addTransition("q1", "q0", "b");
        game_controller.addTransition("q2", "q3", "b");
        game_controller.addTransition("q3", "q2", "b");

        game_controller.startGame(this, "p0", "q0", false, false, [3, 2]);
        game_controller.printAttackerShortestMinMaxPath()
    }
}