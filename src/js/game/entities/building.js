var _ = require('lodash'),
    Zombie = require('./zombie');

var SPAWNING_DISTANCE = 600;

// A building that releases a crowd of lazy zombies the first time the player comes near.
var Building = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'building');
  game.physics.arcade.enableBody(this);
  this.body.immovable = true;
  this.hasSpawned = false;
};

Building.prototype = Object.create(Phaser.Sprite.prototype);
Building.prototype.constructor = Building;

Building.prototype.distanceTo = function(sprite) {
  return Phaser.Math.distance(sprite.x, sprite.y, this.x + this.width/2, this.y + this.height/2);
};

Building.prototype.inSpawnRange = function(player) {
  return this.distanceTo(player) < SPAWNING_DISTANCE + this.width/2;
};

Building.prototype.spawnZombies = function(zombies, player) {
  if (this.hasSpawned || !this.inSpawnRange(player)) {
    return;
  }
  this.hasSpawned = true;

  var centerX = this.x + this.width/2,
      centerY = this.y + this.height/2,
      dx = player.x - centerX,
      dy = player.y - centerY,
      offset = 125;

  // Zombies spawn on the side of the building facing the player.
  if (Math.abs(dx) > Math.abs(dy)) {
    centerX += dx > 0 ? offset : -offset;
  } else {
    centerY += dy > 0 ? offset : -offset;
  }

  var count = _.random(2, 13);
  for (var i = 0; i < count; i++) {
    Zombie.spawn(this.game, zombies, player, centerX, centerY, {roamer: false});
  }
};

module.exports = Building;
