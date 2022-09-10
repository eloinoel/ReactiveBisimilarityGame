import { Tests } from "../utils/Tests";

export default class TestScene extends Phaser.Scene {

    constructor() {
        super('TestScene');
    }

    /**
     * preload stuff
     */
    preload(): void {
    }

    create(): void {
        let tests = new Tests();
        //tests.testIsMovePossible();
        tests.testAI();

        //this.scene.launch("ReBisim_Level2")
    }
}