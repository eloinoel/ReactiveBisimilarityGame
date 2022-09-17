import { RoundRectangle, Sizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import { Constants } from "../utils/Constants";

export class WinPopup extends Phaser.GameObjects.Container {

    private coordinates: Phaser.Math.Vector2;
    private dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/3.8, 230);

    private movesNeeded: number;
    private stars: number;
    private textStyle: Phaser.Types.GameObjects.Text.TextStyle;
    private replay_action;
    private next_level_action

    private sizer: Sizer;
    private replay_btn!: ReplayButton;
    private next_level_btn!: ReplayButton;

    constructor(scene: Phaser.Scene, stars: number, movesNeeded: number, replayAction = () => {console.log("replay action")}, nextLevelAction = () => {console.log("next level action")}) {
        super(scene, scene.renderer.width/2, scene.renderer.height/2);

        this.setSize(this.dimensions.x, this.dimensions.y);

        this.movesNeeded = movesNeeded;
        this.stars = stars;
        this.replay_action = replayAction;
        this.next_level_action = nextLevelAction;
        this.textStyle = {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.black};

        this.coordinates = new Phaser.Math.Vector2(scene.renderer.width/2, scene.renderer.height/2);
        this.sizer = this.createPanel();

        

        scene.add.existing(this);
    }

    private createPanel(): Sizer {

        let sizer = new Sizer(this.scene, {
            x: this.coordinates.x, 
            y: this.coordinates.y,
            width: this.dimensions.x,
            height: this.dimensions.y,
            orientation: 'y',
            space: {item: 5, top: 10, bottom: 10, left: 7, right: 7}
        })
        sizer.addBackground(this.scene.add.existing(new RoundRectangle(this.scene, 0, 0, 2, 2, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c4))));
        
        //title
        sizer.add(this.scene.add.text(0, 0, "You win!", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"})

        //Moves needed
        sizer.add(this.scene.add.text(0, 0, "Moves needed: " + this.movesNeeded, this.textStyle).setResolution(2).setFontSize(20), {padding: {top: 10, bottom: 3},})

        //Feedback
        if(this.stars === 1) {
            sizer.add(this.scene.add.text(0, 0, "There is room for improvement!", this.textStyle).setResolution(2).setFontSize(20))
        } else if(this.stars === 2) {
            sizer.add(this.scene.add.text(0, 0, "Well done!", this.textStyle).setResolution(2).setFontSize(20))
        } else if(this.stars === 3) {
            sizer.add(this.scene.add.text(0, 0, "Perfect score!", this.textStyle).setResolution(2).setFontSize(20))
        }

        //Stars
        sizer.add(this.createStarsContainer(this.stars), {padding: {top: 3, bottom: 3}});

        //Buttons
        sizer.add(new Sizer(this.scene)
            .add(this.replay_btn = new ReplayButton(this.scene, 0, 0, this.replay_action, Constants.COLORS_BLUE_LIGHT.c3, Constants.COLORS_BLUE_LIGHT.c1, "Replay", this.textStyle), {padding: {top: 10, right: 7}})
            .add(this.next_level_btn = new ReplayButton(this.scene, 0, 0, this.next_level_action, Constants.COLORS_BLUE_LIGHT.c3, Constants.COLORS_BLUE_LIGHT.c1, "Next Level", this.textStyle), {padding: {top: 10, left: 7}})
        );

        sizer.setDepth(2)
        sizer.layout();

        return sizer;
    }

    private createStarsContainer(num_stars: number): Sizer {
        let sizer = new Sizer(this.scene, {orientation: 'x'})

        let star_scale = 0.08
        for(let i = 0; i < num_stars && i < 3; i++) {
            sizer.add(this.scene.add.image(0, 0, "star").setScale(star_scale))
        }
        for(let i = num_stars; i < 3; i++) {
            sizer.add(this.scene.add.image(0, 0, "star_empty").setScale(star_scale))
        }

        return sizer;
    }

    destroyPopup() {
        this.replay_btn.destroyButton();
        this.next_level_btn.destroyButton();
        this.sizer.destroy()
        this.destroy();
    }
}

export class LosePopup extends Phaser.GameObjects.Container {

    private coordinates: Phaser.Math.Vector2;
    private dimensions = new Phaser.Math.Vector2(this.scene.renderer.width/4.4, 130);
    private replay_action;


    private textStyle: Phaser.Types.GameObjects.Text.TextStyle;

    private sizer: Sizer;
    private replay_btn!: ReplayButton;

    constructor(scene: Phaser.Scene, replayAction = () => {console.log("replay action")}) {
        super(scene, scene.renderer.width/2, scene.renderer.height/2);

        this.setSize(this.dimensions.x, this.dimensions.y);

        this.textStyle = {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.black};
        this.replay_action = replayAction;
        this.coordinates = new Phaser.Math.Vector2(scene.renderer.width/2, scene.renderer.height/2);
        this.sizer = this.createPanel();

        scene.add.existing(this);
    }

    private createPanel(): Sizer {

        let sizer = new Sizer(this.scene, {
            x: this.coordinates.x, 
            y: this.coordinates.y,
            width: this.dimensions.x,
            height: this.dimensions.y,
            orientation: 'y',
            space: {item: 10, top: 17, bottom: 17, left: 7, right: 7}
        })
        sizer.addBackground(this.scene.add.existing(new RoundRectangle(this.scene, 0, 0, 2, 2, 10, Constants.convertColorToNumber(Constants.COLORS_BLUE_LIGHT.c4))));
        
        //title
        sizer.add(this.scene.add.text(0, 0, "You lose", this.textStyle).setFontSize(30).setResolution(2).setFontStyle('bold'), {align: "center"});

        //hint
        sizer.add(this.scene.add.text(0, 0, "No (winning) moves left", this.textStyle).setFontSize(20).setResolution(2), {align: "center", padding: {bottom: 10}})


        //Buttons
        sizer.add(new Sizer(this.scene)
            .add(this.replay_btn = new ReplayButton(this.scene, 0, 0, this.replay_action, Constants.COLORS_BLUE_LIGHT.c3, Constants.COLORS_BLUE_LIGHT.c1, "Try again", this.textStyle))
        );

        sizer.setDepth(2)
        sizer.layout();

        return sizer;
    }

    destroyPopup() {
        this.replay_btn.destroyButton();
        this.sizer.destroy();
        this.destroy();
    }
}


export class ReplayButton extends Phaser.GameObjects.Container {

    private background: RoundRectangle;
    private dimensions = new Phaser.Math.Vector2(140, 35);

    text: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, actionOnClick = () => {}, bg_clr: string, border_clr = bg_clr, text: string, textStyle: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y);


        this.setSize(this.dimensions.x, this.dimensions.y);
        this.background = scene.add.existing(new RoundRectangle(scene, 0, 0, this.dimensions.x, this.dimensions.y, 10, Constants.convertColorToNumber(bg_clr)))
        if(bg_clr !== border_clr) {
            this.background.setStrokeStyle(4, Constants.convertColorToNumber(border_clr));
        }
        
        this.text = scene.add.text(0, 0, text, textStyle).setOrigin(0.5).setResolution(2).setFontSize(22).setFontStyle('bold');

        this.add(this.background)
        this.add(this.text);

        scene.add.existing(this);

        this.setDepth(1);
        this.setInteractive();

        /** make image button interactive
         * PointerEvents:
         *    pointerover - hovering
         *    pointerout - not hovering
         *    pointerup - click and release
         *    pointerdown - just click
         */
        this.on('pointerover', () => {
            this.scale = 1.1
            this.background.setFillStyle(Constants.convertColorToNumber(bg_clr)).setAlpha(0.8)
        })
        this.on('pointerdown', () => {
            this.scale = 0.95
            this.background.setFillStyle(Constants.convertColorToNumber(bg_clr)).setAlpha(0.6)
        })
        this.on('pointerup', () => {
            actionOnClick();
            this.scale = 1.1
            this.background.setFillStyle(Constants.convertColorToNumber(bg_clr)).setAlpha(0.8)
        })
        this.on('pointerout', () => {
            this.scale = 1
            this.background.setFillStyle(Constants.convertColorToNumber(bg_clr)).setAlpha(1)
        })
    }

    destroyButton() {
        this.text.destroy();
        this.background.destroy();
        this.destroy();
    }
}


