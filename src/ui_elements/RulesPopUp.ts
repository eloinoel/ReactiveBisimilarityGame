import { RoundRectangle, Sizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import Level1_1 from "../scenes/SimulationLevels/Level1_1";
import { Constants } from "../utils/Constants";

export class RulesPopUp extends Phaser.GameObjects.Container {

    private coordinates: Phaser.Math.Vector2;
    private dimensions;

    private textStyle: Phaser.Types.GameObjects.Text.TextStyle;

    private sizer: Sizer;
    private exit_btn!: ExitButton;
    private grey_bg: Phaser.GameObjects.Rectangle;

    /**
     * 
     * @param scene 
     * @param levelType 0: simulation, 1: bisimulation, 2: reactive bisimulation, 3: reactive bisimulation with hidden transitions
     */
    constructor(scene: Phaser.Scene, levelType: number) {
        super(scene, scene.renderer.width/2, scene.renderer.height/2);

        this.coordinates = new Phaser.Math.Vector2(scene.renderer.width/2, scene.renderer.height/2);
        switch(levelType) {
            case 0:
                this.dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/1.8, this.scene.renderer.height/2.3);
                break;
            case 1:
                this.dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/1.8, this.scene.renderer.height/2.1);
                break;
            case 2:
                this.dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/1.1, this.scene.renderer.height/1.38);
                break;
            case 3:
                this.dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/1.1, this.scene.renderer.height/1.19);
                this.coordinates = new Phaser.Math.Vector2(scene.renderer.width/2, scene.renderer.height/2 + 35);
                break;
            default:
                this.dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/1.8, this.scene.renderer.height/2.3);
        }

        this.setSize(this.dimensions.x, this.dimensions.y);
        this.textStyle = {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.black};
        

        this.grey_bg = this.scene.add.rectangle(this.scene.renderer.width/2, this.scene.renderer.height/2, this.scene.renderer.width + 1, this.scene.renderer.height + 1, 0x000000, 0.4).setOrigin(0.5).setDepth(7).setInteractive();
        this.sizer = this.createPanel(levelType);



        
        //add close Button
        this.exit_btn = new ExitButton(this.scene, this.coordinates.x + this.dimensions.x/2 -22, this.coordinates.y - this.dimensions.y/2 + 22, () => {
            this.fadeOut(() => {
                this.destroyPopup()
                scene.input.removeListener('pointerup', undefined, this);
            })
        }, this.textStyle);

        this.fadeIn()
        
        //can also close by clicking anywhere on screen
        this.scene.time.delayedCall(100, () => {
            let listener = this.scene.input.addListener('pointerup', () => {
                this.fadeOut(() => {
                    this.destroyPopup()
                    scene.input.removeListener('pointerup', undefined, this);
                })
            }, this)
        })
        
    }

    private createPanel(levelType: number): Sizer {

        let sizer = new Sizer(this.scene, {
            x: this.coordinates.x, 
            y: this.coordinates.y,
            width: this.dimensions.x,
            height: this.dimensions.y,
            orientation: 'y',
            space: {item: 5, top: 15, bottom: 5, left: 15, right: 15}
        })
        sizer.addBackground(this.scene.add.existing(new RoundRectangle(this.scene, 0, 0, 2, 2, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c4))));
        
        //title
        switch(levelType) {
            case 0:
                sizer.add(this.scene.add.text(0, 0, "Simulation Rules", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});
                break;
            case 1:
                sizer.add(this.scene.add.text(0, 0, "Bisimulation Rules", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});
                break;
            case 2:
            case 3:
                sizer.add(this.scene.add.text(0, 0, "Reactive Bisimulation Rules", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});
                break;
            default:
                sizer.add(this.scene.add.text(0, 0, "Unknown Gamemode Rules :)", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});
        }
        sizer.add(this.scene.add.text(0, 0, "Goal: Make the defender unable to simulate your spells", this.textStyle).setFontSize(22).setResolution(2), {padding: {top: 10, bottom: 10}})
        
        /* Attacker Rules */
        let atk_icon = this.scene.add.image(0, 0, "witch_icon").setOrigin(0.5).setScale(0.7);

        sizer.add(new Sizer(this.scene, { orientation: 'x'})
        .add(atk_icon, {padding: {right: 5}})
        .add(this.scene.add.text(0, 0, "Attacker Rules:", this.textStyle).setFontSize(26).setResolution(2).setFontStyle('bold'))
        , {align: 'left'});

        //rules
        let atk_rule_normal = new Sizer(this.scene, { orientation: 'x'})
        .add(this.scene.add.text(0, 0, "    • Cast ", this.textStyle).setFontSize(22).setResolution(2))
        .add(this.scene.add.image(0, 0, "fire_arrow_icon", ).setOrigin(0.5).setScale(0.08))
        .add(this.scene.add.text(0, 0, ", ", this.textStyle).setFontSize(22).setResolution(2))
        .add(this.scene.add.image(0, 0, "water_arrow_icon", ).setOrigin(0.5).setScale(0.08))
        .add(this.scene.add.text(0, 0, " or ", this.textStyle).setFontSize(22).setResolution(2))
        .add(this.scene.add.image(0, 0, "plant_arrow_icon", ).setOrigin(0.5).setScale(0.08))
        .add(this.scene.add.text(0, 0, " basic magic spells ", this.textStyle).setFontSize(22).setResolution(2).setFontStyle('bold'))
        
        sizer.add(atk_rule_normal, {align: 'left'});

        //symmetry swap
        if(levelType >= 1) {
            let atk_rule_symmetry = new Sizer(this.scene, { orientation: 'x'})
            .add(this.scene.add.text(0, 0, "    • Use ", this.textStyle).setFontSize(22).setResolution(2))
            .add(this.scene.add.image(0, 0, "ui_swap_btn", ).setOrigin(0.5).setScale(0.07))
            .add(this.scene.add.text(0, 0, " to swap sides", this.textStyle).setFontSize(22).setResolution(2))

            sizer.add(atk_rule_symmetry, {align: 'left'});
        }

        //timeout
        if(levelType >= 2) {
            let atk_rule_timeout = new Sizer(this.scene, { orientation: 'x'})
            .add(this.scene.add.text(0, 0, "    • Cast ", this.textStyle).setFontSize(22).setResolution(2))
            .add(this.scene.add.image(0, 0, "timeout_arrow_icon", ).setOrigin(0.5).setScale(0.08))
            .add(this.scene.add.text(0, 0, " time magic spell", this.textStyle).setFontSize(22).setResolution(2).setFontStyle('bold'))

            let timeout_cond1 = new Sizer(this.scene, {orientation: 'x'})
            .add(this.scene.add.text(0, 0, "        • condition: Disable all basic spells that are possible in the current state", this.textStyle).setFontSize(20).setResolution(2))
            let timeout_cond1_2 = new Sizer(this.scene, {orientation: 'x'})
            .add(this.scene.add.text(0, 0, "                     AND if consecutive ", this.textStyle).setFontSize(20).setResolution(2).setFontStyle('bold'))
            .add(this.scene.add.image(0, 0, "timeout_arrow_icon", ).setOrigin(0.5).setScale(0.08))
            .add(this.scene.add.text(0, 0, " spells:", this.textStyle).setFontSize(20).setResolution(2).setFontStyle('bold'))

            let timeout_cond1_3 = new Sizer(this.scene, {orientation: 'x'})
            .add(this.scene.add.text(0, 0, "                     - no basic spells allowed in current state from the previous ", this.textStyle).setFontSize(20).setResolution(2))
            .add(this.scene.add.image(0, 0, "timeout_arrow_icon", ).setOrigin(0.5).setScale(0.08))
            .add(this.scene.add.text(0, 0, " restriction", this.textStyle).setFontSize(20).setResolution(2))
            

            let timeout_cond2 = new Sizer(this.scene, {orientation: 'x'})
            .add(this.scene.add.text(0, 0, "        • consequence: disabled basic spells ", this.textStyle).setFontSize(20).setResolution(2))
            .add(this.scene.add.text(0, 0, "won't be allowed immediately after ", this.textStyle).setFontSize(20).setResolution(2).setFontStyle('bold'))
            .add(this.scene.add.text(0, 0, "this spell,", this.textStyle).setFontSize(20).setResolution(2))

            let timeout_cond3 = new Sizer(this.scene, {orientation: 'x'})
            .add(this.scene.add.text(0, 0, "                       unless", this.textStyle).setFontSize(20).setResolution(2).setFontStyle('bold'))
            .add(this.scene.add.text(0, 0, " if no available basic spell is allowed in the next state, ", this.textStyle).setFontSize(20).setResolution(2))
            
            let timeout_cond4 = new Sizer(this.scene, {orientation: 'x'})
            .add(this.scene.add.text(0, 0, "                       any basic spell can be performed", this.textStyle).setFontSize(20).setResolution(2))
            //.add(this.scene.add.text(0, 0, "(idling)", this.textStyle).setFontSize(20).setResolution(2).setFontStyle('italic'))

            //if no basic magic spell is possible
            sizer.add(atk_rule_timeout, {align: 'left'});
            sizer.add(timeout_cond1, {align: 'left', padding: {top: 5}})
            sizer.add(timeout_cond1_2, {align: 'left'})
            sizer.add(timeout_cond1_3, {align: 'left'})
            sizer.add(timeout_cond2, {align: 'left'})
            sizer.add(timeout_cond3, {align: 'left'})
            sizer.add(timeout_cond4, {align: 'left'})
        }

        //hidden action
        if(levelType >= 3) {
            let atk_rule_tau = new Sizer(this.scene, { orientation: 'x'})
            .add(this.scene.add.text(0, 0, "    • Cast ", this.textStyle).setFontSize(22).setResolution(2))
            .add(this.scene.add.image(0, 0, "tau_arrow_icon", ).setOrigin(0.5).setScale(0.08))
            .add(this.scene.add.text(0, 0, " portal magic spell", this.textStyle).setFontSize(22).setResolution(2).setFontStyle('bold'))

            let timeout_cond1 = new Sizer(this.scene, {orientation: 'x'})
            .add(this.scene.add.text(0, 0, "        • basic spell that cannot be disabled", this.textStyle).setFontSize(20).setResolution(2))
            let timeout_cond2 = new Sizer(this.scene, {orientation: 'x'})
            .add(this.scene.add.text(0, 0, "        • transfers ", this.textStyle).setFontSize(20).setResolution(2).setFontStyle('bold'))
            .add(this.scene.add.text(0, 0, "disabled-spell-properties from previous time magic to the next state", this.textStyle).setFontSize(20).setResolution(2))

            sizer.add(atk_rule_tau, {align: 'left', padding: {top: 5}});
            sizer.add(timeout_cond1, {align: 'left', padding: {top: 5}})
            sizer.add(timeout_cond2, {align: 'left'})
        }

        /* Defender Rules */
        let def_icon = this.scene.add.image(0, 0, "purple_wizard_icon", 0).setOrigin(0.5).setScale(0.7);
        sizer.add(new Sizer(this.scene, { orientation: 'x'})
        .add(def_icon, {padding: {right: 5}})
        .add(this.scene.add.text(0, 0, "Defender Rules:", this.textStyle).setFontSize(26).setResolution(2).setFontStyle('bold'))
        , {align: 'left', padding: {top: 10}});

        //rules
        sizer.add(new Sizer(this.scene, { orientation: 'x'})
        .add(this.scene.add.text(0, 0, "    • Simulates ", this.textStyle).setFontSize(22).setResolution(2))
        .add(this.scene.add.text(0, 0, "magic spells ", this.textStyle).setFontSize(22).setResolution(2).setFontStyle('italic'))
        .add(this.scene.add.text(0, 0, "of the attacker", this.textStyle).setFontSize(22).setResolution(2))
        , {align: 'left'});

        //sizer.add(this.scene.add.text(0, 0, "< Click anywhere to close this window >", this.textStyle).setFontSize(16).setResolution(2), {padding: {top: 50}})

        sizer.setDepth(8)
        sizer.layout();

        return sizer;
    }

    destroyPopup() {
        if(this !== undefined) {
            this.exit_btn.destroyButton();
            this.sizer.destroy();
            this.grey_bg.destroy();
            this.destroy();
        }
    }

    fadeOut(fn = () => {}) {
        
        //tweens
        this.grey_bg.alpha = 1;
        this.sizer.alpha = 1;
        this.exit_btn.alpha = 1;

        let a = this.scene.tweens.add({
            targets: this.grey_bg,
            duration: 250,
            alpha: 0,
        })

        let c = this.scene.tweens.add({
            targets: this.exit_btn,
            duration: 250,
            alpha: 0,
        })

        let b = this.scene.tweens.add({
            targets: this.sizer,
            duration: 250,
            alpha: 0,
            onComplete: () => {fn()}
        })
    }

    fadeIn() {
        //tweens
        this.grey_bg.alpha = 0;
        this.sizer.alpha = 0;
        this.exit_btn.alpha = 0;

        let a = this.scene.tweens.add({
            targets: this.grey_bg,
            duration: 250,
            alpha: 1,
        })

        let c = this.scene.tweens.add({
            targets: this.exit_btn,
            duration: 250,
            alpha: 1,
        })

        let b = this.scene.tweens.add({
            targets: this.sizer,
            duration: 250,
            alpha: 1,
        })
    }
}

export class ExitButton extends Phaser.GameObjects.Container {

    private background: Phaser.GameObjects.Arc;
    private icon: Phaser.GameObjects.Image;
    private dimensions = new Phaser.Math.Vector2(50, 50);
    private default_scale = 0.8;

    constructor(scene: Phaser.Scene, x: number, y: number, actionOnClick = () => {}, textStyle: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y);
        let bg_clr = Constants.COLORS_BLUE_LIGHT.c3;


        this.setSize(this.dimensions.x, this.dimensions.y);
        this.icon = scene.add.image(0, 0, "ui_cross_btn").setScale(0.25).setTint(Constants.convertColorToNumber(Constants.COLORPACK_FINAL.white))
        this.background = scene.add.circle(0, 0, 20, Constants.convertColorToNumber(bg_clr)).setOrigin(0.5).setAlpha(1);
        
        
        //this.background.setStrokeStyle(4, Constants.convertColorToNumber(bg_clr));


        this.add(this.background)
        this.add(this.icon);


        scene.add.existing(this);

        this.setDepth(9).setScale(this.default_scale);
        this.setInteractive();

        /** make image button interactive
         * PointerEvents:
         *    pointerover - hovering
         *    pointerout - not hovering
         *    pointerup - click and release
         *    pointerdown - just click
         */
        this.on('pointerover', () => {
            this.scale = this.default_scale
            this.background.fillColor = Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2)
        })
        this.on('pointerdown', () => {
            this.scale = this.default_scale -0.1
            
        })
        this.on('pointerup', () => {
            actionOnClick();
            scene.input.removeListener('pointerup', undefined, "popUpListener");
            this.scale = this.default_scale
            this.background.fillColor = Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2)
        })
        this.on('pointerout', () => {
            this.scale = this.default_scale
            this.background.fillColor = Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c3)
        })
    }

    destroyButton() {
        //this.background.destroy();
        this.destroy();
    }
}