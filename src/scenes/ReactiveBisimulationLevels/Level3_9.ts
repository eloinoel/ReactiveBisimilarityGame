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

        this.scene.launch("GUIScene", { otherRunningScene: this })

        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {

        let level_description = new LevelDescription(this, this.renderer.width/2, 50, "3.9", "Reactive Bisimulation", true);
        let game_controller = new PhaserGameController(this, Constants.lts_xy_offset, Constants.first_coordinates, Constants.second_coordinates, level_description)
        
        game_controller.addState("p0", 0, 0, 0);
        game_controller.addState("p1", 0, 1, -1.5);
        game_controller.addState("p2", 0, 1, 0);
        game_controller.addState("p3", 0, 1, 1.5);
        //game_controller.addState("p4", 0, 2, -1.5);
        game_controller.addState("p5", 0, 2, 0);
        game_controller.addState("p6", 0, 2, 1.5);

        game_controller.addTransition("p0", "p1", "a");
        game_controller.addTransition("p0", "p2", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p1", "p5", Constants.HIDDEN_ACTION);
        game_controller.addTransition("p5", "p3", "b");
        game_controller.addTransition("p3", "p0", Constants.HIDDEN_ACTION);
        game_controller.addTransition("p2", "p3", Constants.HIDDEN_ACTION);
        game_controller.addTransition("p5", "p2", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("p2", "p1", "a");
        //game_controller.addTransition("p1", "p4", "b");
        game_controller.addTransition("p3", "p6", "b");

        game_controller.addState("q0", 1, 0, 0);
        game_controller.addState("q1", 1, 1, -1.5);
        game_controller.addState("q2", 1, 1, 0);
        game_controller.addState("q3", 1, 1, 1.5);
        game_controller.addState("q4", 1, 2, -1.5);
        game_controller.addState("q5", 1, 2, 0);

        game_controller.addTransition("q0", "q1", Constants.TIMEOUT_ACTION);
        game_controller.addTransition("q0", "q2", "a");
        game_controller.addTransition("q1", "q5", Constants.HIDDEN_ACTION);
        game_controller.addTransition("q2", "q5", Constants.HIDDEN_ACTION);
        game_controller.addTransition("q5", "q3", "b");
        game_controller.addTransition("q3", "q0", Constants.HIDDEN_ACTION);
        game_controller.addTransition("q2", "q1", Constants.HIDDEN_ACTION);


        game_controller.startGame(this, "p0", "q0", true, true, [7, 6]);
        game_controller.printAttackerShortestPath();
        
    }
}