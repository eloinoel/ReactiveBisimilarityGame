import { ReactiveBisimilarityGame } from "./ReactiveBisimilarityGameController";
import Phaser from 'phaser';
import { LTSController } from "./LTSController";
import { LtsStateButton, Simple_Button } from '../ui_elements/Button';
import { FixedLengthTransition, Transition } from '../ui_elements/Transition';
import { Constants } from './Constants';
import { TextEdit } from 'phaser3-rex-plugins/plugins/textedit';
import { AttackerNode, GamePosition, Player, RestrictedAttackerNode, RestrictedSimulationDefenderNode, SimulationDefenderNode } from "./GamePosition";
import { ScrollableTextArea } from "../ui_elements/ScrollableTextArea";
import { EnvironmentPanel } from "../ui_elements/EnvironmentPanel";
import { SetOps } from "./SetOps";
import { LevelDescription } from "../ui_elements/LevelDescription";
import { AI } from "./AI";
import { WinPopup, LosePopup } from "../ui_elements/EndGamePopup";
import BaseScene from "../scenes/BaseScene";
import GUIScene from "../scenes/GUIScene";

export class PhaserGameController {
    private game: ReactiveBisimilarityGame;
    private game_initialized: boolean;

    private left_coordinates: Phaser.Math.Vector2; //coordinates of first lts
    private right_coordinates: Phaser.Math.Vector2; //coordinates of second lts to compare
    private offset_between_vertices: Phaser.Math.Vector2; //distance between vertices

    private stateBtns: Map<string, LtsStateButton>; //map from state names to visual buttons references
    private scene: Phaser.Scene;    
    private current_hightlights: Phaser.GameObjects.Arc[];  //visual hightlight references with indeces 0 and 1
    private player_icons: Phaser.GameObjects.GameObject[];  //0:_player icon sprite, 1: geometryMaskObject, 2: opponent icon sprite, 3: mask2
    private environment_container!: Phaser.GameObjects.Container;  //text object displaying the current environment
    private current_position!: Phaser.GameObjects.Container;  //text object displaying current game position 
    private possible_moves_text!: ScrollableTextArea; //panel object displaying all possible moves
    private switch_button!: Phaser.GameObjects.Container;
    private environment_panel!: EnvironmentPanel;
    private movable_environment_panel!: EnvironmentPanel;
    private level_description: LevelDescription;
    ai_controller!: AI;     //TODO: set private

    private num_moves_for_stars: number[];  //contains the number of moves needed for 2 or 3 stars 
    private num_moves: number; //the number of moves a player currently made

    private nextProcessAfterTimeout: string;    //used to call doMove after environmentPanel was set for timeout actions

    private replayPulseTween!: Phaser.Tweens.Tween;

    /**shows debug UI if set to true */
    debug: boolean;

    /**
     * PhaserGameController to manage games and displaying objects in one scene relating to the game
     * @param scene 
     * @param offset_between_vertices 
     * @param left_coordinates 
     * @param right_coordinates 
     */
    constructor(scene: Phaser.Scene, offset_between_vertices = Constants.lts_xy_offset, left_coordinates = Constants.first_coordinates, right_coordinates = Constants.second_coordinates, level_description: LevelDescription) {
        this.left_coordinates = left_coordinates;
        this.right_coordinates = right_coordinates;
        this.offset_between_vertices = offset_between_vertices;
        this.scene = scene;
        this.stateBtns = new Map<string, LtsStateButton>();
        let lts = new LTSController();
        this.game = new ReactiveBisimilarityGame("", "", lts);
        this.nextProcessAfterTimeout = "";
        this.current_hightlights = [];
        this.player_icons = [];
        /* this.environment_container = new Phaser.GameObjects.Container(this.scene, 0, 0);
        this.current_position = new Phaser.GameObjects.Text(this.scene, 0, 0, "", {});
        this.possible_moves_text = new Phaser.GameObjects.Container(this.scene, 0, 0) as ScrollableTextArea;
        this.switch_button = new Phaser.GameObjects.Container(this.scene, 0, 0);
        this.environment_panel = new Phaser.GameObjects.Container(this.scene, 0, 0); */
        this.game_initialized = false;
        this.debug = false;  //Set this if you want to see possible moves, current position and environment field
        this.level_description = level_description;
        this.num_moves_for_stars = [0, 0];
        this.num_moves = 0;
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
                let tmp = this.encapsulateDoMove(name);
                if(tmp === -1) {
                    p0.redBlinking()
                }
            }, name, this.debug)
            this.stateBtns.set(name, p0);
        } else if(lts_num === 1) {
            const q0 = new LtsStateButton(this.scene, this.right_coordinates.x + this.offset_between_vertices.x*column, this.right_coordinates.y + this.offset_between_vertices.y*row, () => {
                let tmp = this.encapsulateDoMove(name);
                if(tmp === -1) {
                    q0.redBlinking()
                }
            }, name, this.debug)
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
            if(p0 === p1 && (action === "a" || action === "c")) {
                const tr_p0_p1 = new Transition(this.scene, p0_button.x, p0_button.y, p1_button.x, p1_button.y, "arrow_tail", "arrow_middle", "arrow_head", action, 0.2, 75);
            } else {
                const tr_p0_p1 = new FixedLengthTransition(this.scene, p0_button.x, p0_button.y, p1_button.x, p1_button.y, action, 1)
            }
            /* const tr_p0_p1 = new Transition(this.scene, p0_button.x, p0_button.y, p1_button.x, p1_button.y, "arrow_tail", "arrow_middle", "arrow_head", action, 0.2, 75); */

        } else {
            this.printError("addTransition: illegal arguments: " + p0 + ", " + p1);
        }
    }

    /**
     * start a new game, p0 playing against p1
     * @param p0 name of first process
     * @param p1 name of second process
     * @param reactive turns the game into reactive bisimulation game
     * @param bisimilar turns the game into bisimulation game, isn't evaluated if reactive is true
     * @param num_moves_for_stars an array with the first 2 indeces containing the number of moves needed to achieve 2 or 3 stars at the end of the level
     */
    startGame(scene: Phaser.Scene, p0: string, p1: string, reactive = true, bisimilar = true, num_moves_for_stars = [0, 0, 0]) {
        if(this.game.startNewGame(p0, p1) === 0) {
            this.createEnvironmentField();
            this.game.setReactive(reactive) //order with createEnvironmentField is important
            this.game.setBisimilar(bisimilar);
            this.game_initialized = true;
            this.createHighlights(p0, p1);
            this.createReactiveElements();
            this.environment_panel.disable(); //only enable on timeout
            this.movable_environment_panel.disable()
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

            //ai initialization
            this.ai_controller = new AI(this.game);
            this.ai_controller.generateGraph();
            this.ai_controller.determineWinningRegion();
            //stars evaluation
            for(let i = 0; i < num_moves_for_stars.length; i++) {
                if(num_moves_for_stars[i] >= 0) {
                    this.num_moves_for_stars[i] = num_moves_for_stars[i];
                }
            }
            this.num_moves = 0;
        }
    }


    /**
     * if timeout not possible after setting environment, give visual feedback
     * @param env 
     */
    setEnvironmentAndDoTimeout(env: Set<string>) {
        //set environment
        this.setEnvironment(env, false);

        //doMove
        let legalMove = this.doMove(this.nextProcessAfterTimeout, false);

        //resetEnvironment to previous, if move was not possible
        if(legalMove === -1) {
            let cur_pos = this.game.getPlay()[this.game.getPlay().length - 1];
            if(cur_pos instanceof RestrictedAttackerNode || cur_pos instanceof RestrictedSimulationDefenderNode) {
                this.game.setEnvironment(cur_pos.environment, true);
            } else if (cur_pos instanceof AttackerNode || cur_pos instanceof SimulationDefenderNode) {
                this.game.resetEnvironment(true);
            }

            //red blinking
            
            this.movable_environment_panel.redBlinking();
            this.scene.time.delayedCall(400, () => {
                this.movable_environment_panel.disable()
                this.movable_environment_panel.makeInvisible()
                this.environment_panel.updatePanel();
                this.movable_environment_panel.updatePanel();
            })
            
        } else {
            this.movable_environment_panel.disable()
            this.environment_panel.updatePanel();
            this.movable_environment_panel.updatePanel();
            this.movable_environment_panel.swooshAnimation(this.environment_panel.getPanelPosition())
        }

        return legalMove;
    }

    /**
     * add environment change, timeout functionality
     * and AI functionality
     * @returns -1 if move is not possible
     * */
    encapsulateDoMove(next_process: string, isSymmetryMove = false) {
        let cur_pos = this.game.getPlay()[this.game.getPlay().length - 1];

        //Defender ---> red blinking to signal its not the players turn
        if(cur_pos.activePlayer === Player.Defender) {
            console.log("Not player's turn")
            return -1;

        //Attacker ---> if timeout, activate environment change panel otherwise doMove
        } else {
            //revert any changes made to the environment by timeout action
            if(this.movable_environment_panel.isEnabled()) {
                this.movable_environment_panel.disable();
                this.movable_environment_panel.makeInvisible()

                //environment wasn't changed if it is still enabled
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
                //this.movable_environment_panel.stopAllTweens();
                this.movable_environment_panel.disable();
                this.movable_environment_panel.makeInvisible()
                //enable Environment Change UI
                //get position 
                let p1_btn = this.stateBtns.get(cur_pos.process1);
                let p2_btn = this.stateBtns.get(next_process);
                if(p1_btn !== undefined && p2_btn !== undefined) {
                    this.nextProcessAfterTimeout = next_process;
                    let vector = new Phaser.Math.Vector2(p2_btn.x - p1_btn.x, p2_btn.y - p1_btn.y);
                    let center = new Phaser.Math.Vector2(p1_btn.x, p1_btn.y).add(vector.clone().scale(0.5)); 
                    this.movable_environment_panel.stopAllTweens()
                    this.movable_environment_panel.setPanelPosition(center)
                    this.movable_environment_panel.enable();
                    this.movable_environment_panel.makeVisible();
                    (this.scene as BaseScene).background.setInteractive()
                } else {
                    this.printError("encapsulateDoMove: cannot display environment panel, buttons were not found");
                }
            } else {
                return this.doMove(next_process, isSymmetryMove);
            }
        }
        
        
    }

    /**
     * does not work if there are multiple edges between processes
     * @param next_process
     * @isSymmetryMove
     * @returns -1 if the move was not possible, 0 if the game is over
     */
    doMove(next_process: string, isSymmetryMove: boolean = false): number {
        let cur_pos = this.game.getPlay()[this.game.getPlay().length - 1];
        let moves = this.game.possibleMoves();
        let next_position;
        let action: string = Constants.NO_ACTION;

        if(moves.length === 0) {
            this.printError("doMove: no possible moves from current position")
            return -1;
        }

        // cautious when using this in the next if case
        if(!this.game.lts.hasTransition(cur_pos.process1, next_process)) {
            isSymmetryMove = true;
        }

        //determine next position from LTS and given arguments
        if(cur_pos instanceof AttackerNode || cur_pos instanceof RestrictedAttackerNode) {
            if(isSymmetryMove) {
                next_position = moves.filter((position) => (cur_pos.isSymmetryMove(position) && position.process1 === next_process));
                action = Constants.NO_ACTION;
            } else {
                next_position = moves.filter((position) => (position.process1 === next_process));
                if(!(next_position.length === 0)) {
                    action = (next_position[0] as SimulationDefenderNode).previousAction;
                }
            }
            if(next_position.length === 0) {
                this.printError("doMove: no possible move to process " + next_process);
                return -1;
            }
        } else if(cur_pos instanceof SimulationDefenderNode || cur_pos instanceof RestrictedSimulationDefenderNode) {
            next_position = moves.filter((position) => (position.process2 === next_process));
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

        //now execute the move
        if(this.game.performMove(action, next_position[0]) === -1) {
            console.log("move not possible: " + action + ", " + next_position.toString());
            return -1;
        } else {
            if(isSymmetryMove) {
                (this.player_icons[0] as Phaser.GameObjects.Sprite).toggleFlipX();
                (this.player_icons[2] as Phaser.GameObjects.Sprite).toggleFlipX();
            }

            //update visuals
            this.updateVisualsAfterMove()


            cur_pos = this.game.getPlay()[this.game.getPlay().length - 1];
            moves = this.game.possibleMoves(undefined, true);

            //attacker did a move, update counter
            this.num_moves++;

            if(cur_pos.activePlayer === Player.Defender) {
                //check if the game is over
                //defender is stuck
                if(moves.length === 0) {
                /*     let wintext = this.scene.add.text(this.scene.renderer.width / 2, this.scene.renderer.height / 2, "The attacker won the game!", {fontFamily: Constants.textStyle, color: Constants.COLORS_GREEN.c2, fontStyle: "bold", stroke: "#0", strokeThickness: 3}).setFontSize(50).setDepth(4).setOrigin(0.5).setInteractive().on("pointerdown", () => {
                        wintext.destroy();
                    }); */
                    this.launchEndScreen(true);
                //AI makes a move
                } else {
                    let defender_move = this.ai_controller.getNextMove(cur_pos);
                    if(defender_move !== undefined) {
                        let return_code = this.game.performMove((cur_pos as SimulationDefenderNode).previousAction, defender_move);
                        if(return_code === -1) {
                            this.printError("doMove: Could not execute move the defender AI said to be possible: " + defender_move.toString());
                        } else {
                            this.updateVisualsAfterMove()
                            moves = this.game.possibleMoves(undefined, true);
                            //should only occur in simulation game because there is always a symmetry move in bisimilar games
                            if(moves.length === 0) {
                                this.launchEndScreen(false);
                            }
                        }
                    }
                }

            //Attackers Turn, only reachable after symmetry move
            } else {
                
                //TODO: detect symmetry move loop with bfs
                if(false) {
                    this.launchEndScreen(false)
                }
                
            }
            this.scene.events.emit('clickedLtsButton')
            return 0
        }
        return 1;
    }

    /**
     * set localstorage stars, 
     * end screen Popup
     * @param win 
     */
    private launchEndScreen(win: boolean) {
        if(win) {
            let current_level = parseInt(localStorage.getItem("currentLevel") as string);
            if(current_level !== undefined && current_level >= 0 && current_level <= 17) {
                console.log("The attacker won the game!");
                //get number of stars
                let num_stars = 1;
                for(let i = 0; i < this.num_moves_for_stars.length && i < 2; i++) {
                    if(this.num_moves <= this.num_moves_for_stars[i] ) {
                        num_stars = i + 2;
                    }
                }

                //update local storage
                let tmp_levels = localStorage.getItem("levels");
                if(tmp_levels === null) {
                    this.printError("launchEndScreen: retrieving levels from storage returned null");
                } else {
                    let levels = JSON.parse(tmp_levels);
                    if(levels[current_level].stars < num_stars) {
                        levels[current_level].stars = num_stars;
                    }
                    //unlock next level
                    if(current_level < 17 && levels[current_level + 1].state === false) {
                        levels[current_level + 1].state = true;
                    }

                    localStorage.setItem("levels", JSON.stringify(levels));
                }

                //grey overlay
                let bg_overlay = this.scene.add.rectangle(this.scene.renderer.width/2, this.scene.renderer.height/2, this.scene.renderer.width + 1, this.scene.renderer.height + 1, 0x000000, 0.7).setOrigin(0.5).setDepth(7);

                //open popup
                let pop = new WinPopup(this.scene, num_stars, this.num_moves, () => {
                    //replayAction
                    (this.scene as BaseScene).fade(false, () => {
                        pop.destroyPopup();
                        bg_overlay.destroy();
                        console.clear(); 
                        this.scene.scene.stop("GUIScene"); 
                        this.scene.scene.restart()
                    })
                }, () => {
                    //nextLevelAction
                    (this.scene as BaseScene).fade(false, () => {
                        localStorage.setItem("currentLevel", JSON.stringify(current_level + 1));
                        console.clear();
                        pop.destroyPopup();
                        bg_overlay.destroy();
                        this.scene.scene.stop("GUIScene");
                        this.scene.scene.start(this.getSceneKeyFromIndex(current_level + 1));
                    })
                })
            } else {
                this.printError("launchEndScreen: currenLevel: " + current_level);
                let wintext = this.scene.add.text(this.scene.renderer.width / 2, this.scene.renderer.height / 2, "The attacker won the game!", {fontFamily: Constants.textStyle, color: Constants.COLORS_GREEN.c2, fontStyle: "bold", stroke: "#0", strokeThickness: 3}).setFontSize(50).setDepth(4).setOrigin(0.5).setInteractive().on("pointerdown", () => {
                    wintext.destroy(); 
                });
                return;
            }
        //lose
        } else {
            console.log("The defender wins the game!");

            //grey overlay
            let bg_overlay = this.scene.add.rectangle(this.scene.renderer.width/2, this.scene.renderer.height/2, this.scene.renderer.width + 1, this.scene.renderer.height + 1, 0x000000, 0.7).setOrigin(0.5).setDepth(4);

            //open popup
            let pop = new LosePopup(this.scene, () => {
                //replayAction
                (this.scene as BaseScene).fade(false, () => {
                    pop.destroyPopup();
                    bg_overlay.destroy();
                    console.clear(); 
                    this.scene.scene.stop("GUIScene"); 
                    this.scene.scene.restart()
                })
            });
        }
    }

    /************************************* UTILITY AND DEBUG *************************************/


    printAIGraph() {
        if(this.ai_controller !== undefined && this.ai_controller !== null) {
            this.ai_controller.printGraph();
        } else {
            this.printError("printAIGraph: AI not initialized.");
        }
    }

    printAttackerShortestPath() {
        if(this.ai_controller !== undefined && this.ai_controller !== null) {
            let path = this.ai_controller.getShortestPathFromBfs();
            if(path !== undefined) {
                let length = 0;
                let path_string = "";
                let previous = undefined;   //for detecting symmetry moves
                for(let i = 0; i < path.length; i++) {
                    if(path[i].data[0].activePlayer === Player.Defender || (previous === Player.Attacker && path[i].data[0].activePlayer === Player.Attacker)) {
                        length++;
                    }
                    previous = path[i].data[0].activePlayer;
                    path_string = path_string.concat(path[i].data[0].toString() + ", ");
                }
                path_string = path_string.concat("; moves: " + length);
                console.log(path_string);
            } else {
                this.printError("printAttackerShortestPath: path undefined" )
            }
            
        } else {
            this.printError("printAttackerShortestPath: AI not initialized.");
        }
    }

    printAttackerShortestMinMaxPath() {
        if(this.ai_controller !== undefined && this.ai_controller !== null) {
            let path = this.ai_controller.launchModifiedMinMax();

            if(path !== undefined) {
                let length = 0;
                let path_string = "";
                let previous = undefined;   //for detecting symmetry moves
                for(let i = 0; i < path.length; i++) {
                    if(path[i].activePlayer === Player.Defender || (previous === Player.Attacker && path[i].activePlayer === Player.Attacker)) {
                        length++;
                    }
                    previous = path[i].activePlayer;
                    path_string = path_string.concat(path[i].toString() + ", ");
                }
                path_string = path_string.concat("; moves: " + length + "; pathlen: " + (path.length - 1));
                console.log(path_string);
            } else {
                this.printError("printAttackerShortestMindMaxPath: returned path is undefined")
            }
            
        } else {
            this.printError("printAttackerShortestMinMaxPath: AI not initialized.");
        }
    }

    /**
     * returns the name of the scene for the specified level index
     * @param index 
     */
    getSceneKeyFromIndex(index: number) {
        switch(index) {
            case 0: 
                return "Sim_Level1";
            case 1:
                return "Sim_Level2";
            case 2: 
                return "Sim_Level3";
            case 3:
                return "Sim_Level4";
            case 4: 
                return "Bisim_Level1";
            case 5:
                return "Bisim_Level2";
            case 6: 
                return "Bisim_Level3";
            case 7:
                return "Bisim_Level4";
            case 8: 
                return "ReBisim_Level1";
            case 9:
                return "ReBisim_Level2";
            case 10: 
                return "ReBisim_Level3";
            case 11:
                return "ReBisim_Level4";
            case 12: 
                return "ReBisim_Level5";
            case 13:
                return "ReBisim_Level6";
            case 14: 
                return "ReBisim_Level7";
            case 15:
                return "ReBisim_Level8";
            case 16: 
                return "ReBisim_Level9";
            case 17:
                return "ReBisim_Level10";
            default:
                this.printError("getSceneKeyFromIndex: Unknown index " + index);
                return undefined;
        }
    }

    /**
     * wrapper for multiple update functions
     * Hightlights, environmentPanel and Container, CurrentPositionField, PossibleMovesField, Turn
     */
    private updateVisualsAfterMove() {
        this.updateHightlights();
        if(this.game.isReactive()) {
            this.updateEnvironmentContainer();
            this.environment_panel.updatePanel();
            this.movable_environment_panel.updatePanel()
        }
        if(this.debug) {
            this.updateCurrentPositionField();
            this.updatePossibleMovesField();
        }

        let cur_pos = this.game.getPlay()[this.game.getPlay().length - 1];
        //set turn
        if(cur_pos.activePlayer === Player.Defender) {
            this.level_description.setTurn(false);
        } else {
            this.level_description.setTurn(true);
        }

        //replay
        if(this.ai_controller.getWinningRegionOfPosition() === false && this.replayPulseTween === undefined) {
            let guiscene = this.scene.scene.get('GUIScene');
            let replayBtn = (guiscene as GUIScene).replay_btn;
            let scale = replayBtn.scale;

            this.replayPulseTween = this.scene.tweens.add({
                targets: replayBtn,
                duration: 700,
                scale: scale + 0.15,
                ease: Phaser.Math.Easing.Quadratic.InOut,
                yoyo: true,
                loop: -1,
            })
        }
    }
    /**
     * Method not needed in project
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
            this.movable_environment_panel.updatePanel()
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
     setEnvironment(env: Set<string>, visualsUpdate = true) {
        if(this.game.isReactive()) {
            this.game.setEnvironment(env, !visualsUpdate);
            //update visualization
            if(this.game_initialized && visualsUpdate) {
                this.updateEnvironmentContainer(); //if some illegal characters are given, reset to previous
                this.environment_panel.updatePanel();
                this.movable_environment_panel.updatePanel()
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
                this.current_hightlights[0].setStrokeStyle(4, Constants.convertColorToNumber(Constants.COLORS_GREEN.c2)).setVisible(this.debug);
            } else {
                this.printError("startGame: " + p0 + " is not in stateBtns list.");
                return
            }

            let p1_button = this.stateBtns.get(p1)
            if(p1_button !== undefined) {
                this.current_hightlights[1] = this.scene.add.circle(p1_button.x, p1_button.y, 36).setDepth(0);
                this.current_hightlights[1].setStrokeStyle(4,  Constants.convertColorToNumber(Constants.COLORS_RED.c4)).setVisible(this.debug);
            } else {
                this.printError("startGame: " + p1 + " is not in stateBtns list.");
                return
            }

            //create animated player icon
            let player_anim = this.scene.anims.create({
                key: 'witch_idle_animation',
                frames: this.scene.anims.generateFrameNumbers('witch_idle', {frames: [0, 1, 2, 3, 4, 5]}),
                frameRate: 6,
                repeat: -1
            })
            if(player_anim !== false) { 
                this.player_icons[0] = this.scene.add.sprite(p0_button.x+1, p0_button.y + 15, 'witch_idle').setScale(0.95).setOrigin(0.5).setDepth(4);
                (this.player_icons[0] as Phaser.GameObjects.Sprite).play('witch_idle_animation');

                const shape = this.scene.make.graphics({
                    x: p0_button.x,
                    y: p0_button.y,
                    add: false
                });
                shape.fillStyle(0xffffff);
                shape.arc(0, 0, 29, 0, Math.PI*2);
                shape.fillPath().setDepth(6);
                this.player_icons[1] = shape;
                //let debug = this.scene.add.circle(p0_button.x, p0_button.y, 31, 0x6666ff).setDepth(6)
                
                let mask = shape.createGeometryMask();
                (this.player_icons[0] as Phaser.GameObjects.Sprite).mask = mask;

            } else { this.printError("createHighlights: could not generate player animation"); }

            //create animated opponent icon
            let opponent_anim = this.scene.anims.create({
                key: 'wizard_idle_animation',
                frames: this.scene.anims.generateFrameNumbers('purple_wizard', {frames: [0, 1, 2, 3, 4, 5, 6, 7]}),
                frameRate: 6,
                repeat: -1
                
            })
            if(opponent_anim !== false) { 
                this.player_icons[2] = this.scene.add.sprite(p1_button.x - 5, p1_button.y - 38, 'purple_wizard').setScale(0.95).setOrigin(0.5).setDepth(4);
                (this.player_icons[2] as Phaser.GameObjects.Sprite).play('wizard_idle_animation').toggleFlipX();

                const shape = this.scene.make.graphics({
                    x: p1_button.x,
                    y: p1_button.y,
                    add: false
                });
                shape.fillStyle(0xffffff);
                shape.arc(0, 0, 29, 0, Math.PI*2);
                shape.fillPath().setDepth(6);
                this.player_icons[3] = shape;
                //let debug = this.scene.add.circle(p0_button.x, p0_button.y, 31, 0x6666ff).setDepth(6)
                
                let mask = shape.createGeometryMask();
                (this.player_icons[2] as Phaser.GameObjects.Sprite).mask = mask;

            } else { this.printError("createHighlights: could not generate player animation"); }
        }
    }

    /**
     * symmetry move button
     */
    private createReactiveElements() {
        this.switch_button = new Simple_Button(this.scene , this.scene.renderer.width/2, this.scene.renderer.height/2, "ui_swap_btn", () => {
            this.encapsulateDoMove(this.game.getCurrent(1), true);
        }).setScale(0.14);

        this.environment_panel = new EnvironmentPanel(this.scene, this.scene.renderer.width/2, this.scene.renderer.height - 100, this.game, this, true, 1);

        this.movable_environment_panel = new EnvironmentPanel(this.scene, 0, 0, this.game, this, false, 0.7).makeInvisible();
        
        (this.scene as BaseScene).background.on('pointerdown', () => {
            this.movable_environment_panel.disable();
            this.movable_environment_panel.makeInvisible()
            this.movable_environment_panel.update();
            (this.scene as BaseScene).background.disableInteractive()
        })
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
     * gets the current position, calculates the next moves and makes the buttons pulsate until they are clicked
     */
    pulsateNextMoveButtons() {
        if(this.game_initialized && this.game.getPlay().length > 0) {
            let possibleMoves = this.game.possibleMoves(undefined, true);
            let tmp: string[] = [];
            possibleMoves.forEach((entry) => {
                tmp.push(entry.process1);
            })

            //get unique processes
            let button_captions = tmp.filter((item, index, array) => (array.indexOf(item) === index))
            let buttons = []
            let scale = 1;
            //add tween for each button
            for(let i = 0; i < button_captions.length; i++) {
                let button = this.stateBtns.get(button_captions[i]);
                if(button !== undefined) {
                    scale = button.scale
                    this.scene.tweens.add({
                        targets: button,
                        duration: 700,
                        scale: scale + 0.1,
                        ease: Phaser.Math.Easing.Quadratic.InOut,
                        yoyo: true,
                        loop: -1,
                    })
                } else {
                    this.printError("pulsateNextMoveButtons: could not get button from label: " + button_captions[i])
                }
            }

            let listener = this.scene.events.on('clickedLtsButton', () => {
                console.log("test")
                let tweens = this.scene.tweens.getAllTweens();
                let pulse_tweens = tweens.filter(tween => tween.targets[0] instanceof LtsStateButton);
                console.log(pulse_tweens.length)
                for(let i = 0; i < pulse_tweens.length; i++) {
                    let button = pulse_tweens[i].targets[0];
                    pulse_tweens[i].complete();
                    (button as LtsStateButton).setScale(scale)
                }
                this.scene.events.off('clickedLtsButton')
                this.pulsateNextMoveButtons()
            })
        }
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

            //player 1 is in right side lts
            if(cur0_btn.x > this.scene.renderer.width/2) {
                (this.player_icons[0] as Phaser.GameObjects.Sprite).setPosition(cur0_btn.x - 1, cur0_btn.y + 15);
                (this.player_icons[2] as Phaser.GameObjects.Sprite).setPosition(cur1_btn.x + 5, cur1_btn.y - 38);
            } else {
                (this.player_icons[0] as Phaser.GameObjects.Sprite).setPosition(cur0_btn.x + 1, cur0_btn.y + 15);
                (this.player_icons[2] as Phaser.GameObjects.Sprite).setPosition(cur1_btn.x - 5, cur1_btn.y - 38);
            }
            
            (this.player_icons[1] as Phaser.GameObjects.Sprite).setPosition(cur0_btn.x , cur0_btn.y);
            (this.player_icons[3] as Phaser.GameObjects.Sprite).setPosition(cur1_btn.x , cur1_btn.y);
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

