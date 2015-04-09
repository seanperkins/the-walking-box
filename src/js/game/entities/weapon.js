var Utilities = require('../utils/utilities')();

module.exports = function() {

  var CLIP_SIZE = 3;
  var RELOAD_SPEED = 60; //speed to reload each bullet in game frames

  var logic = {
    shotTimer: 0,
    ammo: CLIP_SIZE,
    reloadTimer: 0
  };

  logic.shoot = function (game, player, bullets) {
    var baseSpeed = 1000;

    if (logic.shotTimer < game.time.now) {
      logic.shotTimer = game.time.now + 275;
      if (logic.ammo === 0) {
        logic.reload();
      } else {
        logic.setAmmo(logic.ammo - 1);
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
      }
    }
  };

  logic.setAmmo = function (count) {
    logic.ammo = count;
    console.log('ammo: '+count);
  };

  logic.reload = function () {
    if (logic.reloadTimer === 0) {
      logic.reloadTimer = RELOAD_SPEED;
      console.log('reloading');
    }
  };

  logic.updateReloadTimer = function () {
    if (logic.reloadTimer > 0) {
      logic.reloadTimer--;

      if (logic.reloadTimer === 0 && logic.ammo < CLIP_SIZE) {
        logic.setAmmo(logic.ammo + 1);
        if (logic.ammo < CLIP_SIZE) {
          logic.reloadTimer = RELOAD_SPEED;
        }
      }
    } 
  };

  return logic;

};