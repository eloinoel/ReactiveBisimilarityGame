import { Constants } from "../utils/Constants";
export class LevelDescription extends Phaser.GameObjects.Container {

    private img_player: Phaser.GameObjects.Image;
    private img_opponent: Phaser.GameObjects.Image;

    level_x: Phaser.GameObjects.Text;
    level_type: Phaser.GameObjects.Text;
    enemy_turn: Phaser.GameObjects.Text;
    player_turn: Phaser.GameObjects.Text;


    constructor(scene: Phaser.Scene, x: number, y: number, level: string, level_type: string, attacker_turn: boolean = true) {
        super(scene, x, y);

        this.level_x = scene.add.text(0, 0, "Level " + level, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setOrigin(0.5).setFontSize(25).setResolution(2).setStroke('#A3A3A3', 1);
        this.level_type = scene.add.text(0, 40, level_type, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white, fontStyle: 'bold'}).setOrigin(0.5).setFontSize(33).setResolution(2).setStroke('#A3A3A3', 1);
        this.enemy_turn = scene.add.text(0, 85, "Opponent's turn", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setOrigin(0.4, 0.5).setFontSize(30).setResolution(2).setStroke('#A3A3A3', 1);
        this.player_turn = scene.add.text(0, 85, "Your turn", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setOrigin(0.4, 0.5).setFontSize(30).setResolution(2).setStroke('#A3A3A3', 1);
        this.img_player = scene.add.image(this.player_turn.x - 90, this.player_turn.y + 10, "witch_idle", 0).setOrigin(0.5);
        this.img_opponent = scene.add.image(this.enemy_turn.x - 135, this.enemy_turn.y - 40, "purple_wizard", 0).setFlipX(true).setScale(1);

        //masks
        const shape0 = this.scene.make.graphics({
            x: this.x + this.img_player.x,
            y: this.y + this.player_turn.y,
            add: false,
        });
        shape0.fillStyle(0xffffff);
        shape0.arc(0, 0, 20, 0, Math.PI*2);
        shape0.fillPath().setDepth(6);

        let mask = shape0.createGeometryMask();
        this.img_player.mask = mask;

        const shape1 = this.scene.make.graphics({
            x: this.x + this.img_opponent.x + 1,
            y: this.y + this.enemy_turn.y,
            add: false,
        });
        shape1.fillStyle(0xffffff);
        shape1.arc(0, 0, 20, 0, Math.PI*2);
        shape1.fillPath().setDepth(6);

        let mask1 = shape1.createGeometryMask();
        this.img_opponent.mask = mask1;

        //add to container
        this.add(this.level_x);
        this.add(this.level_type);
        this.add(this.enemy_turn);
        this.add(this.player_turn);
        this.add(this.img_player);
        this.add(this.img_opponent);
        scene.add.existing(this);

        this.setDepth(2)

        //this.setTurn(attacker_turn);
        this.setTurn(attacker_turn);
    }

    setTurn(attacker_turn = true) {
        if(attacker_turn) {
            this.img_opponent.setVisible(false);
            this.enemy_turn.setVisible(false);
            this.img_player.setVisible(true);
            this.player_turn.setVisible(true);
        } else {
            this.img_opponent.setVisible(true);
            this.enemy_turn.setVisible(true);
            this.img_player.setVisible(false);
            this.player_turn.setVisible(false);
        }
    }
}