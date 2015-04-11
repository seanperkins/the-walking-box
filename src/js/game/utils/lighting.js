var Lighting = function(game) {

  // Create a bitmap texture for drawing light cones
  this.bitmap = game.add.bitmapData(game.world.width, game.world.height);
  this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
  this.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';
  this.lightBitmap = game.add.image(0, 0, this.bitmap);

  // This bitmap is drawn onto the screen using the MULTIPLY blend mode.
  // Since this bitmap is over the background, dark areas of the bitmap
  // will make the background darker. White areas of the bitmap will allow
  // the normal colors of the background to show through. Blend modes are
  // only supported in WebGL. If your browser doesn't support WebGL then
  // you'll see gray shadows and white light instead of colors and it
  // generally won't look nearly as cool. So use a browser with WebGL.
  this.lightBitmap.blendMode = Phaser.blendModes.MULTIPLY;

  // Create a bitmap for drawing rays
  this.rayBitmap = game.add.bitmapData(game.world.width, game.world.height);
  this.rayBitmapImage = game.add.image(0, 0, this.rayBitmap);
  this.rayBitmapImage.visible = false;
};

Lighting.prototype.constructor = Lighting;

//Returns closes intersection
function getWallIntersection(game, ray, walls) {
  var distanceToWall = Number.POSITIVE_INFINITY;
  var closestIntersection = null;

  // For each of the walls...
  walls.forEach(function(wall) {
      // Create an array of lines that represent the four edges of each wall
      var lines = [
          new Phaser.Line(wall.x, wall.y, wall.x + wall.width, wall.y),
          new Phaser.Line(wall.x, wall.y, wall.x, wall.y + wall.height),
          new Phaser.Line(wall.x + wall.width, wall.y,
              wall.x + wall.width, wall.y + wall.height),
          new Phaser.Line(wall.x, wall.y + wall.height,
              wall.x + wall.width, wall.y + wall.height)
      ];

      // Test each of the edges in this wall against the ray.
      // If the ray intersects any of the edges then the wall must be in the way.
      for(var i = 0; i < lines.length; i++) {
          var intersect = Phaser.Line.intersects(ray, lines[i]);
          if (intersect) {
              // Find the closest intersection
              var distance = game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
              if (distance < distanceToWall) {
                  distanceToWall = distance;
                  closestIntersection = intersect;
              }
          }
      }
  }, this);

  return closestIntersection;
}

Lighting.prototype.update = function(game, player, objects){

  //These are the equivelent of zero x and y values for the screen
  var zeroedX = game.camera.x;
  var zeroedY = game.camera.y;
  var limitedX = zeroedX + game.camera.width;
  var limitedY = zeroedY + game.camera.height;

  // Fill the entire light bitmap with a dark shadow color.
  this.bitmap.context.fillStyle = 'rgb(50, 50, 50)';
  this.bitmap.context.fillRect(zeroedX, zeroedY, game.camera.width, game.camera.height);

  // An array of the stage corners that we'll use later
  var stageCorners = [
    new Phaser.Point(zeroedX, zeroedY),
    new Phaser.Point(limitedX, zeroedY),
    new Phaser.Point(limitedX, limitedY),
    new Phaser.Point(zeroedX,  limitedY)
  ];

  // Ray casting!
  // Cast rays through the corners of each wall towards the stage edge.
  // Save all of the intersection points or ray end points if there was no intersection.
  var points = [];
  var ray = null;
  var intersect;
  var i;

  //Accepts a collection of entities
  objects.forEach(function(wall) {

    //Check to see if objects are within camera before calculating rays
    //This saves on processing and also helps with rendering
    if (wall.inCamera) {

      // Create a ray from the light through each corner out to the edge of the stage.
      // This array defines points just inside of each corner to make sure we hit each one.
      // It also defines points just outside of each corner so we can see to the stage edges.
      var corners = [
          new Phaser.Point(wall.x+0.1, wall.y+0.1),
          new Phaser.Point(wall.x-0.1, wall.y-0.1),

          new Phaser.Point(wall.x-0.1 + wall.width, wall.y+0.1),
          new Phaser.Point(wall.x+0.1 + wall.width, wall.y-0.1),

          new Phaser.Point(wall.x-0.1 + wall.width, wall.y-0.1 + wall.height),
          new Phaser.Point(wall.x+0.1 + wall.width, wall.y+0.1 + wall.height),

          new Phaser.Point(wall.x+0.1, wall.y-0.1 + wall.height),
          new Phaser.Point(wall.x-0.1, wall.y+0.1 + wall.height)
      ];

      // Calculate rays through each point to the edge of the stage
      for(i = 0; i < corners.length; i++) {
          var c = corners[i];

          // Here comes the linear algebra.
          // The equation for a line is y = slope * x + b
          // b is where the line crosses the left edge of the stage
          var slope = (c.y - player.y) / (c.x - player.x);
          var b = player.y - slope * player.x;

          var end = null;

          if (c.x === player.x) {
              // Vertical lines are a special case
              if (c.y <= player.y) {
                  end = new Phaser.Point(player.x, zeroedY);
              } else {
                  end = new Phaser.Point(player.x, limitedY);
              }
          } else if (c.y === player.y) {
              // Horizontal lines are a special case
              if (c.x <= player.x) {
                  end = new Phaser.Point(zeroedX, player.y);
              } else {
                  end = new Phaser.Point(limitedX, player.y);
              }
          } else {
              // Find the point where the line crosses the stage edge
              var left = new Phaser.Point(zeroedX, (slope*zeroedX)+b);
              var right = new Phaser.Point(limitedX, (slope*limitedX)+b);
              var top = new Phaser.Point((zeroedY-b)/slope, zeroedY);
              var bottom = new Phaser.Point((limitedY-b)/slope, limitedY);

              // Get the actual intersection point
              if (c.y <= player.y && c.x >= player.x) {
                  if (top.x >= zeroedX && top.x <= limitedX) {
                      end = top;
                  } else {
                      end = right;
                  }
              } else if (c.y <= player.y && c.x <= player.x) {
                  if (top.x >= zeroedX && top.x <= limitedX) {
                      end = top;
                  } else {
                      end = left;
                  }
              } else if (c.y >= player.y && c.x >= player.x) {
                  if (bottom.x >= zeroedX && bottom.x <= limitedX) {
                      end = bottom;
                  } else {
                      end = right;
                  }
              } else if (c.y >= player.y && c.x <= player.x) {
                  if (bottom.x >= zeroedX && bottom.x <= limitedX) {
                      end = bottom;
                  } else {
                      end = left;
                  }
              }
          }

          // Create a ray
          ray = new Phaser.Line(player.x, player.y, end.x, end.y);

          // Check if the ray intersected the wall
          intersect = getWallIntersection(game, ray, objects);
          if (intersect) {
              // This is the front edge of the light blocking object
              points.push(intersect);
          } else {
              // Nothing blocked the ray
              points.push(ray.end);
          }
      }
    }// End If for inCamera
  });

  // Shoot rays at each of the stage corners to see if the corner
  // of the stage is in shadow. This needs to be done so that
  // shadows don't cut the corner.
  for(i = 0; i < stageCorners.length; i++) {
    ray = new Phaser.Line(player.x, player.y,
        stageCorners[i].x, stageCorners[i].y);
    intersect = getWallIntersection(game, ray, objects);
    if (!intersect) {
        // Corner is in light
        points.push(stageCorners[i]);
    }
  }

  // Now sort the points clockwise around the light
  // Sorting is required so that the points are connected in the right order.
  //
  // This sorting algorithm was copied from Stack Overflow:
  // http://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
  //
  // Here's a pseudo-code implementation if you want to code it yourself:
  // http://en.wikipedia.org/wiki/Graham_scan
  var center = { x: player.x, y: player.y };
  points = points.sort(function(a, b) {
    if (a.x - center.x >= 0 && b.x - center.x < 0) {
        return 1;
    }
    if (a.x - center.x < 0 && b.x - center.x >= 0) {
        return -1;
    }
    if (a.x - center.x === 0 && b.x - center.x === 0) {
        if (a.y - center.y >= 0 || b.y - center.y >= 0) {
            return 1;
        }
        return -1;
    }

    // Compute the cross product of vectors (center -> a) x (center -> b)
    var det = (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y);
    if (det < 0) {
        return 1;
    }
    if (det > 0) {
        return -1;
    }

    return 1;
  });

  // Connect the dots and fill in the shape, which are cones of light,
  // with a bright white color. When multiplied with the background,
  // the white color will allow the full color of the background to
  // shine through.
  this.bitmap.context.beginPath();
  this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
  this.bitmap.context.moveTo(points[0].x, points[0].y);
  for(var j = 0; j < points.length; j++) {
    this.bitmap.context.lineTo(points[j].x, points[j].y);
  }
  this.bitmap.context.closePath();
  this.bitmap.context.fill();

  // Draw each of the rays on the rayBitmap
  this.rayBitmap.context.clearRect(zeroedX, zeroedY, game.camera.width, game.camera.height);
  this.rayBitmap.context.beginPath();
  this.rayBitmap.context.strokeStyle = 'rgb(255, 255, 255)';
  this.rayBitmap.context.fillStyle = 'rgb(255, 255, 255)';
  this.rayBitmap.context.moveTo(points[0].x, points[0].y);
  for(var k = 0; k < points.length; k++) {
    this.rayBitmap.context.moveTo(player.x, player.y);
    this.rayBitmap.context.lineTo(points[k].x, points[k].y);
    this.rayBitmap.context.fillRect(points[k].x-2, points[k].y-2, 4, 4);
  }
  this.rayBitmap.context.stroke();

  // This just tells the engine it should update the texture cache
  this.bitmap.dirty = true;
  this.rayBitmap.dirty = true;

  //Line for debugging
  // rayBitmapImage.visible = true;
};

module.exports = Lighting;