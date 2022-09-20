import { Vector } from "matter";
import { Constants } from "../utils/Constants";

export class Transition extends Phaser.GameObjects.Container {
    
    private text!: Phaser.GameObjects.Text;
    private icon!: Phaser.GameObjects.Image;

    private tail_img!: Phaser.GameObjects.Image;
    private middle_img!: Phaser.GameObjects.Image;
    private head_img!: Phaser.GameObjects.Image;
    private circle_img!: Phaser.GameObjects.Image;
    
    constructor(scene: Phaser.Scene, source_x: number, source_y: number, destination_x: number, destination_y: number, texture_tail: string, texture_middle: string, texture_head: string, caption: string = "", scale: number = 1.0, padding: number = 0) {
        super(scene, source_x, source_y);

        

        /**
             * positioning math:
             * v_12 = v2 - v1                                           Richtungsvektor
             * c = v1 + 0.5 * v_12                                    Mittelpunkt zwischen vertices
             * total_len = |v_12| - 2r - padding                        Länge des Pfeils
             * x_len_middle = total_len - head_x_len_ - tail_x_len      Länge des Mittelstücks
            */
        let v_12 = new Phaser.Math.Vector2(destination_x - source_x, destination_y - source_y);
        let c = new Phaser.Math.Vector2(source_x, source_y).add(v_12.clone().scale(0.5)); 
        let total_len = v_12.length() - padding;
        let arrow_angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Normalize(v_12.angle()))

        //circular arrow
        if(source_x === destination_x && source_y === destination_y) {
            this.circle_img = scene.add.image(-60, 0, "ui_replay_btn").setScale(0.45).setTint(Constants.convertColorToNumber(Constants.COLORPACK_1.blue)).setRotation(-0.5);
            this.add(this.circle_img);

            //fire
            if(caption === "a") {
                this.icon = this.scene.add.image(-100, 0, "fire_icon").setOrigin(0.5).setDepth(2).setScale(0.055);
                this.add(this.icon);
            //water
            } else if(caption === "b") {
                this.icon = this.scene.add.image(-100, 0, "water_icon").setOrigin(0.5).setDepth(2).setScale(0.05);
                this.add(this.icon);
            //plant
            } else if(caption === "c") {
                this.icon = this.scene.add.image(-100, 0, "leaf_icon").setOrigin(0.5).setDepth(2).setScale(0.05);
                this.add(this.icon);
            //TODO:
            } else if(caption === Constants.TIMEOUT_ACTION) {
                this.text = scene.add.text(-100, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
                this.add(this.text);
            } else if(caption === Constants.HIDDEN_ACTION) {
                this.text = scene.add.text(-100, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
                this.add(this.icon);
            } else {
                this.text = scene.add.text(-100, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
                this.add(this.icon);
            }
        
        //straight arrow
        } else {

            this.tail_img = scene.add.image(0, 0, texture_tail).setDepth(1);
            this.middle_img = scene.add.image(0, 0, texture_middle).setDepth(1);
            this.head_img = scene.add.image(0, 0, texture_head).setDepth(1);
            
            //lengths of parts after scaling the container
            let head_len = this.head_img.width * scale;
            let mid_len = this.middle_img.width * scale;
            let tail_len = this.tail_img.width * scale;


            if(total_len < head_len + tail_len) {   //not tested because not needed at the moment
                //only display head and tail and scale it down
                this.middle_img.setVisible(false);
                let target_head_len = total_len - tail_len;
                let target_tail_len = total_len - head_len;

                //scale factor
                let scale_head = target_head_len/head_len;
                this.head_img.scale = scale_head;
                let scale_tail = target_tail_len/tail_len;
                this.tail_img.scale = scale_tail;

                //translate
                this.head_img.x = 0 + target_head_len*this.head_img.scale/2;
                this.tail_img.x = 0 - target_tail_len*this.tail_img.scale/2;
            } else {
                //calculate scale_factor for the adaptive length of the middle_image
                let target_mid_len = (total_len - head_len - tail_len);
                let scale_factor = target_mid_len / mid_len;
                this.middle_img.scaleX = scale_factor;

                //position objects in container
                this.middle_img.x = 0 - this.head_img.width/2 + padding/5; //+ padding/5 to add a little more space at the beginning
                //translate in x-direction by target_mid_len/2, then revert scale of the container and finally translate by head_img_width to offset the origin
                this.head_img.x = this.middle_img.x + target_mid_len/(2*scale) + this.head_img.width/2;
                this.tail_img.x = this.middle_img.x - target_mid_len/(2*scale) - this.tail_img.width/2;

                /* 
                TODO: Delete DEBUG
                let debug = scene.add.circle(source_x, source_y, 2, 0xFF2E63).setDepth(4);
                let debug2 = scene.add.circle(destination_x, destination_y, 2, 0xFF2E63).setDepth(4); 
                let scale_head = head_len / total_len;
                let scale_tail = tail_len / total_len;
                let point = new Phaser.Math.Vector2(destination_x, destination_y).subtract(v_12.clone().scale(scale_head));
                let debug3 = scene.add.circle(point.x, point.y, 2, 0xFF2E63).setDepth(4); 
                let point2 = new Phaser.Math.Vector2(source_x, source_y).add(v_12.clone().scale(scale_tail));
                let debug4 = scene.add.circle(point2.x, point2.y, 2, 0xFF2E63).setDepth(4); 
                this.tail_img.setVisible(false);
                this.head_img.setVisible(false);
                this.middle_img.setVisible(false);
                this.middle_img.setTint(0x3CCF4E);
                */
            }
            /** caption */
            //calculate position in 90 degree angle to transition middle

            let caption_position;
            //position caption left of arrow
            if(arrow_angle >= 0 && arrow_angle < 90) {
                caption_position = c.clone().add(v_12.clone().rotate(Phaser.Math.DegToRad(270)).normalize().scale(25))
                caption_position.y = caption_position.y + v_12.clone().normalize().scale(10).y
                caption_position.x = caption_position.x + v_12.clone().scale(0.07).x
            //position caption right of arrow
            } else {
                caption_position = c.clone().add(v_12.clone().rotate(Phaser.Math.DegToRad(90)).normalize().scale(25))
                caption_position.y = caption_position.y + v_12.clone().scale(0.1).y
                caption_position.x = caption_position.x + v_12.clone().scale(0.05).x
            }

            //fire
            if(caption === "a") {
                this.icon = this.scene.add.image(caption_position.x, caption_position.y, "fire_icon").setOrigin(0.5).setDepth(2).setScale(0.055);
            //water
            } else if(caption === "b") {
                this.icon = this.scene.add.image(caption_position.x, caption_position.y, "water_icon").setOrigin(0.5).setDepth(2).setScale(0.05);
            //plant
            } else if(caption === "c") {
                this.icon = this.scene.add.image(caption_position.x, caption_position.y, "leaf_icon").setOrigin(0.5).setDepth(2).setScale(0.05);
            //TODO:
            } else if(caption === Constants.TIMEOUT_ACTION) {
                this.text = scene.add.text(0, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
                this.text.x = Math.round(c.x + v_12.x*scale);
                this.text.y = Math.round(c.y + v_12.y*scale*0.5);
            } else if(caption === Constants.HIDDEN_ACTION) {
                this.text = scene.add.text(0, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
                this.text.x = Math.round(c.x + v_12.x*scale);
                this.text.y = Math.round(c.y + v_12.y*scale*0.5);
            } else {
                this.text = scene.add.text(0, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
                this.text.x = Math.round(c.x + v_12.x*scale);
                this.text.y = Math.round(c.y + v_12.y*scale*0.5);
            }

            //add arrow parts to container to make the coordinates dependent on the container coords
            this.add(this.tail_img);
            this.add(this.middle_img);
            this.add(this.head_img);

            //scale and rotate container
            this.angle = arrow_angle;
            this.scale = scale;
        }

        //set container origin
        this.x = Math.round(c.x);
        this.y = Math.round(c.y);
        scene.add.existing(this);
        this.setDepth(1);
    }
}

export class FixedLengthTransition extends Phaser.GameObjects.Container {
    
    private text!: Phaser.GameObjects.Text;

    private arrow!: Phaser.GameObjects.Image;
    
    
    constructor(scene: Phaser.Scene, source_x: number, source_y: number, destination_x: number, destination_y: number, caption: string = "", scale: number = 1.0) {
        super(scene, source_x, source_y);

        

        /**
             * positioning math:
             * v_12 = v2 - v1                                           Richtungsvektor
             * c = v1 + 0.5 * v_12                                    Mittelpunkt zwischen vertices
             * total_len = |v_12| - 2r - padding                        Länge des Pfeils
             * x_len_middle = total_len - head_x_len_ - tail_x_len      Länge des Mittelstücks
            */
        let v_12 = new Phaser.Math.Vector2(destination_x - source_x, destination_y - source_y);
        let c = new Phaser.Math.Vector2(source_x, source_y).add(v_12.clone().scale(0.5)); 
        let total_len = v_12.length()
        let arrow_angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Normalize(v_12.angle()))

        //circular arrow
        if(source_x === destination_x && source_y === destination_y) {

            //fire
            if(caption === "a") {
                this.arrow = this.scene.add.image(0, 0, "fire_arrow").setOrigin(0.5).setDepth(2);
            //water
            } else if(caption === "b") {
                this.arrow = this.scene.add.image(0, 0, "water_arrow").setOrigin(0.5).setDepth(2);
            //plant
            } else if(caption === "c") {

            //TODO:
            } else if(caption === Constants.TIMEOUT_ACTION) {
                this.text = scene.add.text(-100, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
            } else if(caption === Constants.HIDDEN_ACTION) {
                this.text = scene.add.text(-100, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
            } else {
                this.text = scene.add.text(-100, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
            }
        } else {
            //fire
            if(caption === "a") {
                this.arrow = this.scene.add.image(0, 0, "fire_arrow").setOrigin(0.5).setDepth(0).setScale(0.15);
            //water
            } else if(caption === "b") {
                this.arrow = this.scene.add.image(0, 0, "water_arrow").setOrigin(0.5).setDepth(2).setScale(0.15);
            //plant 
            } else if(caption === "c") {
                this.arrow = this.scene.add.image(0, 0, "plant_arrow").setOrigin(0.5).setDepth(2).setScale(0.15);

            //TODO:
            } else if(caption === Constants.TIMEOUT_ACTION) {
                this.text = scene.add.text(-100, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
            } else if(caption === Constants.HIDDEN_ACTION) {
                this.text = scene.add.text(-100, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
            } else {
                this.text = scene.add.text(-100, 0, caption, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setOrigin(0.5).setFontSize(30 * scale * 5).setDepth(2);
            }
        }
    

        //add arrow parts to container to make the coordinates dependent on the container coords
        this.add(this.arrow);


        //scale and rotate container
        this.angle = arrow_angle;
        this.scale = scale;

        //set container origin
        this.x = Math.round(c.x);
        this.y = Math.round(c.y);
        scene.add.existing(this);
        this.setDepth(1);
    }
}