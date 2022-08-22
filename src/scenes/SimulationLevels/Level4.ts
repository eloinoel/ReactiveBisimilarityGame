import BaseScene from "../BaseScene";
import { UI_Button } from "../../ui_elements/Button";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";

export default class Level4 extends BaseScene {
    constructor() {
        super('Sim_Level4');
    }

    preload() {

    }

    create() {
        this.fade(true);

        let bg = this.add.image(0, 0, "background_demo").setOrigin(0).setDepth(0);
        bg.scale = this.renderer.width / bg.width;

        let homeBtn = new UI_Button(this, this.renderer.width - 2* Constants.UI_offset, "ui_home_btn", () => {this.fade(false, () => {
            this.scene.start("ParallaxScene");
        })}, "Home");

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

        game_controller.startGame(this, "p0", "q0");
    }
}