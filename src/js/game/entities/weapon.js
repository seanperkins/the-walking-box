var Utilities = require('../utils/utilities')();

module.exports = function() {

  var CLIP_SIZE = 3;
  var RELOAD_SPEED = 60; //speed to reload each bullet in game frames

  var timers = {
    shot: 0,
    reload: 0
  };

  var checkReload = function () {
    if (logic.ammo < CLIP_SIZE) {
      setAmmo(logic.ammo + 1);
      if (logic.ammo < CLIP_SIZE) {
        timers.reload = RELOAD_SPEED;
      }
    }
  };

  var setAmmo = function (count) {
    logic.ammo = count;
    console.log('ammo: '+count);
  };

  var logic = {
    ammo: CLIP_SIZE
  };

  logic.shoot = function (game, player, bullets) {
    var baseSpeed = 1000;

    if (timers.shot < game.time.now) {
      timers.shot = game.time.now + 275;
      if (logic.ammo === 0) {
        logic.reload();
      } else {
        setAmmo(logic.ammo - 1);
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

  logic.reload = function () {
    if (timers.reload === 0) {
      timers.reload = RELOAD_SPEED;
      console.log('reloading');
    }
  };

  logic.updateReloadTimer = function () {
    if (timers.reload > 0) {
      timers.reload--;

      if (timers.reload === 0) {
        checkReload();
      }
    } 
  };

  return logic;

};