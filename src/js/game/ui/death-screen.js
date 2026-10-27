var BEST_KEY = 'walkingBox:best';

function formatTime(ms) {
  var seconds = Math.floor(ms / 1000),
      remainder = seconds % 60;
  return Math.floor(seconds / 60) + ':' + (remainder < 10 ? '0' : '') + remainder;
}

// Storage can be unavailable (private windows, blocked site data), so the best run is a nicety.
function loadBest() {
  try {
    return JSON.parse(window.localStorage.getItem(BEST_KEY)) || null;
  } catch (e) {
    return null;
  }
}

function saveBest(run) {
  try {
    window.localStorage.setItem(BEST_KEY, JSON.stringify(run));
  } catch (e) {}
}

// The only screen with words on it: how the run went, the best run, and a way back in.
// run is { time, kills, wave }; onRestart fires from the button or Enter.
module.exports = function showDeathScreen(game, run, onRestart) {
  var centerX = game.camera.view.centerX,
      centerY = game.camera.view.centerY,
      best = loadBest(),
      bestLine;

  if (!best || run.time > best.time) {
    bestLine = best ? 'new best' : '';
    saveBest(run);
  } else {
    bestLine = 'best ' + formatTime(best.time) + ' · ' + best.kills + ' kills';
  }

  function centered(y, text, style) {
    game.add.text(centerX, centerY + y, text, style).anchor.setTo(0.5, 0);
  }

  centered(-230, 'ZOMBIES GOT HUNGRY!', { fontSize: '50px', fill: '#Ff3333' });
  game.add.button(centerX, centerY-130, 'button', onRestart, null, 2, 1, 0).anchor.setTo(0.5, 0);
  centered(-30, formatTime(run.time) + ' · ' + run.kills + ' kills · wave ' + run.wave,
           { font: '24px Arial', fill: '#c9c9c9' });
  centered(5, bestLine, { font: '18px Arial', fill: '#888888' });

  game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.addOnce(onRestart);
};
