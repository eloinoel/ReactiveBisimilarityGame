import Phaser, { Scene } from 'phaser';
import { Constants } from './utils/Constants';
import MainMenuScene from './scenes/MainMenu'
import PreloadScene from './scenes/Preloader'
import DemoScene from './scenes/DemoLevel';

// Aspect Ratio 16:9
const MAX_WIDTH = 4096 //1920
const MAX_HEIGHT = 2304 //1080
const MIN_WIDTH = 480
const MIN_HEIGHT = 270 
const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 720


export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: Constants.COLORPACK_1.black,

  scale: {
    mode: Phaser.Scale.NONE, //Set to FIT otherwise if scaling of game objects doesnt work properly
    //Game size
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min : {
      width: MIN_WIDTH,
      height: MIN_HEIGHT
    },
    max: {
      width: MAX_WIDTH,
      height: MAX_HEIGHT
    }, 
    
    zoom: 1
  },
  dom: {
    createContainer: true
  },
  scene: [/*PreloadScene, MainMenuScene,*/ DemoScene],
  render: {
    //pixelArt: true,
    //antialias: false,
  }
};
