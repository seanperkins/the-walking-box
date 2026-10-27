var HealthPack = module.exports = {};

// Drops a pulsing health pack into the group at (x, y).
HealthPack.drop = function(game, group, x, y) {
  var pack = group.create(x, y, 'health-pack');
  game.physics.enable(pack, Phaser.Physics.ARCADE);
  pack.anchor.setTo(0.5, 0.5);
  pack.body.immovable = true;
  game.add.tween(pack.scale).to({ x: 1.3, y: 1.3 }, 500, Phaser.Easing.Quadratic.InOut, true, 0, 100, true);
  return pack;
};
