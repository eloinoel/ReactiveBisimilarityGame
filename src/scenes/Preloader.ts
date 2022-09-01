/* Preload Screen to load main menu assets */

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('PreloaderScene');
    }

    /**
     * preload stuff
     */
    preload(): void {
        //UI
        this.load.image("ui_home_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/home.png");
        this.load.image("ui_info_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/info_2.png");
        this.load.image("ui_settings_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/settings_3.png");
        this.load.image("ui_replay_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/replay.png");
        this.load.image("ui_leftarrow_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/cursor_left.png");
        this.load.image("ui_tick_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/tick.png");
        this.load.image("ui_swap_btn", "assets/switch.png")

        //LTS
        this.load.image("circle", 'assets/DemoScene/Circle03.png');
        this.load.image("circle_over", 'assets/DemoScene/Circle02.png');
        this.load.image("circle_down", 'assets/DemoScene/Circle01.png');
        this.load.image("arrow_tail", 'assets/DemoScene/right-arrow_tail.png');
        this.load.image("arrow_middle", 'assets/DemoScene/right-arrow_middle.png');
        this.load.image("arrow_head", 'assets/DemoScene/right-arrow_head.png');
        this.load.image("panel", 'assets/DemoScene/Panel02.png')

        //background
        this.load.image("background_demo", 'assets/dark_blue_sky.jpg');
        
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