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
      //Loop through all the objects to group. If they're sprites,
      //copy them into `this` Group object, which, of course, is
      //an array. If they aren't sprites, throw an error to warn
      //the user that they can only add Sprite objects to groups
      spritesToGroup.forEach((sprite) => {
        if (sprite instanceof Sprite) {
          this.push(sprite);
        } else {
          throw new Error("You can only add Sprite objects to Groups");
        }
      });
    }
    //Add the group to the global array of groups
    //(This makes it easier to add and remove sprites from a game)
    groups.push(this);

    //Private properties that will be accesses using getters/setters
    this._layer = 0;
    this._x = 0;
    this._y = 0;
    this._alpha = 1;
    this._visible = true;
  }
  //Group getters and setters for some of the sprites' properties
  get x() {
    return this._x;
  }
  set x(value) {
    let currentX = this.x;
    this.forEach((sprite) => {
      //The offset is equal to the difference between the 
      //group's `currentX` position and its new `value`
      let offset = value - currentX;
      sprite.p.x += offset;
    });
    //Set the new x value
    this._x = value;
  }
  get y() {
    return this._y;
  }
  set y(value) {
    let currentY = this.y;
    this.forEach((sprite) => {
      //The offset is equal to the difference between the 
      //group's `currentX` position and its new `value`
      let offset = value - currentY;
      sprite.p.y += offset;
    });
    this._y = value;
  }
  get layer() {
    return this._layer;
  }
  set layer(value) {
    this._layer = value;
    this.forEach((sprite) => {
      sprite.layer = value;
    });
  }
  get alpha() {
    return this._alpha;
  }
  set alpha(value) {
    this.forEach((sprite) => sprite.alpha = value);
    this._alpha = value;
  }
  get visible() {
    return this._visible;
  }
  set visible(value) {
    this.forEach((sprite) => sprite.visible = value);
    this._visible = value;
  }
  get empty() {
    //Use `empty` to check whether this group contains sprites
    return (this.length > 0) ? false : true;
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
      let index = this.indexOf(sprite);
      if (index !== -1) {
        this.splice(this.indexOf(sprite), 1);
      } else {
        throw new Error(`${sprite} is not part of the group ${this}`);
      }
    });
  }
}

/*
remove
-------

A function to remove a sprite or group of sprites from a game.
It removes the sprite from any groups that it belongs to,
including the global `sprites` array.

    remove(spriteName);

You can remove a group of sprites like this:

   remove(...spriteGroup);

*/

export function remove(...elementsToRemove) {
  elementsToRemove.forEach((element) => {
    //If the element is a Sprite...
    if (element instanceof Sprite) {
      //Remove the sprite from any group arrays that it belongs to
      groups.forEach((group) => {
        let index = group.indexOf(element);
        if (index !== -1) group.splice(index, 1);
      });
    }
    //Throw a warning error if the element isn't a Sprite
    else {
      throw new Error(
        `You can only use the remove function to remove Sprites.
        Remove a group of sprites like this: remove(...spriteGroup).`
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
    this.strokeStyle = "none";
    this.lineWidth = 1;
    this.fillStyle = "rgba(128; 128, 128, 1)";
    //Does this sprite scroll?
    this.scroll = true;
    //Which depth layer is the sprite on?
    //(Used with Groups in Chapter 5)
    this._layer = 0;
    //Copy the configuration properties onto the new object
    Object.assign(this, config);
    //Add this object to the `sprites` array
    sprites.push(this);
  }
  get layer() {
    return this._layer;
  }
  set layer(value) {
    this._layer = value;
    sprites.sort(byLayer);
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

export let buttons = new Group();

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
    //Assign the `press` and `release` methods to this object
    this.press = config.press;
    this.release = config.release;
    //Run the super class's constructor to create the sprite
    super(config);
    //The `state` property tells you button's
    //curent state. Set its initial state to "up"
    this.state = "up";
    //`pressed` is a Boolean that helps track whether or not
    //the button has been pressed down.
    this.pressed = false;
    //Add the button into the global `buttons` sprite group.
    buttons.add(this);
  }
  update(pointer, canvas) {
    //1. Figure out the current state
    if (pointer.isUp) {
      //Up state
      this.state = "up"
    }
    if (hitTestPoint(pointer.p, this)) {
      //Over state
      this.state = "over";
      //Down state
      if (pointer.isDown) {
        this.state = "down"
      }
    }

    //2. Set the correct image
    this.image.x = this.states[this.state].x;
    this.image.y = this.states[this.state].y;

    //3. Run the correct button action
    //a. Run the `press` method if the button state is "down" and
    //the button hasn't already been pressed.
    if (this.state === "down") {
      if (!this.pressed) { 
        if (this.press) this.press();
        this.pressed = true;
      }
    }
    //b. Run the `release` method if the button state is "over" and
    //the button has been pressed.
    if (this.state === "over") {
      if (this.pressed) {
        if (this.release) this.release();
        this.pressed = false;
      }
    }
    //c. Check to whether the pointer has been released outside
    //the button's area. If the button state is "up" and it's
    //already been pressed, then run the `release` method.
    if (this.state === "up") {
      if (this.pressed) {
        if (this.release) this.release();
        this.pressed = false;
      }
    }
  }
}

/*
Grid
----
*/

export class Grid extends Group {
  constructor(config) {
    this.colums = 5;
    this.rows = 5;
    this.cellWidth = 64;
    this.cellHeight = 64;
    this.centerCell = false;
    //A temporary array to hold the sprites that are going to 
    //be created.
    this.gridSprites = [];
    //Assign the config object to the grid, but make sure
    //not to assign the `x` and `y` properties. This is to
    //prevent them from overwriting the `x` and `y` getters
    //and setters in the parent `Group` class
    Object.keys(config).forEach((key) => {
       if (key !== "x" && key !== "y") {
         this[key] = config[key];
       }
    });
    //Throw an error if you forgot to supply the `makeSprite` method
    if (!this.makeSprite) {
      throw new Error("Please provide a makeSprite method");
    }
    //Create the grid
    this.create();
    //Initialize the `Group` superclass with the 
    //array of `gridSprites` that the `create` method made
    super(...this.gridSprites);
    //console.log(`test ${this[2].p.x}`)
    //Position the grid using `config.x` and `config.y` values
    this.x = config.x;
    this.y = config.y;
    //Clear the `gridSprites` array
    this.gridSprites = [];
  }
  create() {
    let length = this.columns * this.rows;
    for(let i = 0; i < length; i++) {
      let x = ((i % this.columns) * this.cellWidth),
          y = (Math.floor(i / this.columns) * this.cellWidth);
     
      //Use the `makeSpite` method supplied in the constructor
      //to make the a sprite for the grid cell
      let sprite = this.makeSprite();

      //Should the sprite be centered in the cell?
      if (!this.centerCell) {
        sprite.p.x = x;
        sprite.p.y = y;
      }
      else {
        sprite.p.x = x + sprite.width / 2;
        sprite.p.y = y + sprite.height / 2;
      }

      //Run any optional extra code. This calls the
      //`extra` method supplied by the constructor
      if (this.extra) this.extra(sprite);
      
      //Add the sprite to the `gridSprites` array
      this.gridSprites.push(sprite);
    }
  }
}

/*
sort functions
--------------
*/

export function byLayer(a, b) {
  //return a.layer - b.layer;
  if (a.layer < b.layer) {
    return -1;
  } else if (a.layer > b.layer) {
    return 1;
  } else {
    return 1;
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
removeSprite
-------------

A function to remove a sprite from any arrays it might be in,
as well as the global `sprites` array.

*/

export function removeSprite(sprite, ...arrays) {
  //Remove the sprite from any game arrays that it might be in
  if(arrays) {
    arrays.forEach((array) => {
      array.splice(array.indexOf(sprite), 1);
    });
  }
  //Remove the sprite from the `sprites` array
  sprites.splice(sprites.indexOf(sprite), 1);
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
    if (!this.initialized) {
      //Store a reference to the `assets` object
      this.assets = assets;
      //Set the maximum width to half the width of the canvas
      this.maxWidth = canvas.width / 2;

      //Build the progress bar using two Rectangle sprites and
      //one Message Sprite
      //1. Create the bar's gray background
      this.backBar = new Rectangle({
        p: {
          //Center it inside the canvas
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
          //Center it inside the canvas
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
    }
  },
  update() {
    //Change the width of the blue `frontBar` to match the 
    //ratio of assets that have loaded
    this.frontBar.width = 
      (this.maxWidth / this.assets.toLoad) * this.assets.loaded;
    //Display the percentage
    this.percentage.text = 
      `${(this.assets.loaded / this.assets.toLoad) * 100}%`;
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
