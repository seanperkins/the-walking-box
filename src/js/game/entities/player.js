var Utilities = require('../utils/utilities');
var Sound = require('../utils/sound');
var Revolver = require('./weapons/revolver');
var Shotgun = require('./weapons/shotgun');
var debug = require('debug')('walkingBox:player');

var SPAWN_PROTECTION = 3000;

var Player = function(game, options) {
  Phaser.Sprite.call(this, game, game.world.centerX, game.world.centerY, 'hero');
  this.anchor.setTo(0.5,0.5);
  this.game.physics.arcade.enableBody(this);
  this.body.collideWorldBounds = true;

  this.options = options || {};

  this.maxPlayerHealth = this.options.maxPlayerHealth || 5;
  this.body.health = this.maxPlayerHealth;
  this.baseSpeed = this.options.baseSpeed || 400;
  this.protectedUntil = game.time.now + SPAWN_PROTECTION;

  this.weapons = [new Revolver(game, this), new Shotgun(game, this)];
  this.equip(0);

  var keyboard = game.input.keyboard;
  keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(function() { this.equip(0); }, this);
  keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(function() { this.equip(1); }, this);
  keyboard.addKey(Phaser.Keyboard.Q).onDown.add(function() {
    this.equip((this.weapons.indexOf(this.weapon) + 1) % this.weapons.length);
  }, this);
  keyboard.addKey(Phaser.Keyboard.R).onDown.add(function() { this.weapon.reload(); }, this);

  //Don't forget to add it to the world if you aren't adding to to a group
  game.add.existing(this);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
  Utilities.resetEntity(this);
  this.movePlayer();
  this.rotatePlayer();
  this.weapon.update();

  // Blink while spawn protection lasts.
  this.alpha = this.isProtected() && Math.floor(this.game.time.now / 100) % 2 ? 0.3 : 1;
};

Player.prototype.equip = function(index) {
  if (this.weapon) {
    this.weapon.setActive(false);
  }
  this.weapon = this.weapons[index];
  this.weapon.setActive(true);
};

Player.prototype.shoot = function(bullets) {
  this.weapon.shoot(this, bullets);
};

Player.prototype.isProtected = function() {
  return this.game.time.now < this.protectedUntil;
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

Player.prototype.isDead = function() {
  return this.body.health === 1;
};

Player.prototype.takeDamage = function() {
  debug('Took damage. Health: %d', this.body.health);

  if(this.body.health > 1 && !this.isProtected()) {
    Sound.hurt();
    this.body.health = this.body.health - 1;
    var scalePercentage = 1 - ((this.maxPlayerHealth - this.body.health) * 0.05);
    this.scale.setTo(scalePercentage, scalePercentage);
  }
};

Player.prototype.addHealth = function() {
  this.body.health = this.maxPlayerHealth;
  this.scale.setTo(1, 1);
};

module.exports = Player;
