var CELL = 25,
    RECOMPUTE_INTERVAL = 150;

// Neighbour offsets: four orthogonal, then four diagonal.
var STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

// A flow field over the world: every open 25px cell knows how many steps it is from the target,
// so zombies can walk downhill through doorways and around walls, cars and trees.
var Navigation = function(game, obstacleGroups) {
  this.game = game;
  this.cols = Math.ceil(game.world.width / CELL);
  this.rows = Math.ceil(game.world.height / CELL);

  var size = this.cols * this.rows;
  this.blocked = new Uint8Array(size);
  this.distance = new Int32Array(size);
  this.queue = new Int32Array(size);
  this.targetCell = -1;
  this.nextCompute = 0;

  obstacleGroups.forEach(function(group) {
    group.forEach(function(sprite) {
      this.block(sprite.body.x, sprite.body.y, sprite.body.width, sprite.body.height);
    }, this);
  }, this);
};

Navigation.prototype.block = function(x, y, width, height) {
  var left = Math.max(0, Math.floor(x / CELL)),
      right = Math.min(this.cols - 1, Math.floor((x + width - 1) / CELL)),
      top = Math.max(0, Math.floor(y / CELL)),
      bottom = Math.min(this.rows - 1, Math.floor((y + height - 1) / CELL));

  for (var col = left; col <= right; col++) {
    for (var row = top; row <= bottom; row++) {
      this.blocked[row * this.cols + col] = 1;
    }
  }
};

Navigation.prototype.cellAt = function(point) {
  var col = Math.min(this.cols - 1, Math.max(0, Math.floor(point.x / CELL))),
      row = Math.min(this.rows - 1, Math.max(0, Math.floor(point.y / CELL)));
  return row * this.cols + col;
};

Navigation.prototype.open = function(col, row) {
  return col >= 0 && row >= 0 && col < this.cols && row < this.rows && !this.blocked[row * this.cols + col];
};

// Diagonal moves may not cut the corner of a blocked cell.
Navigation.prototype.canStep = function(col, row, step) {
  return this.open(col + step[0], row + step[1]) &&
    (step[0] === 0 || step[1] === 0 || (this.open(col + step[0], row) && this.open(col, row + step[1])));
};

// Breadth-first flood from the target's cell.
Navigation.prototype.compute = function(start) {
  var distance = this.distance, queue = this.queue, cols = this.cols, head = 0, tail = 0;

  distance.fill(-1);
  distance[start] = 0;
  queue[tail++] = start;

  while (head < tail) {
    var cell = queue[head++],
        col = cell % cols,
        row = (cell - col) / cols;

    for (var i = 0; i < STEPS.length; i++) {
      var next = (row + STEPS[i][1]) * cols + col + STEPS[i][0];
      if (this.canStep(col, row, STEPS[i]) && distance[next] === -1) {
        distance[next] = distance[cell] + 1;
        queue[tail++] = next;
      }
    }
  }
};

Navigation.prototype.update = function(target) {
  var cell = this.cellAt(target);
  if (cell !== this.targetCell && this.game.time.now >= this.nextCompute) {
    this.targetCell = cell;
    this.nextCompute = this.game.time.now + RECOMPUTE_INTERVAL;
    this.compute(cell);
  }
};

// The centre of the next cell to walk to from `from`, or null when the target is a step or two
// away (or unreachable) and should be approached directly.
Navigation.prototype.nextStep = function(from) {
  var cell = this.cellAt(from),
      col = cell % this.cols,
      row = (cell - col) / this.cols,
      here = this.distance[cell];

  if (here >= 0 && here <= 2) {
    return null;
  }

  var best = -1, bestDistance = here >= 0 ? here : Number.MAX_VALUE;
  for (var i = 0; i < STEPS.length; i++) {
    var next = (row + STEPS[i][1]) * this.cols + col + STEPS[i][0],
        d = this.canStep(col, row, STEPS[i]) ? this.distance[next] : -1;
    if (d >= 0 && d < bestDistance) {
      bestDistance = d;
      best = next;
    }
  }

  if (best < 0) {
    return null;
  }
  var bestCol = best % this.cols;
  return new Phaser.Point((bestCol + 0.5) * CELL, ((best - bestCol) / this.cols + 0.5) * CELL);
};

module.exports = Navigation;
