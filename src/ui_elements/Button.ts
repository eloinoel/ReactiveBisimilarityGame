import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { Constants } from "../utils/Constants";

export class Button extends Phaser.GameObjects.Container {

    private outImage: Phaser.GameObjects.Image;
    private overImage: Phaser.GameObjects.Image;
    private downImage: Phaser.GameObjects.Image;
    
    private blinkingRectangle;

    text: Phaser.GameObjects.Text;


    constructor(scene: Phaser.Scene, x: number, y: number, outTexture: string, actionOnClick = () => {}, caption: string = "", overTexture?: string, downTexture?: string, showCaption = true) {
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

        this.text.setVisible(showCaption);


        this.add(this.outImage);
        this.add(this.overImage);
        this.add(this.downImage);
        this.add(this.text);
        //this.add(this.blinkingRectangle)

        this.overImage.setVisible(false);
        this.downImage.setVisible(false);


        scene.add.existing(this);

        this.setSize(this.outImage.width, this.outImage.height);
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.setDepth(1);
        this.setInteractive();
        this.setScale(0.5)//.setAlpha(1);

        
        //red blink animation
        this.blinkingRectangle = this.scene.add.graphics({
            /* x: this.overImage.x - this.overImage.width/2,
            y: this.overImage.y - this.overImage.height/2, */
        })
        .fillStyle(Constants.convertColorToNumber(Constants.COLORS_RED.c4), 1).fillRect(this.x - this.width*this.scale/2, this.y - this.height*this.scale/2, this.width*this.scale, this.height*this.scale).setDepth(10).setAlpha(0);
        
        let mask_img = this.scene.make.image({
            x: this.x,
            y: this.y,
            key: outTexture,
            scale: 0.5,
            add: false
        })
        let mask = new Phaser.Display.Masks.BitmapMask(this.scene, mask_img);
        this.blinkingRectangle.mask = mask

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

    redBlinking() {
        this.blinkingRectangle.alpha = 0
        this.scene.tweens.add({
            targets: this.blinkingRectangle,
            alpha: 0.8,
            ease: Phaser.Math.Easing.Quintic.InOut,
            duration: 160,
            repeat: 1,
            onComplete: () => {
                this.blinkingRectangle.alpha = 0
            }
        })
    }
}

export class LtsStateButton extends Button {
    
    constructor(scene: Phaser.Scene, x: number, y: number, actionOnClick = () => {}, caption: string, showCaption = true) {
        super(scene, x, y, "circle", actionOnClick, caption, "circle_over", "circle_down", showCaption);
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

    private stars: Phaser.GameObjects.Image[];
    private star_scale = 1;
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, actionOnClick = () => {}, caption: string = "", fontSize = 25) {
        super(scene, x, y);

        this.texture = scene.add.sprite(0, 0, texture, 0).setScale(1.5);
        this.clickTexture = scene.add.sprite(0, 0, texture, 1).setScale(1.5);
        this.stars = [];
    
        this.star_scale = 0.055
        this.stars[3] = scene.add.image(0, -fontSize -4, "star").setOrigin(1.4, 0.5).setVisible(false);
        this.stars[4] = scene.add.image(0, -fontSize -4, "star").setVisible(false);
        this.stars[5] = scene.add.image(0, -fontSize -4, "star").setOrigin(-0.4, 0.5).setVisible(false);
        this.stars[0] = scene.add.image(0, -fontSize -4, "star_empty").setOrigin(1.4, 0.5);
        this.stars[1] = scene.add.image(0, -fontSize -4, "star_empty");
        this.stars[2] = scene.add.image(0, -fontSize -4, "star_empty").setOrigin(-0.4, 0.5);
        for(let i = 0; i < this.stars.length; i++) {
            this.add(this.stars[i].setScale(this.star_scale))
        }


        this.text = scene.add.text(0, -2*fontSize - 3, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(fontSize);
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
            for(let i = 0; i < this.stars.length; i++) {
                this.stars[i].scale = this.star_scale + 0.0075;
            }
            //this.clickTexture.setTint(Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2));
            this.clickTexture.setVisible(false);
            this.text.scale = 1;
        })
        this.on('pointerdown', () => {
            this.texture.setVisible(false);
            this.clickTexture.setVisible(true);
            this.text.scale = 0.85;
            for(let i = 0; i < this.stars.length; i++) {
                this.stars[i].scale = this.star_scale - 0.004;
            }
        })
        this.on('pointerup', () => {
            this.texture.setVisible(true);
            this.clickTexture.setVisible(false);
            this.text.scale = 1;
            for(let i = 0; i < this.stars.length; i++) {
                this.stars[i].scale = this.star_scale + 0.0075;
            }
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
            for(let i = 0; i < this.stars.length; i++) {
                this.stars[i].scale = this.star_scale;
            }
        })
    }

    disable() {
        this.disableInteractive();
        this.texture.alpha = this.disableAlpha;
        this.clickTexture.alpha = this.disableAlpha;
        this.text.alpha = this.disableAlpha;
        for(let i = 0; i < this.stars.length; i++) {
            this.stars[i].setAlpha(this.disableAlpha);
        }
        return this;
    }

    enable() {
        this.setInteractive();
        this.texture.alpha = 1;
        this.clickTexture.alpha = 1;
        this.text.alpha = 1
        for(let i = 0; i < this.stars.length; i++) {
            this.stars[i].alpha = 1;
        }
        return this;
    }

    /**
     * set yellow stars
     * @param n 
     */
    setStars(n: number) {
        if(n >= 1 && n <= 3) {
            for(let i = 3; i < n+3; i++) {
                this.stars[i].setVisible(true);
            }
        } else {
            for(let i = 3; i < 6; i++) {
                this.stars[i].setVisible(false);
            }
        }
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
            this.image.scale = 1.1
            this.text.scale = 1.1
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
            this.image.scale = 1.1
            this.text.scale = 1.1
        })
        this.on('pointerout', () => {
            this.image.scale = 1
            this.text.scale = 1
        })
    }
}

export class Tick_Button extends Phaser.GameObjects.Container {

    private image: Phaser.GameObjects.Image;
    private background: RoundRectangle;
    scale_btn: number;  //reset parameter

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, actionOnClick = () => {}, bg_clr: string, border_clr = bg_clr, scale = 1) {
        super(scene, x, y);

        this.image = scene.add.image(0, 0, texture).setOrigin(0.5).setScale(0.8).setTintFill(Constants.convertColorToNumber(Constants.COLORPACK_1.white));
        this.setSize(this.image.width, this.image.height);

        this.scale_btn = 0.32 * scale;
        this.setScale(this.scale_btn)

        this.background = scene.add.existing(new RoundRectangle(scene, 0, 0, this.width, this.height, 150*this.scale_btn, Constants.convertColorToNumber(bg_clr)))
        if(bg_clr !== border_clr) {
            this.background.setStrokeStyle(4/this.scale_btn, Constants.convertColorToNumber(border_clr));
        }
        
        this.add(this.background)
        this.add(this.image);

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
            this.scale = this.scale_btn + 0.15*this.scale_btn
            this.background.setFillStyle(Constants.convertColorToNumber(bg_clr)).setAlpha(0.8)
        })
        this.on('pointerdown', () => {
            this.scale = this.scale_btn - 0.0075*this.scale_btn
            this.background.setFillStyle(Constants.convertColorToNumber(bg_clr)).setAlpha(0.6)
        })
        this.on('pointerup', () => {
            actionOnClick();
            this.scale = this.scale_btn + 0.15*this.scale_btn
            this.background.setFillStyle(Constants.convertColorToNumber(bg_clr)).setAlpha(0.8)
        })
        this.on('pointerout', () => {
            this.scale = this.scale_btn;
            this.background.setFillStyle(Constants.convertColorToNumber(bg_clr)).setAlpha(1)
        })
    }

}


