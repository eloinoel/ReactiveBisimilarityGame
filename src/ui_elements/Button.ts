import { Constants } from "../utils/Constants";

export class Button extends Phaser.GameObjects.Container {

    private outImage: Phaser.GameObjects.Image;
    private overImage: Phaser.GameObjects.Image;
    private downImage: Phaser.GameObjects.Image;

    text: Phaser.GameObjects.Text;


    constructor(scene: Phaser.Scene, x: number, y: number, outTexture: string, actionOnClick = () => {}, caption: string, overTexture?: string, downTexture?: string) {
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
        this.text = scene.add.text(0, 0, caption, {fontFamily:'Monospace', color: Constants.COLORPACK_1.black, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(45);
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