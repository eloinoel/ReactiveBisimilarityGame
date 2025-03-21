import Phaser from 'phaser';
import { Constants } from './utils/Constants';
import MainMenuScene from './scenes/MainMenu'
import PreloaderScene from './scenes/Preloader'
import ParallaxScene from './scenes/Parallax'
import LevelMapScene from './scenes/LevelMap'
import GUIScene from './scenes/GUIScene';
import TestScene from './scenes/TestScene';
import CreditsScene from './scenes/CreditsScene';
import Level1_1 from './scenes/SimulationLevels/Level1_1';
import Level1_2 from './scenes/SimulationLevels/Level1_2';
import Level1_3 from './scenes/SimulationLevels/Level1_3';
import Level1_4 from './scenes/SimulationLevels/Level1_4';
import Level2_1 from './scenes/BisimulationLevels/Level2_1';
import Level2_2 from './scenes/BisimulationLevels/Level2_2';
import Level2_3 from './scenes/BisimulationLevels/Level2_3';
import Level2_4 from './scenes/BisimulationLevels/Level2_4';
import Level3_1 from './scenes/ReactiveBisimulationLevels/Level3_1';
import Level3_2 from './scenes/ReactiveBisimulationLevels/Level3_2';
import Level3_3 from './scenes/ReactiveBisimulationLevels/Level3_3';
import Level3_4 from './scenes/ReactiveBisimulationLevels/Level3_4';
import Level3_5 from './scenes/ReactiveBisimulationLevels/Level3_5';
import Level3_6 from './scenes/ReactiveBisimulationLevels/Level3_6';
import Level3_7 from './scenes/ReactiveBisimulationLevels/Level3_7';
import Level3_8 from './scenes/ReactiveBisimulationLevels/Level3_8';
import Level3_9 from './scenes/ReactiveBisimulationLevels/Level3_9';
import Level3_10 from './scenes/ReactiveBisimulationLevels/Level3_10';
import Level3_11 from './scenes/ReactiveBisimulationLevels/Level3_11';
import Level3_12 from './scenes/ReactiveBisimulationLevels/Level3_12';

export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0',

  scale: {
    mode: Phaser.Scale.NONE, //Set to FIT otherwise if scaling of game objects doesnt work properly
    //Game size
    width: Constants.DEFAULT_WIDTH,
    height: Constants.DEFAULT_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min : {
      width: Constants.MIN_WIDTH,
      height: Constants.MIN_HEIGHT
    },
    max: {
      width: Constants.MAX_WIDTH,
      height: Constants.MAX_HEIGHT
    }, 
    
    zoom: 1
  },
  dom: {
    createContainer: true
  },
  scene: [PreloaderScene, ParallaxScene, MainMenuScene, LevelMapScene, CreditsScene, Level1_1, Level1_2,
   Level1_3, Level1_4, Level2_1, Level2_2, Level2_3, Level2_4, Level3_1, Level3_2, Level3_3, Level3_4, Level3_5,
   Level3_6, Level3_7, Level3_8, Level3_9, Level3_10, Level3_11, Level3_12, GUIScene, TestScene],
  render: {
    //pixelArt: true,
    //antialias: false,
  },
};
