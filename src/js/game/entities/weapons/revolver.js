var _ = require('lodash');
var Utilities = require('../../utils/utilities');
var Weapon = require('../weapon');

var fire = function(game, player, bullets) {
  var baseSpeed = 1000;

  var bullet,
      rotation = Utilities.calculateRotation(game, player),
      yModifier = Math.sin(rotation),
      xModifier = Math.cos(rotation);

  bullet = bullets.create(
            player.position.x+(xModifier*25),
            player.position.y+(yModifier*25),
            'bullet');

  game.physics.enable(bullet, Phaser.Physics.ARCADE);
  bullet.outOfBoundsKill = true;
  bullet.anchor.setTo(0.5, 0.5);

  Utilities.setBulletSpeed(bullet, rotation, baseSpeed);
};

var Revolver = function() {
  this.CLIP_SIZE = 6;
  this.RELOAD_SPEED = 200; //speed to reload each bullet in game frames
  this.FIRING_SPEED = 275;

  this.ammo.fire = fire;

  Weapon.apply(this, arguments);
};

_.extend(Revolver.prototype, Weapon.prototype);

module.exports = Revolver;