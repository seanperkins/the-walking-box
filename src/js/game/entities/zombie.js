var _ = require('lodash'),
    Boid = require('./boid');

module.exports = function() {

  var logic = {};
  
  logic.spawnZombie = function (game, target, group, xPosition, yPosition, options) {
    var zombie = group.add(new Boid(game,
                                    xPosition + _.random(0,100),
                                    yPosition + _.random(0,100),
                                    group,
                                    options
                                      ));
    zombie.target = target;
    return zombie;
  };

  return logic;
};