import { Button, LevelSelectionButton, UI_Button } from '../ui_elements/Button';
import BaseScene from './BaseScene';
import { Constants } from '../utils/Constants';
import { WinPopup, LosePopup } from '../ui_elements/EndGamePopup';

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

        /* //reset storage
        localStorage.removeItem("levels");
        localStorage.removeItem("levelsBeforeToggle") */

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

        //init local storage for stars and enabling of levels
        let levels = JSON.parse(localStorage.getItem("levels") as string);
        if(levels === null) {
            levels = [
                //simulation levels
                {state: true, stars: 0}, 
                {state: false, stars: 0},
                {state: false, stars: 0},
                {state: false, stars: 0},
                //bisimulation levels
                {state: false, stars: 0},
                {state: false, stars: 0},
                {state: false, stars: 0},
                {state: false, stars: 0},
                //reactive bisimulation levels
                {state: false, stars: 0},    //level 3.1
                {state: false, stars: 0},    //level 3.2
                {state: false, stars: 0},    //level 3.3
                {state: false, stars: 0},    //level 3.4
                {state: false, stars: 0},    //level 3.5
                {state: false, stars: 0},    //level 3.6
                {state: false, stars: 0},    //level 3.7
                {state: false, stars: 0},    //level 3.8
                {state: false, stars: 0},    //level 3.9
                {state: false, stars: 0},    //level 3.10
                {state: false, stars: 0},    //level 3.11
                {state: false, stars: 0},    //level 3.12
            ]
        }
        localStorage.setItem("levels", JSON.stringify(levels));

        //UI Buttons
        let backBtn = new UI_Button(this, 1.5* Constants.UI_offset, "ui_leftarrow_btn", () => {this.fade(false, () => {
                //this.pulseTween.stop();
                this.scene.start("ParallaxScene");
        })}, "Back")

        this.input.keyboard.on('keydown-ESC', (event:KeyboardEvent) => {
            this.fade(false, () => {
                //this.pulseTween.stop();
                this.scene.start("ParallaxScene");
            })
        })

        this.levelObjects = [];
        //simulation
        let simText = this.add.text(600, this.renderer.height - 150, "Simulation", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold italic'}).setOrigin(0.5).setFontSize(45).setStroke('#000000', 4).setResolution(2);
        this.levelObjects.push(new LevelSelectionButton(this, 350, this.renderer.height - 70, "blue_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "0"); this.scene.start("Sim_Level1")})}, "Level 1.1"));
        this.levelObjects.push(new LevelSelectionButton(this, 160, this.renderer.height - 150, "blue_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "1");this.scene.start("Sim_Level2")})}, "Level 1.2"));
        this.levelObjects.push(new LevelSelectionButton(this, 350, this.renderer.height - 210, "blue_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "2");this.scene.start("Sim_Level3")})}, "Level 1.3"));
        this.levelObjects.push(new LevelSelectionButton(this, 520, this.renderer.height - 290, "blue_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "3");this.scene.start("Sim_Level4")})}, "Level 1.4"));

        //bisimulation
        let bisimText = this.add.text(300, 40, "Bisimulation", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold italic'}).setOrigin(0.5).setFontSize(45).setStroke('#000000', 4).setResolution(2);
        this.levelObjects.push(new LevelSelectionButton(this, 270, this.renderer.height/2 + 45, "orange_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "4");this.scene.start("Bisim_Level1")})}, "Level 2.1"));
        this.levelObjects.push(new LevelSelectionButton(this, 200, this.renderer.height/2 - 50, "orange_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "5");this.scene.start("Bisim_Level2")})}, "Level 2.2"));
        this.levelObjects.push(new LevelSelectionButton(this, 95, 187, "orange_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "6");this.scene.start("Bisim_Level3")})}, "Level 2.3"));
        this.levelObjects.push(new LevelSelectionButton(this, 290, 200, "orange_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "7");this.scene.start("Bisim_Level4")})}, "Level 2.4"));

        //reactive bisimulation
        let rebisimText = this.add.text(this.renderer.width - 300, 110, "Reactive Bisimulation", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold italic'}).setOrigin(0.5).setFontSize(45).setStroke('#000000', 4).setResolution(2);       
        this.levelObjects.push(new LevelSelectionButton(this, 440, 150, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "8");this.scene.start("ReBisim_Level1")})}, "Level 3.1"));
        this.levelObjects.push(new LevelSelectionButton(this, 540, 240, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "9");this.scene.start("ReBisim_Level2")})}, "Level 3.2"));
        this.levelObjects.push(new LevelSelectionButton(this, 720, 220, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "10");this.scene.start("ReBisim_Level3")})}, "Level 3.3"));
        this.levelObjects.push(new LevelSelectionButton(this, 800, 350, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "11");this.scene.start("ReBisim_Level4")})}, "Level 3.4"));
        this.levelObjects.push(new LevelSelectionButton(this, 930, 255, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "12");this.scene.start("ReBisim_Level5")})}, "Level 3.5"));
        this.levelObjects.push(new LevelSelectionButton(this, 1120, 210, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "13");this.scene.start("ReBisim_Level6")})}, "Level 3.6"));
        this.levelObjects.push(new LevelSelectionButton(this, 1045, 360, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "14");this.scene.start("ReBisim_Level7")})}, "Level 3.7"));
        this.levelObjects.push(new LevelSelectionButton(this, 1210, 400, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "15");this.scene.start("ReBisim_Level8")})}, "Level 3.8"));
        this.levelObjects.push(new LevelSelectionButton(this, 1150, 495, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "16");this.scene.start("ReBisim_Level9")})}, "Level 3.9"));
        this.levelObjects.push(new LevelSelectionButton(this, 1060, 580, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "17");this.scene.start("ReBisim_Level10")})}, "Level 3.10"));
        this.levelObjects.push(new LevelSelectionButton(this, 1160, 655, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "18");this.scene.start("ReBisim_Level11")})}, "Level 3.11"));
        this.levelObjects.push(new LevelSelectionButton(this, 973, 682, "red_button", () => {this.fade(false, () => {localStorage.setItem("currentLevel", "19");this.scene.start("ReBisim_Level12")})}, "Level 3.12"));

        //disable all levels that players hasn't unlocked yet
        let fartest_enabled_level_index = 0;
        for(let i = 0; i < this.levelObjects.length; i++) {
            if(!levels[i].state) {
                this.levelObjects[i].disable()
            } else {
                fartest_enabled_level_index = i;
                this.levelObjects[i].enable();
            }
            this.levelObjects[i].setStars(levels[i].stars);
        }

        //current lvl pulse effect
        this.curLevelBtn = this.levelObjects[fartest_enabled_level_index];
        
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

        //toggle switch
        this.input.keyboard.on('keydown-T', (event:KeyboardEvent) => {
            if(event.shiftKey) {
                this.toggleAllLevels()
            }
        })
        this.input.keyboard.on('keydown-R', (event:KeyboardEvent) => {
            if(event.shiftKey) {
                this.resetAllProgress()
            }
        })
    }

    update(time: number, delta: number): void {
    }

    toggleAllLevels() {
        let levels = JSON.parse(localStorage.getItem("levels") as string);

        let on = false;
        for(let i = 0; i < levels.length; i++) {
            if(levels[i].state === false) {
                on = true;
                break;
            }
        }

        //unlock all levels
        if(on) {
            localStorage.setItem("levelsBeforeToggle", JSON.stringify(levels))
            for(let i = 0; i < levels.length; i++) {
                levels[i].state = true;
            }
            localStorage.setItem("levels", JSON.stringify(levels));
        //reset to previous state
        } else {
            let tmp = localStorage.getItem("levelsBeforeToggle");
            if(tmp !== null) {
                let levelsBeforeToggle = JSON.parse(tmp);
                localStorage.removeItem("levelsBeforeToggle")
                localStorage.setItem("levels", JSON.stringify(levelsBeforeToggle));
            }
        }
        this.scene.restart();
    }

    resetAllProgress() {
        
        let levels = [
            //simulation levels
            {state: true, stars: 0}, 
            {state: false, stars: 0},
            {state: false, stars: 0},
            {state: false, stars: 0},
            //bisimulation levels
            {state: false, stars: 0},
            {state: false, stars: 0},
            {state: false, stars: 0},
            {state: false, stars: 0},
            //reactive bisimulation levels
            {state: false, stars: 0},    //level 3.1
            {state: false, stars: 0},    //level 3.2
            {state: false, stars: 0},    //level 3.3
            {state: false, stars: 0},    //level 3.4
            {state: false, stars: 0},    //level 3.5
            {state: false, stars: 0},    //level 3.6
            {state: false, stars: 0},    //level 3.7
            {state: false, stars: 0},    //level 3.8
            {state: false, stars: 0},    //level 3.9
            {state: false, stars: 0},    //level 3.10
            {state: false, stars: 0},    //level 3.11
            {state: false, stars: 0},    //level 3.12
        ]
        localStorage.removeItem("levelsBeforeToggle")
        localStorage.setItem("levels", JSON.stringify(levels));
        this.scene.restart();
    }
}