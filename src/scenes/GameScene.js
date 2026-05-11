import * as Phaser from '/node_modules/phaser/dist/phaser.esm.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.roomIndex = 0;
    this.currentRoom = null;
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b1322');
    this.createPlayer();
    this.createRoom();
    this.createTilemap();
    this.createControls();
    this.createEnemies();
    this.createParticles();

    this.currentRoom = this.getRoomName();
    this.events.on('wake', this.onWake, this);
    this.scene.get('UIScene').events.emit('update-status', this.player.health, this.player.silk, this.currentRoom);
    this.scene.get('UIScene').events.emit('update-room', this.currentRoom);
  }

  createRoom() {
    this.add.rectangle(480, 320, 960, 640, 0x100c1e);
    this.add.circle(220, 120, 90, 0x8f6ce7, 0.12);
    this.add.circle(760, 100, 80, 0xc3a8ff, 0.08);
    this.add.line(0, 80, 80, 120, 320, 240, 0x845add, 0.18).setOrigin(0);
    this.add.line(0, 0, 700, 60, 940, 200, 0xa686ff, 0.14).setOrigin(0);
    this.add.line(0, 0, 160, 580, 340, 360, 0xffc6f7, 0.1).setOrigin(0);
  }

  createTilemap() {
    const map = this.make.tilemap({ key: 'level' });
    const tileset = map.addTilesetImage('tiles', 'tiles', 32, 32, 0, 0);
    this.groundLayer = map.createLayer('Ground', tileset, 0, 0);
    this.groundLayer.setCollision([1, 2, 3]);
    this.groundLayer.setTileIndexCallback(3, this.onPlayerHitHazard, this);
    this.groundLayer.setTileIndexCallback(4, this.enterDoor, this);
    this.physics.add.collider(this.player, this.groundLayer);
  }

  createPlayer() {
    this.player = this.physics.add.sprite(140, 540, null).setSize(32, 44).setOffset(0, 0);
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setMaxVelocity(420, 950);
    this.player.health = 6;
    this.player.silk = 50;
    this.player.facing = 'right';
    this.player.canDash = true;
    this.player.isDashing = false;
    this.player.isAttacking = false;
    this.player.jumpCount = 0;

    this.playerShadow = this.add.ellipse(0, 0, 42, 14, 0x000000, 0.18).setDepth(2);
    const cloak = this.add.triangle(0, 8, -18, -12, 18, -12, 0, 24, 0x9a6cff).setAlpha(0.8);
    const body = this.add.rectangle(0, 0, 28, 36, 0xe9f0ff).setOrigin(0.5);
    const head = this.add.ellipse(0, -14, 24, 20, 0xf8f9ff).setOrigin(0.5);
    const hornLeft = this.add.triangle(-10, -28, -16, -42, -4, -36, 0xf4f6ff);
    const hornRight = this.add.triangle(10, -28, 4, -42, 16, -36, 0xf4f6ff);
    this.playerBody = body;
    this.playerDraw = this.add.container(0, 0, [cloak, body, head, hornLeft, hornRight]).setDepth(5);

    this.attackFX = this.add.triangle(0, 0, 0, -10, 42, 0, 0, 10, 0x9bf0ff, 0.8).setOrigin(0, 0.5).setDepth(6).setAlpha(0);
  }

  createControls() {
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.Z,
      dash: Phaser.Input.Keyboard.KeyCodes.C,
      attack: Phaser.Input.Keyboard.KeyCodes.X,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
    });
  }

  createEnemies() {
    this.enemies = this.physics.add.group();
    this.spawnEnemy(620, 560, 140, 760);
    this.spawnEnemy(760, 160, 680, 840);
    this.physics.add.collider(this.enemies, this.groundLayer);
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);
  }

  createParticles() {
    this.emitter = this.add.particles('pixel', {
      x: 0,
      y: 0,
      speed: { min: -30, max: 30 },
      lifespan: 420,
      alpha: { start: 0.85, end: 0 },
      tint: [0xd7a7ff, 0xa2f0ff],
      scale: { start: 0.18, end: 0 },
      quantity: 0,
      blendMode: 'ADD',
    });
  }

  spawnEnemy(x, y, leftBound, rightBound) {
    const enemy = this.enemies.create(x, y, null).setSize(30, 30).setOffset(0, 0);
    enemy.body.setGravityY(1400);
    enemy.body.setCollideWorldBounds(true);
    enemy.minX = leftBound;
    enemy.maxX = rightBound;
    enemy.direction = -1;
    enemy.health = 2;
    enemy.setBounceX(1);
    return enemy;
  }

  onPlayerHit(player, enemy) {
    if (this.player.isAttacking) {
      enemy.health -= 1;
      enemy.setVelocityX((enemy.x < player.x ? -1 : 1) * 260);
      if (enemy.health <= 0) {
        enemy.disableBody(true, true);
      }
      this.player.silk = Phaser.Math.Clamp(this.player.silk + 8, 0, 100);
      this.scene.get('UIScene').events.emit('update-status', this.player.health, this.player.silk, this.getRoomName());
      return;
    }

    if (this.player.takeDamageCooldown) {
      return;
    }

    this.player.health -= 1;
    this.player.takeDamageCooldown = true;
    this.time.delayedCall(400, () => { this.player.takeDamageCooldown = false; });
    this.player.setVelocityY(-260);
    this.scene.get('UIScene').events.emit('update-status', this.player.health, this.player.silk, this.getRoomName());
    if (this.player.health <= 0) {
      this.respawn();
    }
  }

  onPlayerHitHazard(player, hazard) {
    if (!this.player.takeDamageCooldown) {
      this.player.health -= 1;
      this.player.takeDamageCooldown = true;
      this.time.delayedCall(400, () => { this.player.takeDamageCooldown = false; });
      this.player.setVelocityY(-320);
      this.scene.get('UIScene').events.emit('update-status', this.player.health, this.player.silk, this.getRoomName());
      if (this.player.health <= 0) {
        this.respawn();
      }
    }
  }

  enterDoor() {
    this.roomIndex = (this.roomIndex + 1) % 2;
    this.resetRoom();
  }

  resetRoom() {
    this.player.x = 140;
    this.player.y = 540;
    this.player.setVelocity(0, 0);
    this.player.health = Math.max(1, this.player.health);
    this.player.silk = Math.min(100, this.player.silk + 10);
    this.enemies.children.iterate(enemy => {
      if (enemy.active) {
        enemy.destroy();
      }
    });
    this.enemies.clear(true, true);
    this.createEnemies();
    this.scene.get('UIScene').events.emit('update-status', this.player.health, this.player.silk, this.getRoomName());
  }

  respawn() {
    this.player.health = 6;
    this.player.silk = 0;
    this.resetRoom();
  }

  getRoomName() {
    return this.roomIndex === 0 ? 'Paleblooms Hollow' : 'Silkglade Depths';
  }

  onWake() {
    this.scene.get('UIScene').events.emit('update-status', this.player.health, this.player.silk, this.getRoomName());
  }

  update(time) {
    this.updatePlayer();
    this.updateEnemies();
    this.updateDraw();
    const roomName = this.getRoomName();
    if (roomName !== this.currentRoom) {
      this.currentRoom = roomName;
      this.scene.get('UIScene').events.emit('update-room', roomName);
    }
  }

  updatePlayer() {
    const onGround = this.player.body.onFloor();
    const onWall = this.player.body.blocked.left || this.player.body.blocked.right;
    const left = this.keys.left.isDown;
    const right = this.keys.right.isDown;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.keys.up);
    const dashPressed = Phaser.Input.Keyboard.JustDown(this.keys.dash);
    const attackPressed = Phaser.Input.Keyboard.JustDown(this.keys.attack);

    let velocityX = 0;
    if (left) velocityX = -260;
    if (right) velocityX = 260;
    if (!this.player.isDashing) {
      this.player.setVelocityX(velocityX);
    }

    if (velocityX !== 0) {
      this.player.facing = velocityX < 0 ? 'left' : 'right';
    }

    if (jumpPressed) {
      if (onGround || this.player.jumpCount < 1 || onWall) {
        this.player.setVelocityY(-520);
        this.player.jumpCount += onGround ? 0 : 1;
        if (onWall) {
          this.player.setVelocityX(this.player.facing === 'left' ? 260 : -260);
        }
      }
    }

    if (dashPressed && this.player.canDash && this.player.silk >= 12) {
      this.player.canDash = false;
      this.player.isDashing = true;
      this.player.silk = Math.max(0, this.player.silk - 12);
      this.scene.get('UIScene').events.emit('update-status', this.player.health, this.player.silk, this.getRoomName());
      const dashSpeed = this.player.facing === 'left' ? -650 : 650;
      this.player.setVelocityX(dashSpeed);
      this.player.setAccelerationY(0);
      this.time.delayedCall(170, () => {
        this.player.isDashing = false;
      });
      this.time.delayedCall(500, () => {
        this.player.canDash = true;
      });
    }

    if (attackPressed && !this.player.isAttacking) {
      this.player.isAttacking = true;
      this.time.delayedCall(220, () => { this.player.isAttacking = false; });
      this.showAttackFX();
      this.punchHit();
    }

    if (this.keys.restart.isDown) {
      this.respawn();
    }
  }

  punchHit() {
    const hitbox = new Phaser.Geom.Rectangle(
      this.player.x + (this.player.facing === 'right' ? 22 : -54),
      this.player.y - 16,
      48,
      32,
    );
    this.enemies.children.iterate(enemy => {
      if (enemy.active && Phaser.Geom.Rectangle.Overlaps(hitbox, enemy.getBounds())) {
        this.onPlayerHit(this.player, enemy);
      }
    });
  }

  showAttackFX() {
    const offsetX = this.player.facing === 'right' ? 24 : -24;
    this.attackFX.setPosition(this.player.x + offsetX, this.player.y);
    this.attackFX.setScale(this.player.facing === 'right' ? 1 : -1, 1);
    this.attackFX.setAlpha(1);
    this.tweens.killTweensOf(this.attackFX);
    this.tweens.add({
      targets: this.attackFX,
      alpha: 0,
      duration: 180,
      ease: 'Cubic.Out',
    });
  }

  updateEnemies() {
    this.enemies.children.iterate(enemy => {
      if (!enemy.active) return;
      if (enemy.body.blocked.left) {
        enemy.direction = 1;
      }
      if (enemy.body.blocked.right) {
        enemy.direction = -1;
      }
      enemy.setVelocityX(enemy.direction * 80);
    });
  }

  updateDraw() {
    this.playerDraw.x = this.player.x;
    this.playerDraw.y = this.player.y;
    this.playerDraw.setScale(this.player.isDashing ? 1.05 : 1);
    this.playerBody.fillColor = this.player.takeDamageCooldown ? 0xff7b7b : 0xe9f0ff;
    this.playerShadow.x = this.player.x;
    this.playerShadow.y = this.player.y + 28;
    this.playerShadow.setAlpha(this.player.isDashing ? 0.3 : 0.18);

    this.enemies.children.iterate(enemy => {
      if (enemy.active && !enemy.drawn) {
        const body = this.add.ellipse(0, 0, 30, 24, 0xc5749d);
        const eye = this.add.circle(6, -2, 4, 0xffffff);
        enemy.drawn = this.add.container(enemy.x, enemy.y, [body, eye]).setDepth(3);
      }
      if (enemy.drawn) {
        enemy.drawn.x = enemy.x;
        enemy.drawn.y = enemy.y;
      }
    });
  }
}
