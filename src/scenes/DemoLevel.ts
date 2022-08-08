import Phaser from 'phaser';
import { LTSController } from '../utils/LTSController';
import { Constants } from '../utils/Constants';
import { ReactiveBisimilarityGame } from '../utils/ReactiveBisimilarityGameController';
import { PhaserGameController } from '../utils/PhaserGameController';
import { TextEdit } from 'phaser3-rex-plugins/plugins/textedit';

export default class DemoLevel extends Phaser.Scene {
    constructor() {
        super('DemoScene');
    }

    preload() {
        this.load.image("circle", 'assets/DemoScene/Circle03.png');
        this.load.image("circle_over", 'assets/DemoScene/Circle02.png');
        this.load.image("circle_down", 'assets/DemoScene/Circle01.png');
        this.load.image("arrow_tail", 'assets/DemoScene/right-arrow_tail.png');
        this.load.image("arrow_middle", 'assets/DemoScene/right-arrow_middle.png');
        this.load.image("arrow_head", 'assets/DemoScene/right-arrow_head.png');
        this.load.image("panel", 'assets/DemoScene/Panel02.png')

    }

    create() {
        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {

        let first_coordinates = new Phaser.Math.Vector2(this.game.renderer.width/4 - 50, 100);
        let second_coordinates = new Phaser.Math.Vector2(this.game.renderer.width*2/4 + 50, 100);
        let xy_offset = new Phaser.Math.Vector2(115, 140);

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