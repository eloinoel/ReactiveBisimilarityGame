import Phaser from 'phaser';
import BaseScene from './BaseScene';
import { Constants } from "../utils/Constants";
import { UI_Button } from '../ui_elements/Button';

export default class GUIScene extends BaseScene {
    otherRunningScene!: Phaser.Scene;

    constructor() {
        super('GUIScene');
    }

    init() {
        
    }

    /* preload function to add music and pictures into memory */
    preload() {
    }

    /* create function is used to add the objects to the game */
    create(data: { otherRunningScene: Phaser.Scene }) {
        this.otherRunningScene = data.otherRunningScene;


        let homeBtn = new UI_Button(this, 4*Constants.UI_offset, "ui_home_btn", () => {this.fade(false, () => {
            console.clear()
            this.toHome();
        })}, "Home")

        let backBtn = new UI_Button(this, 2*Constants.UI_offset, "ui_leftarrow_btn", () => {this.fade(false, () => {
            console.clear()
            this.toLevelMap();
        })}, "Back");

        let replayBtn = new UI_Button(this, this.renderer.width - 4* Constants.UI_offset, "ui_replay_btn", () => {this.fade(false, () => {
            console.clear()
            this.restartLevel();
        })}, "Restart");

        let infoyBtn = new UI_Button(this, this.renderer.width - 2* Constants.UI_offset, "ui_info_btn", () => {
            //TODO:Display Popup
            console.log("TODO: display rules popup")
        }, "Rules", false);

        let buttons = [];
        buttons.push(homeBtn, backBtn, replayBtn, infoyBtn);
        for(let i = 0; i < buttons.length; i++) {
            this.fadeImage((buttons[i] as unknown) as Phaser.GameObjects.Image, undefined, Constants.camFadeSpeed);
            this.fadeImage((buttons[i].text as unknown) as Phaser.GameObjects.Image, undefined, Constants.camFadeSpeed);
        }

        


    }

    /* update function is a loop that runs constantly */
    update(time: number, delta: number): void {
    }

    private toHome() {
        if(this.otherRunningScene !== undefined && this.otherRunningScene !== null) {
            this.scene.stop(this.otherRunningScene);
        }
        this.scene.start("ParallaxScene");
    }

    private toLevelMap() {
        if(this.otherRunningScene !== undefined && this.otherRunningScene !== null) {
            this.scene.stop(this.otherRunningScene);
        }
        this.scene.start('LevelMapScene');
    }

    private restartLevel() {
        if(this.otherRunningScene !== undefined && this.otherRunningScene !== null) {
            this.scene.stop(this.otherRunningScene);
        }
        this.scene.start(this.otherRunningScene);
    }
}
