var _ = require('lodash'),
        Utilities = require('../utils/utilities')();

module.exports = function() {

  var Player = {};

  Player.MAX_PLAYER_HEALTH = 10;

  Player.create = function(game) {
    //Create player in center area
    var player = game.add.sprite(game.world.centerX, game.world.centerY, 'hero');
    player.anchor.setTo(0.5,0.5);

    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    _.extend(player.body, {health: Player.MAX_PLAYER_HEALTH});

    return player;
  }

  Player.movePlayer = function(game, player) {
    var IS_W_DOWN = game.input.keyboard.isDown(Phaser.Keyboard.W),
        IS_A_DOWN = game.input.keyboard.isDown(Phaser.Keyboard.A),
        IS_S_DOWN = game.input.keyboard.isDown(Phaser.Keyboard.S),
        IS_D_DOWN = game.input.keyboard.isDown(Phaser.Keyboard.D),
        baseSpeed = 400,
        direction;

    if (IS_W_DOWN && !IS_A_DOWN && !IS_D_DOWN) {
      direction = 'n';
    }
    else if (IS_D_DOWN && IS_W_DOWN && !IS_S_DOWN) {
      direction = 'ne';
    }
    else if (IS_D_DOWN && !IS_W_DOWN && !IS_S_DOWN) {
      direction = 'e';
    }
    else if (IS_D_DOWN && !IS_W_DOWN && IS_S_DOWN) {
      direction = 'se';
    }
    else if (IS_S_DOWN && !IS_A_DOWN && !IS_D_DOWN) {
      direction = 's';
    }
    else if (IS_A_DOWN && !IS_W_DOWN && IS_S_DOWN) {
      direction = 'sw';
    }
    else if (IS_A_DOWN && !IS_W_DOWN && !IS_S_DOWN) {
      direction = 'w';
    }
    else if (IS_A_DOWN && IS_W_DOWN && !IS_S_DOWN) {
      direction = 'nw';
    }

    if(!!direction) {
      Utilities.setSpeed(player, direction, baseSpeed);
    }
  };

  Player.rotatePlayer = function(game, player) {
    var angleInRadians = Utilities.calculateRotation(game, player);

    player.rotation = angleInRadians;
  };

  return Player;
};