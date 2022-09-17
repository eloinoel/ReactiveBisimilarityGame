import Phaser from 'phaser';
import BaseScene from './BaseScene';
import { Constants } from "../utils/Constants";
import { UI_Button } from '../ui_elements/Button';

export default class CreditsScene extends BaseScene {
    
    private toFadeIn!: Phaser.GameObjects.GameObject[]
    private clickedBtn = false; //to not allow clicking button errors while fading scene out

    constructor() {
        super('CreditsScene');
    }

  /* preload function to add music and pictures into memory */
    preload() {

    }

  /* create function is used to add the objects to the game */
    create() {
        this.clickedBtn = false;



        this.toFadeIn = []

        this.toFadeIn.push(this.add.text(this.renderer.width/2, 50, "Credits", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(45).setOrigin(0.5));
        this.toFadeIn.push(this.add.text(this.renderer.width/9, 200, "Design and Programming                         Eloi Sandt", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(30).setOrigin(0,0.5));
        this.toFadeIn.push(this.add.text(this.renderer.width/9, 250, "Consulting                                     Benjamin Bisping", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(30).setOrigin(0,0.5));
        this.toFadeIn.push(this.add.text(this.renderer.width/9, 300, "Influences", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(30).setOrigin(0,0.5));
        this.toFadeIn.push(this.add.text(this.renderer.width/9, 350, "    - Similar game                             Dominik Peacock", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(26).setOrigin(0,0.5));
        this.toFadeIn.push(this.add.text(this.renderer.width/9, 400, "    - Some Levels                              Rob v. Glabbeek, \n                                               Dominik Peacock, \n                                               Luca Tesei", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(26).setOrigin(0,0.5));
        
        this.toFadeIn.push(this.add.text(this.renderer.width/9, 500, "Assets                                         TODO", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(30).setOrigin(0,0.5));

        for(let i = 0; i < this.toFadeIn.length; i++) {
            this.fadeImage(this.toFadeIn[i] as Phaser.GameObjects.Image, i*25);
        }

        //UI Buttons
        let backBtn = new UI_Button(this, 1.5* Constants.UI_offset, "ui_leftarrow_btn", () => {
            this.tweens.killAll()
            for(let i = 0; i < this.toFadeIn.length - 1; i++) {
                this.fadeImageOut(this.toFadeIn[i] as Phaser.GameObjects.Image, i*50, );
            }
            this.fadeImageOut(this.toFadeIn[this.toFadeIn.length - 1] as Phaser.GameObjects.Image, (this.toFadeIn.length - 1) * 50, true, () => {
                this.scene.start('MainMenuScene');
            })
        }, "Back")
    }

    /* update function is a loop that runs constantly */
    update(time: number, delta: number): void {

    }
}
