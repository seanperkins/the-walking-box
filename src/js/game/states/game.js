var _ = require('lodash'),
    zombieLogic = require('../entities/zombie')(),
    Player = require('../entities/player'),
    buildingLogic = require('../entities/building')(),
    Shotgun = require('../entities/weapons/shotgun'),
    Lighting = require('../utils/lighting'),
    Utilities = require('../utils/utilities');

module.exports = function(game) {

  var gameState = {},
      staticObjects,
      player,
      zombies,
      bullets,
      buildings,
      weapon,
      lighting,
      collisionDamageFn,
      healthPacks,
      resetButton,
      resetText,
      counts;

  function populateHealthPack(x, y) {
    var healthPack = healthPacks.create(x, y, 'health-pack');
    game.physics.enable(healthPack, Phaser.Physics.ARCADE);
    healthPack.anchor.setTo(0.5, 0.5);
    healthPack.body.immovable = true;
    game.add.tween(healthPack.scale).to( { x: 1.3, y: 1.3 }, 500, Phaser.Easing.Quadratic.InOut, true, 0, 100, true);
  }

  function killZombie(bullet, zombie) {
    zombieLogic.bleed(game, zombie);
    bullet.kill();
    setTimeout(function() {
      // fixing a racing condition where the bullet is still being updated even though the reference is null
      bullet.destroy();
    });

    if( player.body.health !== player.maxHealth && _.random(0, 100, true) < 10) {
      populateHealthPack(zombie.position.x, zombie.position.y);
    }

    zombie.destroy();
    // we should destroy instead of .kill() because destroy will free up objects for GC and kill does not.
    // kill also retain all the listeners on the object.
  }

  function bulletRicochet(bullet) {
    bullet.kill();
    var blood = game.add.emitter(bullet.x, bullet.y, 20);
    blood.makeParticles('blood');
    blood.gravity = 0;
    blood.forEach(function(particle){
      particle.tint = 0x444444;
    });

    blood.start(false, 200, 100, 20, 10);
    blood.update();
    setTimeout(function() {
      bullet.destroy();
    });
  }

  function resetPlayerHealth(player, health) {
    health.destroy();
    player.addHealth();
  }

  function clickResetButton() {
    resetButton.destroy();
    resetText.destroy();

    player.restoreHealthAndSize();
    player.revive();

    weapon.resetAmmo();
    resetButton = undefined;
  }

  gameState.create = function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    staticObjects = game.add.group();
    buildings = game.add.group();
    zombies = game.add.group();
    healthPacks = game.add.group();

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

    player = new Player(game);

    // Create throttled damage handler.
    collisionDamageFn = _.throttle(player.takeDamage.bind(player), 200, { 'leading': true, 'trailing': false });

    //Create bullets
    bullets = game.add.group();
    game.physics.enable(bullets, Phaser.Physics.ARCADE);

    //Create zombie swarm
    this.maxZombies = 30;

    for(var k = 0; k < this.maxZombies; k++) {
      zombieLogic.spawnZombie(game, player, zombies, game.world.randomX, game.world.randomY, {roamer: true});
    }

    //Add lighting objects
    lighting = new Lighting(game);

    //Lock n load
    weapon = new Shotgun(game, player);

    counts = Utilities.createCounts(game);
  };

  gameState.update = function() {
    game.camera.follow(player);


    game.physics.arcade.collide(player, staticObjects);
    game.physics.arcade.collide(player, zombies, collisionDamageFn, null, this);
    game.physics.arcade.collide(player, buildings);

    game.physics.arcade.collide(zombies, staticObjects);
    game.physics.arcade.collide(zombies, zombies);
    game.physics.arcade.collide(zombies, buildings);

    game.physics.arcade.overlap(bullets, zombies, killZombie, null, this);
    game.physics.arcade.overlap(bullets, buildings, bulletRicochet, null, this);
    game.physics.arcade.overlap(player, healthPacks, resetPlayerHealth, null, this);

    player.update();

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

    Utilities.updateCounts(counts, zombies, buildings, staticObjects);

    if(player.isDead() && !resetButton) {
      var message = 'ZOMBIES GOT HUNGRY!';
      resetButton = game.add.button(game.camera.position.x, game.camera.position.y-130, 'button', clickResetButton, null, 2, 1, 0);
      player.kill();
      resetText = game.add.text(game.camera.position.x, game.camera.position.y-230, message, { fontSize: '50px', fill: '#Ff3333' });
    }

  };

  return gameState;
};
