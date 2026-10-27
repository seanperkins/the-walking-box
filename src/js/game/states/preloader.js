module.exports = function(game) {

  var preloader = {};

  preloader.preload = function () {
    game.load.image('hero', 'images/hero.png');
    game.load.image('zombie', 'images/zombie.png');
    game.load.image('car-1', 'images/car-1.png');
    game.load.image('car-2', 'images/car-2.png');
    game.load.image('tree', 'images/tree.png');
    game.load.image('building', 'images/building.png');
    game.load.image('bullet', 'images/bullet.png');
    game.load.image('hud-bullet', 'images/hud/bullet.png');
    game.load.image('blood', 'images/blood.png');
    game.load.image('health-pack', 'images/health-pack.png');
    game.load.image('button', 'images/restart-button.png');
    };

  preloader.create = function () {
    game.state.start('game');
  };

  return preloader;
};
