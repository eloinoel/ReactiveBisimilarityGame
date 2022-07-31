import Phaser from 'phaser';
import { LtsStateButton } from '../ui_elements/Button';
import { LTSController } from '../utils/LTSController';
import { Constants } from '../utils/Constants';

export default class DemoLevel extends Phaser.Scene {
    constructor() {
        super('DemoScene');
    }

    preload() {
        this.load.image("circle", "./assets/DemoScene/Circle03.png");
        this.load.image("circle_over", "./assets/DemoScene/Circle02.png");
        this.load.image("circle_down", "./assets/DemoScene/Circle01.png");
    }

    create() {
        this.setupLTS();
    }

    update(time: number, delta: number): void {
            
    }

    private setupLTS(): void {
        let x_left = this.game.renderer.width/3 - 50;
        let y_left = 150;
        let x_right = this.game.renderer.width*2/3 + 50;
        let y_right = y_left;
        let x_offset = 115;
        let y_offset = 140;

        const lts = new LTSController();
        lts.addState("p0");
        const p0 = new LtsStateButton(this, x_left, y_left, () => {console.log("p0")}, "p0").setScale(0.5);
        lts.addState("p1");
        const p1 = new  LtsStateButton(this, x_left - x_offset, y_left + y_offset, () => {console.log("p1")}, "p1").setScale(0.5);
        lts.addState("p2");
        const p2 = new  LtsStateButton(this, x_left , y_left + y_offset, () => {console.log("p2")}, "p2").setScale(0.5);
        lts.addState("p3");
        const p3 = new  LtsStateButton(this, x_left + x_offset, y_left + y_offset, () => {console.log("p3")}, "p3").setScale(0.5);
        lts.addState("p4");
        const p4 = new  LtsStateButton(this, x_left - x_offset, y_left + 2*y_offset, () => {console.log("p4")}, "p4").setScale(0.5);
        lts.addState("p5");
        const p5 = new  LtsStateButton(this, x_left, y_left + 2*y_offset, () => {console.log("p5")}, "p5").setScale(0.5);
        lts.addState("p6");
        const p6 = new  LtsStateButton(this, x_left + x_offset, y_left + 2*y_offset, () => {console.log("p6")}, "p6").setScale(0.5);
        lts.addState("p7");
        const p7 = new  LtsStateButton(this, x_left - x_offset, y_left + 3*y_offset, () => {console.log("p7")}, "p7").setScale(0.5);
        lts.addState("p8");
        const p8 = new  LtsStateButton(this, x_left + x_offset, y_left + 3*y_offset, () => {console.log("p8")}, "p8").setScale(0.5);

        lts.addTransition("p0", "p1", "b");
        lts.addTransition("p0", "p2", Constants.TIMEOUT_ACTION);
        lts.addTransition("p0", "p3", Constants.TIMEOUT_ACTION);
        lts.addTransition("p2", "p4", "a");
        lts.addTransition("p2", "p5", Constants.HIDDEN_ACTION);
        lts.addTransition("p3", "p6", Constants.HIDDEN_ACTION);
        lts.addTransition("p5", "p7", "b");
        lts.addTransition("p5", "p8", "a");
        lts.addTransition("p6", "p8", "a");

        lts.addState("q0");
        const q0 = new LtsStateButton(this, x_right, y_right, () => {console.log("q0")}, "q0").setScale(0.5);
        lts.addState("q1");
        const q1 = new LtsStateButton(this, x_right - x_offset, y_right + y_offset, () => {console.log("q1")}, "q1").setScale(0.5);
        lts.addState("q2");
        const q2 = new LtsStateButton(this, x_right, y_right + y_offset, () => {console.log("q2")}, "q2").setScale(0.5);
        lts.addState("q3");
        const q3 = new LtsStateButton(this, x_right + x_offset, y_right + y_offset, () => {console.log("q3")}, "q3").setScale(0.5);
        lts.addState("q4");
        const q4 = new LtsStateButton(this, x_right - x_offset, y_right + 2*y_offset, () => {console.log("q4")}, "q4").setScale(0.5);
        lts.addState("q5");
        const q5 = new LtsStateButton(this, x_right, y_right + 2*y_offset, () => {console.log("q5")}, "q5").setScale(0.5);
        lts.addState("q6");
        const q6 = new LtsStateButton(this, x_right + x_offset, y_right + 2*y_offset, () => {console.log("q6")}, "q6").setScale(0.5);
        lts.addState("q7");
        const q7 = new LtsStateButton(this, x_right - x_offset, y_right + 3*y_offset, () => {console.log("q7")}, "q7").setScale(0.5);
        lts.addState("q8");
        const q8 = new LtsStateButton(this, x_right + x_offset, y_right + 3*y_offset, () => {console.log("q0")}, "q0").setScale(0.5);

        lts.addTransition("q0", "q1", "b");
        lts.addTransition("q0", "q2", Constants.TIMEOUT_ACTION);
        lts.addTransition("q0", "q3", Constants.TIMEOUT_ACTION);
        lts.addTransition("q2", "q4", "a");
        lts.addTransition("q2", "q6", Constants.HIDDEN_ACTION);
        lts.addTransition("q3", "q5", Constants.HIDDEN_ACTION);
        lts.addTransition("q5", "q7", "b");
        lts.addTransition("q5", "q8", "a");
        lts.addTransition("q6", "q8", "a");
        

    }

}