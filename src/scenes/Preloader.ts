/* Preload Screen to load main menu assets */

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('PreloaderScene');
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
        

        

        /* Loader Events:
            - complete: when done loading everything
            - progress: loader number progress in decimal || can also just use create()
        */
        //ugly loading bar
        this.load.on("progress", (percent: number) => {
            loadingBar.fillRect(this.game.renderer.width/4, this.game.renderer.height / 2, this.game.renderer.width * percent * (0.5), 50);
        });

        //load
        /* for(let i = 0; i < 100; i++) {
            this.load.image("logo", '/assets/phaser3-logo.png');
        } */

    }

    create(): void {
        this.scene.start('MainMenuScene');
    }
}