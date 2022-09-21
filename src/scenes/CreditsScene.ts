import Phaser from 'phaser';
import BaseScene from './BaseScene';
import { Constants } from "../utils/Constants";
import { UI_Button } from '../ui_elements/Button';
import { CreditsScrollableArea } from '../ui_elements/ScrollableTextArea';

export default class CreditsScene extends BaseScene {
    
    private toFadeIn!: Phaser.GameObjects.GameObject[]
    private clickedBtn = false; //to not allow clicking button errors while fading scene out

    constructor() {
        super('CreditsScene');
    }

  /* preload function to add music and pictures into memory */
    preload() {

    }

  /* create function is used to add the objects to the game */
    create() {
        this.clickedBtn = false;



        this.toFadeIn = []

        //UI Buttons
        let backBtn = new UI_Button(this, 1.5* Constants.UI_offset, "ui_leftarrow_btn", () => {
        this.tweens.killAll()
        for(let i = 0; i < this.toFadeIn.length - 1; i++) {
            this.fadeImageOut(this.toFadeIn[i] as Phaser.GameObjects.Image, i*20, );
        }
        this.fadeImageOut(this.toFadeIn[this.toFadeIn.length - 1] as Phaser.GameObjects.Image, (this.toFadeIn.length - 1) * 20, true, () => {
            this.scene.start('MainMenuScene');
        })
        }, "Back")

        //title
        this.toFadeIn.push(backBtn)
        this.toFadeIn.push(backBtn.text)
        this.toFadeIn.push(this.add.text(this.renderer.width/2, 50, "Credits", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(45).setOrigin(0.5));

        this.toFadeIn.push((this.add.text(this.renderer.width/2 - 10, 100, "This game is part of a bachelor project", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(30).setOrigin(0.5)));
        this.toFadeIn.push(this.getLinkIcon("https://github.com/eloinoel/ReactiveBisimilarityGame").setPosition(980, 100) as unknown as Phaser.GameObjects.Text)

        //scrollable area
        let scrollable_area = new CreditsScrollableArea(this, this.renderer.width/2, this.renderer.height/2 + 40, this.renderer.width - 50, this.renderer.height - 250)
        this.toFadeIn.push(scrollable_area.getSlider()[0])
        this.toFadeIn.push(scrollable_area.getSlider()[1])

        this.toFadeIn.push(scrollable_area.addNewLine(this.add.text(0, 0, "Design and Programming:                  Eloi Sandt", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(30)));
        this.toFadeIn.push(scrollable_area.addNewLine(this.add.text(0, 0, "Consulting:                              Benjamin Bisping", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(30)));
        this.toFadeIn.push(scrollable_area.addNewLine(this.add.text(0, 0, "Influences:", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(30)));
        this.toFadeIn.push(scrollable_area.addText(this.add.text(0, 0, "    - Similar game ", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(24)));
        this.toFadeIn.push(scrollable_area.addText(this.getLinkIcon("https://concurrency-theory.org/rvg-game/") as unknown as Phaser.GameObjects.Text));
        this.toFadeIn.push(scrollable_area.addNewLine(this.add.text(0, 0, "                               Dominik Peacock", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(23)));
                                     
        this.toFadeIn.push(scrollable_area.addNewLine(this.add.text(0, 0, "    - Adopted Levels", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(24)));
        this.toFadeIn.push(scrollable_area.addText(this.add.text(0, 0, "        Level 2.3                                     Dominik Peacock", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(23)));
        this.toFadeIn.push(scrollable_area.addNewLine(this.getLinkIcon("https://concurrency-theory.org/rvg-game/") as unknown as Phaser.GameObjects.Text));
        this.toFadeIn.push(scrollable_area.addText(this.add.text(0, 0, "        Level 2.4                                     Luca Tesei", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(23)));
        this.toFadeIn.push(scrollable_area.addNewLine(this.getLinkIcon("http://didattica.cs.unicam.it/old/lib/exe/fetch.php?media=didattica:magistrale:rtpsv:ay_1718:ex_and_solutions_bisim_hml_weak_fixpoint.pdf") as unknown as Phaser.GameObjects.Text));
        this.toFadeIn.push(scrollable_area.addText(this.add.text(0, 0, "        Level 3.7                                     Rob van Glabbeek", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(23)));
        this.toFadeIn.push(scrollable_area.addNewLine(this.getLinkIcon("https://link.springer.com/content/pdf/10.1007/s00236-022-00417-1.pdf") as unknown as Phaser.GameObjects.Text));
        
        this.toFadeIn.push(scrollable_area.addNewLine(this.add.text(0, 0, "Assets: TODO", {fontFamily: Constants.textStyle, fontStyle: 'bold', color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(30)));
        this.toFadeIn.push(scrollable_area.addNewLine(this.add.text(0, 0, "bla", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(23)));
        this.toFadeIn.push(scrollable_area.addNewLine(this.add.text(0, 0, "bla", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(23)));
        this.toFadeIn.push(scrollable_area.addNewLine(this.add.text(0, 0, "bla", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(23)));
        this.toFadeIn.push(scrollable_area.addNewLine(this.add.text(0, 0, "bla", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(23)));



        //built with phaser
        let logo = this.add.image(this.renderer.width/2 + 80, this.renderer.height - 50, "logo").setOrigin(0.5).setScale(0.3)
        let built_with = this.add.text(this.renderer.width/2 - 70, this.renderer.height - 50, "Built with", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setResolution(2).setFontSize(20).setOrigin(0.5).setDepth(1).setResolution(2);
        this.toFadeIn.push(built_with);
        this.toFadeIn.push(logo)


        for(let i = 0; i < this.toFadeIn.length; i++) {
            this.fadeImage(this.toFadeIn[i] as Phaser.GameObjects.Image, i*25);
        }

        this.input.keyboard.on('keydown-ESC', (event:KeyboardEvent) => {
            this.tweens.killAll()
            for(let i = 0; i < this.toFadeIn.length - 1; i++) {
                this.fadeImageOut(this.toFadeIn[i] as Phaser.GameObjects.Image, i*20, false);
            }
            this.fadeImageOut(this.toFadeIn[this.toFadeIn.length - 1] as Phaser.GameObjects.Image, (this.toFadeIn.length - 1) * 20, true, () => {
                this.scene.start('MainMenuScene');
            })
        })
    }

    getLinkIcon(url: string) {
        let scale = 0.043;
        let icon = this.add.image(0, 0, "link_icon").setInteractive().setTint(Constants.convertColorToNumber(Constants.COLORPACK_1.white)).setScale(scale);
        icon.tintFill = true;

        let fn = () => {
            let s = window.open(url, '_blank');

            if (s && s.focus)
            {
                s.focus();
            }
            else if (!s)
            {
                window.location.href = url;
            }
        }

        icon.on('pointerup', fn);
        icon.on('pointerout', () => {icon.setScale(scale)})
        icon.on('pointerover', () => {icon.setScale(scale + 0.01)})
        return icon;
    }

    /* update function is a loop that runs constantly */
    update(time: number, delta: number): void {

    }
}
