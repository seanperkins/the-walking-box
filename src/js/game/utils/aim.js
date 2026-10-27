var Aim = module.exports = {};

// Angle from the sprite to the mouse, in world space.
Aim.toPointer = function(game, sprite) {
  var pointer = game.input.mousePointer;
  return Math.atan2(pointer.worldY - sprite.position.y, pointer.worldX - sprite.position.x);
};

Aim.setVelocity = function(sprite, angle, speed) {
  sprite.body.velocity.setTo(Math.cos(angle) * speed, Math.sin(angle) * speed);
};
