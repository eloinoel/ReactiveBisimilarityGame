import { ScrollablePanel, FixWidthSizer, RoundRectangle, Sizer } from 'phaser3-rex-plugins/templates/ui/ui-components';
import { Constants } from '../utils/Constants';

export class ScrollableTextArea extends Phaser.GameObjects.Container {

    private text: string;
    private panel: ScrollablePanel;
    private fontSize: number;
    private description: Phaser.GameObjects.Text;
    
    constructor(scene: Phaser.Scene, x_pos: number, y_pos: number, texture?: string, text: string = "", fontSize: number = 20, texture_over?: string, texture_click?: string, width = 370, height = 400) {
        super(scene, Math.round(x_pos), Math.round(y_pos));
        scene.add.existing(this).setDepth(1);

        this.text = text;
        this.fontSize = fontSize;
        this.description = scene.add.text(x_pos, y_pos - 40, "Possible Moves: ", {fontFamily: Constants.textStyle}).setFontSize(20);


        //add text
        this.panel = new ScrollablePanel(scene, {
            x: x_pos,
            y: y_pos,
            width: width,
            height: height,
            scrollMode: 'vertical',
            background: scene.add.existing(new RoundRectangle(scene, 0, 0, 2, 2, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c4))),
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
                track: scene.add.existing(new RoundRectangle(scene, 0, 0, 20, 10, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c2))),
                thumb: scene.add.existing(new RoundRectangle(scene, 0, 0, 0, 0, 13, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c3))),
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

    makeInvisible() {
        this.panel.setVisible(false);
        this.description.setVisible(false);
    }

    makeVisible() {
        this.panel.setVisible(true);
        this.description.setVisible(true);
    }
}


export class CreditsScrollableArea extends Phaser.GameObjects.Container {

    private panel: ScrollablePanel;
    private slider: RoundRectangle;
    private sliderknob: RoundRectangle;
    
    constructor(scene: Phaser.Scene, x_pos: number, y_pos: number, width = 370, height = 400) {
        super(scene, Math.round(x_pos), Math.round(y_pos));
        scene.add.existing(this).setDepth(1);

        //add text
        this.panel = new ScrollablePanel(scene, {
            x: x_pos,
            y: y_pos,
            width: width,
            height: height,
            scrollMode: 'vertical',
            //background: scene.add.existing(new RoundRectangle(scene, 0, 0, 2, 2, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c4))),
            panel: {
                child: scene.add.existing(new FixWidthSizer(scene, {
                    space: {
                        left: 100,    //padding
                        right: 5,
                        top: 3,
                        bottom: 3,
                        item: 8,
                        line: 15,
                    }
                })),
                mask: {
                    padding: 1
                },
            },        
            mouseWheelScroller: true,
            //c1: "#71C9CE", c2: "#A6E3E9"
            slider: {
                track: scene.add.existing(this.slider = new RoundRectangle(scene, 0, 0, 5, 10, 10, Constants.convertColorToNumber(Constants.COLORS_PARALLAX.lighter_blue))).setAlpha(0.6),
                thumb: scene.add.existing(this.sliderknob = new RoundRectangle(scene, 0, 0, 0, 0, 13, Constants.convertColorToNumber(Constants.COLORPACK_1.white))).setAlpha(0.8),
            },
            //.drawBounds(this.add.graphics(), 0xff0000);
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                panel: 10,
            }

        }).layout()
    }



    addNewLine(text_obj: Phaser.GameObjects.Text) {
        let sizer = this.panel.getElement('panel');
        let scene = this.panel.scene;

        (sizer as FixWidthSizer).add(text_obj);
        (sizer as FixWidthSizer).addNewLine();
        this.panel.layout()
        return text_obj;
    }

    addText(obj: Phaser.GameObjects.Text) {
        let sizer = this.panel.getElement('panel');
        let scene = this.panel.scene;

        (sizer as FixWidthSizer).add(obj);
        this.panel.layout();

        return obj;
    }

    addLineBreak() {
        let sizer = this.panel.getElement('panel');
        (sizer as FixWidthSizer).addNewLine();
        this.panel.layout()
    }

    getSlider() {
        return [this.slider, this.sliderknob];
    }
}