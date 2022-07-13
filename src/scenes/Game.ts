import Phaser from 'phaser';

export default class Game extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  /* preload function to add music and pictures into memory */
  preload() {
    this.load.image('logo', 'assets/phaser3-logo.png');
  }

  /* create function is used to add the objects to the game */
  create() {

    const logo = this.add.image(400, 70, 'logo');

    this.tweens.add({
      targets: logo,
      y: 350,
      duration: 1500,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  /* update function is a loop that runs constantly */
  update(time: number, delta: number): void {
      
  }
}
