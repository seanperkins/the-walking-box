var Boid = function(game, x, y, group, options) {
  Phaser.Sprite.call(this, game, x, y, 'zombie');
  this.anchor.setTo(0.5, 0.5);
  this.group = group;
  this.game.physics.arcade.enableBody(this);

  this.options = options || {};
  this.cannibal = this.options.cannibal;
  this.roamer = this.options.roamer;
  
  this.maxVelocity = 100.0;
  this.maxForce = 10.0;
  this.seekForce = 0.5;
  
  this.radius = Math.sqrt(this.height * this.height + this.width * this.width) / 2;

  this.desiredSeparation = 40.0;
  this.maxDistance = this.radius * 10.0;
  
};

Boid.prototype = Object.create(Phaser.Sprite.prototype);
Boid.prototype.constructor = Boid;

Boid.prototype.update = function() {
  this.body.acceleration.setTo(0,0);
  //Roamer zombies continue to persue the player even when not on screen
  if (this.roamer || this.inCamera){
    if(this.target && this.target.exists) {
      var seekAccel = Phaser.Point();
      if(this.target instanceof Phaser.Group) {
        seekAccel = this.seekGroup();
      } else {
        seekAccel = this.seek(this.target.body.position);
      }
      seekAccel.multiply(this.seekForce, this.seekForce);
      this.applyForce(seekAccel);
    }
    this.applyForce(this.separate());
    this.applyForce(this.align());
    this.cohesion();
    
    this.checkBorders();
    this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);    
  }
};

Boid.prototype.applyForce = function(force) {
  this.body.acceleration = Phaser.Point.add(this.body.acceleration, force);
};

Boid.prototype.seekGroup = function(targetGroup) {

  var closest = null;
  var distance = Number.MAX_VALUE;
  targetGroup = targetGroup || this.target;
  targetGroup.forEachExists(function(target) {
    var d = this.body.position.distance(target.body.position);
    if(d < distance) {
      distance = d;
      closest = target;
    }
  }, this);
  if(closest) {
    return this.seek(closest.body.position);  
  }
  return new Phaser.Point();
};

Boid.prototype.seek = function(target) {
  var desired = Phaser.Point.subtract(target, this.body.position);

  desired.normalize();
  desired.multiply(this.maxVelocity, this.maxVelocity);

  var steer = Phaser.Point.subtract(desired, this.body.velocity);
  return steer;
};

Boid.prototype.lookAtClosest = function() {
  var target = null;
  var dist = 0;
  this.group.forEach(function(boid) {
    if (boid.body.position !== this.body.position) {
      var distBetween = this.game.physics.arcade.distanceBetween(this, boid);
      if(!target ||  distBetween < dist) {
        dist = distBetween;
        target = boid;
      }
    }
  },this);

  if(!!target) {
    this.rotation = this.game.physics.arcade.angleBetween(this, target);
  }
};

Boid.prototype.separate = function() {
  var steer = new Phaser.Point();
  var count = 0;

  this.group.forEach(function(boid) {
    var d = this.body.position.distance(boid.body.position);
    if((d > 0) && (d < this.desiredSeparation)) {
      var diff = Phaser.Point.subtract(this.body.position, boid.body.position);
      diff.normalize();
      diff.divide(d,d);
      steer.add(diff.x,diff.y);
      count++;
    }
  }, this);

  if(count > 0) {
    steer.divide(count, count);
  }

  if(steer.getMagnitude() > 0) {
    steer.normalize();
    steer.multiply(this.maxVelocity, this.maxVelocity);
    steer.subtract(this.body.velocity.x, this.body.velocity.y);
  }

  return steer;
};


Boid.prototype.cohesion = function() {
  
  var sum = new Phaser.Point();
  var steer = new Phaser.Point();
  var count = 0;

  this.group.forEach(function(boid) {
    var d = this.body.position.distance(boid.body.position);
    if ((d > 0) && d < this.maxDistance) {
      sum.add(boid.body.position.x, boid.body.position.y);
      count++;
    }
  }, this);

  if (count > 0) {
    sum.divide(count, count);  
    return this.seek(sum);
  }
  return steer;
};


Boid.prototype.align = function() {
  var sum = new Phaser.Point();
  var steer = new Phaser.Point();
  var count = 0;
  this.group.forEach(function(boid) {
    var d = this.body.position.distance(boid.body.position);
    if ((d > 0) && d < this.maxDistance) {
      sum.add(boid.body.velocity.x, boid.body.velocity.y);
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

Boid.prototype.checkBorders = function() {
  if(this.body.position.x < -this.radius ){
    this.body.position.x = this.world.width + this.radius;
  }
  if(this.body.position.y < -this.radius ){
    this.body.position.y = this.world.height + this.radius;
  }
  if(this.body.position.x > this.world.width + this.radius ){
    this.body.position.x = -this.radius;
  }
  if(this.body.position.y > this.world.height + this.radius ){
    this.body.position.y = -this.radius;
  }
};
module.exports = Boid;