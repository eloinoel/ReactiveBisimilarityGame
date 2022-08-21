/* Preload Screen to load main menu assets */

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('PreloaderScene');
    }

    /**
     * preload stuff
     */
    preload(): void {
        this.load.image("ui_home_btn", "assets/UI/Iconsforgamesgameassetpack/icons_256/home.png");
        this.load.image("ui_info_btn", "assets/UI/Iconsforgamesgameassetpack/icons_256/info_2.png");
        this.load.image("ui_musicon_btn", "assets/UI/Iconsforgamesgameassetpack/icons_256/music_on.png");
        this.load.image("ui_musicoff_btn", "assets/UI/Iconsforgamesgameassetpack/icons_256/music_off.png");
        this.load.image("ui_settings_btn", "assets/UI/Iconsforgamesgameassetpack/icons_256/settings_3.png");
        this.load.image("ui_replay_btn", "assets/UI/Iconsforgamesgameassetpack/icons_256/replay.png");
        this.load.image("ui_leftarrow_btn", "assets/UI/Iconsforgamesgameassetpack/icons_256/cursor_left.png");
        /* Loader Events:
            - complete: when done loading everything
            - progress: loader number progress in decimal || can also just use create()
        */

    }

    create(): void {
        let index = this.game.scene.getIndex('PreloaderScene');
        let nextScene = this.game.scene.getAt(index + 1);

        if(nextScene !== undefined) {
            this.scene.start(nextScene);
        }
    }
}