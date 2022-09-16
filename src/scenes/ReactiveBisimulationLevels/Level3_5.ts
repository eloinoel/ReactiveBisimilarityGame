import BaseScene from "../BaseScene";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";
import { LevelDescription } from "../../ui_elements/LevelDescription";

export default class Level3_5 extends BaseScene {
    constructor() {
        super('ReBisim_Level5');
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

        let level_description = new LevelDescription(this, this.renderer.width/2, 50, "3.5", "Reactive Bisimulation", true);
        let game_controller = new PhaserGameController(this, Constants.lts_xy_offset, Constants.first_coordinates, Constants.second_coordinates, level_description)
        
        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, -1);
        game_controller.addState("p2", 0, 1, 1);
        game_controller.addState("p3", 0, 1.75, 2.25);
        game_controller.addState("p4", 0, 2.5,-1);
        game_controller.addState("p5", 0, 2.5, 1);

        game_controller.addTransition("p0", "p1", "a");
        game_controller.addTransition("p0", "p2", "a");
        game_controller.addTransition("p1", "p4", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p2", "p4", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p4", "p5", "a");
        game_controller.addTransition("p5", "p2", "a");
        game_controller.addTransition("p2", "p3", Constants.TIMEOUT_ACTION);

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, -1);
        game_controller.addState("q2", 1, 1, 1);
        game_controller.addState("q3", 1, 1.75, 2.25);
        game_controller.addState("q4", 1, 2.5,-1);
        game_controller.addState("q5", 1, 2.5, 1);

        game_controller.addTransition("q0", "q1", "a");
        game_controller.addTransition("q0", "q2", "a");
        game_controller.addTransition("q2", "q4", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q1", "q4", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q2", "q5", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q5", "q3", "a");
        game_controller.addTransition("q3", "q2", "a");

        game_controller.startGame(this, "p0", "q0", true, true, [6, 5]);
    }
}