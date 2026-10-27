var _ = require('lodash');

// A flocking zombie: seeks its target while separating from and aligning with the rest of its group.
// Roamers chase the player from anywhere; lazy zombies only move while on screen.
var Zombie = function(game, x, y, group, target, options) {
  Phaser.Sprite.call(this, game, x, y, 'zombie');
  this.anchor.setTo(0.5, 0.5);
  this.game.physics.arcade.enableBody(this);
  this.body.collideWorldBounds = true;

  this.group = group;
  this.target = target;
  this.options = options || {};
  this.roamer = this.options.roamer;

  this.maxVelocity = _.random(150, 210, true) * (this.options.speed || 1);
  this.seekForce = 14;

  this.radius = Math.sqrt(this.height * this.height + this.width * this.width) / 2;
  this.desiredSeparation = 40.0;
  this.maxDistance = this.radius * 10.0;
};

Zombie.prototype = Object.create(Phaser.Sprite.prototype);
Zombie.prototype.constructor = Zombie;

// Adds a zombie to the group near (x, y), scattered by up to options.scatter (default 100px).
Zombie.spawn = function(game, group, target, x, y, options) {
  var scatter = options && options.scatter !== undefined ? options.scatter : 100;
  return group.add(new Zombie(game, x + _.random(0, scatter), y + _.random(0, scatter), group, target, options));
};

Zombie.prototype.update = function() {
  this.body.acceleration.setTo(0, 0);

  if (!this.roamer && !this.inCamera) {
    return;
  }

  if (this.target && this.target.exists) {
    // The group can provide a route function to steer through doors and around buildings.
    var goal = this.group.route ? this.group.route(this.position, this.target.position) : this.target.position,
        seekAccel = this.seek(goal);
    seekAccel.multiply(this.seekForce, this.seekForce);
    this.applyForce(seekAccel);
  }
  this.applyForce(this.separate());
  this.applyForce(this.align());

  this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
};

Zombie.prototype.applyForce = function(force) {
  this.body.acceleration = Phaser.Point.add(this.body.acceleration, force);
};

Zombie.prototype.seek = function(target) {
  var desired = Phaser.Point.subtract(target, this.position);

  desired.normalize();
  desired.multiply(this.maxVelocity, this.maxVelocity);

  return Phaser.Point.subtract(desired, this.body.velocity);
};

Zombie.prototype.separate = function() {
  var steer = new Phaser.Point();
  var count = 0;

  this.group.forEach(function(other) {
    var d = this.body.position.distance(other.body.position);
    if ((d > 0) && (d < this.desiredSeparation)) {
      var diff = Phaser.Point.subtract(this.body.position, other.body.position);
      diff.normalize();
      diff.divide(d, d);
      steer.add(diff.x, diff.y);
      count++;
    }
  }, this);

  if (count > 0) {
    steer.divide(count, count);
  }

  if (steer.getMagnitude() > 0) {
    steer.normalize();
    steer.multiply(this.maxVelocity, this.maxVelocity);
    steer.subtract(this.body.velocity.x, this.body.velocity.y);
  }

  return steer;
};

Zombie.prototype.align = function() {
  var sum = new Phaser.Point();
  var steer = new Phaser.Point();
  var count = 0;

  this.group.forEach(function(other) {
    var d = this.body.position.distance(other.body.position);
    if ((d > 0) && d < this.maxDistance) {
      sum.add(other.body.velocity.x, other.body.velocity.y);
      count++;
    }
  }, this);

  if (count > 0) {
    sum.divide(count, count);
    sum.normalize();
    sum.multiply(this.maxVelocity, this.maxVelocity);
    steer = Phaser.Point.subtract(sum, this.body.velocity);
  }

  return steer;
};

module.exports = Zombie;
