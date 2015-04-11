var _ = require('lodash'),
        Utilities = require('../utils/utilities')();

var Player = function(game, options) {
  Phaser.Sprite.call(this, game, game.world.centerX, game.world.centerY, 'hero');
  this.anchor.setTo(0.5,0.5);
  this.game.physics.arcade.enableBody(this);
  this.body.collideWorldBounds = true;
  
  this.options = options || {};
  
  this.maxPlayerHealth = this.options.maxPlayerHealth || 5;
  this.body.health = this.maxPlayerHealth;
  this.baseSpeed = this.options.baseSpeed || 400;

  //Don't forget to add it to the world if you aren't adding to to a group
  game.add.existing(this);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
  Utilities.resetEntity(this);
  this.movePlayer();
  this.rotatePlayer();
};

Player.prototype.movePlayer = function() {
  var IS_W_DOWN = this.game.input.keyboard.isDown(Phaser.Keyboard.W),
      IS_A_DOWN = this.game.input.keyboard.isDown(Phaser.Keyboard.A),
      IS_S_DOWN = this.game.input.keyboard.isDown(Phaser.Keyboard.S),
      IS_D_DOWN = this.game.input.keyboard.isDown(Phaser.Keyboard.D),
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
    Utilities.setSpeed(this, direction, this.baseSpeed);
  }
};

Player.prototype.rotatePlayer = function() {
  var angleInRadians = Utilities.calculateRotation(this.game, this);
  this.rotation = angleInRadians;
};

Player.prototype.takeDamage = function(game, player) {
  if(player.body.health  === 1) {
    player.kill();
    message = 'ZOMBIES GOT HUNGRY!';
    game.add.text(game.camera.position.x,
                  game.camera.position.y-230,
                  message,
                  { fontSize: '50px', fill: '#Ff3333' });
  }
  else {
    player.body.health = player.body.health - 1;
    var scalePercentage = 1 - ((this.maxPlayerHealth-player.body.health)*0.05);
    player.scale.setTo(scalePercentage, scalePercentage);
  }
};

module.exports = Player;