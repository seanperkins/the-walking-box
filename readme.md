# The Walking Box

A game with no exposition but lots of zombies.

https://thewalkingbox.herokuapp.com/

## Requirements

### Node.js, Bower and Grunt

You will need to first install [Node.js](http://nodejs.org/download/) and the grunt-cli: `npm install -g grunt-cli`.

### Getting Started


    npm install

    bower install

And you should now be ready to spin up a development build of your new project:

    grunt

## Developing

Your first port of call will likely be to customise the properties found in `package.json` and `src/js/game/properties.js`.

All of the files required to run the game will live in the `src` folder, this will include any JavaScript, images, HTML ([Jade](http://jade-lang.com/)), and CSS ([Stylus](http://learnboost.github.io/stylus/)). When the default grunt task is invoked, these files are compiled to a `build` directory.

Files in the `build` directory will always be generated and excluded from Git by the `.gitignore`, as such these will removed without warning and should generally not be edited.

### Available Targets

#### `grunt`

Configures and runs an unminified development build optimised for fast watch performance with source maps and live reload.

#### `grunt build`

Creates an uglified, production ready build with no source maps.

#### `grunt optimise`

Lossy compression of all png's in the `src/images/` directory using [pngquant](http://pngquant.org/).

(Linux users will need to have a version of pngquant available on their paths.)

#### `grunt zip`

Compiles the current build into `{title}.zip` with an internal folder. This is intended for use when transferring the build to a third party for webserver upload.

#### `grunt cocoon`

Compiles the current build into `{title}.zip` ready for upload to [CocoonJs](https://www.ludei.com/cocoonjs/).

### Updating or Adding Libraries

The project comes with an unminified version of Phaser with arcade physics, this can be replaced if you require updates or one of the alternate physics engines.

When adding new libraries that aren't CommonJS compatible, you'll have to update the [Browserify Shim configuration](https://github.com/thlorenz/browserify-shim#3-provide-browserify-shim-config).

## Created from A Phaser.js Boilerplate

  Lots of thanks to Luke Wilde. Without the boiler plate we would have wasted hours I am sure.
  https://github.com/lukewilde/phaser-js-boilerplate
