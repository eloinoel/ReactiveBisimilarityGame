import BaseScene from "../BaseScene";
import { UI_Button } from "../../ui_elements/Button";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";

export default class Level2 extends BaseScene {
    constructor() {
        super('Sim_Level2');
    }

    preload() {

    }

    create() {
        this.fade(true);

        let bg = this.add.image(0, 0, "background_demo").setOrigin(0).setDepth(0);
        bg.scale = this.renderer.width / bg.width;

        let homeBtn = new UI_Button(this, this.renderer.width - 2* Constants.UI_offset, "ui_home_btn", () => {this.fade(false, () => {
            this.scene.start("ParallaxScene");
        })}, "Home")

        let backBtn = new UI_Button(this, 2*Constants.UI_offset, "ui_leftarrow_btn", () => {this.fade(false, () => {
            this.scene.start("LevelMapScene");
        })}, "Back");

        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {

        let game_controller = new PhaserGameController(this, Constants.lts_xy_offset, Constants.first_coordinates, Constants.second_coordinates)

        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, -1);
        game_controller.addState("p2", 0, 1, 1);
        game_controller.addState("p3", 0, 2, 0);

        game_controller.addTransition("p0", "p1", "a");
        game_controller.addTransition("p0", "p2", "a");
        game_controller.addTransition("p1", "p3", "a");
        game_controller.addTransition("p2", "p3", "b");

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, -1);
        game_controller.addState("q2", 1, 1, 1);
        game_controller.addState("q3", 1, 2, 0);

        game_controller.addTransition("q0", "q1", "a");
        game_controller.addTransition("q0", "q2", "a");
        game_controller.addTransition("q1", "q3", "a");
        game_controller.addTransition("q2", "q3", "a");

        game_controller.startGame(this, "p0", "q0", false, false);
    }
}