import BaseScene from "../BaseScene";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";
import { LevelDescription } from "../../ui_elements/LevelDescription";

export default class Level2_4 extends BaseScene {
    constructor() {
        super('Bisim_Level4');
    }

    preload() {

    }

    create() {
        this.fade(true);

        let bg = this.add.image(0, 0, "background_demo").setOrigin(0).setDepth(0);
        bg.scale = this.renderer.width / bg.width;
        this.background = bg;

        /** 0: simulation, 1: bisimulation, 2: reactive bisimulation, 3: reactive bisimulation with tau-actions */
        this.scene.launch("GUIScene", { otherRunningScene: this, levelType: 1})

        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {

        let level_description = new LevelDescription(this, this.renderer.width/2, 50, "2.4", "Bisimulation", true);
        let game_controller = new PhaserGameController(this, Constants.lts_xy_offset, Constants.first_coordinates.clone().subtract(new Phaser.Math.Vector2(50, 0)), Constants.second_coordinates.clone().add(new Phaser.Math.Vector2(50, 0)), level_description)

        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, -1.5);
        game_controller.addState("p2", 0, 1, 0);
        game_controller.addState("p3", 0, 1, 1.5);
        game_controller.addState("p4", 0, 2, -1.5);
        game_controller.addState("p5", 0, 2, 1.5);
        game_controller.addState("p6", 0, 2, 0);

        game_controller.addTransition("p0", "p1", "a");
        game_controller.addTransition("p0", "p2", "a");
        game_controller.addTransition("p0", "p3", "a");
        game_controller.addTransition("p1", "p4", "c");
        game_controller.addTransition("p3", "p5", "c");
        game_controller.addTransition("p1", "p6", "b");
        game_controller.addTransition("p2", "p3", "b");
        game_controller.addTransition("p6", "p5", "c");

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, 0);
        game_controller.addState("q2", 1, 2, -1);
        game_controller.addState("q3", 1, 2, 1);
        game_controller.addState("q4", 1, 1, -1.5);


        game_controller.addTransition("q0", "q1", "a");
        game_controller.addTransition("q1", "q4", "b");
        game_controller.addTransition("q1", "q2", "b");
        game_controller.addTransition("q2", "q3", "c");
        game_controller.addTransition("q1", "q3", "c");

        game_controller.startGame(this, "p0", "q0", false, true, [5, 3]);

        game_controller.printAttackerShortestMinMaxPath()
        //console.log("expected moves: 3")
    }
}