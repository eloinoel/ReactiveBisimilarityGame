import { Constants } from "../utils/Constants";
import { FixWidthSizer, RoundRectangle, Label} from 'phaser3-rex-plugins/templates/ui/ui-components';
import { SetOps } from "../utils/SetOps";
import { ReactiveBisimilarityGame } from "../utils/ReactiveBisimilarityGameController";

export class EnvironmentPanel extends Phaser.GameObjects.Container {

    private coordinates: Phaser.Math.Vector2;
    private dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/5, 50)

    private panel_buttons: Map<Phaser.GameObjects.GameObject, boolean>;
    private sizer!: FixWidthSizer;
    private caption;
    private possibleActions;
    private curEnvironment;
    private game;
    //private caption: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, game: ReactiveBisimilarityGame) {
        super(scene, x, y);


        this.scene = scene;
        this.coordinates = new Phaser.Math.Vector2(x, y);

        this.panel_buttons = new Map();
        this.game = game;
        this.possibleActions = SetOps.toArray(this.game.lts.getVisibleActions());
        this.curEnvironment = game.getEnvironment();

        this.caption = scene.add.text(0, - this.dimensions.y, "Environment", {fontFamily: Constants.textStyle, fontStyle: 'bold'}).setFontSize(30).setOrigin(0.5).setResolution(2);
        this.add(this.caption);

        this.create();


        scene.add.existing(this);
        this.setDepth(1);
    }

    /**
     * enable all buttons to be clickable
    */ 
    enable() {
        this.sizer.setInteractive();
        let list = this.sizer.getAllChildren()
        for(let i = 0; i < list.length; i++) {
            (list[i] as Label).setAlpha(1)
        }
        return this;
    }

    /**
     * disable all buttons to not be clickable
     */
    disable() {
        this.sizer.disableInteractive()
        let list = this.sizer.getAllChildren()
        for(let i = 0; i < list.length; i++) {
            (list[i] as Label).setAlpha(0.7)
        }
        return this;
    }

    /**
     * make visible and clickable in scene
     * @returns 
     */
    makeVisible() {
        this.caption.setVisible(true);
        this.sizer.setVisible(true);
        return this;
    }

    /**
     * not visible or clickable in scene
     * @returns 
     */
    makeInvisible() {
        this.caption.setVisible(false);
        this.sizer.setVisible(false);
        return this;
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
    update() {
        this.curEnvironment = this.game.getEnvironment();
        this.possibleActions = SetOps.toArray(this.game.lts.getVisibleActions());
        //create a a new instance and asign it
        this.destroyPanel();
        this.create();
    }

    private create() {

        let width = this.dimensions.x
        for(let i = 4; i < this.possibleActions.length; i++) {
            width += 45;
        }

        this.sizer = new FixWidthSizer(this.scene, {
            x: this.coordinates.x, y: this.coordinates.y,
            width: width,
            height: this.dimensions.y,
            align: "center",
            space: { item: 7 , top: 5, bottom: 5 },
        })

        this.sizer.addBackground(this.scene.add.existing(new RoundRectangle(this.scene, 0, 0, 2, 2, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c4))));

        for (var i = 0; i < this.possibleActions.length; i++) {
            let label = new Label(this.scene, {
                width: 40, height: 40,
                background: this.curEnvironment.has(this.possibleActions[i])? this.scene.add.existing(new RoundRectangle(this.scene, 0, 0, 0, 0, 14, Constants.convertColorToNumber(Constants.COLORS_GREEN.c1)).setStrokeStyle(4, Constants.convertColorToNumber(Constants.COLORS_GREEN.c3)))
                 : this.scene.add.existing(new RoundRectangle(this.scene, 0, 0, 0, 0, 14, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c1)).setAlpha(0.5)),
                text: this.scene.add.text(0, 0, this.possibleActions[i], {fontFamily: Constants.textStyle, fontStyle: 'bold'}).setFontSize(22).setResolution(2),
                space: {
                    left: 5,
                    right: 5,
                    top: 5,
                    bottom: 5,
                },
                align: 'center'
            })
            this.sizer.add(label);
            this.panel_buttons.set(label, this.curEnvironment.has(this.possibleActions[i]) ? true : false);
        }
        this.sizer.layout();

        this.sizer.setChildrenInteractive({})
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
            });
    }

    /**
     * warning: do not use this without fully understanding this class
     * deletes the entire visual representation and clears up data structures
     * should be followed by another create() call
     */
    private destroyPanel() {
        this.sizer.destroy(true);
        this.panel_buttons.clear();
    }
}