import * as Phaser from '/node_modules/phaser/dist/phaser.esm.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.bitmapFont('pixelFont', 'https://labs.phaser.io/assets/fonts/bitmap/desyrel.png', 'https://labs.phaser.io/assets/fonts/bitmap/desyrel.xml');
  }

  create() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 2, 2);
    graphics.generateTexture('pixel', 2, 2);
    graphics.destroy();

    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
