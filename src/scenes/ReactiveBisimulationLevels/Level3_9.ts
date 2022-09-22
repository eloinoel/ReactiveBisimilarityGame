import BaseScene from "../BaseScene";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";
import { LevelDescription } from "../../ui_elements/LevelDescription";

export default class Level3_9 extends BaseScene {
    constructor() {
        super('ReBisim_Level9');
    }

    preload() {

    }

    create() {
        this.fade(true);

        let bg = this.add.image(0, 0, "background_demo").setOrigin(0).setDepth(0);
        bg.scale = this.renderer.width / bg.width;
        this.background = bg;

        this.scene.launch("GUIScene", { otherRunningScene: this })

        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {

        let level_description = new LevelDescription(this, this.renderer.width/2, 50, "3.9", "Reactive Bisimulation", true);
        let game_controller = new PhaserGameController(this, Constants.lts_xy_offset, Constants.first_coordinates.clone().subtract(new Phaser.Math.Vector2(50, 0)), Constants.second_coordinates.clone().subtract(new Phaser.Math.Vector2(-50, 0)), level_description)
        
        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, -1.5);
        game_controller.addState("p2", 0, 1, 0);
        game_controller.addState("p3", 0, 2, 0);
        game_controller.addState("p4", 0, 2, 1.5);

        game_controller.addTransition("p0", "p1", "b");
        game_controller.addTransition("p0", "p2", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p1", "p3", "b");
        game_controller.addTransition("p3", "p4", "a");
        game_controller.addTransition("p3", "p2", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p2", "p1", Constants.HIDDEN_ACTION);

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, 0);
        game_controller.addState("q2", 1, 1, 1.5);
        game_controller.addState("q3", 1, 1, -1.5);
        game_controller.addState("q4", 1, 2, 0);
        game_controller.addState("q5", 1, 2, 1.5);

        game_controller.addTransition("q0", "q1", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q0", "q2", "b");
        game_controller.addTransition("q1", "q2", Constants.HIDDEN_ACTION);
        game_controller.addTransition("q1", "q3", "b");
        game_controller.addTransition("q2", "q4", "b");
        game_controller.addTransition("q4", "q1", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q4", "q5", "a");



        game_controller.startGame(this, "p0", "q0", true, true, [7, 5]);
        
    }
}