import Phaser, { Scene } from 'phaser';
import {game} from './index'

import GameScene from './scenes/Game'
import PreloadScene from './scenes/Preloader'


// Aspect Ratio 16:9
const SCALE_MODE = 'SMOOTH' //FIT or SMOOTH
const MAX_WIDTH = 1920
const MAX_HEIGHT = 1080
/* const MIN_WIDTH = 480
const MIN_HEIGHT = 270 */ //use this with mode: Phaser.Scale.FIT
const DEFAULT_WIDTH = 960
const DEFAULT_HEIGHT = 540

export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#33A5E7',

  

  scale: {
    mode: Phaser.Scale.NONE, //Set to FIT otherwise if scaling of game objects doesnt work properly
    //Game size
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    //autoCenter: Phaser.Scale.CENTER_BOTH,
    /* min : {
      width: MIN_WIDTH,
      height: MIN_HEIGHT
    },
    max: {
      width: MAX_WIDTH,
      height: MAX_HEIGHT
    }, */
    
    zoom: 1
  },
  dom: {
    createContainer: true
  },
  scene: [PreloadScene, GameScene]
};

const resize = () => {
  const w = window.innerWidth
    const h = window.innerHeight

    let width = DEFAULT_WIDTH
    let height = DEFAULT_HEIGHT
    let maxWidth = MAX_WIDTH
    let maxHeight = MAX_HEIGHT
    let scaleMode = SCALE_MODE

    let scale = Math.min(w / width, h / height)
    let newWidth = Math.min(w / scale, maxWidth)
    let newHeight = Math.min(h / scale, maxHeight)

    let defaultRatio = DEFAULT_WIDTH / DEFAULT_HEIGHT
    let maxRatioWidth = MAX_WIDTH / DEFAULT_HEIGHT
    let maxRatioHeight = DEFAULT_WIDTH / MAX_HEIGHT

    // smooth scaling
    let smooth = 1
    if (scaleMode === 'SMOOTH') {
      const maxSmoothScale = 1.15
      const normalize = (value: number, min: number, max: number) => {
        return (value - min) / (max - min)
      }
      if (width / height < w / h) {
        smooth =
          -normalize(newWidth / newHeight, defaultRatio, maxRatioWidth) / (1 / (maxSmoothScale - 1)) + maxSmoothScale
      } else {
        smooth =
          -normalize(newWidth / newHeight, defaultRatio, maxRatioHeight) / (1 / (maxSmoothScale - 1)) + maxSmoothScale
      }
    }

    // resize the game
    game.scale.resize(newWidth * smooth, newHeight * smooth)

    // scale the width and height of the css
    game.canvas.style.width = newWidth * scale + 'px'
    game.canvas.style.height = newHeight * scale + 'px'

    // center the game with css margin
    game.canvas.style.marginTop = `${(h - newHeight * scale) / 2}px`
    game.canvas.style.marginLeft = `${(w - newWidth * scale) / 2}px`
}

window.addEventListener('resize', () => {
  resize();
}) 
