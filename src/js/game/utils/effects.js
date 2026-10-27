var Effects = module.exports = {};

// One-shot particle burst that destroys its emitter once the particles have faded.
Effects.splatter = function(game, x, y, count, lifespan, tint) {
  var emitter = game.add.emitter(x, y, count);
  emitter.makeParticles('blood');
  emitter.gravity = 0;
  if (tint) {
    emitter.forEach(function(particle) {
      particle.tint = tint;
    });
  }

  emitter.start(true, lifespan, null, count);
  game.time.events.add(lifespan + 100, emitter.destroy, emitter);
};
