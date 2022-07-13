/* Preload Screen to load main menu assets */

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }

    /**
     * preload stuff
     */
    preload(): void {

    }

    create(): void {
        this.add.text(20, 20, "Loading Game...");
        this.scene.start('GameScene');
    }
}