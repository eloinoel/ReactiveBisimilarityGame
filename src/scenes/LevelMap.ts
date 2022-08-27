import { Button, LevelSelectionButton, UI_Button } from '../ui_elements/Button';
import BaseScene from './BaseScene';
import { Constants } from '../utils/Constants';

export default class LevelMap extends BaseScene {
    private zoomTime = 600;
    private zoomAmount = 0.4;
    private levelObjects: LevelSelectionButton[] = [];
    private curLevelBtn!: LevelSelectionButton;
    private pulseTween!: Phaser.Tweens.Tween;
    
    constructor() {
        super('LevelMapScene');
    }

    preload() {
        this.load.image("world_map", 'assets/LevelMap/LevelMap.png');
        this.load.image("world_map_blur", 'assets/LevelMap/LevelMap_blur.png');
        this.load.spritesheet("blue_button", 'assets/LevelMap/blue_button.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("orange_button", 'assets/LevelMap/orange_button.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("red_button", 'assets/LevelMap/red_button.png', {frameWidth: 16, frameHeight: 16});
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

        //UI Buttons
        let backBtn = new UI_Button(this, Constants.UI_offset, "ui_leftarrow_btn", () => {this.fade(false, () => {
                //this.pulseTween.stop();
                this.scene.start("ParallaxScene");
        })}, "Back")

        this.levelObjects = [];
        //simulation
        let simText = this.add.text(600, this.renderer.height - 150, "Simulation", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold italic'}).setOrigin(0.5).setFontSize(45).setStroke('#000000', 4).setResolution(2);
        this.levelObjects.push(new LevelSelectionButton(this, 350, this.renderer.height - 70, "blue_button", () => {this.fade(false, () => {this.scene.start("Sim_Level1")})}, "Level 1.1"));
        this.levelObjects.push(new LevelSelectionButton(this, 160, this.renderer.height - 150, "blue_button", () => {this.fade(false, () => {this.scene.start("Sim_Level2")})}, "Level 1.2"));
        this.levelObjects.push(new LevelSelectionButton(this, 350, this.renderer.height - 210, "blue_button", () => {this.fade(false, () => {this.scene.start("Sim_Level3")})}, "Level 1.3"));
        this.levelObjects.push(new LevelSelectionButton(this, 520, this.renderer.height - 290, "blue_button", () => {this.fade(false, () => {this.scene.start("Sim_Level4")})}, "Level 1.4"));

        //bisimulation
        let bisimText = this.add.text(360, 70, "Bisimulation", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold italic'}).setOrigin(0.5).setFontSize(45).setStroke('#000000', 4).setResolution(2);
        this.levelObjects.push(new LevelSelectionButton(this, 270, this.renderer.height/2 + 45, "orange_button", () => {this.fade(false, () => {this.scene.start("Bisim_Level1")})}, "Level 2.1"));
        this.levelObjects.push(new LevelSelectionButton(this, 200, this.renderer.height/2 - 50, "orange_button", () => {this.fade(false, () => {this.scene.start("Bisim_Level2")})}, "Level 2.2"));
        this.levelObjects.push(new LevelSelectionButton(this, 120, 170, "orange_button", () => {this.fade(false, () => {this.scene.start("Bisim_Level3")})}, "Level 2.3"));
        this.levelObjects.push(new LevelSelectionButton(this, 290, 200, "orange_button", () => {this.fade(false, () => {this.scene.start("Bisim_Level4")})}, "Level 2.4").disable());

        //reactive bisimulation
        let rebisimText = this.add.text(this.renderer.width - 300, 150, "Reactive Bisimulation", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold italic'}).setOrigin(0.5).setFontSize(45).setStroke('#000000', 4).setResolution(2);       
        this.levelObjects.push(new LevelSelectionButton(this, 440, 130, "red_button", () => {this.fade(false, () => {this.scene.start("ReBisim_Level1")})}, "Level 3.1"));
        this.levelObjects.push(new LevelSelectionButton(this, 540, 240, "red_button", () => {this.fade(false, () => {this.scene.start("ReBisim_Level2")})}, "Level 3.2").disable());
        this.levelObjects.push(new LevelSelectionButton(this, 720, 220, "red_button", () => {this.fade(false, () => {this.scene.start("ReBisim_Level3")})}, "Level 3.3").disable());
        this.levelObjects.push(new LevelSelectionButton(this, 800, 350, "red_button", () => {this.fade(false, () => {this.scene.start("ReBisim_Level4")})}, "Level 3.4").disable());
        this.levelObjects.push(new LevelSelectionButton(this, 930, 255, "red_button", () => {this.fade(false, () => {this.scene.start("ReBisim_Level5")})}, "Level 3.5").disable());
        this.levelObjects.push(new LevelSelectionButton(this, 1120, 210, "red_button", () => {this.fade(false, () => {this.scene.start("ReBisim_Level6")})}, "Level 3.6").disable());
        this.levelObjects.push(new LevelSelectionButton(this, 1045, 360, "red_button", () => {this.fade(false, () => {this.scene.start("ReBisim_Level7")})}, "Level 3.7").disable());
        this.levelObjects.push(new LevelSelectionButton(this, 1125, 510, "red_button", () => {this.fade(false, () => {this.scene.start("ReBisim_Level8")})}, "Level 3.8").disable());
        this.levelObjects.push(new LevelSelectionButton(this, 1160, 655, "red_button", () => {this.fade(false, () => {this.scene.start("ReBisim_Level9")})}, "Level 3.9").disable());
        this.levelObjects.push(new LevelSelectionButton(this, 973, 682, "red_button", () => {this.fade(false, () => {this.scene.start("ReBisim_Level10")})}, "Level 3.10").disable());


        //current lvl pulse effect
        this.curLevelBtn = this.levelObjects[0];    //TODO: dependant on what player has already played
        
        if(this.curLevelBtn !== undefined) {
            this.pulseTween = this.tweens.add({
                targets: this.curLevelBtn,
                duration: 800,
                scale: 1.15,
                ease: Phaser.Math.Easing.Quadratic.InOut,
                yoyo: true,
                loop: -1
            })
        }
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