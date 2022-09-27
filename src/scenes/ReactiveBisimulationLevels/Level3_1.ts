import BaseScene from "../BaseScene";
import { Constants } from "../../utils/Constants";
import { PhaserGameController } from "../../utils/PhaserGameController";
import { LevelDescription } from "../../ui_elements/LevelDescription";

export default class Level3_1 extends BaseScene {
    constructor() {
        super('ReBisim_Level1');
    }

    preload() {

    }

    create() {
        this.fade(true);

        let bg = this.add.image(this.renderer.width/2, this.renderer.height/2, "background_demo").setOrigin(0.5).setDepth(0);
        bg.scale = this.renderer.width / bg.width;
        this.background = bg;
        //this.background.setInteractive();

        /** 0: simulation, 1: bisimulation, 2: reactive bisimulation, 3: reactive bisimulation with tau-actions */
        this.scene.launch("GUIScene", { otherRunningScene: this, levelType: 2})

        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {

        let level_description = new LevelDescription(this, this.renderer.width/2, 50, "3.1", "Reactive Bisimulation", true);
        let game_controller = new PhaserGameController(this, Constants.lts_xy_offset, Constants.first_coordinates, Constants.second_coordinates, level_description)
        
        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, -1);
        game_controller.addState("p2", 0, 1, 1);
        game_controller.addState("p3", 0, 2, 0);

        game_controller.addTransition("p0", "p1", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p0", "p2", "a");
        game_controller.addTransition("p1", "p3", "b");

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, -1);
        game_controller.addState("q2", 1, 1, 1);
        game_controller.addState("q3", 1, 2, 0);

        game_controller.addTransition("q0", "q2", "a");
        game_controller.addTransition("q0", "q1", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q1", "q3", "a");

        game_controller.startGame(this, "p0", "q0", true, true, [3, 2]);
    }
}