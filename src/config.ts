import Phaser from 'phaser';
import { Constants } from './utils/Constants';
import MainMenuScene from './scenes/MainMenu'
import PreloaderScene from './scenes/Preloader'
import DemoScene from './scenes/DemoLevel';
import ParallaxScene from './scenes/Parallax'
import LevelMapScene from './scenes/LevelMap'
import GUIScene from './scenes/GUIScene';
import Level1 from './scenes/SimulationLevels/Level1';
import Level2 from './scenes/SimulationLevels/Level2';
import Level3 from './scenes/SimulationLevels/Level3';
import Level4 from './scenes/SimulationLevels/Level4';
import Level5 from './scenes/BisimulationLevels/Level5';
import Level6 from './scenes/BisimulationLevels/Level6';
import Level7 from './scenes/BisimulationLevels/Level7';


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
  scene: [PreloaderScene, ParallaxScene,  MainMenuScene, LevelMapScene, DemoScene, Level1, Level2 , Level3, Level4, Level5, Level6, Level7, GUIScene],
  render: {
    //pixelArt: true,
    //antialias: false,
  }
};
