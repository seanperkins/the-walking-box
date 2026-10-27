var _ = require('lodash'),
    Building = require('../entities/building');

var GRID = 12,
    CELL = 250;

// Scatters cars, trees and buildings over a 12x12 grid of 250px cells (the 3000x3000 world).
// Returns the groups so the game state can collide against them.
module.exports = function generateCity(game) {
  var staticObjects = game.add.group(),
      buildings = game.add.group();

  function addProp(x, y, key) {
    var prop = staticObjects.create(x, y, key);
    game.physics.enable(prop, Phaser.Physics.ARCADE);
    prop.body.immovable = true;
  }

  for (var i = 0; i < GRID; i++) {
    for (var j = 0; j < GRID; j++) {
      var x = i * CELL,
          y = j * CELL,
          rand = _.random(0, 100);

      if (rand < 50) {
        // Props are nudged back into the previous cell by a random amount.
        addProp(x - _.random(0, CELL), y - _.random(0, CELL), rand % 2 === 0 ? 'car-' + _.random(1, 2) : 'tree');
      } else if (rand > 90) {
        buildings.add(new Building(game, x, y));
      }
    }
  }

  return { staticObjects: staticObjects, buildings: buildings };
};
