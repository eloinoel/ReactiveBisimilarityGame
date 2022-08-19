import { Button, LevelSelectionButton } from '../ui_elements/Button';
import BaseScene from './BaseScene';
import { Constants } from '../utils/Constants';

export default class LevelMap extends BaseScene {
    private zoomTime = 1000;
    private zoomAmount = 0.4;
    
    constructor() {
        super('LevelMapScene');
    }

    preload() {
        this.load.image("world_map", 'assets/LevelMap/LevelMap.png');
        this.load.image("world_map_blur", 'assets/LevelMap/LevelMap_blur.png');
        this.load.spritesheet("blue_button", 'assets/LevelMap/blue_button.png', {frameWidth: 16, frameHeight: 16});
    }

    create() {
        //zoom effect
        this.cameras.main.zoom = 1 - this.zoomAmount;
        this.tweens.add({
            targets: this.cameras.main,
            ease: Phaser.Math.Easing.Sine.Out,
            duration: this.zoomTime,
            zoom: 1
        })

        //radial blur for zoom
        let bg = this.add.image(0, 0, "world_map").setOrigin(0, 0).setDepth(0);
        let bg_blurred = this.add.image(0, 0, "world_map_blur").setOrigin(0, 0).setDepth(0);
        bg.scale = this.renderer.width / bg.width;
        bg_blurred.scale = this.renderer.width / bg.width;
        this.fadeImageOut(bg_blurred, this.zoomTime);

        //fade scene in
        this.fade(true);

        //TODO: Serif Font for titles

        //simulation
        let simText = this.add.text(600, this.renderer.height - 150, "Simulation", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(45).setStroke('#000000', 4);
        let lvl1_btn = new LevelSelectionButton(this, 350, this.renderer.height - 70, "blue_button", () => {console.log("click")}, "Level 1");
        let lvl2_btn = new LevelSelectionButton(this, 160, this.renderer.height - 150, "blue_button", () => {console.log("click")}, "Level 2");
        let lvl3_btn = new LevelSelectionButton(this, 350, this.renderer.height - 210, "blue_button", () => {console.log("click")}, "Level 3");
        let lvl4_btn = new LevelSelectionButton(this, 520, this.renderer.height - 290, "blue_button", () => {console.log("click")}, "Level 4");

        //TODO: bisimulation
        let bisimText = this.add.text(200, 50, "Bisimulation", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(45).setStroke('#000000', 4);

        //TODO: reactive bisimulation
        let rebisimText = this.add.text(this.renderer.width - 300, 150, "Reactive Bisimulation", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(45).setStroke('#000000', 4);
        
    }

    update(time: number, delta: number): void {
        //zoom in
        
        /* if(time - this.startTime <= this.zoomTime) {
            let easeFn = Phaser.Tweens.Builders.GetEaseFunction(Phaser.Math.Easing.Sine.Out);
            console.log(easeFn(0.2))
            this.cameras.main.zoom += (delta / this.zoomTime) * this.zoomAmount;
        } */
    }
}