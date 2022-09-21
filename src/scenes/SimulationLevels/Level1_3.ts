import BaseScene from "../BaseScene";
import { UI_Button } from "../../ui_elements/Button";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";
import { LevelDescription } from "../../ui_elements/LevelDescription";

export default class Level1_3 extends BaseScene {
    constructor() {
        super('Sim_Level3');
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

        let level_description = new LevelDescription(this, this.renderer.width/2, 50, "1.3", "Simulation", true);
        let game_controller = new PhaserGameController(this, Constants.lts_xy_offset, Constants.first_coordinates, Constants.second_coordinates, level_description)

        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, 0);
        game_controller.addState("p2", 0, 2, -1);
        game_controller.addState("p3", 0, 2, 1);

        game_controller.addTransition("p0", "p1", "c");
        game_controller.addTransition("p1", "p2", "a");
        game_controller.addTransition("p1", "p3", "b");
        game_controller.addTransition("p2", "p3", "a");
        game_controller.addTransition("p3", "p2", "a");

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, -1);
        game_controller.addState("q2", 1, 1, 1);
        game_controller.addState("q3", 1, 2, -1);
        game_controller.addState("q4", 1, 2, 1);

        game_controller.addTransition("q0", "q1", "c");
        game_controller.addTransition("q0", "q2", "c");
        game_controller.addTransition("q1", "q3", "a");
        game_controller.addTransition("q2", "q4", "b");
        game_controller.addTransition("q3", "q4", "a");
        game_controller.addTransition("q4", "q3", "a");

        game_controller.startGame(this, "p0", "q0", false, false, [3, 2]);
    }
}