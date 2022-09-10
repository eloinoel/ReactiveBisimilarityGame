export class LevelDescription extends Phaser.GameObjects.Container {

    private img_player: Phaser.GameObjects.Image;
    private img_opponent: Phaser.GameObjects.Image;

    text: Phaser.GameObjects.Text;


    constructor(scene: Phaser.Scene, x: number, y: number, ) {
        super(scene, x, y);
    }
}