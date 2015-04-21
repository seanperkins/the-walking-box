var _ = require('lodash');
var Weapon = require('../weapon');

var Revolver = function() {
  this.CLIP_SIZE = 6;
  this.RELOAD_SPEED = 200; //speed to reload each bullet in game frames
  this.FIRING_SPEED = 275;
  this.BULLET_SPEED = 1000;

  Weapon.apply(this, arguments);
};

_.extend(Revolver.prototype, Weapon.prototype);

module.exports = Revolver;