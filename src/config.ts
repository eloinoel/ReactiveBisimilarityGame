import Phaser, { Scene } from 'phaser';

import GameScene from './scenes/Game'
import PreloadScene from './scenes/Preloader'


// Aspect Ratio 16:9
const MAX_WIDTH = 4096 //1920
const MAX_HEIGHT = 2304 //1080
const MIN_WIDTH = 480
const MIN_HEIGHT = 270 
const DEFAULT_WIDTH = 960
const DEFAULT_HEIGHT = 540

export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#33A5E7',

  

  scale: {
    mode: Phaser.Scale.ENVELOP, //Set to FIT otherwise if scaling of game objects doesnt work properly
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
  scene: [PreloadScene, GameScene]
};
