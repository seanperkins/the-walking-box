// Builds the game into build/. Pass --serve for a local dev server with rebuilds.
import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const serve = process.argv.includes('--serve');
const out = 'build';

rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/js`, { recursive: true });

cpSync('src/index.html', `${out}/index.html`);
cpSync('src/style', `${out}/style`, { recursive: true });
cpSync('src/images', `${out}/images`, { recursive: true });
cpSync('src/audio', `${out}/audio`, { recursive: true });
// Phaser CE ships PIXI/p2 globals that don't bundle cleanly, so it loads as its own script.
cpSync(require.resolve('phaser-ce/build/phaser.min.js'), `${out}/js/phaser.min.js`);

const options = {
  entryPoints: ['src/js/game/app.js'],
  bundle: true,
  minify: !serve,
  sourcemap: serve,
  outfile: `${out}/js/app.min.js`,
  define: { 'process.browser': 'true' },
  logLevel: 'info'
};

if (serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: out, port: 3017 });
  console.log(`Serving on http://localhost:${port}`);
} else {
  await esbuild.build(options);
}
