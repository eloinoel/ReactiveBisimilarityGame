/* Preload Screen to load main menu assets */

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }

    /**
     * preload stuff
     */
    preload(): void {
        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff
            }
        });
        this.load.image("title_bg", './public/assets/title_bg.jpg');
        this.load.image("options_button", './public/assets/options_button.png');
        this.load.image("play_button", './public/assets/play_button.png');
        this.load.image("logo", './public/assets/phaser3-logo.png');

        this.load.spritesheet("cat", './public/assets/cat.png', {
            frameHeight: 32,
            frameWidth: 32
        });

        this.load.audio("bg_music", './public/assets/placeholder.mp3');

        

        /* Loader Events:
            - complete: when done loading everything
            - progress: loader number progress in decimal || can also just use create()
        */
        //ugly loading bar
        this.load.on("progress", (percent: number) => {
            loadingBar.fillRect(this.game.renderer.width/4, this.game.renderer.height / 2, this.game.renderer.width * percent * (0.5), 50);
        });

        for(let i = 0; i < 100; i++) {
            this.load.image("logo", './public/assets/phaser3-logo.png');
        }

    }

    create(): void {
        this.scene.start('MainMenuScene');
    }
}