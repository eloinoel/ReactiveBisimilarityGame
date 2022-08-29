import { Constants } from "../utils/Constants";
import { ScrollablePanel, FixWidthSizer, RoundRectangle, Label, GridSizer, Anchor} from 'phaser3-rex-plugins/templates/ui/ui-components';
import { SetOps } from "../utils/SetOps";

export class EnvironmentPanel extends Phaser.GameObjects.Container {

    private panel_buttons: Phaser.GameObjects.GameObject[];
    private sizer;
    private caption;
    //private caption: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, possibleActions: Set<string>) {
        super(scene, x, y);

        /* this.caption = scene.add.text(0, 0, "Environment", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setOrigin(0.5).setFontSize(40).setResolution(2); */
        this.panel_buttons = [];
        


        let actions = SetOps.toArray(possibleActions);
        let dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/5, 50);

        this.caption = scene.add.text(0, - dimensions.y, "Environment", {fontFamily: Constants.textStyle, fontStyle: 'bold'}).setFontSize(30).setOrigin(0.5).setResolution(2);
        this.add(this.caption);

        this.sizer = new FixWidthSizer(scene, {
            x: x, y: y,
            width: dimensions.x,
            height: dimensions.y,
            align: "center",
            space: { item: 5 , top: 5, bottom: 5 },
        })

        this.sizer.addBackground(scene.add.existing(new RoundRectangle(scene, 0, 0, 2, 2, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2))),
            //{left: -5, right: -5, top: -5, bottom: -5}
        );
        /* sizer.add() */
        for (var i = 0; i < actions.length; i++) {
            let label = new Label(scene, {
                width: 40, height: 40,
                background: scene.add.existing(new RoundRectangle(scene, 0, 0, 0, 0, 14, Constants.convertColorToNumber(Constants.COLORPACK_1_LIGHT.blue))),
                text: scene.add.text(0, 0, actions[i], {fontFamily: Constants.textStyle, fontStyle: 'bold'}).setFontSize(22).setResolution(2),
                space: {
                    left: 5,
                    right: 5,
                    top: 5,
                    bottom: 5,
                },
                align: 'center'
            })
            this.sizer.add(label);
            this.panel_buttons.push(label);
        }
        this.sizer.layout();

        this.sizer.setChildrenInteractive({})
            .on('child.up', (child: Label) => {
                (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORPACK_1.black));
                //var index = (this.sizer.getElement('items') as Phaser.GameObjects.GameObject[]).indexOf(child);
                //print.text += `click ${index}\n`; 
            })
            .on('child.down', (child: Label) => {
                (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORPACK_1_LIGHT.black));
                //var index = (this.sizer.getElement('items') as Phaser.GameObjects.GameObject[]).indexOf(child);
                //print.text += `click ${index}\n`; 
            })
            .on('child.over', (child: Label) => {
                (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORPACK_1.black));
                //(child.getElement('background') as RoundRectangle).setStrokeStyle(4, 0xff0000);
            })
            .on('child.out', (child: Label) => {
                //(child.getElement('background') as RoundRectangle).setStrokeStyle();
                (child.getElement('background') as RoundRectangle).setFillStyle(Constants.convertColorToNumber(Constants.COLORPACK_1_LIGHT.blue));
            });


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

    /* private createPanel(scene: Phaser.Scene, x: number, y:number, width: number, height: number , data: {name: string, actions: string[]}) {
        let title = new Label(scene, {
            height: 30,
            orientation: 'x',
            text: scene.add.text(0, 0, data.name, {fontStyle: 'bold'}).setResolution(2),
        });

        let sizer = new Sizer(scene, {
            space: {
                left: 1,
                right: 1,
                top: 1,
                bottom: 1,
                item: 10,
            },
        })

        for(let i = 0; i < data.actions.length ; i++) {
            sizer.add(new Label(scene, {
                width: 60, 
                height: 60,
                background: scene.add.existing(new RoundRectangle(scene, 0, 0, 0, 0, 10, Constants.convertColorToNumber(Constants.COLORPACK_1.red_pink))),
                text: scene.add.text(0, 0, data.actions[i]).setFontSize(25).setResolution(2),
                align: 'center',
                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10,
                }
            }));
        }

        let vertical_sizer = new Sizer(scene, {
            orientation: 'y',
            space: { left: 5, right: 5, top: 5, bottom: 5, item: 2 },
        }).add(title, {
            expand: true,
            align: 'center',
        }).add(sizer)
        
        return new ScrollablePanel(scene, {
            x: x,
            y: y,
            width: width,
            height: height,
            scrollMode: 'horizontal',
            background: scene.add.existing(new RoundRectangle(scene, 0, 0, 2, 2, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c1))),
            panel: {
                child: vertical_sizer,
                mask: {
                    padding: 1,
                },
            },
            mouseWheelScroller: false,
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                panel: 10,
            },
        }).layout();;
    } */
}