// Line-of-sight lighting: rays are cast from the player past the corners of every on-screen
// occluder, and the lit polygon they outline is multiplied over the scene so everything
// outside it falls into shadow.
var Lighting = function(game) {
  this.game = game;

  // A screen-sized bitmap, moved to the camera each frame and drawn in world coordinates
  // by offsetting the context by the same amount.
  this.bitmap = game.add.bitmapData(game.camera.width, game.camera.height);
  this.image = game.add.image(0, 0, this.bitmap);

  // MULTIPLY lets white (lit) areas show the scene and darkens the rest. Blend modes need WebGL;
  // on canvas you get grey shadows and white light instead.
  this.image.blendMode = Phaser.blendModes.MULTIPLY;
};

function edges(rect) {
  return [
    new Phaser.Line(rect.x, rect.y, rect.x + rect.width, rect.y),
    new Phaser.Line(rect.x, rect.y, rect.x, rect.y + rect.height),
    new Phaser.Line(rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height),
    new Phaser.Line(rect.x, rect.y + rect.height, rect.x + rect.width, rect.y + rect.height)
  ];
}

// Closest point where the ray hits any occluder edge, or null.
function closestIntersection(ray, occluders) {
  var closest = null,
      closestDistance = Number.POSITIVE_INFINITY;

  occluders.forEach(function(lines) {
    for (var i = 0; i < lines.length; i++) {
      var hit = Phaser.Line.intersects(ray, lines[i]);
      if (hit) {
        var distance = Phaser.Math.distance(ray.start.x, ray.start.y, hit.x, hit.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = hit;
        }
      }
    }
  });

  return closest;
}

// Where a ray from origin through target leaves the view rectangle.
function exitPoint(origin, target, view) {
  var dx = target.x - origin.x,
      dy = target.y - origin.y,
      t = Number.POSITIVE_INFINITY;

  if (dx > 0) { t = Math.min(t, (view.right - origin.x) / dx); }
  if (dx < 0) { t = Math.min(t, (view.x - origin.x) / dx); }
  if (dy > 0) { t = Math.min(t, (view.bottom - origin.y) / dy); }
  if (dy < 0) { t = Math.min(t, (view.y - origin.y) / dy); }
  if (t === Number.POSITIVE_INFINITY) { return target; }

  return new Phaser.Point(origin.x + dx * t, origin.y + dy * t);
}

// Points just inside and just outside each corner, so rays both hit the corner and graze past it.
function cornerTargets(rect) {
  var left = rect.x, top = rect.y, right = rect.x + rect.width, bottom = rect.y + rect.height;
  return [
    new Phaser.Point(left + 0.1, top + 0.1), new Phaser.Point(left - 0.1, top - 0.1),
    new Phaser.Point(right - 0.1, top + 0.1), new Phaser.Point(right + 0.1, top - 0.1),
    new Phaser.Point(right - 0.1, bottom - 0.1), new Phaser.Point(right + 0.1, bottom + 0.1),
    new Phaser.Point(left + 0.1, bottom - 0.1), new Phaser.Point(left - 0.1, bottom + 0.1)
  ];
}

// Sort clockwise around the light so the polygon connects in order.
// See http://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
function clockwise(center) {
  return function(a, b) {
    if (a.x - center.x >= 0 && b.x - center.x < 0) { return 1; }
    if (a.x - center.x < 0 && b.x - center.x >= 0) { return -1; }
    if (a.x - center.x === 0 && b.x - center.x === 0) {
      return (a.y - center.y >= 0 || b.y - center.y >= 0) ? 1 : -1;
    }
    var det = (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y);
    return det > 0 ? -1 : 1;
  };
}

// Lights the scene from the player; objects is a group of rectangular occluders.
Lighting.prototype.update = function(player, objects) {
  var view = this.game.camera.view,
      context = this.bitmap.context,
      light = new Phaser.Point(player.x, player.y),
      visible = objects.filter(function(object) { return object.inCamera; }).list,
      occluders = visible.map(edges),
      points = [];

  function castThrough(target) {
    var end = exitPoint(light, target, view);
    points.push(closestIntersection(new Phaser.Line(light.x, light.y, end.x, end.y), occluders) || end);
  }

  visible.forEach(function(object) {
    cornerTargets(object).forEach(castThrough);
  });

  // Rays to the corners of the view so shadows don't cut across them.
  [ new Phaser.Point(view.x, view.y), new Phaser.Point(view.right, view.y),
    new Phaser.Point(view.right, view.bottom), new Phaser.Point(view.x, view.bottom)
  ].forEach(function(corner) {
    if (!closestIntersection(new Phaser.Line(light.x, light.y, corner.x, corner.y), occluders)) {
      points.push(corner);
    }
  });

  points.sort(clockwise(light));

  this.image.position.setTo(view.x, view.y);
  context.setTransform(1, 0, 0, 1, -view.x, -view.y);

  // Shadow everywhere, then the lit polygon in white.
  context.fillStyle = 'rgb(50, 50, 50)';
  context.fillRect(view.x, view.y, view.width, view.height);

  context.beginPath();
  context.fillStyle = 'rgb(255, 255, 255)';
  context.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < points.length; i++) {
    context.lineTo(points[i].x, points[i].y);
  }
  context.closePath();
  context.fill();

  context.setTransform(1, 0, 0, 1, 0, 0);
  this.bitmap.dirty = true;
};

module.exports = Lighting;
