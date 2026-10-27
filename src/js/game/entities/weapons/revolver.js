var Weapon = require('../weapon');

var Revolver = function() {
  this.CLIP_SIZE = 6;
  this.RELOAD_SPEED = 2400;
  this.FIRING_SPEED = 275;
  this.BULLET_SPEED = 1000;
  this.SOUND = 'revolver';

  Weapon.apply(this, arguments);
};

Revolver.prototype = Object.create(Weapon.prototype);
Revolver.prototype.constructor = Revolver;

module.exports = Revolver;
