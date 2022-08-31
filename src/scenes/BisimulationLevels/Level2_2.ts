import BaseScene from "../BaseScene";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";

export default class Level2_2 extends BaseScene {
    constructor() {
        super('Bisim_Level2');
    }

    preload() {

    }

    create() {
        this.fade(true);

        let bg = this.add.image(0, 0, "background_demo").setOrigin(0).setDepth(0);
        bg.scale = this.renderer.width / bg.width;

        this.scene.launch("GUIScene", { otherRunningScene: this })

        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {

        let game_controller = new PhaserGameController(this, Constants.lts_xy_offset, Constants.first_coordinates, Constants.second_coordinates)

        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, -1);
        game_controller.addState("p2", 0, 1, 1);
        game_controller.addState("p3", 0, 2, -2);

        game_controller.addTransition("p0", "p1", "a");
        game_controller.addTransition("p0", "p2", "a");
        game_controller.addTransition("p1", "p3", "b");
        game_controller.addTransition("p2", "p2", "b");

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, 0);
        game_controller.addState("q2", 1, 2, 0);

        game_controller.addTransition("q0", "q1", "a");
        game_controller.addTransition("q1", "q1", "b");
        game_controller.addTransition("q1", "q2", "b");

        game_controller.startGame(this, "p0", "q0", false, true);
    }
}