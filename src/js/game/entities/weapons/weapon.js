var _ = require('lodash');
var Aim = require('../../utils/aim');
var Sound = require('../../utils/sound');

var BULLET_LIFESPAN = 1500;

// Subclasses set CLIP_SIZE, RELOAD_SPEED (ms), FIRING_SPEED (ms) and BULLET_SPEED before calling Weapon.
var Weapon = function(game, player) {
  this.game = game;
  this.nextShot = 0;
  this.reloadStarted = 0;
  this.ammo = this.CLIP_SIZE;

  // The clip is drawn beside the player, so ammo and reload progress need no other HUD.
  this.hudBullets = [];
  for (var k = 0; k < this.CLIP_SIZE; k++) {
    var bullet = game.add.sprite(-45, -this.CLIP_SIZE*6+k*12, 'hud-bullet');
    this.hudBullets.push(bullet);
    player.addChild(bullet);
  }

  this.setActive(false);
};

Weapon.prototype.isReloading = function() {
  return this.reloadStarted > 0;
};

Weapon.prototype.showAmmo = function(count) {
  var active = this.active;
  _.each(this.hudBullets, function(bullet, n) {
    bullet.visible = active && n < count;
  });
};

Weapon.prototype.setActive = function(active) {
  this.active = active;
  this.showAmmo(this.ammo);
};

Weapon.prototype.emitBullet = function(speed, rotation, player, bullets) {
  // Reuse spent bullets; each one dies after BULLET_LIFESPAN or on leaving the world.
  var bullet = bullets.getFirstDead(true,
        player.position.x+(Math.cos(rotation)*25),
        player.position.y+(Math.sin(rotation)*25),
        'bullet');

  if (!bullet.body) {
    this.game.physics.enable(bullet, Phaser.Physics.ARCADE);
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;
    bullet.anchor.setTo(0.5, 0.5);
  }
  bullet.lifespan = BULLET_LIFESPAN;

  Aim.setVelocity(bullet, rotation, speed);
};

Weapon.prototype.emitBullets = function(player, bullets) {
  var rotation = Aim.toPointer(this.game, player);
  this.emitBullet(this.BULLET_SPEED, rotation, player, bullets);
};

Weapon.prototype.shoot = function(player, bullets) {
  var now = this.game.time.now;

  if (this.isReloading() || now < this.nextShot) {
    return;
  }
  this.nextShot = now + this.FIRING_SPEED;

  if (this.ammo === 0) {
    Sound.dryFire();
    this.reload();
  } else {
    this.ammo--;
    this.showAmmo(this.ammo);
    this.emitBullets(player, bullets);
    Sound.shot(this.SOUND);
  }
};

Weapon.prototype.reload = function() {
  if (!this.isReloading() && this.ammo !== this.CLIP_SIZE) {
    this.ammo = 0;
    this.reloadStarted = this.game.time.now;
    this.showAmmo(0);
  }
};

Weapon.prototype.update = function() {
  if (!this.isReloading()) {
    return;
  }

  var progress = (this.game.time.now - this.reloadStarted) / this.RELOAD_SPEED,
      loaded = Math.min(this.CLIP_SIZE, Math.floor(progress * this.CLIP_SIZE));

  if (loaded > this.ammo) {
    this.ammo = loaded;
    this.showAmmo(loaded);
    Sound.reloadClick();
  }

  if (this.ammo === this.CLIP_SIZE) {
    this.reloadStarted = 0;
  }
};

module.exports = Weapon;
