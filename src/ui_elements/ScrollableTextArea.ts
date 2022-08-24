import { ScrollablePanel, FixWidthSizer, RoundRectangle } from 'phaser3-rex-plugins/templates/ui/ui-components';
import { Constants } from '../utils/Constants';

export class ScrollableTextArea extends Phaser.GameObjects.Container {

    private text: string;
    private panel: ScrollablePanel;
    private fontSize: number;
    
    constructor(scene: Phaser.Scene, x_pos: number, y_pos: number, texture?: string, text: string = "", fontSize: number = 20, texture_over?: string, texture_click?: string, width = 370, height = 400) {
        super(scene, Math.round(x_pos), Math.round(y_pos));
        scene.add.existing(this).setDepth(1);

        this.text = text;
        this.fontSize = fontSize;


        //add text
        this.panel = new ScrollablePanel(scene, {
            x: x_pos,
            y: y_pos,
            width: width,
            height: height,
            scrollMode: 'vertical',
            background: scene.add.existing(new RoundRectangle(scene, 0, 0, 2, 2, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c3))),
            panel: {
                child: scene.add.existing(new FixWidthSizer(scene, {
                    space: {
                        left: 3,    //padding
                        right: 3,
                        top: 3,
                        bottom: 3,
                        item: 8,
                        line: 8,
                    }
                })),
                mask: {
                    padding: 1
                },
            },        
            mouseWheelScroller: true,
            //c1: "#71C9CE", c2: "#A6E3E9"
            slider: {
                track: scene.add.existing(new RoundRectangle(scene, 0, 0, 20, 10, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c1))),
                thumb: scene.add.existing(new RoundRectangle(scene, 0, 0, 0, 0, 13, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2))),
            },
            //.drawBounds(this.add.graphics(), 0xff0000);
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                panel: 10,
            }

        }).layout().setOrigin(0);
        this.updatePanel(text);
    }

    updatePanel (content: string) {
        let sizer = this.panel.getElement('panel');
        let scene = this.panel.scene;
    
        (sizer as FixWidthSizer).clear(true);
        //TODO: maybe better splitting strategy cutting at specified amount of characters
        var lines = content.split('\n');
        for (var li = 0, lcnt = lines.length; li < lcnt; li++) {
            var words = lines[li].split(' ');
            for (var wi = 0, wcnt = words.length; wi < wcnt; wi++) {
                (sizer as FixWidthSizer).add(
                    scene.add.text(0, 0, words[wi], {
                        fontFamily:Constants.textStyle,
                        color: Constants.COLORPACK_1.black,
                        fontStyle: 'bold'
                    }).setFontSize(this.fontSize)
                );
            }
            if (li < (lcnt - 1)) {
                (sizer as FixWidthSizer).addNewLine();
            }
        }
    
    
        this.panel.layout();
        return this.panel;
    }


}