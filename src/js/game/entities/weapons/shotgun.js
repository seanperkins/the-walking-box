var _ = require('lodash');
var Weapon = require('../weapon');
var Utilities = require('../../utils/utilities');

var Shotgun = function() {
  this.CLIP_SIZE = 2;
  this.RELOAD_SPEED = 150;
  this.FIRING_SPEED = 275;
  this.BULLET_SPEED = 1000;

  Weapon.apply(this, arguments);
};

_.extend(Shotgun.prototype, Weapon.prototype, {
  emitBullets: function(game, player, bullets) {
    var baseRotation = Utilities.calculateRotation(game, player);
    
    for (var k = -0.1; k <= 0.1; k = k + 0.05) {
      this.emitBullet(this.BULLET_SPEED, baseRotation+k, game, player, bullets);
    }
  }
});

module.exports = Shotgun;