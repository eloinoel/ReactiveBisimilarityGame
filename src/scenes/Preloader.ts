/* Preload Screen to load main menu assets */

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('PreloaderScene');
    }

    /**
     * preload stuff
     */
    preload(): void {
        this.load.image("ui_home_button", 'assets/UI/Menu\ Buttons/Square\ Buttons/Square Buttons/Home\ Square\ Button.png');
        this.load.image("ui_info_button", 'assets/UI/Menu\ Buttons/Square\ Buttons/Square Buttons/Info\ Square\ Button.png');
        this.load.image("ui_redo_button", 'assets/UI/Menu\ Buttons/Square\ Buttons/Square Buttons/Return\ Square\ Button.png');
        this.load.image("ui_back_button", 'assets/UI/Menu\ Buttons/Square\ Buttons/Square Buttons/Back\ Square\ Button.png');

        /* Loader Events:
            - complete: when done loading everything
            - progress: loader number progress in decimal || can also just use create()
        */

    }

    create(): void {
        this.scene.start('MainMenuScene');
    }
}