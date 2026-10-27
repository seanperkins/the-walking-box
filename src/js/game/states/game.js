var _ = require('lodash'),
    Player = require('../entities/player'),
    HealthPack = require('../entities/health-pack'),
    generateCity = require('../world/city'),
    Waves = require('../world/waves'),
    showDeathScreen = require('../ui/death-screen'),
    DebugCounts = require('../ui/debug-counts'),
    Lighting = require('../utils/lighting'),
    Sound = require('../utils/sound'),
    Effects = require('../utils/effects'),
    properties = require('../properties');

module.exports = function(game) {

  var gameState = {},
      staticObjects,
      buildings,
      zombies,
      healthPacks,
      player,
      bullets,
      waves,
      lighting,
      debugCounts,
      collisionDamageFn,
      run;

  function killZombie(bullet, zombie) {
    run.kills++;
    Sound.splat();
    Effects.splatter(game, zombie.x, zombie.y, 100, 1000);
    // Bullets are pooled by the weapon, so kill rather than destroy.
    bullet.kill();

    if (player.body.health !== player.maxPlayerHealth && _.random(0, 100, true) < 10) {
      HealthPack.drop(game, healthPacks, zombie.x, zombie.y);
    }

    // Destroy rather than kill so the zombie and its listeners can be garbage collected.
    zombie.destroy();
  }

  function bulletRicochet(bullet) {
    Sound.ricochet();
    bullet.kill();
    Effects.splatter(game, bullet.x, bullet.y, 10, 200, 0x444444);
  }

  function pickUpHealth(player, pack) {
    pack.destroy();
    player.addHealth();
  }

  function restart() {
    game.state.restart();
  }

  function endRun() {
    run.over = true;
    player.kill();
    Sound.death();
    showDeathScreen(game, { time: game.time.now - run.startedAt, kills: run.kills, wave: waves.wave }, restart);
  }

  gameState.create = function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Creation order is draw order: city, zombies, pickups, player, bullets, then lighting on top.
    var city = generateCity(game);
    staticObjects = city.staticObjects;
    buildings = city.buildings;
    zombies = game.add.group();
    healthPacks = game.add.group();

    player = new Player(game);
    run = { startedAt: game.time.now, kills: 0, over: false };

    // Buildings already in range of the spawn point stay empty so the opening is safe.
    buildings.forEach(function(building) {
      building.hasSpawned = building.inSpawnRange(player);
    });

    // Zombies keep touching the player, so damage is throttled.
    collisionDamageFn = _.throttle(player.takeDamage.bind(player), 200, { 'leading': true, 'trailing': false });

    bullets = game.add.group();

    waves = new Waves(game, zombies, player);
    waves.spawnWave();

    lighting = new Lighting(game);

    debugCounts = properties.showStats ? new DebugCounts(game) : null;
  };

  gameState.update = function() {
    game.camera.follow(player);

    game.physics.arcade.collide(player, staticObjects);
    game.physics.arcade.collide(player, zombies, collisionDamageFn);
    game.physics.arcade.collide(player, buildings);

    game.physics.arcade.collide(zombies, staticObjects);
    game.physics.arcade.collide(zombies, zombies);
    game.physics.arcade.collide(zombies, buildings);

    game.physics.arcade.overlap(bullets, zombies, killZombie);
    game.physics.arcade.overlap(bullets, buildings, bulletRicochet);
    game.physics.arcade.overlap(player, healthPacks, pickUpHealth);

    if (!run.over) {
      if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || game.input.mousePointer.justPressed()) {
        player.shoot(bullets);
      }
      waves.update();
    }

    buildings.forEach(function(building) {
      building.spawnZombies(zombies, player);
    });

    lighting.update(player, buildings);

    if (debugCounts) {
      debugCounts.update(zombies, buildings, staticObjects);
    }

    if (player.isDead() && !run.over) {
      endRun();
    }
  };

  return gameState;
};
