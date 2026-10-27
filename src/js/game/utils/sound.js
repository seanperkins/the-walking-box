// Every effect is synthesised with WebAudio, so the game ships no audio files.
var properties = require('../properties');

var Sound = module.exports = {};

var ctx = null,
    master = null,
    noise = null;

function context() {
  if (ctx || properties.mute) {
    return ctx;
  }
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return null;
  }

  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);

  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  var data = noise.getChannelData(0);
  for (var i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

// Browsers keep audio suspended until the player interacts with the page.
function unlock() {
  if (context() && ctx.state === 'suspended') {
    ctx.resume();
  }
}
window.addEventListener('pointerdown', unlock);
window.addEventListener('keydown', unlock);

function envelope(peak, attack, decay) {
  var gain = ctx.createGain(),
      t = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  gain.connect(master);
  return gain;
}

function burst(options) {
  if (!context() || ctx.state !== 'running') {
    return;
  }
  var source = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      t = ctx.currentTime,
      length = options.attack + options.decay;

  source.buffer = noise;
  filter.type = options.filter;
  filter.frequency.setValueAtTime(options.from, t);
  filter.frequency.exponentialRampToValueAtTime(options.to, t + length);
  filter.Q.value = options.q || 1;

  source.connect(filter);
  filter.connect(envelope(options.volume, options.attack, options.decay));
  source.start(t, Math.random() * 0.5);
  source.stop(t + length);
}

function tone(options) {
  if (!context() || ctx.state !== 'running') {
    return;
  }
  var osc = ctx.createOscillator(),
      t = ctx.currentTime,
      length = options.attack + options.decay,
      out = envelope(options.volume, options.attack, options.decay);

  osc.type = options.type;
  osc.frequency.setValueAtTime(options.from, t);
  osc.frequency.exponentialRampToValueAtTime(options.to, t + length);

  if (options.formant) {
    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = options.formant;
    filter.Q.value = 4;
    osc.connect(filter);
    filter.connect(out);
  } else {
    osc.connect(out);
  }
  osc.start(t);
  osc.stop(t + length);
}

Sound.shot = function(kind) {
  if (kind === 'shotgun') {
    burst({ filter: 'lowpass', from: 2500, to: 150, attack: 0.002, decay: 0.35, volume: 1 });
    tone({ type: 'sine', from: 90, to: 35, attack: 0.002, decay: 0.25, volume: 0.8 });
  } else {
    burst({ filter: 'lowpass', from: 5000, to: 400, attack: 0.002, decay: 0.15, volume: 0.7 });
    tone({ type: 'sine', from: 160, to: 50, attack: 0.002, decay: 0.12, volume: 0.5 });
  }
};

Sound.dryFire = function() {
  burst({ filter: 'highpass', from: 3000, to: 3000, attack: 0.001, decay: 0.03, volume: 0.4 });
};

Sound.reloadClick = function() {
  burst({ filter: 'bandpass', from: 2200, to: 1800, q: 6, attack: 0.001, decay: 0.05, volume: 0.5 });
};

Sound.splat = function() {
  burst({ filter: 'bandpass', from: 900, to: 120, q: 2, attack: 0.005, decay: 0.3, volume: 0.9 });
};

Sound.ricochet = function() {
  tone({ type: 'triangle', from: 2400 + Math.random() * 800, to: 900, attack: 0.002, decay: 0.18, volume: 0.15 });
};

Sound.hurt = function() {
  tone({ type: 'sine', from: 140, to: 45, attack: 0.005, decay: 0.2, volume: 1 });
  burst({ filter: 'lowpass', from: 600, to: 100, attack: 0.005, decay: 0.15, volume: 0.6 });
};

// closeness: 0 (far) to 1 (on top of the player).
Sound.groan = function(closeness) {
  var pitch = 70 + Math.random() * 40;
  tone({ type: 'sawtooth', from: pitch, to: pitch * 0.7, formant: 400 + Math.random() * 300,
         attack: 0.15, decay: 0.6 + Math.random() * 0.5, volume: 0.05 + closeness * 0.5 });
};

Sound.death = function() {
  tone({ type: 'sawtooth', from: 110, to: 40, formant: 350, attack: 0.05, decay: 1.6, volume: 0.7 });
  burst({ filter: 'lowpass', from: 1200, to: 80, attack: 0.01, decay: 1.2, volume: 0.6 });
};
