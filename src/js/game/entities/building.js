var _ = require('lodash'),
    Zombie = require('./zombie');

var SPAWNING_DISTANCE = 600,
    WALL = 20,        // thicker than a bullet travels in one frame, so shots can't tunnel through
    DOOR = 70;

// A walk-in building: four walls with a doorway on doorSide, and a floor that only shows where
// the player can see it. Releases a crowd of lazy zombies inside the first time the player is near.
var Building = function(game, x, y, size, doorSide, walls, floors, floorTexture) {
  this.game = game;
  this.rect = new Phaser.Rectangle(x, y, size, size);
  this.doorSide = doorSide;
  this.hasSpawned = false;

  floors.create(x, y, floorTexture);

  var self = this;
  function wall(wx, wy, w, h) {
    if (w <= 0 || h <= 0) { return; }
    var sprite = walls.create(wx, wy, 'building');
    sprite.width = w;
    sprite.height = h;
    game.physics.arcade.enableBody(sprite);
    sprite.body.immovable = true;
    sprite.building = self;
  }

  var right = x + size - WALL,
      bottom = y + size - WALL,
      gapStart = (size - DOOR) / 2,
      gapEnd = gapStart + DOOR;

  // Each side is one wall, or two with the doorway between them.
  _.each({
    top:    function(a, b) { wall(x + a, y, b - a, WALL); },
    bottom: function(a, b) { wall(x + a, bottom, b - a, WALL); },
    left:   function(a, b) { wall(x, y + a, WALL, b - a); },
    right:  function(a, b) { wall(right, y + a, WALL, b - a); }
  }, function(build, side) {
    if (side === doorSide) {
      build(0, gapStart);
      build(gapEnd, size);
    } else {
      build(0, size);
    }
  });
};

Building.prototype.contains = function(x, y) {
  return this.rect.contains(x, y);
};

Building.prototype.randomInteriorPoint = function(margin) {
  margin = WALL + (margin || 20);
  return new Phaser.Point(_.random(this.rect.x + margin, this.rect.right - margin),
                          _.random(this.rect.y + margin, this.rect.bottom - margin));
};

Building.prototype.inSpawnRange = function(player) {
  return Phaser.Math.distance(player.x, player.y, this.rect.centerX, this.rect.centerY) <
    SPAWNING_DISTANCE + this.rect.width/2;
};

Building.prototype.spawnZombies = function(zombies, player) {
  if (this.hasSpawned || !this.inSpawnRange(player)) {
    return;
  }
  this.hasSpawned = true;

  var count = _.random(2, 13);
  for (var i = 0; i < count; i++) {
    var point = this.randomInteriorPoint();
    Zombie.spawn(this.game, zombies, player, point.x, point.y, {roamer: false, scatter: 0});
  }
};

module.exports = Building;
