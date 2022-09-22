import BaseScene from "../BaseScene";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";
import { LevelDescription } from "../../ui_elements/LevelDescription";

export default class Level3_8 extends BaseScene {
    constructor() {
        super('ReBisim_Level8');
    }

    preload() {

    }

    create() {
        this.fade(true);

        let bg = this.add.image(this.renderer.width/2, this.renderer.height/2, "background_demo").setOrigin(0.5).setDepth(0);
        bg.scale = this.renderer.width / bg.width;
        this.background = bg;

        this.scene.launch("GUIScene", { otherRunningScene: this })

        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {

        let level_description = new LevelDescription(this, this.renderer.width/2, 50, "3.8", "Reactive Bisimulation", true);
        let game_controller = new PhaserGameController(this, Constants.lts_xy_offset, Constants.first_coordinates.clone().subtract(new Phaser.Math.Vector2(40, 50)), Constants.second_coordinates.clone().subtract(new Phaser.Math.Vector2(-50, 50)), level_description)
        
        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, -1);
        game_controller.addState("p2", 0, 1, 1);
        game_controller.addState("p3", 0, 2, -1);
        game_controller.addState("p4", 0, 2, 1);
        game_controller.addState("p5", 0, 3, -1);

        game_controller.addTransition("p0", "p1", Constants.HIDDEN_ACTION);
        game_controller.addTransition("p1", "p1", "b");
        game_controller.addTransition("p1", "p3", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p4", "p2", "c");
        game_controller.addTransition("p3", "p4", Constants.HIDDEN_ACTION);
        game_controller.addTransition("p2", "p3", "c");
        game_controller.addTransition("p3", "p5", "b");

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, -1);
        game_controller.addState("q2", 1, 1, 1);
        game_controller.addState("q3", 1, 2, -1);
        game_controller.addState("q4", 1, 2, 1);

        game_controller.addTransition("q0", "q1", Constants.HIDDEN_ACTION);
        game_controller.addTransition("q1", "q1", "b");
        game_controller.addTransition("q1", "q3", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q3", "q4", Constants.HIDDEN_ACTION);
        game_controller.addTransition("q4", "q2", "c");
        game_controller.addTransition("q2", "q1", "c");
        game_controller.addTransition("q2", "q3", "c");


        game_controller.startGame(this, "p0", "q0", true, true, [7, 6]);

    }
}