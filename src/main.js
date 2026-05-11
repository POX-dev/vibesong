import * as Phaser from '/node_modules/phaser/dist/phaser.esm.js';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 640,
  backgroundColor: '#0b1322',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1400 },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, UIScene],
};

new Phaser.Game(config);
