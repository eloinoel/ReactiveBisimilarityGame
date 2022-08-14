import Phaser from 'phaser';
import BaseScene from './BaseScene';
import { Constants } from "../utils/Constants";
export default class MainMenu extends BaseScene {
    private toFadeIn!: Phaser.GameObjects.Image[];

    constructor() {
        super('MainMenuScene');
    }

  /* preload function to add music and pictures into memory */
    preload() {
        this.load.image("options_button", 'assets/options_button.png');
        this.load.image("play_button", 'assets/play_button.png');
        this.load.image("logo", 'assets/phaser3-logo.png');
        this.load.audio("bg_music", 'assets/placeholder.mp3');
    }

  /* create function is used to add the objects to the game */
    create() {

        this.toFadeIn = []

        this.toFadeIn.push(this.add.image(this.cameras.main.centerX, this.game.renderer.height * 0.2, 'logo').setDepth(1));

        let playButton = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, 'play_button').setDepth(1);
        this.toFadeIn.push(playButton);

        let options_button = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2 + 70, 'options_button').setDepth(1);
        this.toFadeIn.push(options_button);

        for(let i = 0; i < this.toFadeIn.length; i++) {
            this.fadeImage(this.toFadeIn[i]);
        }

        //create audio
        this.sound.play("bg_music", {
            loop: true,
        })
        this.sound.volume = 0;
        //this.sound.pauseOnBlur = false; //if music should keep playing when switching tab


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
            playButton.scale = 0.9;
        });
        playButton.on("pointerup", () => {
            playButton.scale = 1;
            this.fade(false, () => {
                this.scene.stop('ParallaxScene');
                this.scene.start('DemoScene');
            }, 500)
        });
        //this.cameras.main.fadeIn(1000)
    }

    /* update function is a loop that runs constantly */
    update(time: number, delta: number): void {

    }
}
