export class Button extends Phaser.GameObjects.Sprite {

     constructor(scene: Phaser.Scene, x: number, y: number, texture: string, actionOnClick = () => {}, outFrame: string, overFrame: string, downFrame: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.setFrame(outFrame).setInteractive();

        /** make image buttons interactive
         * PointerEvents:
         *    pointerover - hovering
         *    pointerout - not hovering
         *    pointerup - click and release
         *    pointerdown - just click
         */
        this.on('pointerover', () => {
            this.setFrame(overFrame);
        })
        this.on('pointerdown', () => {
            this.setFrame(downFrame);
        })
        this.on('pointerup', () => {
            this.setFrame(overFrame);
            actionOnClick();
        })
        this.on('pointerout', () => {
            this.setFrame(outFrame);
        })
    }
}