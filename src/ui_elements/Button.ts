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

        this.text = scene.add.text(0, -fontSize - 3, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(fontSize);
        this.text.setStroke('#000000', 3).setScale(0.9, 0.9).setResolution(2);
        this.text.x = Math.round(this.text.x);
        this.text.y = Math.round(this.text.y);

        this.add(this.texture);
        this.add(this.clickTexture);
        this.add(this.text);
        this.clickTexture.setVisible(false);


        scene.add.existing(this);
        
        this.setSize(this.texture.width * 1.6, this.texture.height * 1.6);
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
            this.text.scale = 1;
        })
        this.on('pointerdown', () => {
            this.texture.setVisible(false);
            this.clickTexture.setVisible(true);
            this.text.scale = 0.85;
        })
        this.on('pointerup', () => {
            this.texture.setVisible(true);
            this.clickTexture.setVisible(false);
            this.text.scale = 1;
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

/**
 * Button class for UI Buttons with one texture, eg. the home button, performs actionOnClick only once
 */
export class UI_Button extends Phaser.GameObjects.Container {

    private image: Phaser.GameObjects.Image;
    private clickedBtn = false;


    text: Phaser.GameObjects.Text;


    constructor(scene: Phaser.Scene, x: number, texture: string, actionOnClick = () => {}, caption: string = "", disableAfterClick = true) {
        super(scene, x, Constants.UI_height);

        this.image = scene.add.image(0, 0, texture);
        this.setSize(this.image.width, this.image.height);
        this.scale = 0.4

        this.text = scene.add.text(x, Constants.UI_height + 40, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setOrigin(0.5).setFontSize(30).setResolution(2).setStroke('#A3A3A3', 1);
        this.add(this.image);
        //this.add(this.text);
        scene.add.existing(this);



        this.image.setTintFill(Constants.convertColorToNumber(Constants.COLORPACK_1.white));
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
            this.image.setTint(Constants.COLOR_BORDEAUX);
            this.text.setTint(Constants.COLOR_BORDEAUX);
            this.image.scale = 1
            this.text.scale = 1
        })
        this.on('pointerdown', () => {
            this.image.setTint(Phaser.Display.Color.GetColor(220, Phaser.Display.Color.ColorToRGBA(Constants.COLOR_BORDEAUX).g + 20, Phaser.Display.Color.ColorToRGBA(Constants.COLOR_BORDEAUX).b + 20));
            this.text.setTint(Phaser.Display.Color.GetColor(220, Phaser.Display.Color.ColorToRGBA(Constants.COLOR_BORDEAUX).g + 20, Phaser.Display.Color.ColorToRGBA(Constants.COLOR_BORDEAUX).b + 20));
            this.image.scale = 0.9
            this.text.scale = 0.9
        })
        this.on('pointerup', () => {
            this.image.setTint(Constants.COLOR_BORDEAUX);
            this.text.setTint(Constants.COLOR_BORDEAUX);
            if(!this.clickedBtn || !disableAfterClick) {
                this.clickedBtn = true;
                actionOnClick();
            }
            this.image.scale = 1
            this.text.scale = 1
        })
        this.on('pointerout', () => {
            this.image.setTint(Constants.convertColorToNumber(Constants.COLORPACK_1.white));
            this.text.setTint(Constants.convertColorToNumber(Constants.COLORPACK_1.white));
            this.image.scale = 1
            this.text.scale = 1
        })
    }
}

/**
 * Button class for UI Buttons with one texture, eg. the home button, performs actionOnClick only once
 */
 export class Simple_Button extends Phaser.GameObjects.Container {

    private image: Phaser.GameObjects.Image;
    private clickedBtn = false;

    text: Phaser.GameObjects.Text;


    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, actionOnClick = () => {}, caption: string = "", disableAfterClick = false) {
        super(scene, x, y);

        this.image = scene.add.image(0, 0, texture);
        this.setSize(this.image.width, this.image.height);

        this.text = scene.add.text(x, Constants.UI_height + 40, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setOrigin(0.5).setFontSize(30).setResolution(2).setStroke('#A3A3A3', 1);
        this.add(this.image);
        //this.add(this.text);
        scene.add.existing(this);



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
            this.image.scale = 1.05
            this.text.scale = 1.05
        })
        this.on('pointerdown', () => {
            this.image.scale = 0.95
            this.text.scale = 0.95
            this.image.tint
        })
        this.on('pointerup', () => {
            if(!this.clickedBtn || !disableAfterClick) {
                this.clickedBtn = true;
                actionOnClick();
            }
            this.image.scale = 1.05
            this.text.scale = 1.05
        })
        this.on('pointerout', () => {
            this.image.scale = 1
            this.text.scale = 1
        })
    }
}