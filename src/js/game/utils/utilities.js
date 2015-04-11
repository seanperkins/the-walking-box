var Utilities = module.exports = {};

//Sets an objects speed based on the facing direction
Utilities.setSpeed = function (object, facing, speed) {
  var direction = {
                    'n' : [0,-1],
                    'ne': [1,-1],
                    'e' : [1,0],
                    'se': [1,1],
                    's' : [0,1],
                    'sw': [-1,1],
                    'w' : [-1,0],
                    'nw': [-1,-1]
                  };
  object.body.velocity.x = direction[facing][0]*speed;
  object.body.velocity.y = direction[facing][1]*speed;
};

Utilities.resetEntity = function (entity) {
  entity.body.velocity.x = 0;
  entity.body.velocity.y = 0;
};

Utilities.setBulletSpeed = function (object, angleInRadians, speed) {
  var yModifier = Math.sin(angleInRadians),
      xModifier = Math.cos(angleInRadians);

  object.body.velocity.x = xModifier*speed;
  object.body.velocity.y = yModifier*speed;
};

Utilities.calculateRotation = function (game, object) {
  var deltaX = game.input.mousePointer.worldX - object.position.x,
      deltaY = game.input.mousePointer.worldY - object.position.y;

  return Math.atan2(deltaY, deltaX);
};
