import { Constants } from "../utils/Constants";
import { ScrollablePanel, Sizer, RoundRectangle, Label, GridSizer} from 'phaser3-rex-plugins/templates/ui/ui-components';
import { SetOps } from "../utils/SetOps";

export class EnvironmentPanel extends Phaser.GameObjects.Container {

    private panel_buttons: Phaser.GameObjects.Container[];
    private panel;
    //private caption: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, possibleActions: Set<string>) {
        super(scene, x, y);

        /* this.caption = scene.add.text(0, 0, "Environment", {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.white}).setOrigin(0.5).setFontSize(40).setResolution(2); */
        this.panel_buttons = [];

        let data = {
            name: 'Environment',
            actions: SetOps.toArray(possibleActions),
        };

        let dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/5, this.scene.renderer.height/12);

        this.panel = new ScrollablePanel(scene, {
            x: x,
            y: y,
            width: dimensions.x,
            height: dimensions.y,
            scrollMode: 1,
            background: scene.add.existing(new RoundRectangle(scene, 0, 0, 2, 2, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c1))),
            
            panel: {
                child: this.createPanel(scene, data),

                mask: {
                    padding: 1,
                    // layer: this.add.layer()
                },
            },
            mouseWheelScroller: false,
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,

                panel: 10,
                // slider: { left: 30, right: 30 },
            },
            
            
        }).layout();





        //background panel
        /* this.panel = this.scene.add.graphics();
        this.panel.fillStyle(Constants.convertColorToNumber(Constants.COLORS_GREEN.c1), 1).setAlpha(0.8)
        let dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/5, this.scene.renderer.height/12);
        this.panel.fillRoundedRect(-dimensions.x/2, + dimensions.y/2, dimensions.x, dimensions.y, 10).setDepth(1);; */

        //add elements to container
        /* this.add(this.panel); */
        /* this.add(this.caption); */

        scene.add.existing(this);

        //this.setSize(this.outImage.width, this.outImage.height);
        this.setDepth(1);
        //this.setInteractive();

    }

    private createPanel(scene: Phaser.Scene, data: {name: string, actions: string[]}) {
        let title = new Label(scene, {
            height: 30,
            orientation: 'x',
            text: scene.add.text(0, 0, data.name).setResolution(2),
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
        
        return vertical_sizer;
    }




    //TODO: enable all buttons to be toggleable
    enable() {

    }

    //TODO: disable all buttons to not be clickable
    disable() {

    }
}