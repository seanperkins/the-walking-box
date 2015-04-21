var _ = require('lodash');
var Utilities = require('../utils/utilities');

var timers = {
  shot: 0,
  reload: 0
};

var ammo = 0;

var hudBullets = [];

var reloadNotifier;

var setAmmo = function (count) {
  ammo = count;
  _.each(hudBullets, function(bullet, n) {
    bullet.visible = n < count;
  });
};

var Weapon = function(game, player) {
  reloadNotifier = game.add.text(5, 5, 'RELOADING!!!', {
    fontSize: '14px',
    fill: '#Ff3333'
  });
  reloadNotifier.fixedToCamera = true;
  reloadNotifier.visible = false;

  for (var k = 0; k < this.CLIP_SIZE; k++) {
    var bullet = game.add.sprite(-45, -this.CLIP_SIZE*6+k*12, 'hud-bullet');
    hudBullets.push(bullet);
    player.addChild(bullet);
  }

  setAmmo(this.CLIP_SIZE);
};

Weapon.prototype.constructor = Weapon;

Weapon.prototype.emitBullet = function(speed, rotation, game, player, bullets) {
  var bullet,
      yModifier = Math.sin(rotation),
      xModifier = Math.cos(rotation);

  bullet = bullets.create(
            player.position.x+(xModifier*25),
            player.position.y+(yModifier*25),
            'bullet');

  game.physics.enable(bullet, Phaser.Physics.ARCADE);
  bullet.outOfBoundsKill = true;
  bullet.anchor.setTo(0.5, 0.5);

  Utilities.setBulletSpeed(bullet, rotation, speed);
};

Weapon.prototype.emitBullets = function(game, player, bullets) {
  var rotation = Utilities.calculateRotation(game, player);
  this.emitBullet(this.BULLET_SPEED, rotation, game, player, bullets);
};

Weapon.prototype.shoot = function(game, player, bullets) {
  if (timers.shot < game.time.now) {
    timers.shot = game.time.now + this.FIRING_SPEED;
    if (ammo === 0) {
      this.reload();
    } else {
      setAmmo(ammo - 1);
      this.emitBullets(game, player, bullets);
    }
  }
};

Weapon.prototype.resetAmmo = function() {
  reloadNotifier.visible = false;
  setAmmo(this.CLIP_SIZE);
};

Weapon.prototype.reload = function() {
  if (timers.reload === 0) {
    reloadNotifier.visible = true;
    setAmmo(0);
    timers.reload = this.RELOAD_SPEED;
  }
};

Weapon.prototype.checkReload = function(game) {
  if (ammo !== this.CLIP_SIZE &&
      timers.reload === 0 &&
      game.input.keyboard.isDown(Phaser.Keyboard.R)) {
    this.reload();
  }

  if (timers.reload > 0) {
    timers.reload--;

    if (timers.reload === 0) {
      reloadNotifier.visible = false;
      setAmmo(this.CLIP_SIZE);
    }
  }
};

module.exports = Weapon;