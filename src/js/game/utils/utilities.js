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

Utilities.createCounts = function (game) {
  var counts = game.add.text(game.camera.width-600, 0, 'Stats', {
    fontSize: '14px',
    fill: '#Ff3333'
  });
  counts.fixedToCamera = true;
  counts.visible = true;

  return counts;
};

Utilities.updateCounts = function (counts, zombies, buildings, staticObjects) {
  var countsText = '',
      zombieCounts = {roamer: 0, lazy: 0};
  zombies.forEach(function(zombie){if(zombie.roamer){zombieCounts.roamer +=1;}else{zombieCounts.lazy +=1;}});
  countsText += 'Roamer Zombies: ' + zombieCounts.roamer;
  countsText += ' | Lazy Zombies: ' + zombieCounts.lazy;
  countsText += ' | Buildings: ' + buildings.length;
  countsText += ' | Static Objects ' + staticObjects.length;
  counts.text = countsText;
  counts.update();
};