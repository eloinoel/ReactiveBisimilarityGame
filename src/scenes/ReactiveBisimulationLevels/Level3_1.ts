import BaseScene from "../BaseScene";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";

export default class Level3_1 extends BaseScene {
    constructor() {
        super('ReBisim_Level1');
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
        game_controller.addState("p3", 0, 2, 0);
        game_controller.addState("p4", 0, 2, 2);

        game_controller.addTransition("p0", "p1", "a");
        game_controller.addTransition("p0", "p2", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p2", "p3", "a");
        game_controller.addTransition("p2", "p4", "b");

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, -1);
        game_controller.addState("q2", 1, 1, 1);
        game_controller.addState("q3", 1, 2, 0);
        game_controller.addState("q4", 1, 2, 2);

        game_controller.addTransition("q0", "q1", "a");
        game_controller.addTransition("q0", "q2", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q2", "q3", "a");
        game_controller.addTransition("q2", "q4", "a");

        game_controller.startGame(this, "p0", "q0", true, true);
    }
}