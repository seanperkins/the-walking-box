# The Walking Box

A game with no exposition but lots of zombies.

**Play it:** https://seanperkins.github.io/the-walking-box/

WASD to move, mouse to aim, click or space to shoot, R to reload, 1/2 or Q to switch between revolver and shotgun.
Survive the waves; your time, kills and best run show when the zombies get hungry. Enter restarts.

## Developing

Requires Node.js 20+.

    npm install
    npm run dev     # http://localhost:3017, rebuilds on change (refresh to reload)
    npm run build   # production build into build/
    npm run lint

Game code lives in `src/js/game` and is bundled with [esbuild](https://esbuild.github.io/).
The engine is [Phaser CE](https://github.com/photonstorm/phaser-ce) (the maintained Phaser 2 line),
loaded as a global from `js/phaser.min.js`. Images and audio in `src/images` and `src/audio` are
copied into `build/` as-is. Sound effects are synthesised with WebAudio in `src/js/game/utils/sound.js`.

Every push to `master` builds and deploys to GitHub Pages via `.github/workflows/pages.yml`.

### Debugging

The [debug](https://www.npmjs.com/package/debug) module is exported to the window as `window.gameDebug`.
Add `?debug` to the URL for the FPS meter and entity counts. Run `gameDebug.enable('walkingBox:*')` in the console to see game messages. The Phaser game instance is `window.game`.

## Credits

Originally built from Luke Wilde's [Phaser.js boilerplate](https://github.com/lukewilde/phaser-js-boilerplate).
Without it we would have wasted hours, I am sure.
