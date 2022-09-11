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
        this.enemy_turn = scene.add.text(0, 80, "Opponent's turn", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setOrigin(0.4, 0.5).setFontSize(30).setResolution(2).setStroke('#A3A3A3', 1);
        this.player_turn = scene.add.text(0, 80, "Your turn", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setOrigin(0.4, 0.5).setFontSize(30).setResolution(2).setStroke('#A3A3A3', 1);
        this.img_player = scene.add.image(-80, 85, "witch_idle", 0).setOrigin(0.5);
        this.img_opponent = scene.add.image(-130, 77, "hellhound_idle", 0);



        this.add(this.level_x);
        this.add(this.level_type);
        this.add(this.enemy_turn);
        this.add(this.player_turn);
        this.add(this.img_player);
        this.add(this.img_opponent);
        scene.add.existing(this);

        this.setDepth(2)

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