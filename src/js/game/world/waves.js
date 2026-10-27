var _ = require('lodash'),
    Zombie = require('../entities/zombie'),
    Sound = require('../utils/sound');

var WAVE_INTERVAL = 25000,
    MAX_ZOMBIES = 150,
    SAFE_SPAWN_DISTANCE = 900,
    GROAN_RANGE = 600;

// Sends a bigger, faster wave of roamers every WAVE_INTERVAL and lets the nearest zombie groan.
var Waves = function(game, zombies, player) {
  this.game = game;
  this.zombies = zombies;
  this.player = player;
  this.wave = 0;
  this.nextWave = 0;
  this.nextGroan = 0;
};

Waves.prototype.spawnAwayFromPlayer = function(options) {
  var x, y;
  for (var tries = 0; tries < 20; tries++) {
    x = this.game.world.randomX;
    y = this.game.world.randomY;
    if (Phaser.Math.distance(x, y, this.player.x, this.player.y) > SAFE_SPAWN_DISTANCE) {
      break;
    }
  }
  Zombie.spawn(this.game, this.zombies, this.player, x, y, options);
};

Waves.prototype.spawnWave = function() {
  this.wave++;
  var size = Math.min(8 + this.wave * 6, MAX_ZOMBIES - this.zombies.length),
      speed = Math.min(1 + (this.wave - 1) * 0.06, 1.6);

  for (var k = 0; k < size; k++) {
    this.spawnAwayFromPlayer({roamer: true, speed: speed});
  }
  this.nextWave = this.game.time.now + WAVE_INTERVAL;
};

Waves.prototype.groan = function() {
  var player = this.player,
      nearest = Number.MAX_VALUE;

  this.zombies.forEachAlive(function(zombie) {
    nearest = Math.min(nearest, Phaser.Math.distance(zombie.x, zombie.y, player.x, player.y));
  });
  if (nearest < GROAN_RANGE) {
    Sound.groan(1 - nearest / GROAN_RANGE);
  }
  this.nextGroan = this.game.time.now + _.random(800, 2500);
};

Waves.prototype.update = function() {
  var now = this.game.time.now;
  if (now >= this.nextWave) {
    this.spawnWave();
  }
  if (now >= this.nextGroan) {
    this.groan();
  }
};

module.exports = Waves;
