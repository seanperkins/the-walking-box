var _ = require('lodash'),
    zombieLogic = require('../entities/zombie')(),
    Player = require('../entities/player'),
    buildingLogic = require('../entities/building')(),
    Lighting = require('../utils/lighting'),
    Utilities = require('../utils/utilities'),
    Sound = require('../utils/sound'),
    Effects = require('../utils/effects'),
    properties = require('../properties');

var WAVE_INTERVAL = 25000,
    MAX_ZOMBIES = 150,
    SAFE_SPAWN_DISTANCE = 900,
    GROAN_RANGE = 600,
    BEST_KEY = 'walkingBox:best';

function formatTime(ms) {
  var seconds = Math.floor(ms / 1000),
      remainder = seconds % 60;
  return Math.floor(seconds / 60) + ':' + (remainder < 10 ? '0' : '') + remainder;
}

// Storage can be unavailable (private windows, blocked site data), so the best run is a nicety.
function loadBest() {
  try {
    return JSON.parse(window.localStorage.getItem(BEST_KEY)) || null;
  } catch (e) {
    return null;
  }
}

function saveBest(run) {
  try {
    window.localStorage.setItem(BEST_KEY, JSON.stringify(run));
  } catch (e) {}
}

module.exports = function(game) {

  var gameState = {},
      staticObjects,
      player,
      zombies,
      bullets,
      buildings,
      lighting,
      collisionDamageFn,
      healthPacks,
      counts,
      run;

  function spawnAwayFromPlayer(options) {
    var x, y;
    for (var tries = 0; tries < 20; tries++) {
      x = game.world.randomX;
      y = game.world.randomY;
      if (Phaser.Math.distance(x, y, player.x, player.y) > SAFE_SPAWN_DISTANCE) {
        break;
      }
    }
    zombieLogic.spawnZombie(game, player, zombies, x, y, options);
  }

  function spawnWave() {
    run.wave++;
    var size = Math.min(8 + run.wave * 6, MAX_ZOMBIES - zombies.length),
        speed = Math.min(1 + (run.wave - 1) * 0.06, 1.6);

    for (var k = 0; k < size; k++) {
      spawnAwayFromPlayer({roamer: true, speed: speed});
    }
    run.nextWave = game.time.now + WAVE_INTERVAL;
  }

  function groan() {
    var nearest = Number.MAX_VALUE;
    zombies.forEachAlive(function(zombie) {
      nearest = Math.min(nearest, Phaser.Math.distance(zombie.x, zombie.y, player.x, player.y));
    });
    if (nearest < GROAN_RANGE) {
      Sound.groan(1 - nearest / GROAN_RANGE);
    }
    run.nextGroan = game.time.now + _.random(800, 2500);
  }

  function populateHealthPack(x, y) {
    var healthPack = healthPacks.create(x, y, 'health-pack');
    game.physics.enable(healthPack, Phaser.Physics.ARCADE);
    healthPack.anchor.setTo(0.5, 0.5);
    healthPack.body.immovable = true;
    game.add.tween(healthPack.scale).to( { x: 1.3, y: 1.3 }, 500, Phaser.Easing.Quadratic.InOut, true, 0, 100, true);
  }

  function killZombie(bullet, zombie) {
    run.kills++;
    Sound.splat();
    Effects.splatter(game, zombie.x, zombie.y, 100, 1000);
    // Bullets are pooled by the weapon, so kill rather than destroy.
    bullet.kill();

    if( player.body.health !== player.maxPlayerHealth && _.random(0, 100, true) < 10) {
      populateHealthPack(zombie.position.x, zombie.position.y);
    }

    zombie.destroy();
    // we should destroy instead of .kill() because destroy will free up objects for GC and kill does not.
    // kill also retain all the listeners on the object.
  }

  function bulletRicochet(bullet) {
    Sound.ricochet();
    bullet.kill();
    Effects.splatter(game, bullet.x, bullet.y, 10, 200, 0x444444);
  }

  function resetPlayerHealth(player, health) {
    health.destroy();
    player.addHealth();
  }

  function restart() {
    game.state.restart();
  }

  function showDeathScreen() {
    var centerX = game.camera.view.centerX,
        centerY = game.camera.view.centerY,
        current = { time: game.time.now - run.startedAt, kills: run.kills, wave: run.wave },
        best = loadBest(),
        bestLine;

    if (!best || current.time > best.time) {
      bestLine = best ? 'new best' : '';
      saveBest(current);
    } else {
      bestLine = 'best ' + formatTime(best.time) + ' \u00b7 ' + best.kills + ' kills';
    }

    var title = game.add.text(centerX, centerY-230, 'ZOMBIES GOT HUNGRY!', { fontSize: '50px', fill: '#Ff3333' });
    title.anchor.setTo(0.5, 0);

    var button = game.add.button(centerX, centerY-130, 'button', restart, null, 2, 1, 0);
    button.anchor.setTo(0.5, 0);

    var summary = formatTime(current.time) + ' \u00b7 ' + current.kills + ' kills \u00b7 wave ' + current.wave;
    game.add.text(centerX, centerY-30, summary, { font: '24px Arial', fill: '#c9c9c9' }).anchor.setTo(0.5, 0);
    game.add.text(centerX, centerY+5, bestLine, { font: '18px Arial', fill: '#888888' }).anchor.setTo(0.5, 0);

    game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.addOnce(restart);
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
    run = { startedAt: game.time.now, kills: 0, wave: 0, nextWave: 0, nextGroan: 0, over: false };

    // Buildings already in range of the spawn point stay empty so the opening is safe.
    buildings.forEach(function(building) {
      building.hasSpawned = buildingLogic.inSpawnRange(player, building);
    });

    // Create throttled damage handler.
    collisionDamageFn = _.throttle(player.takeDamage.bind(player), 200, { 'leading': true, 'trailing': false });

    //Create bullets
    bullets = game.add.group();
    game.physics.enable(bullets, Phaser.Physics.ARCADE);

    //Create zombie swarm
    spawnWave();

    //Add lighting objects
    lighting = new Lighting(game);

    counts = properties.showStats ? Utilities.createCounts(game) : null;
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

    if (!run.over && (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) ||
        game.input.mousePointer.justPressed())) {
      player.shoot(bullets);
    }

    if (!run.over && game.time.now >= run.nextWave) {
      spawnWave();
    }

    if (!run.over && game.time.now >= run.nextGroan) {
      groan();
    }

    _.each(buildings.children, function(building) {
      buildingLogic.spawnZombiesFromBuilding(game, zombies, player, building);
    });

    _.each(zombies.children, function(zombie) {
      zombie.update();
    });

    lighting.update(game, player, buildings);

    if (counts) {
      Utilities.updateCounts(counts, zombies, buildings, staticObjects);
    }

    if (player.isDead() && !run.over) {
      run.over = true;
      player.kill();
      Sound.death();
      showDeathScreen();
    }

  };

  return gameState;
};
