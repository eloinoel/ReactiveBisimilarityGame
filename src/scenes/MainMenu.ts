import Phaser from 'phaser';
import BaseScene from './BaseScene';
import { Constants } from "../utils/Constants";
export default class MainMenu extends BaseScene {
    private toFadeIn!: Phaser.GameObjects.GameObject[];
    private clickedBtn = false; //to not allow clicking button errors while fading scene out

    constructor() {
        super('MainMenuScene');
    }

  /* preload function to add music and pictures into memory */
    preload() {
        this.load.image("logo", 'assets/phaser3-logo.png');

    }

  /* create function is used to add the objects to the game */
    create() {
        this.clickedBtn = false;

        this.toFadeIn = []

        this.toFadeIn.push(this.add.image(this.cameras.main.centerX, this.game.renderer.height * 0.2, 'logo').setDepth(1));

        let playButton = this.add.text(this.renderer.width/2, this.renderer.height/2, "Play", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(50).setOrigin(0.5).setDepth(1);
        this.toFadeIn.push(playButton);

        let options_button = this.add.text(this.renderer.width/2, this.renderer.height/2 + 65, "Credits", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(38).setOrigin(0.5).setDepth(1);
        this.toFadeIn.push(options_button);

        for(let i = 0; i < this.toFadeIn.length; i++) {
            this.fadeImage(this.toFadeIn[i] as Phaser.GameObjects.Image, i*100);
        }


        /** make image buttons interactive
         * PointerEvents:
         *    pointerover - hovering
         *    pointerout - not hovering
         *    pointerup - click and release
         *    pointerdown - just click
         */

        playButton.setInteractive();
        playButton.on("pointerover", () => {
            playButton.scale = 1.1;
        });
        playButton.on("pointerout", () => {
            playButton.scale = 1;
        });
        playButton.on("pointerdown", () => {
            playButton.scale = 0.95;
        });
        playButton.on("pointerup", () => {
            playButton.scale = 1.1;
            if(!this.clickedBtn) { 
                this.clickedBtn = true;
                //this.cameras.main.shake(Constants.camFadeSpeed, 0.0009);
                this.fade(false, () => {
                    this.scene.stop('ParallaxScene');
                    this.scene.start('LevelMapScene');
                }, 500);
            }
            
        });

        options_button.setInteractive();
        options_button.on("pointerover", () => {
            options_button.scale = 1.1;
        });
        options_button.on("pointerout", () => {
            options_button.scale = 1;
        });
        options_button.on("pointerdown", () => {
            options_button.scale = 0.95;
        });
        options_button.on("pointerup", () => {
            options_button.scale = 1.1;
            if(!this.clickedBtn) { 
                this.clickedBtn = true;

                this.tweens.killAll()
                for(let i = 0; i < this.toFadeIn.length - 1; i++) {
                    this.fadeImageOut(this.toFadeIn[i] as Phaser.GameObjects.Image, i*100 + 100, );
                }
                this.fadeImageOut(this.toFadeIn[this.toFadeIn.length - 1] as Phaser.GameObjects.Image, (this.toFadeIn.length - 1) * 100 + 100, true, () => {
                    this.scene.start('CreditsScene');
                })
            }
        });
    }

    /* update function is a loop that runs constantly */
    update(time: number, delta: number): void {

    }
}
