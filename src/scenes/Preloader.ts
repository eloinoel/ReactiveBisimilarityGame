/* Preload Screen to load main menu assets */

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('PreloaderScene');
    }

    /**
     * preload stuff
     */
    preload(): void {

        this.load.image("logo", 'assets/phaser3-logo.png')
        this.load.image("link_icon", 'assets/UI/link.png');

        //UI
        this.load.image("ui_home_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/home.png");
        this.load.image("ui_info_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/info_2.png");
        this.load.image("ui_settings_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/settings_3.png");
        this.load.image("ui_replay_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/replay.png");
        this.load.image("ui_leftarrow_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/cursor_left.png");
        this.load.image("ui_tick_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/tick.png");
        this.load.image("ui_level_map_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/list_bulleted.png");
        this.load.image("ui_questionmark_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/help.png");
        this.load.image("ui_cross_btn", "assets/UI/Iconsforgamesgameassetpack/icons_128/cross.png");
        //this.load.image("ui_swap_btn", "assets/switch.png")
        this.load.image("ui_swap_btn", "assets/Transition/symmetry_arrow.png")

        //LTS
        this.load.image("circle", 'assets/DemoScene/Circle03.png');
        this.load.image("circle_over", 'assets/DemoScene/Circle02.png');
        this.load.image("circle_down", 'assets/DemoScene/Circle01.png');
        this.load.image("arrow_tail", 'assets/DemoScene/right-arrow_tail.png');
        this.load.image("arrow_middle", 'assets/DemoScene/right-arrow_middle.png');
        this.load.image("arrow_head", 'assets/DemoScene/right-arrow_head.png');

        //background
        this.load.image("background_demo", 'assets/dark_blue_sky.jpg');
        this.load.image("background_mountain_water", 'assets/background_parallax/Free-Horizontal-Game-Backgrounds/PNG/game_background_1/game_background_1.png');
        this.load.image("background_mountain_desert", 'assets/background_parallax/Free-Horizontal-Game-Backgrounds/PNG/game_background_2/game_background_2.png');
        this.load.image("background_forest", 'assets/background_parallax/Free-Horizontal-Game-Backgrounds/PNG/game_background_3/game_background_3.1.png');
        this.load.image("background_swamp", 'assets/background_parallax/Free-Horizontal-Game-Backgrounds/PNG/game_background_4/game_background_4.png');
        this.load.image("background_dark_gradient", 'assets/background_parallax/dark_gradient.png');
        this.load.image("background_dark_gradient_green", 'assets/background_parallax/dark_gradient_green.png');


        //characters/icons
        this.load.spritesheet("witch_idle", "assets/characters/Blue_witch/B_witch_idle.png", {frameWidth: 64, frameHeight: 96});
        this.load.spritesheet("purple_wizard", "assets/characters/tinyPurpleWizard/MAGE.png", {frameWidth: 150, frameHeight: 150})
        this.load.image("purple_wizard_icon", 'assets/characters/tinyPurpleWizard/mage_icon.png');
        this.load.image("witch_icon", 'assets/characters/Blue_witch/witch_icon.png');
        this.load.image("fire_arrow_icon", 'assets/Transition/fire_arrow_icon.png');
        this.load.image("water_arrow_icon", 'assets/Transition/water_arrow_icon.png');
        this.load.image("plant_arrow_icon", 'assets/Transition/plant_arrow_icon.png');
        this.load.image("timeout_arrow_icon", 'assets/Transition/timeout_arrow_icon.png');
        this.load.image("tau_arrow_icon", 'assets/Transition/tau_arrow_icon.png');

        //highscore
        this.load.image("star", 'assets/UI/Stars/Star.png');
        this.load.image("star_empty", 'assets/UI/Stars/Empty\ Star\ Grey.png');
        
        //Icons
        this.load.image("fire_icon", 'assets/fire.png');
        this.load.image("water_icon", 'assets/water-drop.png');
        this.load.image("leaf_icon", 'assets/leaf2.png');
        this.load.image("sand_clock", 'assets/Transition/sand_clock.png')

        //arrows
        this.load.image("fire_arrow", 'assets/Transition/fire_arrow.png')
        this.load.image("water_arrow", 'assets/Transition/water_arrow.png')
        this.load.image("plant_arrow", 'assets/Transition/plant_arrow.png')
        this.load.image("water_arrow_circle", 'assets/Transition/water_arrow_circle.png')
        this.load.image("right_arrow", 'assets/Transition/right-arrow.png')
        this.load.image("timeout_arrow" , 'assets/Transition/timeout_arrow.png')
        this.load.image("tau_arrow" , 'assets/Transition/tau_arrow.png')

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