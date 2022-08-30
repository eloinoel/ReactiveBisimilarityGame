import Phaser from 'phaser';
import { Constants } from '../utils/Constants';
import { PhaserGameController } from '../utils/PhaserGameController';
import BaseScene from './BaseScene';
import { UI_Button } from '../ui_elements/Button';

export default class DemoLevel extends BaseScene {
    constructor() {
        super('DemoScene');
    }

    preload() {

    }

    create() {
        this.fade(true);

        let bg = this.add.image(0, 0, "background_demo").setOrigin(0).setDepth(0);
        bg.scale = this.renderer.width / bg.width;

        let backBtn = new UI_Button(this, Constants.UI_offset, "ui_leftarrow_btn", () => {this.fade(false, () => {
            this.scene.start("ParallaxScene");
    })}, "Back")

        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {

        let first_coordinates = Constants.first_coordinates;
        let second_coordinates = Constants.second_coordinates;
        let xy_offset = Constants.lts_xy_offset;

        let game_controller = new PhaserGameController(this, xy_offset, first_coordinates, second_coordinates)

        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, -1);
        game_controller.addState("p2", 0, 1, 0);
        game_controller.addState("p3", 0, 1, 1);
        game_controller.addState("p4", 0, 2, -1);
        game_controller.addState("p5", 0, 2, 0);
        game_controller.addState("p6", 0, 2, 1);
        game_controller.addState("p7", 0, 3, -1);
        game_controller.addState("p8", 0, 3, 1);

        game_controller.addTransition("p0", "p1", "b");
        game_controller.addTransition("p0", "p2", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p0", "p3", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p2", "p4", "a");
        game_controller.addTransition("p2", "p5", Constants.HIDDEN_ACTION);
        game_controller.addTransition("p3", "p6", Constants.HIDDEN_ACTION);
        game_controller.addTransition("p5", "p7", "b");
        game_controller.addTransition("p5", "p8", "a");
        game_controller.addTransition("p6", "p8", "a");

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, -1);
        game_controller.addState("q2", 1, 1, 0);
        game_controller.addState("q3", 1, 1, 1);
        game_controller.addState("q4", 1, 2, -1);
        game_controller.addState("q5", 1, 2, 0);
        game_controller.addState("q6", 1, 2, 1);
        game_controller.addState("q7", 1, 3, -1);
        game_controller.addState("q8", 1, 3, 1);

        game_controller.addTransition("q0", "q1", "b");
        game_controller.addTransition("q0", "q2", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q0", "q3", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q2", "q4", "a");
        game_controller.addTransition("q2", "q6", Constants.HIDDEN_ACTION);
        game_controller.addTransition("q3", "q5", Constants.HIDDEN_ACTION);
        game_controller.addTransition("q5", "q7", "b");
        game_controller.addTransition("q5", "q8", "a");
        game_controller.addTransition("q6", "q8", "a");

        game_controller.startGame(this, "p0", "q0");
    }

}