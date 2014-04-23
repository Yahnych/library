/* 
display.js
==========

This JavaScript file contains functions and objects useful for
creating and rendering canvas based sprites.

*/

//Dependencies
//requestAnimationFrame polyfill
import "library/plugins/rAF";
//`hitTestPoint` needed for the Button class's `update` method
import {hitTestPoint} from "library/collision"

/*
makeCanvas
----------

Make the canvas using default properties, like this:

    let canvas = makeCanvas();
    
You can then access the context as `canvas.ctx`.

Optionally customize the canvas with a configuration object:

    let canvas = makeCanvas({
      width: 500,
      height: 400,
      border: "none",
      backgroundColor: "black"
    });
*/

export function makeCanvas(config) {
  //Set the config objet's values, or, if they're undefined,
  //set default values
  let config = config || {},
    width = config.width || "256",
    height = config.height || "256",
    border = config.border || "1px dashed black",
    backgroundColor = config.backgroundColor || "white";

  //Make the canvas element and add it to the DOM
  let canvas = document.createElement("canvas");
  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);
  canvas.style.border = border;
  canvas.style.backgroundColor = backgroundColor;
  document.body.appendChild(canvas);

  //Create the context as a property of the canvas
  canvas.ctx = canvas.getContext("2d");

  //Return the canvas
  return canvas;
}

export let groups = [];

export class Group extends Array {
  constructor(...spritesToGroup) {
    if (spritesToGroup) {
      spritesToGroup.forEach((sprite) => {
        if (sprite instanceof Sprite) {
          this.push(sprite);
        } else {
          throw new Error("You can only add Sprite objects to Groups");
        }
      });
    }
    //Add the group to the global array of groups
    //(This is make it easier to add and remove sprites from a game)
    groups.push(this);
  }
  //Group getters and setters for some of the sprites' properties
  get x() {
    if (this.length > 1) {
      return this.reduce((a, b) => Math.min(a.p.x, b.p.x));
    } else {
      //If there's only one sprite in the array, get its value
      return this[0].p.x;
    }
  }
  set x(value) {
    //find the group's current x position
    let currentX = this.x;
    this.forEach((sprite) => {
      //The offset is equal to the difference between the 
      //group's `currentX` position and its new `value`
      let offset = value - currentX;
      sprite.p.x += offset;
    });
  }
  get y() {
    if (this.length > 1) {
      return this.reduce((a, b) => Math.min(a.p.y, b.p.y));
    } else {
      return this[0].p.y;
    }
  }
  set y(value) {
    //find the group's current x position
    let currentY = this.y;
    this.forEach((sprite) => {
      //The offset is equal to the difference between the 
      //group's `currentX` position and its new `value`
      let offset = value - currentY;
      sprite.p.y += offset;
    });
  }
  get layer() {
    if (this.length > 1) {
      return this.reduce((a, b) => Math.min(a.layer, b.layer));
    } else {
      return this[0].layer;
    }
  }
  set layer(value) {
    this.forEach((sprite) => {
      sprite.layer = value;
    });
    sprites.sort(byLayer);
  }
  get alpha() {
    //The sprite with the heighest alpha value should represent the
    //group's alpha value
    if (this.length > 1) {
      return this.reduce((a, b) => Math.max(a.alpha, b.alpha));
    } else {
      return this[0].alpha;
    }
  }
  set alpha(value) {
    this.forEach((sprite) => sprite.alpha = value);
  }
  get visible() {
    if (this.length > 1) {
      return this.some((sprite) => sprite.visible);
    } else {
      return this[0].visible;
    }
  }
  set visible(value) {
    this.forEach((sprite) => sprite.visible = value);
  }
  get empty() {
    //Use `empty` to check whether this group contains sprites
    return(this.length > 0) ? false : true;
  }
  //Add and remove methods
  add(...spritesToAdd) {
    spritesToAdd.forEach((sprite) => {
      if (sprite instanceof Sprite) {
        this.push(sprite);
      } else {
        throw new Error("You can only add Sprite objects to Groups");
      }
    });
  }
  ungroup(...spritesToRemove) {
    spritesToRemove.forEach((sprite) => {
      let index = this.indexOf(sprite) 
      if (index !== -1) {
        this.splice(this.indexOf(sprite), 1);
      } else {
        throw new Error(`${sprite} is not part of the group ${this}`);
      }
    });
  }
  //A function that loops through all the sprites in the group
  //(in reverse) and performs a user-definable action each sprite
  loop(action) {
    for (var i = this.length - 1; i >= 0; i--) {
      let sprite = this[i];
      if (action) action(sprite);
    } 
  }
}

export function remove(...elementsToRemove) {
  elementsToRemove.forEach((element) => {
    //If the element is a Sprite...
    if (element instanceof Sprite) {
      //Remove the sprite from any group arrays that it blongs to
      groups.forEach((group) => {
        let index = group.indexOf(element);
        if (index !== -1) group.splice(index, 1);
      });
    }
    //Throw a warning error if the element isn't a Sprite
    else {
      throw new Error(
        "You can only use the remove function to remove Sprites"
      );
    }
  });
}

/*
sprites
-------

An array to store all the sprites

*/

export let sprites = new Group();

//If you're not using Groups, use an ordinary array instead:
//export let sprites = [];

/*
Sprite
------

The sprites' parent class.
It contains all the propertes shared by the sprites.
It shouldn't be instantiated, just extended.
*/

export class Sprite {
  constructor(config = {}) {
    //The sprite's position
    this.p = {
      x: 0,
      y: 0
    };
    //The sprite's velocity
    this.v = {
      x: 0,
      y: 0
    };
    //Dimensions
    this.width = 64;
    this.height = 64;
    //Orientation
    this.rotation = 0;
    //Visibility
    this.alpha = 1;
    this.visible = true;
    //Line and color
    this.strokeStyle = "black";
    this.lineWidth = 1;
    this.fillStyle = "rgba(128; 128, 128, 1)";
    //Does this sprite scroll?
    this.scroll = true;
    //Which depth layer is the sprite on?
    //(Used with Groups in Chapter 5)
    this.layer = 0;
    //Copy the configuration properties onto the new object
    Object.assign(this, config);
    //Add this object to the `sprites` array
    sprites.push(this);
  }
  //Getters that return useful points on the sprite
  get halfWidth() {
    return this.width / 2;
  }
  get halfHeight() {
    return this.height / 2;
  }
  get center() {
    return {
      x: this.p.x + this.halfWidth,
      y: this.p.y + this.halfHeight
    };
  }
  get bottom() {
    return {
      x: this.p.x + this.halfWidth,
      y: this.p.y + this.height
    };
  }
  set x(value) {this.p.x = value;}
  get x() {return this.p.x;}
  set y(value) {this.p.y = value;}
  get y() {return this.p.y;}
  set vx(value) {this.v.x = value;}
  get vx() {return this.v.x;}
  set vy(value) {this.v.y = value;}
  get vy() {return this.v.y;}
}

/*
Rectangle
---------

A Rectangle class.
Make a new rectangle sprite like this:

    let box = new Rectangle({
      p: {x: 30, y: 30},
      fillStyle: "rgba(105, 210, 231, 1)",
      strokeStyle: "red",
      lineWidth: 10,
      rotation: 0.5
    });
    
*/

export class Rectangle extends Sprite {}

/*
Circle
------

A Circle class.
Make a new circle sprite like this:

    let ball = new Circle({
      p: {x: 150, y: 30},
      fillStyle: "rgba(255, 171, 171, 1)",
      lineWidth: 6
    });
    
*/

export class Circle extends Sprite {
  constructor(config) {
    super(config);
  }
  //Diameter
  get diameter() {return this.width}
  set diameter(value) {
    this.width = value;
    this.height = value;
  }
  //Radius
  get radius() {return this.halfWidth}
  set radius(value) {
    this.width = value * 2;
    this.height = value * 2;
  } 
}

/*
Tile
-----

An Tile class.
Make a new tile sprite like this:

    let rocket = new Tile({
      source: assets["spritesheet.png"],
      sourceX: 192,
      sourceY: 128,
      width: 64,
      height: 64,
      x: 120,
      y: 140,
      rotation: 0.5
    });
    
*/

export class Tile extends Sprite {
  constructor(config) {
    super(config);
    //Set default image properties if values for them weren't 
    //specified when the object was created
    this.image = this.image || {};
    this.image.x = this.image.x || 0;
    this.image.y = this.image.y || 0;
    this.image.width = this.image.width || 64;
    this.image.height = this.image.height || 64;
    //Throw an error if the `image.source` wasn't included
    if (!this.image.source) {
      throw new Error(
        `image.source required for ${this.constructor.name}`
      );
    }
  }
}

/*
RoundTile
-----

The same as the Tile class, but with added `diameter` and
`radius` properties. Use it for round tile sprites so that
you can use `radius` and `diameter` properties in collision functions

*/
    
export class RoundTile extends Tile {
  //Diameter
  get diameter() {return this.width}
  set diameter(value) {
    this.width = value;
    this.height = value;
  }
  //Radius
  get radius() {return this.halfWidth}
  set radius(value) {
    this.width = value * 2;
    this.height = value * 2;
  } 
}

/*
Line
----

A line sprite prototype.
Make a new line sprite like this:

    let diagonalLine = new Line({
      a: {x: 32, y: 160},
      b: {x: 128, y: 100},
      lineWidth: 6
    });
    
*/

export class Line extends Sprite {
  constructor(config) {
    //Set default values for the start and end points
    this.a = {x: 0, y: 0};
    this.b = {x: 32, y: 32};
    super(config);
  }  
}

/*
Message
-------

A message sprite prototype.
Make a new line sprite like this:

    let someText = message({
      p: {x: 60, y: 220},
      font: "16px puzzler",
      text: "sprites!"
    });
    
*/

export class Message extends Sprite {
  constructor(config) {
    this.text = "This is a Message sprite";
    this.font = "16px sans-serif";
    this.textBaseline = "top";
    super(config);
  }
}

/*
buttons
-------

An array to store all the buttons

*/

export let buttons = [];

/*
Button
------
*/

export class Button extends Tile {
  constructor(config) {
    //Set the image x and y positions to the
    //buttons `state.up.x` and `state.up.y` values
    config.image.x = config.states.up.x;
    config.image.y = config.states.up.y;
    this.press = config.press;
    this.release = config.release;
    super(config);
    //The `_state` property tells you button's
    //curent state
    this._state = "up";
    //this.alreadyPressed = false;
    //this.alreadyReleased = false;
    //Boolean state properties    
    this.isUp = true;
    this.isActive = false;
    this.isDown = false;
    //this.released = false;
    //Methods that run when the button is pressed or released
    //Push the button into the global `buttons` array.
    buttons.push(this);
  }
  update(pointer, canvas) {
    //Up state
    if (pointer.isUp) {
      this.image.x = this.states.up.x;
      this.image.y = this.states.up.y;
      this._state = "up";
      this.alreadyPressed = false;
      //Change the mouse pointer back to an arrow
      canvas.style.cursor = "auto";
    }
    if (hitTestPoint(pointer.p, this)) {
      //Over state
      this.image.x = this.states.over.x;
      this.image.y = this.states.over.y;
      //Change the mouse pointer to a hand
      canvas.style.cursor = "pointer";
      this._state = "over";
      //Down state
      if (pointer.isDown) {
        this.image.x = this.states.down.x;
        this.image.y = this.states.down.y;
        this._state = "down";
        //this.alreadyReleased = false;
      }
    }

    //Set the button's Boolean properties
    if (this.state === "over") {
      if (this.isDown && this.release) this.release();
      this.isDown = false;
      this.isUp = true;
      this.isActive = true;
    }
    if (this.state === "down") {
      if (this.isUp && this.press) this.press();
      this.isDown = true;
      this.isUp = false;
      this.isActive = true;
      //this.released = false;
    }
    if (this.state === "up") {
      if (this.isDown && this.release) this.release();
      this.isDown = false;
      this.isUp = true;
      this.isActive = false;
    }
  }
  get state() {
    return this._state;
  }
}

/*
export function glue(...spritesToGlue) {
  spritesToGlue.forEach((sprite1) => {
    spritesToGlue.forEach((sprite2) => {
      if (sprite1 !== sprite2) {
        startObserving(sprite1, sprite2);
      }
    });
  });
  function startObserving(sprite1, sprite2) {
    Object.observe(sprite1, (changes) => {
      changes.forEach((change) => {
        console.log(change.type, change.name, change.oldValue);
        if (change.type === "update") {
          let property = change.name,
              value = change.object[change.name];
          switch (change.name) {
            case "layer":
              if (sprite2[property] !== value
                 || sprite2[property] === change.oldValue) {
                sprite2.layer = value//sprite1.layer;
                sprites.sort(byLayer);
                console.log("layers sorted")
              }
              break;
          }
        }
      });
    });
  }
}
*/

/*
Group
-----
*/
/*
export class Group {
  constructor(...spritesToGroup) {
    this.sprites = [];
    this.add(...spritesToGroup);
    //Properties
    this.x = 0;
    this.y = 0;
    this.visible = 0;
    this.alpha = 0;
    this.layer = 0;
    //Start observing these properties
    Object.observe(this, (changes) => {
      changes.forEach((change) => {
        console.log(change.type, change.name, change.oldValue);
        if (change.type === "update") {
          let property = change.name,
              value = change.object[change.name];
          switch (property) {
            case "layer":
              setProperties(property, value);
              sprites.sort(byLayer);
              console.log("layers sorted");
              break;
          }
        }
      });
    });
  }
  setProperties(property, value) {
    this.sprites.forEach((sprite) => {
      sprite[property] = value;
    });
  }
  react(changes) {
  }
  add(...spritesToAdd) {
    spritesToAdd.forEach((sprite) => {
      //Add the sprite to the group's array of sprites
      this.sprites.push(sprite);
      //Add a reference to the game object array on the 
      //sprite itself so that we can remove it later
      sprite.gameArrays.push(this.sprites);
      //Set the sprite's layer value to this group's layer
      sprite.layer = this._layer;
    });
    //Re-sort the global sprites array, by layer
    sprites.sort(byLayer);
    //Check to see if the adding the new sprite has
    //changed the group's x/y position
    //this.updatePosition();
  }
  remove(...spritesToRemove) {
    spritesToRemove.forEach((sprite) => {
      this.sprites.splice(this.sprites.indexOf(sprite), 1);
      //Remove the sprite's own reference to the groups array of
      //sprites from its `gameArrays` property
      if (sprite.gameArrays.indexOf(this.sprites !== -1)) {
        sprite.gameArrays.splice(this.sprites, 1);
      }
    });
    //Check to see if the removing the new sprite has
    //changed the group's x/y position
    //this.updatePosition();
  }
}
*/
/*
export function glue(...spritesToGroup) {
  let array = [];
  spritesToGroup.forEach((sprite) => {
    addSprite(sprite, array);
  });
  //Get x and y
  array.getX = () => {
    return array.reduce((a, b) => Math.min(a.p.x, b.p.x));
  }; 
  array.getY = () => {
    return array.reduce((a, b) => Math.min(a.p.y, b.p.y));
  }; 
  //Set x and y
  array.setX = (value) => {
    //find the group's current x position
    let currentX = array.getX();
    array.forEach((sprite) => {
      //The offset is equal to the difference between the 
      //group's `currentX` position and its new `value`
      let offset = value - currentX;
      sprite.p.x += offset;
    });
  }; 
  array.setY = (value) => {
    let currentY = array.getY();
    array.forEach((sprite) => {
      let offset = value - currentY;
      sprite.p.y += offset;
    });
  }; 
  //Get and set the depth layer
  array.getLayer = () => {
    return array.reduce((a, b) => Math.min(a.layer, b.layer));
  };
  array.setLayer = (value) => {
    array.forEach((sprite) => {
      sprite.layer = value;
    });
    sprites.sort(byLayer);
  };
  //Get and set the alpha
  array.getAlpha = () => {
    //The sprite with the heighest alpha value should represent the
    //group's alpha value
    return array.reduce((a, b) => Math.max(a.alpha, b.alpha));
  };
  array.setAlpha = (value) => {
    array.forEach((sprite) => sprite.alpha = value);
  };
  //Get and set the visibility
  array.getVisible = () => {
    return array.some((sprite) => sprite.visible);
  };
  array.setVisible = (value) => {
    array.forEach((sprite) => sprite.visible = value);
  };


  return array;
}

export function unglue(groupArray) {
  spritesToUngroup.forEach((sprite) => {
    removeSprite(sprite, groupArray);
  });
}

export function set(group, property, value) {
  group.forEach((sprite) => {
    sprite[property] = value;
  });
  if (property === "layer") sprites.sort(byLayer);
}

export function offset(group, property, value) {
  group.forEach((sprite) => {
    sprite[property] += value;
  });
}
*/
/*
export class Group {
  constructor(...spritesToGroup) {
    this.sprites = [];
    //Internal alpha and visible properites. They're accessed by
    //getters/setters in the code ahead
    this._alpha = 1;
    this._visible = true;
    this._layer = 0;
    //The group's position
    this.current = {x: 0, y: 0};
    this.previous = {x: 0, y: 0};
    //Add the sprites to the group
    spritesToGroup.forEach((sprite) => {
      this.add(sprite);
    });
    //Sort the global sprites array by layer
    if(this.sprites.length > 0) {
      sprites.sort(byLayer);
    }
  }
  findX() {
    //Find the x position of the sprite furthest to the left
    let smallest;
    this.sprites.forEach((sprite) => {
      if (sprite.p.x < smallest || smallest === undefined) {
        smallest = sprite.p.x;
      }
    });
    return smallest;
  }
  findY() {
    //Find the y position of the sprite furthest to the left
    let smallest;
    this.sprites.forEach((sprite) => {
      if (sprite.p.y < smallest || smallest === undefined) {
        smallest = sprite.p.y;
      }
    });
    return smallest;
  }
  get x() {
    return this.current.x;
  }
  set x(value) {
    this.current.x = value;
    //Loop through all the sprites in the group
    //and figure out by how much to offset the
    //each sprite's x position from the group's x position
    this.sprites.forEach((sprite) => {
      //The offset is equal to the difference between the 
      //group's `current.x` position and its `previous.x` position
      let offset = this.current.x - this.previous.x;
      sprite.p.x += offset;
    });
    //Store the group's `current.x` position as it's `previous.x`
    //position so that we can use it to calculate the next offset
    this.previous.x = this.current.x;
  }
  get y() {
    return this.current.y;
  }
  set y(value) {
    //Caluclate the y offset for all the sprites in the group
    this.current.y = value;
    this.sprites.forEach((sprite) => {
      let offset = this.current.y - this.previous.y;
      sprite.p.y += offset;
    });
    this.previous.y = this.current.y;
  }
  get visible() {
    return this._visible;
  }
  set visible(value) {
    this._alpha = value;
    for (let sprite of this.sprites) sprite.visible = value;
  }
  get alpha() {
    return this._alpha;
  }
  set alpha(value) {
    this._alpha = value;
    for (let sprite of this.sprites) sprite.alpha = value;
  }
  get empty() {
    //Use `empty` to check whether this group contains sprites
    if (this.sprites.length > 0) {
      return false;
    } else {
      return true;
    }
  }
  get layer() {
    return this._layer;
  }
  set layer(value) {
    this._layer = value;
    this.sprites.forEach((sprite) => {
      sprite.layer = value;
    });
    sprites.sort(byLayer);
  }
  fadeOut(speed = 0.01) {
    this.alpha -= speed;
    if (this.alpha < 0) {
      this.alpha = 0;
      this.fadingOut = false;
    }
  }
  fadeIn(speed = 0.01) {
    this.alpha += speed;
    if (this.alpha > 1) {
      this.alpha = 1;
      this.fadingIn = false;
    }
  }
  ease(x, y, speed = 0.1) {
    let distance, v = {};
    //Figure out the distance between the sprites
    v.x = x - this.x;
    v.y = y - this.y;
    distance = Math.sqrt(v.x * v.x + v.y * v.y);
    //Move the group if it's more than 1 pixel away from the
    //destination
    if (distance >= 1) {
      this.x += v.x * speed;
      this.y += v.y * speed;
    }
  }
  add(...spritesToAdd) {
    spritesToAdd.forEach((sprite) =>{
      //Add the sprite to the group's array of sprites
      this.sprites.push(sprite);
      //Add a reference to the game object array on the 
      //sprite itself so that we can remove it later
      sprite.gameArrays.push(this.sprites);
      //Set the sprite's layer value to this group's layer
      sprite.layer = this._layer;
    });
    //Re-sort the global sprites array, by layer
    sprites.sort(byLayer);
    //Check to see if the adding the new sprite has
    //changed the group's x/y position
    this.updatePosition();
  }
  remove(...spritesToRemove) {
    spritesToRemove.forEach((sprite) => {
      this.sprites.splice(this.sprites.indexOf(sprite), 1);
      //Remove the sprite's own reference to the groups array of
      //sprites from its `gameArrays` property
      if (sprite.gameArrays.indexOf(this.sprites !== -1)) {
        sprite.gameArrays.splice(this.sprites, 1);
      }
    });
    //Check to see if the removing the new sprite has
    //changed the group's x/y position
    this.updatePosition();
  }
  updatePosition() {
    //Find out if adding or removing a sprite from the group has
    //changed the group's x/y position
    let temporary = {x: this.current.x, y: this.current.y};
    //Use `findX` and `findY` to figure our the group's
    //top left corner position based on the sprites
    this.current = {x: this.findX(), y: this.findY()};
    if (temporary.x !== this.current.x) {
      this.previous.x = this.current.x;
    }
    if (temporary.y !== this.current.y) {
      this.previous.y = this.current.y;
    }
  }
}
*/
/*
Grid
----
*/

export class Grid extends Group {
  constructor(config) {
    this.p = {x: 0, y: 0};
    this.width = 5;
    this.height = 5;
    this.cellWidth = 64;
    this.cellHeight = 64;
    this.centerCell = false;
    this.gridSprites = [];
    //An extra function that will run after each new
    //grid cell is created
    this.extra = (sprite) => {};
    //Assign the config object to the grid
    Object.assign(this, config);
    //A default `makeSprite` method if one hasn't been provided
    if (!this.makeSprite) {
      this.makeSprite = () => { 
        return new Rectangle({
          width: this.cellWidth,
          height: this.cellHeight
        });
      };
    }
    //Create the grid
    this.create();
    //Add the sprites in the grid to a group
    super(...this.gridSprites);
    //Clear the temporary array
    this.gridSprites = [];
  }
  create() {
    let length = this.height * this.width;
    for(let i = 0; i < length; i++) {
      let x = ((i % this.width) * this.cellWidth) + this.p.x,
          y = (Math.floor(i / this.width) * this.cellWidth) + this.p.y;
      
      let sprite = this.makeSprite();
      if (!this.centerCell) {
        sprite.p.x = x;
        sprite.p.y = y;
      }
      else {
        sprite.p.x = x + sprite.width / 2;
        sprite.p.y = y + sprite.height / 2;
      }

      //Run any optional extra code
      if (this.extra) this.extra(sprite);
      
      //Add the block to the group's temporary `gridSprites` array
      this.gridSprites.push(sprite);
    }
  }
}

/*
sort functions
--------------
*/

export function byLayer(a, b) {
  if (a.layer < b.layer) {
    return -1;
  } else if (a.layer > b.layer) {
    return 1;
  } else {
    return 0;
  }
}

/*
render
-------

A render function that displays all the sprites on the the canvas.
Use it inside a game loop to render the sprites like this:

    render(canvasContext);

If the canvas contains a camera, it will be used to scroll the game world.
    
*/

export function render(canvas) {
  //Get a reference to the context
  let ctx = canvas.ctx;
  //Get a reference to the camera, if it exists
  let camera = camera || canvas.camera;
  //Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //Display the all the sprites 
  for (let i = 0; i < sprites.length; i++) {  
    let sprite = sprites[i];
    if (sprite.visible) {
      //Draw the different sprite types

      //Rectangle
      if (sprite instanceof Rectangle) {      
        ctx.save();
        //Add an optional camera
        if (camera && camera.initialized && sprite.scroll) {
          ctx.translate(-camera.p.x, -camera.p.y);
        }
        ctx.strokeStyle = sprite.strokeStyle;
        ctx.lineWidth = sprite.lineWidth;
        ctx.fillStyle = sprite.fillStyle;
        ctx.globalAlpha = sprite.alpha;
        ctx.translate(
          Math.floor(sprite.center.x),
          Math.floor(sprite.center.y)
        );
        ctx.rotate(sprite.rotation);
        ctx.beginPath();
        //Draw the rectangle around the context's center point
        ctx.rect(
          Math.floor(-sprite.halfWidth),
          Math.floor(-sprite.halfHeight),
          sprite.width,
          sprite.height
        );
        if (sprite.strokeStyle !== "none") ctx.stroke();
        if (sprite.fillStyle !== "none") ctx.fill();
        ctx.restore();
      }

      //Circle
      if (sprite instanceof Circle) {      
        ctx.save();
        //Add an optional camera
        if (camera && camera.initialized && sprite.scroll) {
          ctx.translate(-camera.p.x, -camera.p.y);
        }
        ctx.strokeStyle = sprite.strokeStyle;
        ctx.lineWidth = sprite.lineWidth;
        ctx.fillStyle = sprite.fillStyle;
        ctx.globalAlpha = sprite.alpha;
        ctx.translate(
          Math.floor(sprite.center.x),
          Math.floor(sprite.center.y)
        );
        ctx.rotate(sprite.rotation);
        ctx.beginPath();
        ctx.arc(0, 0, sprite.radius, 0, 6.28, false);
        if (sprite.strokeStyle !== "none") ctx.stroke();
        if (sprite.fillStyle !== "none") ctx.fill();
        ctx.restore();
      }

      //Tile
      if (sprite instanceof Tile) {      
        ctx.save();
        //Add an optional camera
        if (camera && camera.initialized && sprite.scroll) {
          ctx.translate(-camera.p.x, -camera.p.y);
        }
        ctx.globalAlpha = sprite.alpha;
        ctx.translate(
          Math.floor(sprite.center.x),
          Math.floor(sprite.center.y)
        );
        ctx.rotate(sprite.rotation);
        ctx.drawImage(
          sprite.image.source,
          sprite.image.x, sprite.image.y,
          sprite.image.width, sprite.image.height,
          Math.floor(-sprite.halfWidth),
          Math.floor(-sprite.halfHeight),
          sprite.width, sprite.height
        );
        ctx.restore();
      }
      
      //Line
      if (sprite instanceof Line) {      
        ctx.save();
        //Add an optional camera
        if (camera && camera.initialized && sprite.scroll) {
          ctx.translate(-camera.p.x, -camera.p.y);
        }
        ctx.strokeStyle = sprite.strokeStyle;
        ctx.lineWidth = sprite.lineWidth;
        ctx.globalAlpha = sprite.alpha;
        ctx.beginPath();
        ctx.moveTo(sprite.a.x, sprite.a.y);
        ctx.lineTo(sprite.b.x, sprite.b.y);
        if (sprite.strokeStyle !== "none") ctx.stroke();
        if (sprite.fillStyle !== "none") ctx.fill();
        ctx.restore();
      }
      
      //Message
      if (sprite instanceof Message) {      
        ctx.save();
        //Add an optional camera
        if (camera && camera.initialized && sprite.scroll) {
          ctx.translate(-camera.p.x, -camera.p.y);
        }
        ctx.globalAlpha = sprite.alpha;
        ctx.font = sprite.font;
        ctx.fillStyle = sprite.fillStyle;
        ctx.textBaseline = sprite.textBaseline;
        ctx.fillText(sprite.text, sprite.p.x, sprite.p.y);
        ctx.restore();
      }
    }
  }
}

/*
addSprite
------------

A function that adds sprite to arrays in a game 

    addSprite(spriteName, enemyArray);

The second argument is an array that you want to add the sprite into
You can add as many of these arrays as you like.

*/

export function addSprite(sprite, ...arrays) {
  //Add the sprite to any game arrays that it might be in
  if(arrays.length !== 0) {
    arrays.forEach((array) => {
      //Push the sprite into the game object array
      array.push(sprite);
      //Add a reference to the game object array on the 
      //sprite itself so that we can remove it later
      sprite.gameArrays.push(array);
    });
  }
}

/*
removeSprite
------------

A function that removes a sprite from the `sprites` array
an also from any other arrays that it might in

    removeSprite(spriteName, enemyArray);

The second argument is an array that the sprite might belong to in the game.
You can add as of these arrays as you like. However, they're optional. If you
leave them out, all the sprite will be removed from all the game
arrays that it's in.

*/

export function removeSprite(sprite, ...arrays) {
  //Remove the sprite from any game arrays that it might be in
  if (arrays.length !== 0) {
    arrays.forEach((array) => {
      array.splice(array.indexOf(sprite), 1);
      //Remove the sprite's own reference to the array
      //from its `gameArrays` property
      if (sprite.gameArrays.indexOf(array !== -1)) {
        sprite.gameArrays.splice(array, 1);
      }
    });
  }
  //If an array isn't specified, remove the sprite's own references
  //to any arrays in the game that it might be in
  else  if (sprite.gameArrays.length !== 0) {
    //Loop through all the arrays that might be referenced in the
    //sprite's `gameArrays` list
    sprite.gameArrays.forEach((array) => {
      //Remove the sprite from the array
      array.splice(array.indexOf(sprite), 1);
      //Remove the array from the sprite's list of game arrays
      sprite.gameArrays.splice(sprite.gameArrays.indexOf(array), 1);
    });
  }
  //Remove the sprite from the `sprites` array
  sprites.splice(sprites.indexOf(sprite), 1);
}

/*
shoot
-----

A function that lets sprites fire bullets.
Use it like this:

    shoot({
      shooter: box,         //The sprite doing the shooting
      bulletDiameter: 10,   //The bullet's diameter
      bulletColor: "red",   //The bullet's color
      bulletSpeed: 5,       //The speed of the bullet in pixels/frame
      offsetFromCenter: 32, //Distance of the bullet from the sprite's center
      bulletArray: bullets  //An array that the bullet belongs to
    });

To pevent a bullet from being fired more than once if a key is
being held down, set the key's `alreadyPressed` value to
`true`

    if (keyboard.space.isDown && !keyboard.space.alreadyPressed) {
      shoot({
        shooter: box,
        bulletDiameter: 10,
        bulletColor: "red",
        bulletSpeed: 5,
        offsetFromCenter: 32,
        bulletArray: bullets
      });
      keyboard.space.alreadyPressed = true;
    }

`alreadyPressed` will be re-set to `false` when the key is realeased
(See the `keyboard` object in the library/interactive
module for more details.)

*/

export function shoot(config) {
  let shooter = config.shooter,
      offsetFromCenter = config.offsetFromCenter || 0,
      diameter = config.bulletDiameter || 8,
      fillStyle = config.bulletColor || "red",
      radius = config.bulletDiameter / 2 || 4,
      bulletSpeed = config.bulletSpeed || 5,
      bulletArray = config.bulletArray;
  //Make a bullet sprite
  let bullet = new Circle({
    diameter: diameter,
    fillStyle: fillStyle,
    //Use the shooter's rotation to accurately position 
    //the bullet at the end of the turret
    p: {
      x: shooter.center.x - radius 
          + (offsetFromCenter * Math.cos(shooter.rotation)),
      y: shooter.center.y - radius 
          + (offsetFromCenter * Math.sin(shooter.rotation))
    },
    //Set the bullet's velocity to 7 pixels per frame, in the
    //direction that the shooter is rotated in
    v: {
      x: Math.cos(shooter.rotation) * bulletSpeed,
      y: Math.sin(shooter.rotation) * bulletSpeed
    }
  });
  //Push the bullet into the `bullets` arrays
  bulletArray.push(bullet);
}

/*
progressBar
-------------

*/

export let progressBar = {
  maxWidth: 0, 
  height: 0,
  backgroundColor: "gray",
  foregroundColor: "cyan",
  backBar: null,
  frontBar: null,
  percentage: null,
  assets: null,
  initialized: false,
  create(canvas, assets) {
    //Store a reference to the `assets` object
    this.assets = assets;
    //Set the maximum width to half the width of the canvas
    this.maxWidth = canvas.width / 2;

    //Build the progress bar using two Rectangle sprites and
    //one Message Sprite
    //1. Create the bar's gray background
    this.backBar = new Rectangle({
      p: {
        x: (canvas.width / 2) - (this.maxWidth / 2),
        y: (canvas.height / 2) - 16
      },
      width: this.maxWidth, height: 32,
      fillStyle: this.backgroundColor,
      strokeStyle: "none"
    });
    //2. Create the blue foreground. This is the element of the 
    //progress bar that will increase in width as assets load
    this.frontBar = new Rectangle({
      p: {
        x: (canvas.width / 2) - (this.maxWidth / 2),
        y: (canvas.height / 2) - 16
      },
      width: 0, height: 32,
      fillStyle: this.foregroundColor,
      strokeStyle: "none"
    });
    //3. A Message sprite that will display the percentage
    //of assets that have loaded
    this.percentage = new Message({
      p: {
        x: (canvas.width / 2) - (this.maxWidth / 2) + 12,
        y: (canvas.height / 2) - 16
      },
      font: "28px sans-serif",
      text: "0%"
    });
    //Flag the progressBar as having been initialized
    this.initialized = true;
  },
  update() {
    //Change the width of the blue `frontBar` to match the 
    //ratio of assets that have loaded
    this.frontBar.width = (this.maxWidth / this.assets.toLoad) * this.assets.loaded;
    //Display the percentage
    this.percentage.text = `${(this.assets.loaded / this.assets.toLoad) * 100}%`;
  },
  remove() {
    //Remove the progress bar
    removeSprite(this.frontBar);
    removeSprite(this.backBar);
    removeSprite(this.percentage);
  }
}

/*
makeAnimation
-------------

A function that returns an animation object that you can use to control
spite keyframe animations.
First create a sprite with a states property. The states property
constains sub-objects that define the x and y positions of animation
frames on the spritesheet.

    elf = new Tile({
      p: {x: 96, y: 96},
      width: 64,
      height: 64,
      image: {
        source: assets["walkcycle.png"],
        x: 0,
        y: 64,
        width: 64,
        height: 64,
      },
      //Define states that correspond to x and y coordinates
      //of the the animation sequences on the spritesheet
      states: {
        up: {x: 0, y: 0},
        left: {x: 0, y: 64},
        down: {x: 0, y: 128},
        right: {x: 0, y: 192},
        walkUp: {x: 64, y:0, frames: 8, playing: false},
        walkLeft: {x: 0, y: 64, frames: 9, playing: false},
        walkDown: {x: 64, y: 128, frames: 8, playing: false},
        walkRight: {x: 0, y: 192, frames: 9, playing: false}
      }
    });
    
Then use `makeAnimation` to create an `animation` object on the sprite.

    elf.animation = makeAnimation(elf);
    
Optionally set the `fps`.

    elf.animation.fps = 12;
    
To displays a static (non-moving) frame use the `show` method:

    elf.animation.show("right");
    
To play a sequence of frames, use the `play` method. If the second argument
is `true`, the animation will loop.

    elf.animation.play("walkUp", true);

*/

let makeAnimation = function(sprite) {

  //Intialize the letiables
  let frameCounter = 0,
    state = undefined,
    timerInterval = undefined,
    animation = {};

  //Add the fps value to the animation object so that it
  //you can change its value in the main program if you need to
  animation.fps = 12;

  //The `show` function (to display static states)
  function show(stateName) {
    //Reset any possible previous animations
    reset();
    //Find the new state on the sprite 
    state = sprite.states[stateName];
    //Set the sprite's image.x and image.y to the current state
    sprite.image.x = state.x;
    sprite.image.y = state.y;
  }

  //The `play` function, to play a sequence of frames
  function play(stateName, loop) {
    let frameRate = 1000 / animation.fps,
      loop = loop || false;
    //Reset any possible previous animations
    reset();
    //Set the sprite to the starting frame
    state = sprite.states[stateName];
    sprite.image.x = state.x;
    sprite.image.y = state.y;
    //If the state isn't already playing, start it
    if (!state.playing) {
      timerInterval = setInterval(advanceFrame.bind(this, loop), frameRate);
      state.playing = true;
    }
  }

  //`advanceFrame` is called by `setInterval` to dislay the next frame
  //in the sequence based on the `frameRate`. When frame sequence
  //reaches the end, it will either stop it or loop it.
  function advanceFrame(loop) {
    //console.log("Frame: " + this.frameCounter);
    //Update the new frames if `theframeCounter` is less than 
    //the state's total frames
    if (frameCounter < state.frames - 1) {
      sprite.image.x += sprite.image.width;
      //Wrap the frames around the spritesheet if you need to
      if (sprite.image.x >= sprite.image.source.width) {
        sprite.image.x = 0;
        sprite.image.y += sprite.sourceHeight;
      }
      frameCounter += 1;
    } else {
      //If we've reached the end of the state's frames, and `loop`
      //is `true`, then start from the first frame again
      if (loop) {
        sprite.image.x = state.x;
        sprite.image.y = state.y;
        frameCounter = 1;
      }
    }
  }

  function reset() {
    //Reset `state.playing` to false, set the `frameCounter` to 0,
    //and clear the `timerInterval`
    if (timerInterval !== undefined && state !== undefined) {
      state.playing = false;
      frameCounter = 0;
      clearInterval(timerInterval);
    }
  }

  //Compose the animation object and return it
  animation.show = show;
  animation.play = play;
  return animation;
};
