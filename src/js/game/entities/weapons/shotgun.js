var Weapon = require('../weapon');
var Utilities = require('../../utils/utilities');

var Shotgun = function() {
  this.CLIP_SIZE = 2;
  this.RELOAD_SPEED = 1800;
  this.FIRING_SPEED = 400;
  this.BULLET_SPEED = 1000;
  this.SOUND = 'shotgun';

  Weapon.apply(this, arguments);
};

Shotgun.prototype = Object.create(Weapon.prototype);
Shotgun.prototype.constructor = Shotgun;

Shotgun.prototype.emitBullets = function(player, bullets) {
  var baseRotation = Utilities.calculateRotation(this.game, player);

  for (var k = -2; k <= 2; k++) {
    this.emitBullet(this.BULLET_SPEED, baseRotation + k*0.05, player, bullets);
  }
};

module.exports = Shotgun;
