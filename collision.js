/* 
collision.js
============

This JavaScript file contains 6 collision functions:

- hitTestPoint
- hitTestCircle
- rectangleCollision
- circleCollision
- movingCircleCollision
- bounceOffSurface

To use them you'll need sprite objects with these minimum properties:

    x, y, center.x, center.y, width, height

For rectangular sprites, you need these additional properties:

    halfWidth, halfHeight

For circular sprites, you need these additional properties:

    diameter, radius

Optionally the sprites can include a mass property:

    mass

Mass should have a value greater than 1.

See the `sprite.js` file for an example of sprite prototype objects
that use these properties.

*/

/*
hitTestPoint
------------

Use it to find out if a point is touching a circlular or rectangular sprite.
Parameters: 
a. An object with `x` and `y` properties.
b. A sprite object with `x`, `y`, `center.x` and `center.y` properties.
If the sprite has a `radius` property, the function will interpret
the shape as a circle.
*/

export function hitTestPoint(point, sprite) {

  let shape, left, right, top, bottom, v, magnitude, hit;

  //Find out if the sprite is rectangular or circular depending
  //on whether it has a `radius` property
  if (sprite.radius) {
    shape = "circle";
  } else {
    shape = "rectangle";
  }

  //Rectangle
  if (shape === "rectangle") {
    //Get the postion of the sprite's edges
    left = sprite.p.x;
    right = sprite.p.x + sprite.width;
    top = sprite.p.y;
    bottom = sprite.p.y + sprite.height;

    //Find out if the point is intersecting the rectangle
    hit = point.x > left && point.x < right && point.y > top && point.y < bottom;
  }

  //Circle
  if (shape === "circle") {
    //Find the distance between the point and the
    //center of the circle
    v = {
      x: point.x - sprite.center.x,
      y: point.y - sprite.center.y
    }
    magnitude = Math.sqrt(v.x * v.x + v.y * v.y);

    //The point is intersecting the circle if the magnitude
    //(distance) is less than the circle's radius
    hit = magnitude < sprite.radius;
  }

  return hit;
}

/*
hitTestCircle
-------------

Use it to find out if two circular sprites are touching.
Parameters: 
a. A sprite object with `center.x`, `center.y` and `radius` properties.
b. A sprite object with `center.x`, `center.y` and `radius`.
*/

export function hitTestCircle(c1, c2) {
  let v, magnitude, totalRadii, hit;

  //Calculate the vector between the circles’ center points
  v = {
    x: c1.center.x - c2.center.x,
    y: c1.center.y - c2.center.y
  };

  //Find the distance between the circles by calculating
  //the vector's magnitude (how long the vector is)  
  magnitude = Math.sqrt(v.x * v.x + v.y * v.y);

  //Add together the circles' total radii
  totalRadii = c1.radius + c2.radius;

  //Set hit to true if the distance between the circles is
  //less than their totalRadii
  hit = magnitude < totalRadii;

  return hit;
}

/*
circleCollision
---------------

Use it to prevent a moving circular sprite from overlapping and optionally
bouncing off a non-moving circular sprite.
Parameters: 
a. A sprite object with `p.x`, `p.y` `center.x`, `center.y` and `radius` properties.
b. A sprite object with `p.x`, `p.y` `center.x`, `center.y` and `radius` properties.
c. Optional: true or false to indicate whether or not the first sprite
should bounce off the second sprite.
The sprites can contain an optional mass property that should be greater than 1.

*/

export function circleCollision(c1, c2, bounce = true) {
  let magnitude, combinedRadii, overlap,
      v = {}, d = {}, s = {},
      hit = false;

  //Calculate the vector between the circles’ center points
  v.x = c2.center.x - c1.center.x;
  v.y = c2.center.y - c1.center.y;

  //Find the distance between the circles by calculating
  //the vector's magnitude (how long the vector is) 
  magnitude = Math.sqrt(v.x * v.x + v.y * v.y);

  //Add together the circles' combined half-widths
  combinedRadii = c1.radius + c2.radius;

  //Figure out if there's a collision
  if (magnitude < combinedRadii) {

    //Yes, a collision is happening.
    hit = true;

    //Find the amount of overlap between the circles 
    overlap = combinedRadii - magnitude;

    //Normalize the vector.
    //These numbers tell us the direction of the collision
    d.x = v.x / magnitude;
    d.y = v.y / magnitude;

    //Move circle 1 out of the collision by multiplying
    //the overlap with the normalized vector and subtract it from 
    //circle 1's position
    c1.p.x -= overlap * d.x;
    c1.p.y -= overlap * d.y;

    //Bounce    
    if (bounce) {
      //Create a collision vector object, `s` to represent the bounce surface.
      //Find the bounce surface's x and y properties
      //(This represents the normal of the distance vector between the circles)
      s.x = v.y;
      s.y = -v.x;

      //Bounce c1 off the surface
      bounceOffSurface(c1, s);
    } else {
      //Make it a bit slippery
      let friction = 0.9;
      c1.v.x *= friction;
      c1.v.y *= friction;
    }
  }

  return hit;
}

/*
movingCircleCollision
---------------------

Use it to make two moving circles bounce off each other.
Parameters: 
a. A sprite object with `x`, `y` `center.x`, `center.y` and `radius` properties.
b. A sprite object with `x`, `y` `center.x`, `center.y` and `radius` properties.
The sprites can contain an optional mass property that should be greater than 1.

*/

export function movingCircleCollision(c1, c2) {
  let combinedRadii, overlap, xSide, ySide,
      s = {
        v: {},
        d: {},
        l: {}
      },
      p1A = {}, p1B = {}, p2A = {}, p2B = {},
      hit = false;

  c1.mass = c1.mass || 1;
  c2.mass = c2.mass || 1;

  //Calculate the vector between the circles’ center points
  s.v.x = c1.center.x - c2.center.x;
  s.v.y = c1.center.y - c2.center.y;

  //Find the distance between the circles by calculating
  //the vector's magnitude (how long the vector is) 
  s.magnitude = Math.sqrt(s.v.x * s.v.x + s.v.y * s.v.y);

  //Add together the circles' combined half-widths
  combinedRadii = c1.radius + c2.radius;

  //Figure out if there's a collision
  if (s.magnitude < combinedRadii) {

    //Yes, a collision is happening
    hit = true;

    //Find the amount of overlap between the circles 
    overlap = combinedRadii - s.magnitude;

    //Normalize the vector.
    //These numbers tell us the direction of the collision
    s.d.x = s.v.x / s.magnitude;
    s.d.y = s.v.y / s.magnitude;

    //Find the collision vector.
    //Divide it in half to share between the circles, and make it absolute
    s.v.xHalf = Math.abs(s.d.x * overlap / 2);
    s.v.yHalf = Math.abs(s.d.y * overlap / 2);

    //Find the side that the collision if occuring on
    (c1.p.x > c2.p.x) ? xSide = 1 : xSide = -1;
    (c1.p.y > c2.p.y) ? ySide = 1 : ySide = -1;

    //Move c1 out of the collision by multiplying
    //the overlap with the normalized vector and adding it to 
    //the circle's positions
    c1.p.x = c1.p.x + (s.v.xHalf * xSide);
    c1.p.y = c1.p.y + (s.v.yHalf * ySide);

    //Move c2 out of the collision
    c2.p.x = c2.p.x + (s.v.xHalf * -xSide);
    c2.p.y = c2.p.y + (s.v.yHalf * -ySide);

    //1. Calculate the collision surface's properties

    //Find the surface vector's left normal
    s.l.x = s.v.y;
    s.l.y = -s.v.x;

    //2. Bounce c1 off the surface (s)

    //Find the dot product between c1 and the surface
    let dp1 = c1.v.x * s.d.x + c1.v.y * s.d.y;

    //Project c1's velocity onto the collision surface
    p1A.x = dp1 * s.d.x;
    p1A.y = dp1 * s.d.y;

    //Find the dot product of c1 and the surface's left normal (s.l.x and s.l.y)
    let dp2 = c1.v.x * (s.l.x / s.magnitude) + c1.v.y * (s.l.y / s.magnitude);

    //Project the c1's velocity onto the surface's left normal
    p1B.x = dp2 * (s.l.x / s.magnitude);
    p1B.y = dp2 * (s.l.y / s.magnitude);

    //3. Bounce c2 off the surface (s)

    //Find the dot product between c2 and the surface
    let dp3 = c2.v.x * s.d.x + c2.v.y * s.d.y;

    //Project c2's velocity onto the collision surface
    p2A.x = dp3 * s.d.x;
    p2A.y = dp3 * s.d.y;

    //Find the dot product of c2 and the surface's left normal (s.l.x and s.l.y)
    let dp4 = c2.v.x * (s.l.x / s.magnitude) + c2.v.y * (s.l.y / s.magnitude);

    //Project c2's velocity onto the surface's left normal
    p2B.x = dp4 * (s.l.x / s.magnitude);
    p2B.y = dp4 * (s.l.y / s.magnitude);

    //Calculate the bounce vectors
    //Bounce c1
    //using p1B and p2A
    c1.bounce = {};
    c1.bounce.x = p1B.x + p2A.x;
    c1.bounce.y = p1B.y + p2A.y;

    //Bounce c2
    //using p1A and p2B
    c2.bounce = {};
    c2.bounce.x = p1A.x + p2B.x;
    c2.bounce.y = p1A.y + p2B.y;

    //Add the bounce vector to the circles' velocity
    //and add mass if the circle has a mass property
    c1.v.x = c1.bounce.x / c1.mass;
    c1.v.y = c1.bounce.y / c1.mass;
    c2.v.x = c2.bounce.x / c2.mass;
    c2.v.y = c2.bounce.y / c2.mass;
  }
  return hit;
}

/*
hitTestRectangle
----------------

Use it to find out if two rectangular sprites are touching.
Parameters: 
a. A sprite object with `center.x`, `center.y`, `halfWidth` and `halfHeight` properties.
b. A sprite object with `center.x`, `center.y`, `halfWidth` and `halfHeight` properties.

*/

export function hitTestRectangle(r1, r2) {
  let hit, combinedHalfWidths, combinedHalfHeights, v = {};
  //A variable to determine whether there's a collision
  hit = false;

  //Calculate the distance vector
  v.x = r1.center.x - r2.center.x;
  v.y = r1.center.y - r2.center.y;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(v.x) < combinedHalfWidths) {
    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(v.y) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }

  return hit;
}

/*
rectangleCollision
------------------

Use it to prevent two rectangular sprites from overlapping. 
Optionally, make the first retangle bounceoff the second rectangle.
Parameters: 
a. A sprite object with `p.x`, `p.y` `center.x`, `center.y`, `halfWidth` and `halfHeight` properties.
b. A sprite object with `p.x`, `p.y` `center.x`, `center.y`, `halfWidth` and `halfHeight` properties.
c. Optional: true or false to indicate whether or not the first sprite
should bounce off the second sprite.
*/

export function rectangleCollision(r1, r2, bounce = false) {
  let collision, combinedHalfWidths, combinedHalfHeights,
      overlap = {},
      v = {};

  //A variable to tell us which side the 
  //collision is occurring on
  let collision;

  //Calculate the distance vector
  v.x = r1.center.x - r2.center.x;
  v.y = r1.center.y - r2.center.y;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check whether vx is less than the combined half widths 
  if (Math.abs(v.x) < combinedHalfWidths) {
    //A collision might be occurring! 
    //Check whether vy is less than the combined half heights 
    if (Math.abs(v.y) < combinedHalfHeights) {
      //A collision has occurred! This is good! 
      //Find out the size of the overlap on both the X and Y axes
      overlap.x = combinedHalfWidths - Math.abs(v.x);
      overlap.y = combinedHalfHeights - Math.abs(v.y);

      //The collision has occurred on the axis with the
      //*smallest* amount of overlap. Let's figure out which
      //axis that is

      if (overlap.x >= overlap.y) {
        //The collision is happening on the X axis 
        //But on which side? vy can tell us
        if (v.y > 0) {
          collision = "top";

          //Move the rectangle out of the collision
          r1.p.y = r1.p.y + overlap.y;
        } else {
          collision = "bottom";

          //Move the rectangle out of the collision
          r1.p.y = r1.p.y - overlap.y;
        }

        //Bounce
        if (bounce) {
          r1.v.y *= -1;

          /*Alternative
          //Find the bounce surface's vx and vy properties
          let s = {v:{}};
          s.v.x = r2.p.x - r2.p.x + r2.width; 
          s.v.y = 0;
	
          //Bounce r1 off the surface
          //bounceOffSurface(r1, s);
          */
        }
      } else {
        //The collision is happening on the Y axis 
        //But on which side? vx can tell us
        if (v.x > 0) {
          collision = "left";

          //Move the rectangle out of the collision
          r1.p.x = r1.p.x + overlap.x;
        } else {
          collision = "right";

          //Move the rectangle out of the collision
          r1.p.x = r1.p.x - overlap.x;
        }

        //Bounce
        if (bounce) {
          r1.v.x *= -1;

          /*Alternative
          //Find the bounce surface's vx and vy properties
          let s = {v:{}};
          s.v.x = 0; 
          s.v.y = r2.p.y - r2.p.y + r2.height;
		
          //Bounce r1 off the surface
          bounceOffSurface(r1, s);
          */
        }
      }
    } else {
      //No collision
    }
  } else {
    //No collision
  }

  return collision;
}

/*
bounceOffSurface
----------------

Use this to bounce an object off another object.
Parameters: 
a. An object with `v.x` and `v.y` properties. This represents the object that is colliding
with a surface.
b. An object with `x` and `y` properties. This represents the surface that the object
is colliding into.
The first object can optionally have a mass property that's greater than 1. The mass will
be used to dampen the bounce effect.
*/

function bounceOffSurface(o, s) {
  let dp1, dp2,
      p1 = {
        v: {}
      },
      p2 = {
        v: {}
      },
      bounce = {},
      mass = o.mass || 1;

  //1. Calculate the collision surface's properties
  //Find the surface vector's left normal
  s.l = {};
  s.l.x = s.y;
  s.l.y = -s.x;

  //Find its magnitude
  s.magnitude = Math.sqrt(s.x * s.x + s.y * s.y);

  //Find its normalized values
  s.d = {};
  s.d.x = s.x / s.magnitude;
  s.d.y = s.y / s.magnitude;

  //2. Bounce the object (o) off the surface (s)

  //Find the dot product between the object and the surface
  dp1 = o.v.x * s.d.x + o.v.y * s.d.y;

  //Project the object's velocity onto the collision surface
  p1.v.x = dp1 * s.d.x;
  p1.v.y = dp1 * s.d.y;

  //Find the dot product of the object and the surface's left normal (s.l.x and s.l.y)
  dp2 = o.v.x * (s.l.x / s.magnitude) + o.v.y * (s.l.y / s.magnitude);

  //Project the object's velocity onto the surface's left normal
  p2.v.x = dp2 * (s.l.x / s.magnitude);
  p2.v.y = dp2 * (s.l.y / s.magnitude);

  //Reverse the projection on the surface's left normal
  p2.v.x *= -1;
  p2.v.y *= -1;

  //Add up the projections to create a new bounce vector
  bounce.x = p1.v.x + p2.v.x;
  bounce.y = p1.v.y + p2.v.y;

  //Assign the bounce vector to the object's velocity
  //with optional mass to dampen the effect
  o.v.x = bounce.x / mass;
  o.v.y = bounce.y / mass;
}

/*
hitTestTile
------------------

Check for a collision between a sprite and a gid number in a tile map array.
Here’s how to use it:

    let collision = hitTestTile({
      sprite: anySprite,
      tileToFind: gidNumber,
      array: anyMapArray,
      pointsToCheck: “”,//A string: "center", "some" or "every"
      mapWidth: theMapWidth,
      tileWidth: theMapTileWidth,
      tileHeight: theMapTileHieght
    });
    
hitTestTile returns a collision object that contains these two properties:

  - collision.hit: A Boolean value that will be true if a collision occurred.
  - collision.index: a number that tells you the collision’s map array location

*/

export function hitTestTile(config) {
  //The variables we'll need
  let sprite = config.sprite,
      tileToFind = config.tileToFind,
      array = config.array,
      pointsToCheck = config.pointsToCheck || "some",
      mapWidth = config.mapWidth,
      tileWidth = config.tileWidth,
      tileHeight = config.tileHeight,
      points = {};

  //A collision object that will be returned by this function.
  //`collision.hit` will be true or false depending on whether a collision is detected.
  //`collision.index` will contain the map array index where the collision happened
  let collision = {};
  collision.hit = false;
  collision.index = 0;

  //We need 3 helper functions to figure all this out:
  //A.Find the sprite's corners
  function getPoints(s) {
    return {
      topLeft: {
        x: s.p.x,
        y: s.p.y
      },
      topRight: {
        x: s.p.x + s.width - 1,
        y: s.p.y
      },
      bottomLeft: {
        x: s.p.x,
        y: s.p.y + s.height - 1
      },
      bottomRight: {
        x: s.p.x + s.width - 1,
        y: s.p.y + s.height - 1
      }
    };
  }

  //B. Get the map array index number
  function getIndex(point) {
    let index = {};
    //Convert pixel coordinates to map coordinates
    index.x = Math.floor(point.x / tileWidth);
    index.y = Math.floor(point.y / tileHeight);
    //Return the index number
    return index.x + (index.y * mapWidth);
  }

  //C. Check the points for a collision
  function checkPoints(key) {
    //Convert the point's xy coordinate to its matching index number
    collision.index = getIndex(points[key]);
    //Find the grid id number of that same cell in the array
    let gid = array[collision.index];
    //If the grid id matches the `tileToFind`, return `true`
    if (gid === tileToFind) {
      return true;
    } else {
      return false;
    }
  }

  //Here's where the main logic starts.
  //Which points do we want to check?
  //"every", "some" or "center"?
  switch (pointsToCheck) {
    case "center":
      //`hit` will be true if only the center point is touching
      points = {
        center: sprite.center
      };
      collision.hit = Object.keys(points).some(checkPoints);
      break;
    case "every":
      //`hit` will be true if every point is touching
      points = getPoints(sprite);
      collision.hit = Object.keys(points).every(checkPoints);
      break;
    case "some":
      //`hit` will be true only if some points are touching
      points = getPoints(sprite);
      collision.hit = Object.keys(points).some(checkPoints);
      break;
  }

  //Return the collision object that contains the true/false
  //value of `collision.hit` and the map array location in `collision.index`
  return collision;
}

/*
Contain
-------

Keep a sprite contained within a rectangular area.
The first argument is a sprite, the next 4 arguments
define a rectangular area

    contain(sprite, containerX, containerY, containerWidth, containerHeight, bounce);

*/

export function contain(s, x, y, width, height, bounce = false, extra = undefined) {
  let collision;

  //Left
  if (s.p.x < x) {
    if (bounce) s.v.x *= -1;
    s.p.x = x;
    collision = "left";
  }
  //Top
  if (s.p.y < y) {
    if (bounce) s.v.y *= -1;
    s.p.y = y;
    collision = "top";
  }
  //Right
  if (s.p.x + s.width > width) {
    if (bounce) s.v.x *= -1;
    s.p.x = width - s.width;
    collision = "right";
  }
  //Bottom
  if (s.p.y + s.height > height) {
    if (bounce) s.v.y *= -1;
    s.p.y = height - s.height;
    collision = "bottom";
  }

  if (collision && extra) extra(collision);

  return collision;
}
