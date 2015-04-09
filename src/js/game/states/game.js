var _ = require('lodash'),
    zombieLogic = require('../entities/zombie')(),
    Player = require('../entities/player')(),
    buildingLogic = require('../entities/building')(),
    weapon = require('../entities/weapon')(),
    lighting = require('../utils/lighting')();

module.exports = function(game) {

  var gameState = {},
      staticObjects,
      player,
      zombies,
      bullets,
      buildings;


  function resetEntity(entity) {
    entity.body.velocity.x = 0;
    entity.body.velocity.y = 0;
  }

  function killZombie(bullet, zombie) {
    bullet.kill();
    setTimeout(function() {
      // fixing a racing condition where the bullet is still being updated even though the reference is null
      bullet.destroy();
    });
    zombie.destroy();
    // we should destroy instead of .kill() because destroy will free up objects for GC and kill does not.
    // kill also retain all the listeners on the object.
  }

  function resetGameWithMessage(message) {
    game.add.text(game.camera.position.x, game.camera.position.y-230, message, { fontSize: '50px', fill: '#Ff3333' });
  }

  function hurtPlayer(player) {
    if(player.body.health  === 1) {
      player.kill();
      resetGameWithMessage('ZOMBIES GOT HUNGRY!');
    }
    else {
      player.body.health = player.body.health - 1;
      var scalePercentage = 1 - ((MAX_PLAYER_HEALTH-player.body.health)*0.05);
      player.scale.setTo(scalePercentage, scalePercentage);
    }
  }

  var debouncedHurtplayer = _.throttle(hurtPlayer, 400, { 'leading': true, 'trailing': false });

  gameState.create = function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    staticObjects = game.add.group();
    buildings = game.add.group();
    zombies = game.add.group();

    //Create an array of coordinates that make a 3000px x 3000 grid
    var placementMatrix = [];
    for (var i = 0; i < 12; i++) {
      for (var j = 0; j < 12; j++) {
        placementMatrix.push([i*250, j*250]);
      }
    }

    //Iterate through array to randomly drop cars or trees
    //Once a placement is determined in a grid box, it is randomly placed
    _.each(placementMatrix, function (coordinates) {
      var rand = _.random(0, 100);
      var randX = _.random(0, 250);
      var randY = _.random(0, 250 );
      if (rand < 50) {
        if (rand%2 === 0) {
          var car = staticObjects.create(coordinates[0]-randX, coordinates[1]-randY, 'car-'+_.random(1,2));
          game.physics.enable(car, Phaser.Physics.ARCADE);
          car.body.immovable = true;
        } else {
          var tree = staticObjects.create(coordinates[0]-randX, coordinates[1]-randY, 'tree');
          game.physics.enable(tree, Phaser.Physics.ARCADE);
          tree.body.immovable = true;
        }
      } else if (rand > 90) {
        var building = buildings.create(coordinates[0], coordinates[1], 'building');
        game.physics.enable(building, Phaser.Physics.ARCADE);
        building.body.immovable = true;
        building.hasSpawned = false;
      }
    });

    player = Player.create(game);

    //Create bullets
    bullets = game.add.group();
    game.physics.enable(bullets, Phaser.Physics.ARCADE);

    //Create zombie swarm
    this.maxZombies = 30;

    for(var k = 0; k < this.maxZombies; k++) {
      zombieLogic.spawnZombie(game, player, zombies, game.world.randomX, game.world.randomY);
    }

    //Add lighting objects
    lighting.create(game, player, buildings);

    //Lock n load
    weapon.init(game, player);
  };

  gameState.update = function() {
    //  Reset the players velocity (movement)
    resetEntity(player);

    game.camera.follow(player);

    game.physics.arcade.collide(player, staticObjects);
    game.physics.arcade.collide(player, zombies);
    game.physics.arcade.collide(player, buildings);

    game.physics.arcade.collide(zombies, staticObjects);
    game.physics.arcade.collide(zombies, zombies);
    game.physics.arcade.collide(zombies, buildings);

    game.physics.arcade.overlap(bullets, zombies, killZombie, null, this);

    game.physics.arcade.overlap(player, zombies, debouncedHurtplayer, null, this);

    Player.movePlayer(game, player);
    Player.rotatePlayer(game, player);

    if ( player.body.health > 1 && (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) ||
        game.input.mousePointer.justPressed())) {
        // player can only shoot if he isn't DED
        weapon.shoot(game, player, bullets);
    }

    weapon.checkReload(game);

    _.each(buildings.children, function(building) {
      buildingLogic.spawnZombiesFromBuilding(game, zombies, player, building);
    });

    _.each(zombies.children, function(zombie) {
      zombie.update();
    });
  
    lighting.update(game, player, buildings);
  };

  return gameState;
};