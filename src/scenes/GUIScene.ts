import Phaser from 'phaser';
import BaseScene from './BaseScene';
import { Constants } from "../utils/Constants";
import { UI_Button } from '../ui_elements/Button';
import { RulesPopUp } from '../ui_elements/RulesPopUp';

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
    create(data: { otherRunningScene: Phaser.Scene, levelType: number}) {
        this.otherRunningScene = data.otherRunningScene;


        let homeBtn = new UI_Button(this, 3.5*Constants.UI_offset, "ui_home_btn", () => {this.fade(false, () => {
            console.clear()
            this.toHome();
        })}, "Home")

        let backBtn = new UI_Button(this, 1.5*Constants.UI_offset, "ui_level_map_btn", () => {this.fade(false, () => {
            console.clear()
            this.toLevelMap();
        })}, "Map");

        this.input.keyboard.on('keydown-ESC', (event:KeyboardEvent) => {
            this.fade(false, () => {
                console.clear()
                this.toLevelMap();
            })
        })

        let replayBtn = new UI_Button(this, this.renderer.width - 3.5* Constants.UI_offset, "ui_replay_btn", () => {this.fade(false, () => {
            console.clear()
            this.restartLevel();
        })}, "Restart");

        let infoyBtn = new UI_Button(this, this.renderer.width - 1.5* Constants.UI_offset, "ui_questionmark_btn", () => {
            let tmp = new RulesPopUp(this, data.levelType);
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
