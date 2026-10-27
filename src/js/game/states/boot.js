var Stats = require('stats.js')
  , properties = require('../properties');

module.exports = function(game) {

  var boot = {};

  boot.create = function () {

    if (properties.showStats) {
      addStats();
    }

    //Set world size to populate initially
    game.world.width = 3000;
    game.world.height = 3000;
    game.world.setBounds(0, 0, 3000, 3000); //Don't forget to setBounds so the camera follows

    game.stage.backgroundColor = '#222222';

    // Scale the fixed-size game to fit the space under the header, keeping its aspect ratio.
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.sound.mute = properties.mute;

    game.state.start('preloader');
  };


  function addStats() {
    var stats = new Stats();

    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.right = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);

    setInterval(function () {
      stats.begin();
      stats.end();
    }, 1000 / 60);
  }

  return boot;
};
