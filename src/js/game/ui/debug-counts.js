// Entity counts in the top right, shown only with ?debug.
var DebugCounts = function(game) {
  this.text = game.add.text(game.camera.width-600, 0, '', {
    fontSize: '14px',
    fill: '#Ff3333'
  });
  this.text.fixedToCamera = true;
};

DebugCounts.prototype.update = function(zombies, buildings, staticObjects) {
  var roamers = 0, lazy = 0;
  zombies.forEach(function(zombie) {
    if (zombie.roamer) { roamers++; } else { lazy++; }
  });

  this.text.text = 'Roamer Zombies: ' + roamers +
    ' | Lazy Zombies: ' + lazy +
    ' | Buildings: ' + buildings.length +
    ' | Static Objects ' + staticObjects.length;
};

module.exports = DebugCounts;
