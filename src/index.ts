import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/Game';

export const game = new Phaser.Game(
  //Object.assign(config, {scene: [GameScene]})
  config
);

