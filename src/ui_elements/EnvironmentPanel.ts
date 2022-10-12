import { Constants } from "../utils/Constants";
import { FixWidthSizer, RoundRectangle, Label} from 'phaser3-rex-plugins/templates/ui/ui-components';
import { SetOps } from "../utils/SetOps";
import { ReactiveBisimilarityGame } from "../utils/ReactiveBisimilarityGameController";
import { Tick_Button } from "./Button";
import { PhaserGameController } from "../utils/PhaserGameController";
import { Time, Tweens } from "phaser";

export class EnvironmentPanel extends Phaser.GameObjects.Container {

    private coordinates: Phaser.Math.Vector2;
    private dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/10 - 20, 50)

    private panel_buttons: Map<Phaser.GameObjects.GameObject, boolean>;
    private sizer!: FixWidthSizer;
    private tickButton!: Phaser.GameObjects.Container;
    private caption;
    private possibleActions;
    private curEnvironment;
    private game;
    private phaserGameController: PhaserGameController;
    private sizer_bg!: RoundRectangle;

    private blinkingRectangle!: RoundRectangle;
    private displayCaption: boolean;

    private enabled = true;
    private activated = true;
    private disabledAlpha = 0.4;
    private current_alpha = 1;
    private inFadeTween = false;
    private tweenList: Tweens.Tween[];


    constructor(scene: Phaser.Scene, x: number, y: number, game: ReactiveBisimilarityGame, phaser_game: PhaserGameController, display_caption = true, scale = 1) {
        super(scene, x, y);

        this.coordinates = new Phaser.Math.Vector2(x, y);
        this.tweenList = []

        this.panel_buttons = new Map();
        this.game = game;
        this.phaserGameController = phaser_game;
        this.possibleActions = SetOps.toArray(this.game.lts.getVisibleActions()).sort();
        this.curEnvironment = game.getEnvironment();

        this.scale = scale;
        this.dimensions = this.dimensions.scale(scale)

        this.createPanel();

        this.displayCaption = display_caption;
        this.caption = scene.add.image(0, - this.dimensions.y + 4 , "sand_clock").setOrigin(0.5).setScale(0.15)
        this.add(this.caption);
        if(!display_caption) {
            this.caption.setVisible(false);
        }

        scene.add.existing(this);
        this.setDepth(1);
    }

    /**
     * enable all buttons to be clickable
    */ 
    enable() {
        this.enabled = true;
        this.sizer.setInteractive();
        //this.sizer_bg.setStrokeStyle(3, Constants.convertColorToNumber("#00C59C"));
        let list = this.sizer.getAllChildren()
        this.caption.setAlpha(1)
        for(let i = 0; i < list.length; i++) {
            (list[i] as Label).setAlpha(1)
            if(list[i] instanceof Label) {
                list[i].setInteractive();
            }
        }
        this.tickButton.setVisible(true);
        return this;
    }

    /**
     * disable all buttons to not be clickable
     */
    disable() {
        this.enabled = false;

        this.sizer.disableInteractive();
        this.sizer_bg.setStrokeStyle();
        let list = this.sizer.getAllChildren()
        this.caption.setAlpha(0.9)
        for(let i = 0; i < list.length; i++) {
            (list[i] as Label).setAlpha(this.disabledAlpha)
            //icons
            if(list[i] instanceof Phaser.GameObjects.Image) {
                (list[i] as Label).setAlpha(0.9)
            }

            if(list[i] instanceof Label) {
                list[i].disableInteractive();
            }
        }
        this.tickButton.setVisible(false);
        return this;
    }

    /**
     * make visible and clickable in scene
     * @returns 
     */
    makeVisible() {
        this.activated = true;
        if(this.displayCaption) {
            this.caption.setVisible(true);
        }
        this.sizer.setVisible(true);
        this.tickButton.setVisible(true);
        return this;
    }

    setPanelPosition(new_pos: Phaser.Math.Vector2) {
        this.coordinates = new_pos;
        this.updatePanel();
    }

    /**
     * not visible or clickable in scene
     * @returns 
     */
    makeInvisible() {
        this.activated = false;
        this.caption.setVisible(false);
        this.sizer.setVisible(false);
        this.tickButton.setVisible(false);
        return this;
    }

    isEnabled() {
        return this.enabled;
    }

    /**
     * currently visibly active actions in the gui
     * @returns 
     */
    getActiveActions(): string[] {
        let tmp: string[] = [];
        this.panel_buttons.forEach((value, key) => {
            if(value) {
                tmp.push(((key as Label).getElement('text') as Phaser.GameObjects.Text).text);
            }
        })
        return tmp;
    }

    /**
     * updates visual representation according to current environment
     */
    updatePanel() {
        this.curEnvironment = this.game.getEnvironment();
        this.possibleActions = SetOps.toArray(this.game.lts.getVisibleActions()).sort();
        //create a a new instance and asign it
        this.destroyPanel();
        this.createPanel();
    }

    redBlinking() {
        //this.blinkingRectangle.setVisible(true)
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

    getPanelPosition() {
        return this.coordinates.clone()
    }

    /**
     * warning: do not use this without fully understanding this class
     * deletes the entire visual representation and clears up data structures
     * should be followed by another create() call
     */
    private destroyPanel() {
        let list = this.sizer.getAllChildren()
        for(let i = 0; i < list.length; i++) {
            (list[i] as Label).destroy(false);
        }
        this.blinkingRectangle.destroy()
        this.sizer.destroy(false);
        this.panel_buttons.clear();
        this.tickButton.destroy()
    }
    
    swooshAnimation(destination: Phaser.Math.Vector2) {

        //position
        let tw0 = this.scene.tweens.add({
            targets: this.coordinates,
            x: destination.x,
            y: destination.y,
            duration: 800,

        })

        //fade out
        this.inFadeTween = true
        let tw1 = this.scene.tweens.add({
            targets: this.sizer,
            alpha: 0,
            ease: Phaser.Math.Easing.Cubic.InOut,
            duration: 800, 
            onUpdate: (tween) => { this.updatePanel(); this.current_alpha = tween.getValue()},
            onComplete: () => {this.makeInvisible(); this.inFadeTween = false;}
        })

        this.tweenList.push(tw0);
        this.tweenList.push(tw1);
    }

    stopAllTweens() {
        for(let i = 0; i < this.tweenList.length; i++) {
            this.tweenList[i].complete()
        }
    }

    private createPanel() {

        let width = this.dimensions.x
        for(let i = 2; i < this.possibleActions.length; i++) {
            width += 50 * this.scale;
        }

        this.tickButton = new Tick_Button(this.scene, this.coordinates.x + width/2 + 30*this.scale, this.coordinates.y, "ui_tick_btn", () => {
            let tmp = this.getActiveActions();
            this.phaserGameController.resetEnvironmentSelectionHighlighting();
            let result = this.phaserGameController.setEnvironmentAndDoTimeout(new Set(tmp));

        }, Constants.COLORS_BLUE_LIGHT.c3, undefined, this.scale);
        this.tickButton.setDepth(6)

        this.sizer = new FixWidthSizer(this.scene, {
            x: this.coordinates.x, y: this.coordinates.y,
            width: width,
            height: this.dimensions.y,
            align: "center",
            space: { item: 7 * this.scale, top: 7* this.scale, bottom: 7 * this.scale },
        }).setDepth(6)

        this.blinkingRectangle = this.scene.add.existing(new RoundRectangle(this.scene, this.coordinates.x, this.coordinates.y, width, this.dimensions.y + 4, 10*this.scale, Constants.COLOR_BORDEAUX)).setDepth(7).setAlpha(0);

        this.sizer.addBackground(this.scene.add.existing(this.sizer_bg = new RoundRectangle(this.scene, 0, 0, 2*this.scale, 2 *this.scale, 10*this.scale, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c4)).setDepth(6)));

        for (var i = 0; i < this.possibleActions.length; i++) {
            let icon;
            let label: Label;
            let label_bg = this.curEnvironment.has(this.possibleActions[i])? this.scene.add.existing(new RoundRectangle(this.scene, 0, 0, 0, 0, 14 * this.scale, Constants.convertColorToNumber(Constants.COLORS_GREEN.c1)).setStrokeStyle(4, Constants.convertColorToNumber(Constants.COLORS_GREEN.c3) ).setDepth(6))
            : this.scene.add.existing(new RoundRectangle(this.scene, 0, 0, 0, 0, 14 * this.scale, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c1)).setDepth(6));

            if(this.possibleActions[i] === "a" || this.possibleActions[i] === "b" || this.possibleActions[i] === "c") {
                if(this.possibleActions[i] === "a") {
                    icon = this.scene.add.image(0, 0,"fire_icon").setScale(0.057 * this.scale).setDepth(6);
                } else if(this.possibleActions[i] === "b") {
                    icon = this.scene.add.image(0, 0, "water_icon").setScale(0.05* this.scale).setDepth(6);
                } else if(this.possibleActions[i] === "c") {
                    icon = this.scene.add.image(0, 0, "leaf_icon").setScale(0.05 * this.scale).setDepth(6);
                }
                this.scene.add.existing(label = new Label(this.scene, {
                    width: 40 * this.scale, height: 40 * this.scale,
                    background: label_bg,
                    icon: icon,
                    text: this.scene.add.text(0, 0, this.possibleActions[i], {fontFamily: Constants.textStyle, fontStyle: 'bold'}).setFontSize(22).setResolution(2).setVisible(false).setSize(0, 0),
                    space: {
                        left: 5 * this.scale,
                        right: 5 * this.scale,
                        top: 5* this.scale,
                        bottom: 5 * this.scale,
                    },
                    align: 'center'
                }).setDepth(6))
            } else {
                this.scene.add.existing(label = new Label(this.scene, {
                    width: 40 * this.scale, height: 40 *this.scale,
                    background: label_bg,
                    text: this.scene.add.text(0, 0, this.possibleActions[i], {fontFamily: Constants.textStyle, fontStyle: 'bold'}).setFontSize(22).setResolution(2),
                    space: {
                        left: 5 * this.scale,
                        right: 5 * this.scale,
                        top: 5* this.scale,
                        bottom: 5 * this.scale,
                    },
                    align: 'center'
                }).setDepth(6))
            }
            this.sizer.add(label);
            this.panel_buttons.set(label, this.curEnvironment.has(this.possibleActions[i]) ? true : false);
        }

        let children = this.sizer.getAllChildren();
        for(let k = 0; k < children.length; k++) {
            let child = children[k];
            if(child instanceof Label) {
                child.setInteractive()
                child.on('pointerover', () => {
                    if(this.panel_buttons.get(child)) {
                        ((child as Label).getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_GREEN.c2)).setAlpha(1);
                    //toggled off
                    } else {
                        ((child as Label).getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2)).setAlpha(0.5);
                    }
                });
                
                child.on('pointerup', () => {
                    //toggle on or off
                    this.panel_buttons.set(child, this.panel_buttons.get(child) === undefined? true : !this.panel_buttons.get(child))
                    //activated
                    if(this.panel_buttons.get(child)) {
                        ((child as Label).getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_GREEN.c2)).setAlpha(1);
                        ((child as Label).getElement('background') as RoundRectangle).setStrokeStyle(4, Constants.convertColorToNumber(Constants.COLORS_GREEN.c3));
                        this.phaserGameController.resetEnvironmentSelectionHighlighting()
                        this.phaserGameController.highlightEnvironmentSelectionEffect(new Set(this.getActiveActions()));
                    //toggled off
                    } else {
                        this.phaserGameController.resetEnvironmentSelectionHighlighting()
                        this.phaserGameController.highlightEnvironmentSelectionEffect(new Set(this.getActiveActions()));
                        ((child as Label).getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2)).setAlpha(0.5);
                        ((child as Label).getElement('background') as RoundRectangle).setStrokeStyle();
                    }
                    
                    //set Environment
                    /* let tmp = this.getActiveActions();
                    this.game.setEnvironment(new Set(tmp)); */
                })

                child.on('pointerout', () => {
                    //activated
                    if(this.panel_buttons.get(child)) {
                        ((child as Label).getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_GREEN.c1)).setAlpha(1);
                    //toggled off
                    } else {
                        ((child as Label).getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c1)).setAlpha(0.5);
                    }
                })

                child.on('pointerdown', () => {
                    //activated
                    if(this.panel_buttons.get(child)) {
                        ((child as Label).getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_GREEN.c3)).setAlpha(1);
                    //toggled off
                    } else {
                        ((child as Label).getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c3)).setAlpha(0.5);
                    }
                    //var index = (this.sizer.getElement('items') as Phaser.GameObjects.GameObject[]).indexOf(child);
                    //print.text += `click ${index}\n`; 
                })
            }
        }

        this.sizer.layout();

        //OLD CODE, IF SOMETHING BREAKS WITH NEW CODE
        /* this.sizer.setChildrenInteractive({})
            .on('child.up', (child: Label) => {  
                //toggle on or off
                this.panel_buttons.set(child, this.panel_buttons.get(child) === undefined? true : !this.panel_buttons.get(child))
                //activated
                if(this.panel_buttons.get(child)) {
                    (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_GREEN.c2)).setAlpha(1);
                    (child.getElement('background') as RoundRectangle).setStrokeStyle(4, Constants.convertColorToNumber(Constants.COLORS_GREEN.c3));
                //toggled off
                } else {
                    (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2)).setAlpha(0.5);
                    (child.getElement('background') as RoundRectangle).setStrokeStyle();
                }
                
                //set Environment
                let tmp = this.getActiveActions();
                this.game.setEnvironment(new Set(tmp));
            })
            .on('child.down', (child: Label) => {
                //activated
                if(this.panel_buttons.get(child)) {
                    (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_GREEN.c3)).setAlpha(1);
                //toggled off
                } else {
                    (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c3)).setAlpha(0.5);
                }
                //var index = (this.sizer.getElement('items') as Phaser.GameObjects.GameObject[]).indexOf(child);
                //print.text += `click ${index}\n`; 
            })
            .on('child.over', (child: Label) => {
                //activated
                if(this.panel_buttons.get(child)) {
                    (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_GREEN.c2)).setAlpha(1);
                //toggled off
                } else {
                    (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2)).setAlpha(0.5);
                }
                
            })
            .on('child.out', (child: Label) => {
                //activated
                if(this.panel_buttons.get(child)) {
                    (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_GREEN.c1)).setAlpha(1);
                //toggled off
                } else {
                    (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c1)).setAlpha(0.5);
                }
            }); */
        
            //if update call, restore previous settings
            if(!this.enabled) {
                this.disable();
            }
            if(!this.activated) {
                this.makeInvisible();
            }

            if(this.inFadeTween) {
                this.caption.setAlpha(1)
                let list = this.sizer.getAllChildren()
                for(let i = 0; i < list.length; i++) {
                    (list[i] as Label).setAlpha(this.current_alpha);
                }
            }
    }


}