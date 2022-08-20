import { Constants } from "../utils/Constants";

export class Button extends Phaser.GameObjects.Container {

    private outImage: Phaser.GameObjects.Image;
    private overImage: Phaser.GameObjects.Image;
    private downImage: Phaser.GameObjects.Image;

    text: Phaser.GameObjects.Text;


    constructor(scene: Phaser.Scene, x: number, y: number, outTexture: string, actionOnClick = () => {}, caption: string = "", overTexture?: string, downTexture?: string) {
        super(scene, x, y);

        this.outImage = scene.add.image(0, 0, outTexture);
        if(overTexture === undefined) {
            this.overImage = scene.add.image(0, 0, outTexture).setDepth(1);
        } else {
            this.overImage = scene.add.image(0, 0, overTexture).setDepth(1);
        }
        if(downTexture === undefined) {
            this.downImage = scene.add.image(0, 0, outTexture).setDepth(1);
        } else {
            this.downImage = scene.add.image(0, 0, downTexture).setDepth(1);
        }

        this.text = scene.add.text(0, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.black, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(45);
        this.text.x = Math.round(this.text.x);
        this.text.y = Math.round(this.text.y);

        this.add(this.outImage);
        this.add(this.overImage);
        this.add(this.downImage);
        this.add(this.text);

        this.overImage.setVisible(false);
        this.downImage.setVisible(false);


        scene.add.existing(this);

        this.setSize(this.outImage.width, this.outImage.height);
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.setDepth(1);
        this.setInteractive();

        /** make image button interactive
         * PointerEvents:
         *    pointerover - hovering
         *    pointerout - not hovering
         *    pointerup - click and release
         *    pointerdown - just click
         */
        this.on('pointerover', () => {
            this.overImage.setVisible(true);
            this.outImage.setVisible(false);
            this.downImage.setVisible(false);
        })
        this.on('pointerdown', () => {
            this.overImage.setVisible(false);
            this.outImage.setVisible(false);
            this.downImage.setVisible(true);
        })
        this.on('pointerup', () => {
            this.overImage.setVisible(true);
            this.outImage.setVisible(false);
            this.downImage.setVisible(false);
            actionOnClick();
        })
        this.on('pointerout', () => {
            this.overImage.setVisible(false);
            this.outImage.setVisible(true);
            this.downImage.setVisible(false);
        })
    }
}

export class LtsStateButton extends Button {
    
    constructor(scene: Phaser.Scene, x: number, y: number, actionOnClick = () => {}, caption: string) {
        super(scene, x, y, "circle", actionOnClick, caption, "circle_over", "circle_down");
    }
}

/**
 * uses one Tilesprites
 */
export class LevelSelectionButton extends Phaser.GameObjects.Container {

    private texture: Phaser.GameObjects.Sprite;
    private clickTexture: Phaser.GameObjects.Sprite;
    private btnClicked = false;
    private disableAlpha = 0.4;
    text: Phaser.GameObjects.Text;
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, actionOnClick = () => {}, caption: string = "", fontSize = 25) {
        super(scene, x, y);

        this.texture = scene.add.sprite(0, 0, texture, 0).setScale(1.5);
        this.clickTexture = scene.add.sprite(0, 0, texture, 1).setScale(1.5);
        console.log(window.devicePixelRatio);

        this.text = scene.add.text(0, -fontSize - 3, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(fontSize);
        this.text.setStroke('#000000', 3).setScale(0.9, 0.9).setResolution(2);
        this.text.x = Math.round(this.text.x);
        this.text.y = Math.round(this.text.y);

        this.add(this.texture);
        this.add(this.clickTexture);
        this.add(this.text);
        this.clickTexture.setVisible(false);


        scene.add.existing(this);
        
        this.setSize(this.texture.width, this.texture.height);
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.setDepth(1);
        this.setInteractive();

        /** make image button interactive
         * PointerEvents:
         *    pointerover - hovering
         *    pointerout - not hovering
         *    pointerup - click and release
         *    pointerdown - just click
         */
         this.on('pointerover', () => {
            //this.texture.setTint(Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2));
            this.texture.scale = this.texture.scale + 0.1;
            this.clickTexture.scale = this.clickTexture.scale + 0.1;
            //this.clickTexture.setTint(Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2));
            this.clickTexture.setVisible(false);
            this.text.scale = 0.95;
        })
        this.on('pointerdown', () => {
            this.texture.setVisible(false);
            this.clickTexture.setVisible(true);
            this.text.scale = 0.85;
        })
        this.on('pointerup', () => {
            this.texture.setVisible(true);
            this.clickTexture.setVisible(false);
            this.text.scale = 0.95;
            if(!this.btnClicked) {
                this.btnClicked = true;
                actionOnClick();
            }
        })
        this.on('pointerout', () => {
            //this.texture.clearTint();
            //this.clickTexture.clearTint();
            this.texture.scale = this.texture.scale - 0.1;
            this.clickTexture.scale = this.clickTexture.scale - 0.1;
            this.texture.setVisible(true);
            this.clickTexture.setVisible(false);
            this.text.scale = 0.9;
        })
    }

    disable() {
        this.disableInteractive();
        this.texture.alpha = this.disableAlpha;
        this.clickTexture.alpha = this.disableAlpha;
        this.text.alpha = this.disableAlpha;
        return this;
    }

    enable() {
        this.setInteractive();
        this.texture.alpha = 1;
        this.clickTexture.alpha = 1;
        this.text.alpha = 1
        return this;
    }

}