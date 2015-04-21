var _ = require('lodash');

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
    var bullet = game.add.sprite(-45, -45+(k*12+5), 'hud-bullet');
    hudBullets.push(bullet);
    player.addChild(bullet);
  }

  this.ammo.set = setAmmo;

  this.ammo.set(this.CLIP_SIZE);
};

Weapon.prototype.constructor = Weapon;

Weapon.prototype.ammo = {};

Weapon.prototype.shoot = function(game, player, bullets) {
  if (timers.shot < game.time.now) {
    timers.shot = game.time.now + this.FIRING_SPEED;
    if (ammo === 0) {
      this.reload();
    } else {
      this.ammo.set(ammo - 1);
      this.ammo.fire(game, player, bullets);
    }
  }
};

Weapon.prototype.resetAmmo = function() {
  reloadNotifier.visible = false;
  this.ammo.set(this.CLIP_SIZE);
};

Weapon.prototype.reload = function() {
  if (timers.reload === 0) {
    reloadNotifier.visible = true;
    this.ammo.set(0);
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
      this.ammo.set(this.CLIP_SIZE);
    }
  }
};

module.exports = Weapon;