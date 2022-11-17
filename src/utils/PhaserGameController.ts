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
    private transitionObjects: Map<string, Phaser.GameObjects.Container>;
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
    private last_clicked_process!: string; //for environment selection panel highlights

    private num_moves_for_stars: number[];  //contains the number of moves needed for 2 or 3 stars 
    private num_moves: number; //the number of moves a player currently made

    private nextProcessAfterTimeout: string;    //used to call doMove after environmentPanel was set for timeout actions

    private replayPulseTween!: Phaser.Tweens.Tween;
    private pulsateNextMoves: boolean;    //for tutorial level 1.1

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
        this.transitionObjects = new Map<string, Phaser.GameObjects.Container>();
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
        this.pulsateNextMoves = false;
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
            let transition;
            if(p0 === p1 && (action === "a" || action === "c")) {
                transition = new Transition(this.scene, p0_button.x, p0_button.y, p1_button.x, p1_button.y, "arrow_tail", "arrow_middle", "arrow_head", action, 0.2, 75);
            } else {
                transition = new FixedLengthTransition(this.scene, p0_button.x, p0_button.y, p1_button.x, p1_button.y, action, 1)
            }
            this.transitionObjects.set("".concat(p0, action, p1), transition);

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
            this.resetEnvironmentSelectionHighlighting()
            //revert any changes made to the environment by timeout action
            if(this.movable_environment_panel.isEnabled()) {
                this.movable_environment_panel.disable();
                this.movable_environment_panel.makeInvisible()

            }

            let edgeLabel = this.game.lts.getActionBetweenTwoProcesses(cur_pos.process1, next_process);
            //timeout action, can only occur in these node types
            if((cur_pos instanceof AttackerNode || RestrictedAttackerNode) && !isSymmetryMove && edgeLabel !== undefined && edgeLabel === Constants.TIMEOUT_ACTION) {
                this.last_clicked_process = next_process;

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
                    this.movable_environment_panel.enable();
                    this.movable_environment_panel.setPanelPosition(center)
                    this.movable_environment_panel.makeVisible();
                    (this.scene as BaseScene).background.setInteractive()
                    this.highlightEnvironmentSelectionEffect(new Set(this.movable_environment_panel.getActiveActions()))
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
            //attacker did a move, update counter
            this.num_moves++;

            if(isSymmetryMove) {
                (this.player_icons[0] as Phaser.GameObjects.Sprite).toggleFlipX();
                (this.player_icons[2] as Phaser.GameObjects.Sprite).toggleFlipX();
                this.scene.events.emit('clickedSymmetryButton')
                this.updateVisualsAfterMove()
                return 0;
            }

            //update visuals
            this.updateVisualsAfterMove()
            this.spellAnimation(action, cur_pos, next_position[0]);



            cur_pos = this.game.getPlay()[this.game.getPlay().length - 1];
            moves = this.game.possibleMoves(undefined, true);


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
                    this.scene.time.delayedCall(500, () => {
                        if(defender_move !== undefined) {
                            this.spellAnimation((cur_pos as SimulationDefenderNode).previousAction, cur_pos, defender_move);
                            let return_code = this.game.performMove((cur_pos as SimulationDefenderNode).previousAction, defender_move);
                            if(return_code === -1) {
                                this.printError("doMove: Could not execute move the defender AI said to be possible: " + defender_move.toString());
                            } else {
                                this.updateVisualsAfterMove()
                                moves = this.game.possibleMoves(undefined, true);
                                //should only occur in simulation game because there is always a symmetry move in bisimilar games
                                if(moves.length === 0) {
                                    this.launchEndScreen(false);
                                } else {
                                    //after defender made move, highlight possible moves for attacker
                                    if(this.pulsateNextMoves) {
                                        this.pulsateNextMoveButtons();
                                    }
                                }
                            }
                        } else {
                            this.printError("doMove: defender_move is undefined");
                        }
                    })
                }

            //Attackers Turn, only reachable after symmetry move
            } else {
                
                //TODO: detect symmetry move loop with bfs
                if(false) {
                    this.launchEndScreen(false)
                }
                
            }
            if(!isSymmetryMove) {
                this.scene.events.emit('clickedLtsButton')  //pulsateNextMovesButtons
                this.scene.events.emit('clickedButton', this.stateBtns.get(next_process)) //Level 3.1 pulsate timeout button
            }
            return 0
        }
        return 1;
    }

    /**
     * displays an animation when a move is performed
     * @param action 
     * @param cur_pos 
     * @param next_pos 
     * @returns 
     */
    private spellAnimation(action: string, cur_pos: GamePosition, next_pos: GamePosition) {
        let c: Phaser.Math.Vector2;
        let src;
        let dest;
        let anim_angle: number = 0;
        let same_btn = false;

        //get position, angle and type of animation
        if((cur_pos instanceof AttackerNode || cur_pos instanceof RestrictedAttackerNode) && !(next_pos instanceof AttackerNode || next_pos instanceof RestrictedAttackerNode)) {
            //same source and destination
            if(cur_pos.process1 === next_pos.process1) {
                src = this.stateBtns.get(cur_pos.process1);
                if(src === undefined) {
                    this.printError("spellAnimation: button not found")
                    return;
                }
                c = new Phaser.Math.Vector2(src.x, src.y);
                anim_angle = 0;
                same_btn = true;
            } else {
                src = this.stateBtns.get(cur_pos.process1);
                dest = this.stateBtns.get(next_pos.process1);
                if(src === undefined || dest === undefined) {
                    this.printError("spellAnimation: buttons not found")
                    return;
                }
                let vec = new Phaser.Math.Vector2(dest.x - src.x, dest.y - src.y);
                c = new Phaser.Math.Vector2(src.x, src.y).add(vec.clone().scale(0.5)); 
                anim_angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Normalize(vec.angle()));
            }
        //defender makes a move
        } else if(cur_pos instanceof SimulationDefenderNode || cur_pos instanceof RestrictedSimulationDefenderNode) {
            //same source and destination
            if(cur_pos.process2 === next_pos.process2) {
                src = this.stateBtns.get(cur_pos.process2);
                if(src === undefined) {
                    this.printError("spellAnimation: button not found")
                    return;
                }
                c = new Phaser.Math.Vector2(src.x, src.y);
                anim_angle = 0;
                same_btn = true;
            } else {
                src = this.stateBtns.get(cur_pos.process2);
                dest = this.stateBtns.get(next_pos.process2);
                if(src === undefined || dest === undefined) {
                    this.printError("spellAnimation: buttons not found")
                    return;
                }
                let vec = new Phaser.Math.Vector2(dest.x - src.x, dest.y - src.y);
                c = new Phaser.Math.Vector2(src.x, src.y).add(vec.clone().scale(0.5)); 
                anim_angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Normalize(vec.angle()))
            }
        } else {
            //symmetry move
            return
        }

        
        //play correct animation according to action
        switch(action) {
            case "a":
            	if(!same_btn) {
                    let fire_anim = this.scene.anims.create({
                        key: 'fireball_anim',
                        frames: this.scene.anims.generateFrameNumbers('fireball_vfx', {frames: [0, 1, 2, 3]}),
                        frameRate: 20,
                        repeat: -1
                    })
                    if(fire_anim !== false) {
                        let fireball = this.scene.add.sprite(src.x, src.y, 'fireball_vfx').setScale(1.8).setOrigin(0.5).setDepth(1).setAngle(anim_angle);
                        fireball.play('fireball_anim')
    
                        this.scene.tweens.add({
                            targets: fireball,
                            x: dest?.x,
                            y: dest?.y,
                            ease: Phaser.Math.Easing.Quadratic.In,
                            duration: 500,
                            onComplete: () => {
                                fireball.destroy();
                            }
                        })
                    } else {
                        this.printError("spellAnimation: fire animation undefined")
                        return;
                    }
                }
                break;
            case "b":
                if(!same_btn) {
                    let water_anim = this.scene.anims.create({
                        key: 'waterball_anim',
                        frames: this.scene.anims.generateFrameNumbers('waterball_vfx', {frames: [5, 6, 7, 8, 9]}),
                        frameRate: 20,
                        repeat: -1
                    })
                    if(water_anim !== false) {
                        let waterball = this.scene.add.sprite(src.x, src.y, 'waterball_vfx', 5).setScale(1.1).setOrigin(0.5).setDepth(1).setAngle(anim_angle);
                        waterball.play('waterball_anim')
    
                        this.scene.tweens.add({
                            targets: waterball,
                            x: dest?.x,
                            y: dest?.y,
                            ease: Phaser.Math.Easing.Quadratic.In,
                            duration: 500,
                            onComplete: () => {
                                waterball.destroy();
                            }
                        })
                    } else {
                        this.printError("spellAnimation: water animation undefined")
                        return;
                    }
                } else {
                    let water_anim = this.scene.anims.create({
                        key: 'waterball_anim',
                        frames: this.scene.anims.generateFrameNumbers('waterball_vfx', {frames: [5, 6, 7, 8, 9]}),
                        frameRate: 20,
                        repeat: -1
                    })
                    if(water_anim !== false) {
                        let waterball = this.scene.add.sprite(src.x, src.y, 'waterball_vfx', 5).setScale(1.1).setOrigin(0.5).setDepth(1).setAngle(anim_angle);
                        waterball.play('waterball_anim');

                        let circular_path = new Phaser.Curves.Path();
                        circular_path.add(new Phaser.Curves.Ellipse(waterball.x - 40, waterball.y, 50, 30))
    
                        let param = {t: 0, vec: new Phaser.Math.Vector2()};
                        this.scene.tweens.add({
                            targets: param,
                            t: 1,
                            onUpdate: () => {
                                circular_path.getPoint(param.t, param.vec)
                                waterball.x = param.vec.x
                                waterball.y = param.vec.y
                                waterball.angle = Phaser.Math.RadToDeg((Phaser.Math.PI2) * param.t) + 90
                            },
                            duration: 500,
                            onComplete: () => {
                                waterball.destroy();
                            }
                        })
                    } else {
                        this.printError("spellAnimation: water animation undefined")
                        return;
                    }
                }
                break;
            case "c":
                if(!same_btn) {
                    let spell_anim = this.scene.anims.create({
                        key: 'plant_anim',
                        frames: this.scene.anims.generateFrameNumbers('windplant_vfx', {frames: [0, 1, 2, 3, 4, 5]}),
                        frameRate: 30,
                        repeat: -1
                    })
                    if(spell_anim !== false) {
                        let spell = this.scene.add.sprite(src.x, src.y, 'windplant_vfx', 0).setScale(1.5).setOrigin(0.5).setDepth(1).setAngle(anim_angle);
                        spell.play('plant_anim')
    
                        this.scene.tweens.add({
                            targets: spell,
                            x: dest?.x,
                            y: dest?.y,
                            ease: Phaser.Math.Easing.Quadratic.In,
                            duration: 500,
                            onComplete: () => {
                                spell.destroy();
                            }
                        })
                    } else {
                        this.printError("spellAnimation: plant animation undefined")
                        return;
                    }
                }
                break;
            case Constants.TIMEOUT_ACTION:
                if(!same_btn) {
                    let spell_anim = this.scene.anims.create({
                        key: 'thunder_anim',
                        frames: this.scene.anims.generateFrameNumbers('thunder_vfx', {frames: [2, 3,  4, 5, 6, 7, 8, 9, 10, 11, 12]}),
                        frameRate: 15,
                        //repeat: -1
                    })

                    if(spell_anim !== false) {
                        let vec = new Phaser.Math.Vector2((dest as LtsStateButton).x - src.x, (dest as LtsStateButton).y - src.y);
                        c = new Phaser.Math.Vector2(src.x, src.y).add(vec.clone().scale(0.5));
                        anim_angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Normalize(vec.angle() - Phaser.Math.PI2/4 ))
                        let spell = this.scene.add.sprite(c.x, c.y, 'thunder_vfx').setScale(2.2).setOrigin(0.5).setDepth(1).setAngle(anim_angle);
                        spell.scaleY = vec.length() / spell.height;
                        spell.scaleX = 0.9;
                        
                        spell.play('thunder_anim')
                        this.scene.time.delayedCall(3000, () => {spell.destroy()})
                    } else {
                        this.printError("spellAnimation: timeout animation undefined")
                        return;
                    }
                }
                break;
            case Constants.HIDDEN_ACTION:
                if(!same_btn) {
                    let spell_anim = this.scene.anims.create({
                        key: 'dark_anim',
                        frames: this.scene.anims.generateFrameNumbers('dark_vfx', {frames: [0, 1, 2, 3, 4, 5]}),
                        frameRate: 12,
                        //repeat: -1
                    })
                    if(spell_anim !== false) {
                        let spell = this.scene.add.sprite(c.x, c.y, 'dark_vfx').setScale(2.4).setOrigin(0.5).setDepth(1).setAngle(anim_angle);

                        spell.play('dark_anim')
                    } else {
                        this.printError("spellAnimation: hidden animation undefined")
                        return;
                    }
                }
                break;
            default:
                this.printError("spellAnimation: unknown action")
                return
        }
    }

    /**
     * set localstorage stars, 
     * end screen Popup
     * @param win 
     */
    private launchEndScreen(win: boolean) {
        if(win) {
            let current_level = parseInt(localStorage.getItem("currentLevel") as string);
            //console.log(current_level)
            if(current_level !== undefined && current_level >= 0 && current_level <= 19) {
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
                    if(current_level < 19 && levels[current_level + 1].state === false) {
                        levels[current_level + 1].state = true;
                    }

                    localStorage.setItem("levels", JSON.stringify(levels));
                }

                //grey overlay
                let bg_overlay = this.scene.add.rectangle(this.scene.renderer.width/2, this.scene.renderer.height/2, this.scene.renderer.width + 1, this.scene.renderer.height + 1, 0x000000, 0.7).setOrigin(0.5).setDepth(7).setInteractive();

                //last level
                if(current_level === 19) {
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
                    }, true);
                } else {
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
                }
                
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

    /** TODO:
     * give visual feedback when player selects or deselects actions in the environment selection window
     * @param curProcess 
     * @param clickedProcess 
     * @param environment_selection 
     * @returns 
     */
    highlightEnvironmentSelectionEffect(environment_selection: Set<string>) {
        //console.log("hi")
        let clickedProcess = this.last_clicked_process;
        if(!this.game_initialized) {
            this.printError("hightlightEnvironmentSelectionEffect: game not initialized");
            return;
        }
        //test if timeout action between them
        let curPosition = this.game.getCurrentPosition();
        if(curPosition === undefined || curPosition instanceof SimulationDefenderNode || curPosition instanceof RestrictedSimulationDefenderNode) {
            this.printError("hightlightEnvironmentSelectionEffect: curPosition illegal");
        }

        let curProcess = curPosition!.process1; 
        if(!this.game.lts.hasTransition(curProcess, clickedProcess, Constants.TIMEOUT_ACTION)) {
            this.printError("hightlightEnvironmentSelectionEffect: called method but no timeout action between processes");
            return;
        }

        let env = SetOps.toArray(environment_selection);

        //get all relevant buttons

        //next moves from current
        let generated_moves = this.game.generateMoves(curPosition!, false, environment_selection).filter((position) => (!position.isSymmetryMove(this.game.getCurrentPosition()!)));
        let moves = this.game.possibleMoves(undefined, false, environment_selection).filter((position) => (!position.isSymmetryMove(this.game.getCurrentPosition()!))); //filter out symmetry move
        let possibleMoves = moves.filter((position) => env.includes((position as SimulationDefenderNode).previousAction) || (position as SimulationDefenderNode).previousAction === Constants.HIDDEN_ACTION || ((position as RestrictedSimulationDefenderNode).previousAction === Constants.TIMEOUT_ACTION)); //possible moves for the environment selection
        //let not_possibleMoves = moves.filter((position, index) => !(possibleMoves.find(move => move.process1 === position.process1 && move.process2 === move.process2)) && moves.findIndex(move => move.process1 === position.process1 && move.process2 === position.process2) === index);  //is disjunct with possible moves if two processes only have one edge between them; only one t-move for each two processes
        let not_possibleMoves = generated_moves.filter((position, index) => !(possibleMoves.find(move => move.process1 === position.process1 && move.process2 === move.process2)));

        /* console.log(possibleMoves)
        for(let i = 0; i < possibleMoves.length; i++) {
            if(possibleMoves[i] instanceof RestrictedSimulationDefenderNode) {
                console.log((possibleMoves[i] as RestrictedSimulationDefenderNode).environment)
                console.log(environment_selection)
                console.log(SetOps.areEqual((possibleMoves[i] as RestrictedSimulationDefenderNode).environment, environment_selection))
            }
            
        } //TODO: delete debug*/

        /* console.log(env)
        console.log(generated_moves)
        console.log(possibleMoves)
        console.log(not_possibleMoves) //TODO: delete debug
        console.log(moves) */

        //get objects of not possible moves and gray out
        let buttons = [];
        let edges = [];
        for(let i = 0; i < not_possibleMoves.length; i++) {
            let btn = this.stateBtns.get(not_possibleMoves[i].process1);
            if(btn !== undefined) {
                //buttons.push(btn);
                btn.setAlpha(0.3);
            } else {
                this.printError("hightlightEnvironmentSelectionEffect: undefined statebutton")
            }

            let edge = this.transitionObjects.get("".concat(curProcess, (not_possibleMoves[i] as SimulationDefenderNode).previousAction, not_possibleMoves[i].process1));
            if(edge !== undefined) {
                //edges.push(edge);
                edge.setAlpha(0.3)
            } else {
                this.printError("hightlightEnvironmentSelectionEffect: undefined edge")
            }
        }


        //next moves after timeout
        /* let position_after_timeout = new RestrictedAttackerNode(clickedProcess, curPosition!.process2, environment_selection); //process 2 is wrong but irrelevant
        let future_generated_moves = this.game.generateMoves(position_after_timeout, true, environment_selection).filter((position) => !(position.process2 === clickedProcess));
        let future_possible_moves = this.game.possibleMoves(position_after_timeout, true).filter((position) => !(position.process2 === clickedProcess));
        let future_not_possible_moves = future_generated_moves.filter((position) => !(future_possible_moves.find(move => move.process1 === position.process1)));

        console.log(future_generated_moves)
        console.log(future_possible_moves)
        //get objects of future not possible moves and gray out
        buttons = [];
        edges = []
        for(let i = 0; i < future_not_possible_moves.length; i++) {
            let btn = this.stateBtns.get(future_not_possible_moves[i].process1);
            if(btn !== undefined) {
                //buttons.push(btn);
                btn.setAlpha(0.3);
            } else {
                this.printError("hightlightEnvironmentSelectionEffect: undefined future statebutton")
            }

            let edge = this.transitionObjects.get("".concat(clickedProcess, (future_not_possible_moves[i] as SimulationDefenderNode).previousAction, future_not_possible_moves[i].process1));
            if(edge !== undefined) {
                //edges.push(edge);
                edge.setAlpha(0.3)
            } else {
                this.printError("hightlightEnvironmentSelectionEffect: undefined future edge")
            }
        } */


    }

    resetEnvironmentSelectionHighlighting() {
        if(!this.game_initialized) {
            this.printError("hightlightEnvironmentSelectionEffect: game not initialized");
            return;
        }
        //test if timeout action between them
        let curPosition = this.game.getCurrentPosition();
        if(curPosition === undefined || curPosition instanceof SimulationDefenderNode || curPosition instanceof RestrictedSimulationDefenderNode) {
            this.printError("hightlightEnvironmentSelectionEffect: curPosition illegal");
        }

        let curProcess = curPosition!.process1; 
        /* let adjacent = this.game.lts.getActionsAndDestinations(curProcess);

        for(let i = 0; i < adjacent.length; i++) {
            let btn = this.stateBtns.get(adjacent[i][1]);
            if(btn !== undefined) {
                //buttons.push(btn);
                btn.setAlpha(1);
            } else {
                this.printError("hightlightEnvironmentSelectionEffect: undefined statebutton")
            }

            let edge = this.transitionObjects.get("".concat(curProcess, adjacent[i][0], adjacent[i][1]));
            if(edge !== undefined) {
                //edges.push(edge);
                edge.setAlpha(1)
            } else {
                this.printError("hightlightEnvironmentSelectionEffect: undefined edge")
            }
        } */

        this.stateBtns.forEach(btn => { btn.setAlpha(1) })
        this.transitionObjects.forEach(edge => { edge.setAlpha(1) })


    }

    /************************************* UTILITY AND DEBUG *************************************/


    printAIGraph() {
        if(this.ai_controller !== undefined && this.ai_controller !== null) {
            this.ai_controller.printGraph();
        } else {
            this.printError("printAIGraph: AI not initialized.");
        }
    }

    /* printAttackerShortestPath() {
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
                path_string = path_string.concat("; attacker moves: " + length);
                console.log(path_string);
            } else {
                this.printError("printAttackerShortestPath: path undefined" )
            }
            
        } else {
            this.printError("printAttackerShortestPath: AI not initialized.");
        }
    } */

    printAttackerShortestMinMaxPath() {
        if(this.ai_controller !== undefined && this.ai_controller !== null) {
            let path = this.ai_controller.launchModifiedMinMax();

            if(path !== undefined) {
                let length = 0;
                let path_string = "MiniMaxPath to attacker winning region: ";
                let previous = undefined;   //for detecting symmetry moves
                for(let i = 0; i < path.length; i++) {
                    if(path[i].activePlayer === Player.Defender || (previous === Player.Attacker && path[i].activePlayer === Player.Attacker)) {
                        length++;
                    }
                    previous = path[i].activePlayer;
                    path_string = path_string.concat(path[i].toString() + ", ");
                }
                path_string = path_string.concat("; attacker moves: " + length + "; pathlen: " + (path.length - 1));
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
            case 18:
                return "ReBisim_Level11";
            case 19:
                return "ReBisim_Level12";
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

        //replay btn pulse when in defender winning region
        if(this.ai_controller.getWinningRegionOfPosition() === false && this.replayPulseTween === undefined) {
            let guiscene = this.scene.scene.get('GUIScene');
            let replayBtn = (guiscene as GUIScene).replay_btn;
            let scale = replayBtn.scale;

            this.replayPulseTween = this.scene.tweens.add({
                targets: replayBtn,
                duration: 650,
                scale: scale + 0.18,
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
     * symmetry move button && environment panel
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
            this.resetEnvironmentSelectionHighlighting();
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

            this.scene.events.on('clickedLtsButton', () => {
                let tweens = this.scene.tweens.getAllTweens();
                let pulse_tweens = tweens.filter(tween => tween.targets[0] instanceof LtsStateButton);
                console.log(pulse_tweens.length)
                for(let i = 0; i < pulse_tweens.length; i++) {
                    let button = pulse_tweens[i].targets[0];
                    pulse_tweens[i].complete();
                    (button as LtsStateButton).setScale(scale)
                }
                this.scene.events.off('clickedLtsButton')
                this.pulsateNextMoves = true;
            })
        }
    }

    /**
     * makes the symmetry swap button pulsate until its clicked once
     */
    pulsateSymmetrySwapBtn() {
        if(this.game_initialized && this.switch_button !== undefined) {
            //add tween
            let scale = this.switch_button.scale
            let tween = this.scene.tweens.add({
                targets: this.switch_button,
                duration: 700,
                scale: scale + 0.04,
                ease: Phaser.Math.Easing.Quadratic.InOut,
                yoyo: true,
                loop: -1,
            })

            this.scene.events.on('clickedSymmetryButton', () => {
                tween.complete()
                this.switch_button.setScale(scale);
                this.scene.events.off('clickedSymmetryButton')
            })
        }
    }

    /**
     * pulsate any process button
     * @param process 
     * @returns 
     */
    pulsateProcessBtn(process: string) {
        if(this.game_initialized) {

            let button = this.stateBtns.get(process)
            if(button === undefined) {
                this.printError('pulsateProcessBtn: button ' + process + " not found")
                return;
            }
            //add tween
            let scale = button.scale
            let tween = this.scene.tweens.add({
                targets: button,
                duration: 700,
                scale: scale + 0.1,
                ease: Phaser.Math.Easing.Quadratic.InOut,
                yoyo: true,
                loop: -1,
            })

            this.scene.events.on('clickedButton', () => {
                //console.log('test')
                tween.complete()
                button!.setScale(scale);
                this.scene.events.off('clickedButton')
            }, button)
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

