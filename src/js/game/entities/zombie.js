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
  };

  logic.bleed = function(game, zombie){
    //create an emitter
    var blood = game.add.emitter(zombie.x, zombie.y, 100);
    blood.makeParticles('blood');
    blood.gravity = 0;
    
    blood.start(true, 1000, null, 100);
    blood.update();
  };

  return logic;
};