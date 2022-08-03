import { ReactiveBisimilarityGame } from "./ReactiveBisimilarityGameController";
import Phaser from 'phaser';
import { LTSController } from "./LTSController";
import { LtsStateButton } from '../ui_elements/Button';
import { Transition } from '../ui_elements/Transition';
import { Constants } from './Constants';
import { TextEdit } from 'phaser3-rex-plugins/plugins/textedit';

export class PhaserGameController {
    game: ReactiveBisimilarityGame;
    private left_coordinates: Phaser.Math.Vector2; //coordinate
    private right_coordinates: Phaser.Math.Vector2;
    private offset_between_vertices: Phaser.Math.Vector2;

    private states: Map<string, LtsStateButton>;
    private scene: Phaser.Scene;
    private current_hightlights: Phaser.GameObjects.Arc[];
    private environment_text: Phaser.GameObjects.Text;
    private current_position: Phaser.GameObjects.Text;

    /**
     * PhaserGameController to manage games and displaying objects in one scene relating to the game
     * @param scene 
     * @param offset_between_vertices 
     * @param left_coordinates 
     * @param right_coordinates 
     */
    constructor(scene: Phaser.Scene, offset_between_vertices = new Phaser.Math.Vector2(115, 140), left_coordinates = new Phaser.Math.Vector2(400, 200), right_coordinates = new Phaser.Math.Vector2(800, 200)) {
        this.left_coordinates = left_coordinates;
        this.right_coordinates = right_coordinates;
        this.offset_between_vertices = offset_between_vertices;
        this.scene = scene;
        this.states = new Map<string, LtsStateButton>();
        let lts = new LTSController();
        this.game = new ReactiveBisimilarityGame("", "", lts);
        this.current_hightlights = [];
        this.environment_text = new Phaser.GameObjects.Text(this.scene, 0, 0, "", {});
        this.current_position = new Phaser.GameObjects.Text(this.scene, 0, 0, "", {});
    }

    /**
     * adds the state to the logical game and to the scene
     * @param scene 
     * @param name of the state to add
     * @param lts_num 0 or 1 for left or right player
     * @param row positive integer
     * @param column 0 is the middle, -1 to add process to the left and +1 to the right
     */
    addState(name: string, lts_num:number, row: number, column: number) {
        this.game.lts.addState(name);
        if(lts_num === 0) {
            const p0 = new LtsStateButton(this.scene, this.left_coordinates.x + this.offset_between_vertices.x*column, this.left_coordinates.y + this.offset_between_vertices.y*row, () => {console.log(name)}, name).setScale(0.5);
            this.states.set(name, p0);
        } else if(lts_num === 1) {
            const q0 = new LtsStateButton(this.scene, this.right_coordinates.x + this.offset_between_vertices.x*column, this.right_coordinates.y + this.offset_between_vertices.y*row, () => {console.log(name)}, name).setScale(0.5);
            this.states.set(name, q0);
        } else {
            console.log("PhaserGameController: addState: lts_num has illegal parameter");
        }
        
    }

    /**
     * adds transition to the logical game and to the scene
     * @param scene 
     * @param p0 process 1
     * @param p1 process 2
     * @param action 
     */
    addTransition(p0: string, p1: string, action: string) {
        let p0_button = this.states.get(p0);
        let p1_button = this.states.get(p1);

        if(p0_button !== undefined && p1_button !== undefined) {
            this.game.lts.addTransition(p0, p1, action);
            const tr_p0_p1 = new Transition(this.scene, p0_button.x, p0_button.y, p1_button.x, p1_button.y, "arrow_tail", "arrow_middle", "arrow_head", action, 0.2);
        }
    }

    /**
     * start a new game, p0 playing against p1
     * @param p0 name of first process
     * @param p1 name of second process
     */
    startGame(scene: Phaser.Scene, p0: string, p1: string) {
        if(this.game.startNewGame(p0, p1) === 0) {
            //highlight current processes
            let p0_button = this.states.get(p0);
            if(p0_button !== undefined) {
                this.current_hightlights[0] = this.scene.add.circle(p0_button.x, p0_button.y, 36).setDepth(0);
                this.current_hightlights[0].setStrokeStyle(4,  0xFF2E63);
            } else {
                this.printError("startGame: " + p0 + " is not in states list.");
            }

            let p1_button = this.states.get(p1)
            if(p1_button !== undefined) {
                this.current_hightlights[1] = this.scene.add.circle(p1_button.x, p1_button.y, 36).setDepth(0);
                this.current_hightlights[1].setStrokeStyle(4,  0xFF2E63);
            } else {
                this.printError("startGame: " + p1 + " is not in states list.");
            }
        }
        this.createEnvironmentField();
        this.createCurrentPositionField();
    }

    private createEnvironmentField() {
        //let test = prompt("Enter Environment", "a, b, c") //ALTERNATIVE OPTION
        let pos = new Phaser.Math.Vector2(this.scene.renderer.width * 2.8 / 4, 50);
        const description = this.scene.add.text(pos.x, pos.y, "Environment: ", {fontFamily:'Monospace'}).setFontSize(20)
        this.environment_text = this.scene.add.text(pos.x + 140, pos.y, this.game.getEnvironmentString(), {fontFamily:'Monospace', fixedWidth: 150, fixedHeight: 36}).setFontSize(20);
        let textEdit = new TextEdit(this.environment_text);
        this.environment_text.setInteractive().on('pointerup', () => {
            textEdit.open(undefined, (text_obj) => {
                this.setEnvironment((text_obj as Phaser.GameObjects.Text).text);
            })
        })
    }

    //TODO: better parser to gather any chars except t and tau
    private setEnvironment(text: string) {
        //parse the given string and extract actions
        let arr = text.split(/(?!$)/u); 
        let env = new Set<string>();
        for(let i = 0; i < arr.length; i++) {
            if(arr[i].charCodeAt(0) >= 97 && arr[i].charCodeAt(0) <= 122) {
                env.add(arr[i].charAt(0))
            }
        }
        this.game.setEnvironment(env);
        //update visualization
        this.updateEnvironment(); //if some illegal characters are given
    }

    private updateEnvironment() {
        this.environment_text.text = this.game.getEnvironmentString();
    }

    /**
     * displays current game position on screen
     */
    private createCurrentPositionField() {
        //game initialized
        if(this.game.play.length !== 0) {
            let pos = new Phaser.Math.Vector2(this.scene.renderer.width * 2.8 / 4, 100);
            const description = this.scene.add.text(pos.x, pos.y, "Position: ", {fontFamily:'Monospace'}).setFontSize(20)
            this.current_position = this.scene.add.text(pos.x + 140, pos.y, this.game.play[this.game.play.length - 1].toString(), {fontFamily:'Monospace'}).setFontSize(18);
        }
    }

    /**
     * TODO: call after every move
     */
    private updateCurrentPositionField() {
        //game and textfield initialized
        if(this.game.play.length !== 0 && this.current_position.text !== "") {
            this.current_position.text = this.game.play[this.game.play.length - 1].toString();
        }
    }


    /**
     * 
     * @param error throws an error message that prints in red to the console
     */
     printError(error: string) {
        try {
            throw(error);
        } catch (error) {
            console.log(error);
        }
    }


}