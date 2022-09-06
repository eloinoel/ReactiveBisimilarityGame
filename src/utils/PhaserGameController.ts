import { ReactiveBisimilarityGame } from "./ReactiveBisimilarityGameController";
import Phaser from 'phaser';
import { LTSController } from "./LTSController";
import { LtsStateButton, Simple_Button } from '../ui_elements/Button';
import { Transition } from '../ui_elements/Transition';
import { Constants } from './Constants';
import { TextEdit } from 'phaser3-rex-plugins/plugins/textedit';
import { AttackerNode, Player, RestrictedAttackerNode, RestrictedSimulationDefenderNode, SimulationDefenderNode } from "./GamePosition";
import { ScrollableTextArea } from "../ui_elements/ScrollableTextArea";
import { EnvironmentPanel } from "../ui_elements/EnvironmentPanel";
import { SetOps } from "./SetOps";

export class PhaserGameController {
    private game: ReactiveBisimilarityGame;
    private game_initialized: boolean;

    private left_coordinates: Phaser.Math.Vector2; //coordinates of first lts
    private right_coordinates: Phaser.Math.Vector2; //coordinates of second lts to compare
    private offset_between_vertices: Phaser.Math.Vector2; //distance between vertices

    private stateBtns: Map<string, LtsStateButton>; //map from state names to visual buttons references
    private scene: Phaser.Scene;    
    private current_hightlights: Phaser.GameObjects.Arc[];  //visual hightlight references with indeces 0 and 1
    private environment_container!: Phaser.GameObjects.Container;  //text object displaying the current environment
    private current_position!: Phaser.GameObjects.Container;  //text object displaying current game position 
    private possible_moves_text!: ScrollableTextArea; //panel object displaying all possible moves
    private switch_button!: Phaser.GameObjects.Container;
    private environment_panel!: EnvironmentPanel;

    private nextProcessAfterTimeout: string;    //used to call doMove after environmentPanel was set for timeout actions

    debug: boolean; //TODO: for diplaying possible moves, position etc

    /**
     * PhaserGameController to manage games and displaying objects in one scene relating to the game
     * @param scene 
     * @param offset_between_vertices 
     * @param left_coordinates 
     * @param right_coordinates 
     */
    constructor(scene: Phaser.Scene, offset_between_vertices = Constants.lts_xy_offset, left_coordinates = Constants.first_coordinates, right_coordinates = Constants.second_coordinates) {
        this.left_coordinates = left_coordinates;
        this.right_coordinates = right_coordinates;
        this.offset_between_vertices = offset_between_vertices;
        this.scene = scene;
        this.stateBtns = new Map<string, LtsStateButton>();
        let lts = new LTSController();
        this.game = new ReactiveBisimilarityGame("", "", lts);
        this.nextProcessAfterTimeout = "";
        this.current_hightlights = [];
        /* this.environment_container = new Phaser.GameObjects.Container(this.scene, 0, 0);
        this.current_position = new Phaser.GameObjects.Text(this.scene, 0, 0, "", {});
        this.possible_moves_text = new Phaser.GameObjects.Container(this.scene, 0, 0) as ScrollableTextArea;
        this.switch_button = new Phaser.GameObjects.Container(this.scene, 0, 0);
        this.environment_panel = new Phaser.GameObjects.Container(this.scene, 0, 0); */
        this.game_initialized = false;
        this.debug = true;
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
            const p0 = new LtsStateButton(this.scene, this.left_coordinates.x + this.offset_between_vertices.x*column, this.left_coordinates.y + this.offset_between_vertices.y*row, () => {
                this.encapsulateDoMove(name)}, name).setScale(0.5);
            this.stateBtns.set(name, p0);
        } else if(lts_num === 1) {
            const q0 = new LtsStateButton(this.scene, this.right_coordinates.x + this.offset_between_vertices.x*column, this.right_coordinates.y + this.offset_between_vertices.y*row, () => {
                this.encapsulateDoMove(name)}, name).setScale(0.5);
            this.stateBtns.set(name, q0);
        } else {
            console.log("PhaserGameController: addState: lts_num has illegal parameter");
        }
        
    }

    /**
     * adds transition to the logical game and to the scene, 
     * note that the game wont work properly if there are multiple edges between two nodes
     * @param scene 
     * @param p0 process 1
     * @param p1 process 2
     * @param action 
     */
    addTransition(p0: string, p1: string, action: string) {
        let p0_button = this.stateBtns.get(p0);
        let p1_button = this.stateBtns.get(p1);

        if(p0_button !== undefined && p1_button !== undefined) {
            this.game.lts.addTransition(p0, p1, action);
            if(p0 === p1) {
                this.scene.add.image(p0_button.x - 60, p0_button.y, "ui_replay_btn").setScale(0.45).setTint(Constants.convertColorToNumber(Constants.COLORPACK_1.blue)).setRotation(-0.5);
                this.scene.add.text(p0_button.x - 60, p0_button.y, action, {fontFamily: Constants.textStyle, color: Constants.COLORPACK_1.red_pink, fontStyle: 'bold' }).setFontSize(25).setOrigin(0.5);
            } else {
                const tr_p0_p1 = new Transition(this.scene, p0_button.x, p0_button.y, p1_button.x, p1_button.y, "arrow_tail", "arrow_middle", "arrow_head", action, 0.2, 75);
            }
        }
    }

    /**
     * start a new game, p0 playing against p1
     * @param p0 name of first process
     * @param p1 name of second process
     */
    startGame(scene: Phaser.Scene, p0: string, p1: string, reactive = true, bisimilar = true) {
        if(this.game.startNewGame(p0, p1) === 0) {
            this.createEnvironmentField();
            this.game.setReactive(reactive) //order with createEnvironmentField is important
            this.game.setBisimilar(bisimilar);
            this.game_initialized = true;
            this.createHighlights(p0, p1);
            this.createReactiveElements();
            this.environment_panel.disable(); //only enable on timeout
            if(!reactive) {
                this.environment_container.setVisible(false);
                this.environment_panel.makeInvisible();
            }
            this.createCurrentPositionField();
            this.createPossibleMovesField();
            if(!(reactive || bisimilar)) {
                this.switch_button.setVisible(false);
            }
            if(!this.debug) {
                this.environment_container.setVisible(false);
                this.current_position.setVisible(false);
                this.possible_moves_text.makeInvisible();
            }
        }
    }

    /**
     * if timeout not possible after setting environment, give visual feedback
     * @param env 
     */
     setEnvironmentAndDoTimeout(env: Set<string>) {
        //set environment
        this.setEnvironment(env);

        //doMove
        let legalMove = this.doMove(this.nextProcessAfterTimeout, false);

        //resetEnvironment to previous, if move was not possible
        if(legalMove === -1) {
            let cur_pos = this.game.getPlay()[this.game.getPlay().length - 1];
            if(cur_pos instanceof RestrictedAttackerNode || cur_pos instanceof RestrictedSimulationDefenderNode) {
                this.game.setEnvironment(cur_pos.environment);
            } else if (cur_pos instanceof AttackerNode || cur_pos instanceof SimulationDefenderNode) {
                this.game.resetEnvironment();
            }
        }
    }

    /**
     * add environment change and timeout functionality
     * @returns -1 if move is no possible
     * */
    encapsulateDoMove(next_process: string, isSymmetryMove = false) {
        let cur_pos = this.game.getPlay()[this.game.getPlay().length - 1];
        
        //revert any changes made to the environment by timeout action
        if(this.environment_panel.isEnabled()) {
            this.environment_panel.disable();

            //environment wasn't changed when it is still enabled
            /* if(cur_pos instanceof RestrictedAttackerNode || cur_pos instanceof RestrictedSimulationDefenderNode) {
                if(!SetOps.areEqual(cur_pos.environment, this.game.getEnvironment())) {
                    this.game.setEnvironment(cur_pos.environment);
                }
            } else if (cur_pos instanceof AttackerNode || cur_pos instanceof SimulationDefenderNode) {
                
                this.game.resetEnvironment();
            } */
        }

        let edgeLabel = this.game.lts.getActionBetweenTwoProcesses(cur_pos.process1, next_process);
        //timeout action, can only occur in these node types
        if((cur_pos instanceof AttackerNode || RestrictedAttackerNode) && !isSymmetryMove && edgeLabel !== undefined && edgeLabel === Constants.TIMEOUT_ACTION) {
            //enable Environment Change UI
            this.nextProcessAfterTimeout = next_process;
            this.environment_panel.enable();
        } else {
            this.doMove(next_process, isSymmetryMove);
        }
    }

    /**
     * does not work if there are multiple edges between processes
     * @param next_process
     * @isSymmetryMove
     * @returns -1 if the move was not possible
     */
    doMove(next_process: string, isSymmetryMove: boolean = false): number {
        let cur_pos = this.game.getPlay()[this.game.getPlay().length - 1];
        let moves = this.game.possibleMoves();
        let next_position;
        let action: string = Constants.NO_ACTION;

        if(moves.length === 0) {
            this.printError("doMove: no possible moves from current position")
            //TODO: display visual feedback
            return -1;
        }

        // cautious when using this in the next if case
        if(!this.game.lts.hasTransition(cur_pos.process1, next_process)) {
            isSymmetryMove = true;
        }

        if(cur_pos instanceof AttackerNode || cur_pos instanceof RestrictedAttackerNode) {
            if(isSymmetryMove) {
                next_position = moves.filter((position) => (cur_pos.isSymmetryMove(position) && position.process1 === next_process));
                action = Constants.NO_ACTION;
            } else {
                next_position = moves.filter((position) => (position.process1 === next_process));  //TODO: also test transition label
                if(!(next_position.length === 0)) {
                    action = (next_position[0] as SimulationDefenderNode).previousAction;
                }
            }
            if(next_position.length === 0) {
                this.printError("doMove: no possible move to process " + next_process);
                return -1;
            }
        } else if(cur_pos instanceof SimulationDefenderNode || cur_pos instanceof RestrictedSimulationDefenderNode) {
            next_position = moves.filter((position) => (position.process2 === next_process));  //TODO: also test transition label
            if(next_position.length === 0) {
                this.printError("doMove: no possible move to process " + next_process);
                return -1;
            }
            action = cur_pos.previousAction;
        } else {
            this.printError("doMove: current position type unknown");
            return -1;
        }
        if(next_position.length > 1) {
            console.log("doMove: multiple moves are possible for given arguments, TODO: implement strategy to choose correct one");
        }

        if(this.game.performMove(action, next_position[0]) === -1) {
            console.log("move not possible: " + action + ", " + next_position.toString());
            return -1;
        } else {
            this.updateCurrentPositionField();
            this.updateHightlights();
            if(this.game.isReactive()) {
                this.updateEnvironmentContainer();
                this.environment_panel.updatePanel();
            }
            this.updatePossibleMovesField();

            //check if the game is over
            moves = this.game.possibleMoves();
            cur_pos = this.game.getPlay()[this.game.getPlay().length - 1];

            if(cur_pos.activePlayer === Player.Attacker) {
                //in the reactive bisimulation game the defender cannot get stuck as he always has a symmetry move
            //Defender is stuck
            } else if(cur_pos.activePlayer === Player.Defender) {
                if(moves.length === 0) {
                    //TODO: Show Points and Congratulation
                    let wintext = this.scene.add.text(this.scene.renderer.width / 2, this.scene.renderer.height / 2, "The attacker won the game!", {fontFamily: Constants.textStyle, color: Constants.COLORS_GREEN.c2, fontStyle: "bold", stroke: "#0", strokeThickness: 3}).setFontSize(50).setDepth(4).setOrigin(0.5).setInteractive().on("pointerdown", () => {
                        wintext.destroy();
                    });
                }
            }
        }
        return 0;
    }

    /************************************* UTILITY AND DEBUG *************************************/

    /**
     * TODO: check if switching game mode is possible in current game state
     * if @reactive = true, @bisimilar is not checked in the internal game engine
     * @param reactive 
     * @param bisimilar 
     */
    setGameMode(reactive = true, bisimilar = true) {
        //TODO: visual feedback if not possible
        let react = this.game.setReactive(reactive);
        let bisim = this.game.setBisimilar(bisimilar);
        
        this.environment_container.setVisible(this.game.isReactive());
        this.environment_panel.setVisible(this.game.isReactive());

        if(!(this.game.isBisimilar() || this.game.isReactive())) {
            this.switch_button.setVisible(false);
        } else {
            this.switch_button.setVisible(true);
        }
        
    }

    /**
     * set the game logic's environment from a string, 
     * doesn't detect tau, only singular letters
     * @param text 
     */
    setEnvironmentFromString(text: string) {
        if(this.game.isReactive()) {
            //parse the given string and extract actions
            let arr = text.split(/(?!$)/u); //split at every character
            let env = new Set<string>();
            for(let i = 0; i < arr.length; i++) {
                if(arr[i].charCodeAt(0) >= 97 && arr[i].charCodeAt(0) <= 122 && arr[i] !== "t") {
                    env.add(arr[i].charAt(0))
                }
            }
            this.game.setEnvironment(env);
            //update visualization
            this.updateEnvironmentContainer(); //if some illegal characters are given, reset to previous
            this.environment_panel.updatePanel();
            this.updatePossibleMovesField();

        } else {
            this.printError("setEnvironmentFromString: was called but game is not reactive");
        }
    }

    /**
     * set the game logic's environment and update UI
     * only execute after startGame() has been called
     * @param text 
     */
     setEnvironment(env: Set<string>) {
        if(this.game.isReactive()) {
            this.game.setEnvironment(env);
            //update visualization
            if(this.game_initialized) {
                this.updateEnvironmentContainer(); //if some illegal characters are given, reset to previous
                this.environment_panel.updatePanel();
                this.updatePossibleMovesField();
            }
        } else {
            this.printError("setEnvironment: was called but game is not reactive");
        }
    }

    /**
     * display visual hightlights of current game state
     * @param p0 
     * @param p1 
     */
    private createHighlights(p0: string, p1: string) {
        if(this.game_initialized) {
            //highlight current processes
            let p0_button = this.stateBtns.get(p0);
            if(p0_button !== undefined) {
                this.current_hightlights[0] = this.scene.add.circle(p0_button.x, p0_button.y, 36).setDepth(0);
                this.current_hightlights[0].setStrokeStyle(4, Constants.convertColorToNumber(Constants.COLORS_GREEN.c2));
            } else {
                this.printError("startGame: " + p0 + " is not in stateBtns list.");
            }

            let p1_button = this.stateBtns.get(p1)
            if(p1_button !== undefined) {
                this.current_hightlights[1] = this.scene.add.circle(p1_button.x, p1_button.y, 36).setDepth(0);
                this.current_hightlights[1].setStrokeStyle(4,  Constants.convertColorToNumber(Constants.COLORS_RED.c4));
            } else {
                this.printError("startGame: " + p1 + " is not in stateBtns list.");
            }
        }
    }

    /**
     * symmetry move button
     */
    private createReactiveElements() {
        this.switch_button = new Simple_Button(this.scene , this.scene.renderer.width/2, this.scene.renderer.height/2 -100, "ui_swap_btn", () => {
            this.doMove(this.game.getCurrent(1), true);
        }).setScale(0.15);

        this.environment_panel = new EnvironmentPanel(this.scene, this.scene.renderer.width/2, this.scene.renderer.height - 100, this.game, this);
    }

    /**
     * creates Text Input Box for the games environment
     */
    private createEnvironmentField() {
        let pos = new Phaser.Math.Vector2(this.scene.renderer.width * 3.15 / 4, 150);

        const description = this.scene.add.text(pos.x, pos.y, "Environment: ", {fontFamily: Constants.textStyle}).setFontSize(20)
        let environment_text = this.scene.add.text(pos.x + 140, pos.y, this.game.getEnvironmentString(), {fontFamily: Constants.textStyle, fixedWidth: 150, fixedHeight: 36}).setFontSize(20);
        this.environment_container = this.scene.add.container(0, 0, [environment_text, description]);
        let textEdit = new TextEdit(environment_text);
        environment_text.setInteractive().on('pointerup', () => {
            textEdit.open(undefined, (text_obj) => {
                this.setEnvironmentFromString((text_obj as Phaser.GameObjects.Text).text);
            })
        })
    }

    /**
     * displays current game position on screen
     */
    private createCurrentPositionField() {
        //game initialized
        if(this.game.getPlay().length !== 0) {
            let pos = new Phaser.Math.Vector2(this.scene.renderer.width * 3.15 / 4, 200);
            
            let description = this.scene.add.text(pos.x, pos.y, "Position: ", {fontFamily: Constants.textStyle}).setFontSize(20)
            let position_text = this.scene.add.text(pos.x + 140, pos.y, this.game.getPlay()[this.game.getPlay().length - 1].toString(), {fontFamily: Constants.textStyle}).setFontSize(18);
            this.current_position = this.scene.add.container(0, 0, [position_text, description]);
        }
    }

    /**
     * displays possibles next stateBtns in the game
     */
    private createPossibleMovesField() {
        let pos = new Phaser.Math.Vector2(this.scene.renderer.width * 3.15 / 4, this.scene.renderer.height - 300);
        this.possible_moves_text = new ScrollableTextArea(this.scene, pos.x, pos.y + 40, "panel", "", undefined, undefined, undefined, 250, 230);
        this.updatePossibleMovesField();
    }

    /**
     * updates visual representation of the game's environment
     * game and environment_text should be initialized
     */
    private updateEnvironmentContainer() {
        if(this.game.getPlay().length !== 0) {
            if(this.environment_container.getAll().length === 2) {
                (this.environment_container.first as Phaser.GameObjects.Text).text = this.game.getEnvironmentString();
            } else {
                this.printError("updateEnvironmentContainer: environment_field not initialized")
            }
        } else {
            this.printError("game not initialized")
        }
    }

    /**
     * game and current_position have to be initialized
     */
    private updateCurrentPositionField() {
        //game and textfield initialized
        if(this.game.getPlay().length !== 0 && this.current_position.getAll().length === 2) {
            (this.current_position.first as Phaser.GameObjects.Text).text = this.game.getPlay()[this.game.getPlay().length - 1].toString();
        } else {
            this.printError("game not initialized")
        }
    }

    /**
     * game and possible_moves_text have to be initialized
     */
    private updatePossibleMovesField() {
        if(this.game.getPlay().length !== 0) {
            let moves = this.game.getPossibleMovesString(undefined, undefined, true);
            this.possible_moves_text.updatePanel(moves);
        } else {
            this.printError("game not initialized")
        }
    }

    /**
     * game should be initialized
     */
    private updateHightlights() {
        let cur0 = this.game.getCurrent(0);
        let cur0_btn = this.stateBtns.get(cur0);
        let cur1 = this.game.getCurrent(1);
        let cur1_btn = this.stateBtns.get(cur1);

        if(cur0_btn !== undefined && cur1_btn !== undefined) {
            this.current_hightlights[0].setPosition(cur0_btn.x, cur0_btn.y);
            this.current_hightlights[1].setPosition(cur1_btn.x, cur1_btn.y);
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

