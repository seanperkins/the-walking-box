var _ = require('lodash'),
    Building = require('../entities/building');

var GRID = 12,
    CELL = 250,
    PROP_CLEARANCE = 30,
    SPAWN_CLEARANCE = 80;

var NEIGHBOURS = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] };

// Builds the 3000x3000 world on a 12x12 grid of 250px cells: walk-in buildings first, then cars
// and trees scattered around them. Returns the groups the game state collides against.
module.exports = function generateCity(game) {
  var floors = game.add.group(),
      staticObjects = game.add.group(),
      walls = game.add.group(),
      buildings = [],
      occupied = {},
      floorTexture = game.make.bitmapData(CELL, CELL),
      center = GRID / 2;

  floorTexture.fill(70, 58, 48);

  function key(i, j) { return i + ',' + j; }

  // Keep the four cells around the spawn point (the world centre) free of buildings.
  function nearSpawn(i, j) {
    return (i === center || i === center - 1) && (j === center || j === center - 1);
  }

  var i, j;
  for (i = 0; i < GRID; i++) {
    for (j = 0; j < GRID; j++) {
      if (_.random(0, 100) > 90 && !nearSpawn(i, j)) {
        occupied[key(i, j)] = true;
      }
    }
  }

  // Doors face open ground: not the world edge and not another building.
  _.each(occupied, function(value, cell) {
    var ij = cell.split(',').map(Number),
        open = _.filter(_.keys(NEIGHBOURS), function(side) {
          var ni = ij[0] + NEIGHBOURS[side][0], nj = ij[1] + NEIGHBOURS[side][1];
          return ni >= 0 && nj >= 0 && ni < GRID && nj < GRID && !occupied[key(ni, nj)];
        });

    if (open.length) {
      buildings.push(new Building(game, ij[0] * CELL, ij[1] * CELL, CELL, _.sample(open), walls, floors, floorTexture));
    }
  });

  function blocked(x, y, w, h) {
    var rect = new Phaser.Rectangle(x - PROP_CLEARANCE, y - PROP_CLEARANCE, w + PROP_CLEARANCE*2, h + PROP_CLEARANCE*2),
        spawn = game.world.centerX;
    return _.some(buildings, function(building) { return building.rect.intersects(rect); }) ||
      rect.intersects(new Phaser.Rectangle(spawn - SPAWN_CLEARANCE, spawn - SPAWN_CLEARANCE, SPAWN_CLEARANCE*2, SPAWN_CLEARANCE*2));
  }

  for (i = 0; i < GRID; i++) {
    for (j = 0; j < GRID; j++) {
      var rand = _.random(0, 100);
      if (rand >= 50) {
        continue;
      }
      // Props are nudged back into the previous cell by a random amount.
      var propKey = rand % 2 === 0 ? 'car-' + _.random(1, 2) : 'tree',
          image = game.cache.getImage(propKey),
          x = i * CELL - _.random(0, CELL),
          y = j * CELL - _.random(0, CELL);

      if (!blocked(x, y, image.width, image.height)) {
        var prop = staticObjects.create(x, y, propKey);
        game.physics.enable(prop, Phaser.Physics.ARCADE);
        prop.body.immovable = true;
      }
    }
  }

  return { floors: floors, staticObjects: staticObjects, walls: walls, buildings: buildings };
};
