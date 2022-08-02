import { Constants } from "../utils/Constants";
import Phaser from 'phaser';

export class Transition extends Phaser.GameObjects.Container {
    
    private text: Phaser.GameObjects.Text;
    private tail_img: Phaser.GameObjects.Image;
    private middle_img: Phaser.GameObjects.Image;
    private head_img: Phaser.GameObjects.Image;
    
    constructor(scene: Phaser.Scene, source_x: number, source_y: number, destination_x: number, destination_y: number, texture_tail: string, texture_middle: string, texture_head: string, caption: string = "", scale: number = 1.0) {
        super(scene, source_x, source_y);

        this.tail_img = scene.add.image(0, 0, texture_tail);
        this.middle_img = scene.add.image(0, 0, texture_middle);
        this.head_img = scene.add.image(0, 0, texture_head);
        
        /**
         * positioning math:
         * v_12 = v2 - v1                                           Richtungsvektor
         * c = v1 + 0.5 * v_12                                    Mittelpunkt zwischen vertices
         * total_len = |v_12| - 2r - padding                        Länge des Pfeils
         * x_len_middle = total_len - head_x_len_ - tail_x_len      Länge des Mittelstücks
        */
        let v_12 = new Phaser.Math.Vector2(destination_x - source_x, destination_y - source_y);
        let c = new Phaser.Math.Vector2(source_x, source_y).add(v_12.scale(0.5)); 
        let total_len = v_12.length();//TODO: - radius - Padding
        let scale_to_v12_distance = total_len /(this.tail_img.width + this.head_img.width + this.middle_img.width)+ 0.02;
        let arrow_angle = Phaser.Math.RadToDeg(v_12.angle());

        //position objects in container        
        this.middle_img.x = - total_len/2
        this.tail_img.x = (this.middle_img.x - (this.middle_img.width/2 + this.tail_img.width/2));
        this.head_img.x = (this.middle_img.x + (this.middle_img.width/2 + this.head_img.width/2));

        //let debug = scene.add.circle(c.x, c.y, 2, 0xFF2E63).setDepth(4);

        //add text
        this.text = scene.add.text(0, 0, caption, {fontFamily:'Monospace', color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(35 * scale).setDepth(5);
        this.text.x = Math.round(c.x + v_12.x*0.5);
        this.text.y = Math.round(c.y);

        //add arrow parts to container to make the coordinates dependent on the container coords
        this.add(this.tail_img);
        this.add(this.middle_img);
        this.add(this.head_img);
        //this.add(this.text);

        this.x = Math.round(c.x);
        this.y = Math.round(c.y);
        scene.add.existing(this);

        //scale and rotate container
        this.angle = arrow_angle;
        this.scale = scale_to_v12_distance * scale;
    
    }
}