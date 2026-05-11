import * as Phaser from '/node_modules/phaser/dist/phaser.esm.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    this.healthText = this.add.text(22, 18, 'Health: 6', { font: '20px Inter', fill: '#ffffff' });
    this.silkText = this.add.text(22, 46, 'Silk: 50', { font: '20px Inter', fill: '#94e7ff' });
    this.roomText = this.add.text(22, 74, 'Room: Paleblooms Hollow', { font: '18px Inter', fill: '#d3d3d3' });
    this.tipText = this.add.text(22, 100, 'Attack enemies to gain silk. Dash consumes silk.', { font: '14px Inter', fill: '#aaaaaa' });
    this.events.on('update-status', this.updateStatus, this);
    this.events.on('update-room', this.updateRoom, this);
  }

  updateStatus(health, silk) {
    this.healthText.setText(`Health: ${health}`);
    this.silkText.setText(`Silk: ${silk}`);
  }

  updateRoom(roomName) {
    this.roomText.setText(`Room: ${roomName}`);
  }
}
