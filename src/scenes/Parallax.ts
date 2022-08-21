import 'phaser'
import BaseScene from './BaseScene';

export default class Parallax extends BaseScene {
    private images!: Phaser.GameObjects.TileSprite[];


    constructor() {
        super('ParallaxScene');
    }

    /* preload function to add music and pictures into memory */
    preload() {
        this.load.image("parallax0", 'assets/background_parallax/Free-Horizontal-Game-Backgrounds/PNG/game_background_3/layers/sky.png');
        this.load.image("parallax1", 'assets/background_parallax/Free-Horizontal-Game-Backgrounds/PNG/game_background_3/layers/clouds_1.png');
        this.load.image("parallax2", 'assets/background_parallax/Free-Horizontal-Game-Backgrounds/PNG/game_background_3/layers/rocks.png');
        this.load.image("parallax3", 'assets/background_parallax/Free-Horizontal-Game-Backgrounds/PNG/game_background_3/layers/clouds_2.png');
        this.load.image("parallax4", 'assets/background_parallax/Free-Horizontal-Game-Backgrounds/PNG/game_background_3/layers/ground_1.png');
        this.load.image("parallax5", 'assets/background_parallax/Free-Horizontal-Game-Backgrounds/PNG/game_background_3/layers/ground_2.png');
        this.load.image("parallax6", 'assets/background_parallax/Free-Horizontal-Game-Backgrounds/PNG/game_background_3/layers/ground_3.png');
    }

    /* create function is used to add the objects to the game */
    create() {
        this.images = [];
        this.images[0] = this.add.tileSprite(0, 0, 0, 0, "parallax0").setOrigin(0, 0).setScrollFactor(0, 1);
        this.images[1] = this.add.tileSprite(0, 0, 0, 0, "parallax1").setOrigin(0, 0).setScrollFactor(0, 1);
        this.images[2] = this.add.tileSprite(0, 0, 0, 0, "parallax2").setOrigin(0, 0).setScrollFactor(0, 1);
        this.images[3] = this.add.tileSprite(0, 0, 0, 0, "parallax3").setOrigin(0, 0).setScrollFactor(0, 1);
        this.images[4] = this.add.tileSprite(0, 0, 0, 0, "parallax4").setOrigin(0, 0).setScrollFactor(0, 1);
        this.images[5] = this.add.tileSprite(0, 0, 0, 0, "parallax5").setOrigin(0, 0).setScrollFactor(0, 1);
        this.images[6] = this.add.tileSprite(0, 0, 0, 0, "parallax6").setOrigin(0, 0).setScrollFactor(0, 1);

        for(let i = 0; i < this.images.length; i++) {
            let scaleY = this.renderer.height / this.images[i].height;
            this.images[i].scale = scaleY;
        }

        this.fade(true, undefined, 500);
        this.scene.launch("MainMenuScene");
    }
        

    /* update function is a loop that runs constantly */
    update(time: number, delta: number): void {
        const cam = this.cameras.main;
        const speed = 0.5;
        cam.scrollX += speed;


        for(let i = 0; i < this.images.length; i++) {
            const img = this.images[i];
            img.tilePositionX = this.cameras.main.scrollX * 0.2 * i;
        }
    }
}