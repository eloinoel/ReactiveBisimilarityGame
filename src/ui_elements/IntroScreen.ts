import { RoundRectangle, Sizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import { Constants } from "../utils/Constants";

export class IntroScreen extends Phaser.GameObjects.Container {

    private coordinates: Phaser.Math.Vector2;
    private dimensions;

    private textStyle: Phaser.Types.GameObjects.Text.TextStyle;

    private sizer: Sizer;
    private grey_bg: Phaser.GameObjects.Rectangle;
    private referencesToDestroy: Phaser.GameObjects.GameObject[];

    /**
     * 
     * @param scene 
     * @param levelType 0: simulation, 1: bisimulation, 2: reactive bisimulation timeouts, 3: idling, 4: timeouted timeouts, 5:tau transitions
     */
    constructor(scene: Phaser.Scene, levelType: number) {
        super(scene, scene.renderer.width/2, scene.renderer.height/2);

        this.coordinates = new Phaser.Math.Vector2(scene.renderer.width/2, scene.renderer.height/2);
        switch(levelType) {
            case 0:
                this.dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/1.8, this.scene.renderer.height/3.5);
                break;
            case 1:
                this.dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/1.8, this.scene.renderer.height/3.5);
                break;
            case 2:
                this.dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/1.35, this.scene.renderer.height/2);
                break;
            case 3:
                this.dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/1.26, this.scene.renderer.height/2.2);
                break;
            default:
                this.dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/1.8, this.scene.renderer.height/2.3);
        }
        this.referencesToDestroy = []

        this.setSize(this.dimensions.x, this.dimensions.y);
        this.textStyle = {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white};
        

        this.grey_bg = this.scene.add.rectangle(this.scene.renderer.width/2, this.scene.renderer.height/2, this.scene.renderer.width + 1, this.scene.renderer.height + 1, 0x000000, 0.95).setOrigin(0.5).setDepth(7);
        this.grey_bg.setInteractive().on('pointerup', () => {
            this.destroyPopup()
        });
        this.sizer = this.createPanel(levelType);        
    }

    private createPanel(levelType: number): Sizer {

        let sizer = new Sizer(this.scene, {
            x: this.coordinates.x, 
            y: this.coordinates.y,
            width: this.dimensions.x,
            height: this.dimensions.y,
            orientation: 'y',
            space: {item: 50, top: 15, bottom: 5, left: 15, right: 15}
        })
        //debug
        sizer.addBackground(this.scene.add.existing(new RoundRectangle(this.scene, 0, 0, 2, 2, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c4)).setAlpha(0.0)))
        
        

        let atk_icon = this.scene.add.image(0, 0, "witch_icon").setOrigin(0.5).setScale(0.7);
        
        this.referencesToDestroy.push(atk_icon);
        
        //intro types
        switch(levelType) {
            //simulation
            case 0:
                sizer.add(this.scene.add.text(0, 0, "Simulation", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});

                let def_icon = this.scene.add.image(0, 0, "purple_wizard_icon", 0).setOrigin(0.5).setScale(0.7);
                sizer.add(new Sizer(this.scene, { orientation: 'x'})
                .add(this.scene.add.text(0, 0, "Make ", this.textStyle).setFontSize(26).setResolution(3))
                .add(def_icon)
                .add(this.scene.add.text(0, 0, " unable to copy your magic spells", this.textStyle).setFontSize(26).setResolution(3))
                , {align: 'center', });
                break;
            //symmetry move
            case 1:
                sizer.add(this.scene.add.text(0, 0, "Bisimulation", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});

                let atk_rule_symmetry = new Sizer(this.scene, { orientation: 'x'})
                .add(this.scene.add.text(0, 0, "Use ", this.textStyle).setFontSize(26).setResolution(3))
                .add(this.scene.add.image(0, 0, "ui_swap_btn", ).setOrigin(0.5).setScale(0.07))
                .add(this.scene.add.text(0, 0, " to swap sides", this.textStyle).setFontSize(26).setResolution(3))
                sizer.add(atk_rule_symmetry, {align: 'center'});
                break;
            //timeouts
            case 2:
                sizer.add(this.scene.add.text(0, 0, "Reactive Bisimulation", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});

                let atk_rule_timeout = new Sizer(this.scene, { orientation: 'x'})
                .add(this.scene.add.text(0, 0, "Cast ", this.textStyle).setFontSize(26).setResolution(2))
                .add(this.scene.add.image(0, 0, "timeout_arrow_icon", ).setOrigin(0.5).setScale(0.08))
                .add(this.scene.add.text(0, 0, " time magic spells", this.textStyle).setFontSize(26).setResolution(2))

                let timeout_cond1 = new Sizer(this.scene, {orientation: 'x'})
                .add(this.scene.add.text(0, 0, "• These are only possible when no other magic can be cast from the current state", this.textStyle).setFontSize(22).setResolution(2))
                let timeout_cond2 = new Sizer(this.scene, {orientation: 'x'})
                .add(this.scene.add.text(0, 0, "• You can disable other magic spells ", this.textStyle).setFontSize(22).setResolution(2))
                .add(this.scene.add.image(0, 0, "environment_panel", ).setOrigin(0.5).setScale(1))
                .add(this.scene.add.text(0, 0, " by selection, when using ", this.textStyle).setFontSize(22).setResolution(2))
                .add(this.scene.add.image(0, 0, "timeout_arrow_icon", ).setOrigin(0.5).setScale(0.08))

                let timeout_cond3 = new Sizer(this.scene, {orientation: 'x'})
                .add(this.scene.add.text(0, 0, "• The disabled spells will remain disabled until another spell is cast ", this.textStyle).setFontSize(22).setResolution(2))
                .add(this.scene.add.image(0, 0, "environment_panel_disabled", ).setOrigin(0.5).setScale(0.8))

                //if no basic magic spell is possible
                sizer.add(atk_rule_timeout, {align: 'center'});
                sizer.add(timeout_cond1, {align: 'center'})
                sizer.add(timeout_cond2, {align: 'center'})
                sizer.add(timeout_cond3, {align: 'center', padding: {top: -40}})
                break;
            case 3:
                sizer.add(this.scene.add.text(0, 0, "Reactive Bisimulation", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});

                let atk_rule_3 = new Sizer(this.scene, { orientation: 'x'})
                .add(this.scene.add.text(0, 0, "If no spell is possible ", this.textStyle).setFontSize(26).setResolution(2))
                .add(this.scene.add.image(0, 0, "environment_panel_no_spell_possible", ).setOrigin(0.5).setScale(0.8))
                .add(this.scene.add.text(0, 0, " after a time spell, ", this.textStyle).setFontSize(26).setResolution(2))

                let cond = new Sizer(this.scene, {orientation: 'x'})
                .add(this.scene.add.text(0, 0, "You can reset the restriction by casting any spell", this.textStyle).setFontSize(26).setResolution(2))

                sizer.add(atk_rule_3, {align: 'center', padding: {top: -20, bottom: -20}});
                sizer.add(cond, {align: 'center'})
                break;
            case 4:
                sizer.add(this.scene.add.text(0, 0, "Reactive Bisimulation", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});

                let atk_rule_4 = new Sizer(this.scene, { orientation: 'x'})
                .add(this.scene.add.text(0, 0, "Beware that consecutive time spells are only possible, ", this.textStyle).setFontSize(26).setResolution(2))

                let atk_rule_5 = new Sizer(this.scene, { orientation: 'x'})
                .add(this.scene.add.text(0, 0, "if no other magic is castable after the last time spell", this.textStyle).setFontSize(26).setResolution(2))

                //let atk_rule_6 = new Sizer(this.scene, { orientation: 'x'})
                //.add(this.scene.add.image(0, 0, "timeouted_timeouts", ).setOrigin(0.5).setScale(0.8))

                sizer.add(atk_rule_4, {align: 'center'});
                sizer.add(atk_rule_5, {align: 'center'});
                //sizer.add(atk_rule_6, {align: 'center'});
                break;
            case 5:
                sizer.add(this.scene.add.text(0, 0, "Reactive Bisimulation", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});

                let atk_rule_7 = new Sizer(this.scene, { orientation: 'x'})
                .add(this.scene.add.text(0, 0, "Cast ", this.textStyle).setFontSize(26).setResolution(2))
                .add(this.scene.add.image(0, 0, "tau_arrow_icon", ).setOrigin(0.5).setScale(0.08))
                .add(this.scene.add.text(0, 0, " portal magic spells", this.textStyle).setFontSize(26).setResolution(2))

                let atk_rule_8 = new Sizer(this.scene, { orientation: 'x'})
                .add(this.scene.add.text(0, 0, " to transfer time magic restrictions to the next state", this.textStyle).setFontSize(26).setResolution(2))

                sizer.add(atk_rule_7, {align: 'center'});
                sizer.add(atk_rule_8, {align: 'center'});
                break;
            default:
                sizer.add(this.scene.add.text(0, 0, "Unknown Gamemode :)", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});
        }
        
        /* Attacker Rules */





        //rules
/*         let atk_rule_normal = new Sizer(this.scene, { orientation: 'x'})
        .add(this.scene.add.text(0, 0, "    • Cast ", this.textStyle).setFontSize(22).setResolution(2))
        .add(this.scene.add.image(0, 0, "fire_arrow_icon", ).setOrigin(0.5).setScale(0.08))
        .add(this.scene.add.text(0, 0, ", ", this.textStyle).setFontSize(22).setResolution(2))
        .add(this.scene.add.image(0, 0, "water_arrow_icon", ).setOrigin(0.5).setScale(0.08))
        .add(this.scene.add.text(0, 0, " or ", this.textStyle).setFontSize(22).setResolution(2))
        .add(this.scene.add.image(0, 0, "plant_arrow_icon", ).setOrigin(0.5).setScale(0.08))
        .add(this.scene.add.text(0, 0, " basic magic spells ", this.textStyle).setFontSize(22).setResolution(2).setFontStyle('bold')) */
        

        sizer.add(this.scene.add.text(0, 0, "< Click to continue >", this.textStyle).setFontSize(20).setResolution(2))

        sizer.setDepth(8)
        sizer.layout();

        return sizer;
    }

    destroyPopup() {
        if(this !== undefined) {
            for(let i = 0; i < this.referencesToDestroy.length; i++) {
                this.referencesToDestroy[i].destroy()
            }
            this.sizer.destroy();
            this.grey_bg.destroy();
            this.destroy();
        }
    }
}
