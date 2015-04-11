var Utilities = require('../utils/utilities')(),
    _ = require('lodash');

module.exports = function() {

  var CLIP_SIZE = 6;
  var RELOAD_SPEED = 200; //speed to reload each bullet in game frames

  var timers = {
    shot: 0,
    reload: 0
  };

  var ammo = 0;

  var hudBullets = [];

  var reloadNotifier;

  var initializeHud = function (game, player) {
    reloadNotifier = game.add.text(5, 5, 'RELOADING!!!', {
      fontSize: '14px',
      fill: '#Ff3333'
    });
    reloadNotifier.fixedToCamera = true;
    reloadNotifier.visible = false;

    for (var k = 0; k < CLIP_SIZE; k++) {
      var bullet = game.add.sprite(-45, -45+(k*12+5), 'hud-bullet');
      hudBullets.push(bullet);
      player.addChild(bullet);
    }
  };

  var setAmmo = function (count) {
    ammo = count;
    _.each(hudBullets, function(bullet, n) {
      bullet.visible = n < count;
    });
  };

  var logic = {};

  logic.init = function (game, player) {
    initializeHud(game, player);
    setAmmo(CLIP_SIZE);
  };

  logic.shoot = function (game, player, bullets) {
    var baseSpeed = 1000;

    if (timers.shot < game.time.now) {
      timers.shot = game.time.now + 275;
      if (ammo === 0) {
        logic.reload();
      } else {
        setAmmo(ammo - 1);
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
      reloadNotifier.visible = true;
      setAmmo(0);
      timers.reload = RELOAD_SPEED;
    }
  };

  logic.checkReload = function (game) {
    if (ammo !== CLIP_SIZE &&
        timers.reload === 0 &&
        game.input.keyboard.isDown(Phaser.Keyboard.R)) {
      logic.reload();
    }

    if (timers.reload > 0) {
      timers.reload--;

      if (timers.reload === 0) {
        reloadNotifier.visible = false;
        setAmmo(CLIP_SIZE);
      }
    } 
  };

  return logic;

};