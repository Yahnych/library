
/*
Haiku 
=====
A shorthand API wrapper that saves on tedious typing
*/

//Dependencies
import {
  Sprite, Rectangle, Circle, Tile, RoundTile,
  Line, Message, Button, Group, Grid
} from "library/display";
import {
  hitTestPoint, hitTestRectangle, hitTestCircle,
  rectangleCollision, circleCollision, movingCircleCollision
} from "library/collision";
import Sound from "library/sound";

/*
rectangle
---------
Rectangle sprite
*/

export function rectangle(
    x, y, width, height, rotation, fillStyle,
    strokeStyle = "none", lineWidth = 0
  ){
  return new Rectangle({
    p: {x, y},
    width, height, rotation, fillStyle, strokeStyle, lineWidth
  });
}

/*
circle
------
Circle sprite
*/

export function circle(
    x, y, diameter, rotation,
    fillStyle, strokeStyle = "none", lineWidth = 0
  ){
  return new Circle({
    p: {x, y},
    diameter, rotation, fillStyle, strokeStyle, lineWidth
  });
}

/*
tile
----
Tile sprite
*/

export function tile(
    x, y, width, height, rotation, source, 
    sourceX, sourceY, sourceWidth, sourceHeight
  ){
  return new Tile({
    p: {x, y}, width, height, rotation, 
    image: {
      source, 
      x: sourceX, y: sourceY, 
      width: sourceWidth, height: sourceHeight
    }
  });
}

/*
roundTile
---------
RoundTile sprite
*/

export function roundTile(
    x, y, diameter, rotation, source, 
    sourceX, sourceY, sourceWidth, sourceHeight
  ){
  return new Tile({
    p: {x, y}, diameter, rotation, 
    image: {
      source, 
      x: sourceX, y: sourceY, 
      width: sourceWidth, height: sourceHeight
    }
  });
}

/*
line
----
Line sprite
*/

export function line(
    ax, ay, bx, by, strokeStyle, lineWidth
  ){
  return new Line({
    a: {x: ax, y: ay},
    b: {x: bx, y: by},
    strokeStyle, lineWidth  
  });
}

/*
message
-------
Message sprite
*/

export function message(x, y, text, font, fillStyle){
  return new Message({p: {x, y}, text, font, fillStyle});
}

/*
button
------
Button sprite
*/

export function button(
    x, y, width, height, rotation, 
    source, sourceWidth, sourceHeight, 
    upX, upY, overX, overY, downX, downY,
    press = undefined, release = undefined
  ){
  return new Button({
    p: {x, y}, width, height, rotation, 
    image: {
      source, 
      width: sourceWidth, height: sourceHeight
    },
    states: {
      up: {x: upX, y: upY},
      over: {x: overX, y: overY},
      down: {x: downX, y: downY}
    },
    press, release
  });
}

/*
group
-----
Group
*/

export function group(...spritesToGroup) {
  return new Group(...spritesToGroup);
}

/*
sound
-----
Sound
*/

export function sound(source, volume = 1, pan = 0, loop = false, startPlaying = false) {
  let sound = source;
  sound.volume = volume;
  sound.pan = pan; 
  sound.loop = loop;
  if(startPlaying) {
    sound.play();
  }
  return sound;
}

/*
hit
---
A convenient universal collision function to test for collisions
between rectangles, circles, and points.
*/

export function hit(a, b, react = false, bounce = false, extra = undefined) {
  let collision;

  //Check to make sure one of the arguments isn't an array
  if (a instanceof Sprite && b instanceof Array 
  || b instanceof Sprite && a instanceof Array) {
    //If it is, check for a collision between a sprite and an array
    spriteVsArray();
  } else {
    //If one of the arguments isn't array, find out what type of
    //collision check to run
    collision = findCollisionType(a, b); 
    if (collision && extra) extra(collision);
  }
  
  //Return the result of the collision.
  //It will be `undefined` if there's no collision and `true` if 
  //there is a collision. `rectangleCollision` sets `collsision` to
  //"top", "bottom", "left" or "right" depeneding on which side the
  //collision is occuring on
  return collision;

  function findCollisionType (a, b) {
    //Are `a` and `b` both sprites?
    if (a instanceof Sprite && b instanceof Sprite) {
      //Yes, but what kind of sprites?
      if(a.diameter && b.diameter) {
        //They're cicles
        return circleVsCircle(a, b);
      } else {
        //They're rectangles
        return rectangleVsRectangle(a, b);
      }
    }
    //They're not both sprites, so what are they?
    //Does `a` have x and y properties?
    else if (a.x && a.y && b instanceof Sprite) {
      //Yes, so this is a point vs. sprite collision test
      return hitTestPoint(a, b);
    }
    else {
      //The user is trying to test some incompatible objects
      throw new Error(`I'm sorry, ${a} and ${b} cannot be use together in a collision test.'`);
    }
  }
  
  function spriteVsArray() {
    //If `a` happens to be the array, flip it around so that it becomes `b`
    if (a instanceof Array) {
      let [a, b] = [b, a];
    }
    //Loop through the array in reverse
    for (let i = b.length - 1; i >= 0; i--) {
      let sprite = b[i];
      collision = findCollisionType(a, sprite); //spriteVsSprite(a, sprite);
      if (collision && extra) extra(collision, sprite);
    }
  }

  function circleVsCircle(a, b) {
    //If the circles shouldn't react to the collision,
    //just test to see if they're touching
    if(!react) {
      return hitTestCircle(a, b);
    } 
    //Yes, the cicles should react to the collision
    else {
      //Are they both moving?
      if (a.v.x + a.v.y !== 0 && b.v.x + b.v.y !== 0) {
        //Yes, they are both moving
        //(moving circle collisions always bounce apart so there's
        //no need for the third, `bounce`, argument)
        return movingCircleCollision(a, b);
      }
      else {
        //No, they're not both moving
        //Should they bounce apart?
        //Yes
        if(bounce) {
          return circleCollision(a, b, false);
        } 
        //No
        else {
          return circleCollision(a, b, true); 
        }
      }
    }
  }

  function rectangleVsRectangle(a, b) {
    //If the rectangles shouldn't react to the collision, just
    //test to see if they're touching
    if(!react) {
      return hitTestRectangle(a, b);
    } 
    //Yes
    else {
      //Should they bounce apart?
      //Yes
      if(bounce) {
        return rectangleCollision(a, b, true);
      } 
      //No
      else {
        return rectangleCollision(a, b, false); 
      }
    }
  }
  /*
  function spriteVsSprite(a, b) {
    //Both objects are sprites, but what kind of sprites?

    //Circles
    if(a.diameter && b.diameter) {
      //Should they react to the collision?
      //No, they shouldn't react
      if(!react) {
        return hitTestCircle(a, b);
      } 
      //Yes, they should react
      else {
        //Are they both moving?
        if (a.v.x + a.v.y !== 0 && b.v.x + b.v.y !== 0) {
          //Yes, they are both moving
          //(moving circle collisions always bounce apart so there's
          //no need for the third, `bounce`, argument)
          return movingCircleCollision(a, b);
        }
        else {
          //No, they're not both moving
          //Should they bounce apart?
          //Yes
          if(bounce) {
            return circleCollision(a, b, false);
          } 
          //No
          else {
            return circleCollision(a, b, true); 
          }
        }
      }
    }

    //Rectangles
    if (!a.diameter && !b.diameter) {
      //Should they react to the collision?
      //No
      if(!react) {
        return hitTestRectangle(a, b);
      } 
      //Yes
      else {
        //Should they bounce apart?
        //Yes
        if(bounce) {
          return rectangleCollision(a, b, true);
        } 
        //No
        else {
          return rectangleCollision(a, b, false); 
        }
      }
    }
  }
  */
}


/*
game
----
Zen-mode convenience function for creating new Game object
(You'll find it the `game.js` file so that it avoids a circular dependancy)

export function game(width, height, setup, play, assets, load) {
  let game = new Game({width, height, setup, play, assets, load});
  game.start();
  return game;
}

*/

/*
grid
----
Grid
*/

export function grid(
    x = 0, y = 0, width = 5, height = 5, 
    cellWidth = 32, cellHeight = 32,centerCell = false, 
    makeSprite = undefined, extra = undefined
  ) { 
  return new Grid({
    p: {x, y}, width, height, cellWidth, cellHeight, centerCell, 
    makeSprite, extra
  });
}

