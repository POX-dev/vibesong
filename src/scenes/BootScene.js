import * as Phaser from '/node_modules/phaser/dist/phaser.esm.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.bitmapFont('pixelFont', 'https://labs.phaser.io/assets/fonts/bitmap/desyrel.png', 'https://labs.phaser.io/assets/fonts/bitmap/desyrel.xml');
    this.load.tilemapTiledJSON('level', 'assets/level.json');
  }

  create() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 2, 2);
    graphics.generateTexture('pixel', 2, 2);
    graphics.clear();

    const tileSize = 32;
    const width = tileSize * 5;
    const height = tileSize;

    // Floor tile
    graphics.fillStyle(0x1f1733, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.lineStyle(2, 0xf0e7ff, 0.18);
    graphics.strokeRect(2, 2, tileSize - 4, tileSize - 4);

    // Platform tile
    graphics.fillStyle(0x513d7a, 1);
    graphics.fillRect(tileSize, 0, tileSize, tileSize);
    graphics.strokeRect(tileSize + 2, 2, tileSize - 4, tileSize - 4);

    // Hazard tile
    graphics.fillStyle(0xe2605c, 1);
    graphics.fillRect(tileSize * 2, 0, tileSize, tileSize);
    graphics.lineStyle(2, 0xffffff, 0.8);
    for (let i = 0; i < 5; i += 1) {
      graphics.beginPath();
      graphics.moveTo(tileSize * 2 + 4 + i * 6, tileSize - 4);
      graphics.lineTo(tileSize * 2 + 8 + i * 6, tileSize / 2);
      graphics.lineTo(tileSize * 2 + 12 + i * 6, tileSize - 4);
      graphics.closePath();
      graphics.strokePath();
    }

    // Door tile
    graphics.fillStyle(0x5f47a8, 1);
    graphics.fillRect(tileSize * 3, 0, tileSize, tileSize);
    graphics.fillStyle(0xfff3a3, 1);
    graphics.fillRect(tileSize * 3 + 10, 8, 12, 16);
    graphics.lineStyle(2, 0x94e7ff, 0.22);
    graphics.strokeRect(tileSize * 3 + 1, 1, tileSize - 2, tileSize - 2);

    // Decorative silk tile
    graphics.fillStyle(0x8f6ce7, 1);
    graphics.fillRect(tileSize * 4, 0, tileSize, tileSize);
    graphics.lineStyle(2, 0xffffff, 0.12);
    graphics.strokeRect(tileSize * 4 + 1, 1, tileSize - 2, tileSize - 2);

    graphics.generateTexture('tiles', width, height);
    graphics.destroy();

    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
