/* 
display.js
==========

This JavaScript file contains functions and objects useful for
creating and rendering canvas based sprites.

*/

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

/*
sprites
-------

An array to store all the sprites

*/

export let sprites = [];

/*
Sprite
------

The sprites' parent class.
It contains all the propertes shared by the sprites.
It shouldn't be instantiated, just extended.
*/

class Sprite {
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
  set diameter(value) {this.width = value}
  //Radius
  get radius() {return this.halfWidth}
  set radius(value) {this.width = value * 2} 
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
    //Throw an error if the image.source wasn't included
    if (!this.image.source) {
      throw new Error(
        `image.source required for ${this.constructor.name}`
      );
    }
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
    super(config)
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
        ctx.stroke();
        ctx.fill();
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
        ctx.stroke();
        ctx.fill();
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
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }
      
      //Message
      if (sprite instanceof Message) {      
        ctx.save();
        //Add an optional camera
        if (camera && camera.initialized && sprite.scroll) {
          ctx.translate(-camera.p.x, -camera.p.y);
        }
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
removeSprite
------------

A function that removes a sprite from the `sprites` array
an also from any other arrays that it might in

    removeSprite(spriteName, enemyArray);

*/

export let removeSprite = (sprite, array = undefined) => {
  //Remove the sprite from a game array that it might be in
  if (array) {
    array.splice(array.indexOf(sprite), 1);
  }
  //Remove the sprite from the `sprites` array
  sprites.splice(sprites.indexOf(sprite), 1);
};

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

    elf = image({
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
