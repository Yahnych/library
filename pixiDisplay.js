
export let stage = new PIXI.Stage(0xFFFFFF);

function addProperties(sprite) {
  sprite.vx = 0; 
  sprite.vy = 0;
  sprite._layer = 0;
  sprite._draggable = undefined;
  sprite._circular = false;

  Object.defineProperties(sprite, {
    halfWidth: {
      get() {
        return this.width / 2;
      },
      enumerable: true, configurable: true
    },
    halfHeight: {
      get() {
        return this.height / 2;
      },
      enumerable: true, configurable: true
    },
    centerX: {
      get() {return this.parentX + this.halfWidth}
    },
    centerY: {
      get() {return this.parentY + this.halfHeight}
    },
    center: {
      get() {
        return {
          x: this.parentX + this.halfWidth,
          y: this.parentY + this.halfHeight
        };
      },
      enumerable: true, configurable: true
    },
    bottom: {
      get () {
        return {
          x: this.worldX + this.halfWidth,
          y: this.worldY + this.height
        };
      },
      enumerable: true, configurable: true
    },
    layer: {
      get() {
        return this._layer;
      },
      set(value) {
        this._layer = value;
        this.parent.children.sort(byLayer);
      }, 
      enumerable: true, configurable: true
    },
    draggable: {
      get() {
        return this._draggable;
      },
      set(value) {
        if (this._draggable === undefined) makeDraggable(this);
        this._draggable = value;
      },
      enumerable: true, configurable: true
    },
    circular: {
      get() {
        return this._circular;
      },
      set(value) {
        //Give the sprite `diameter` and `radius` properties
        //if `circular` is `true`
        if (value === true && this._circular === false) {
          makeCircular(this);
          this._circular = true;
        }
        //Remove the sprite's `diameter` and `radius` properties
        //if `circular` is `false`
        if (value === false && this._circular === true) {
          delete this.diameter;
          delete this.radius;
          this._circular = false;
        }
      },
      enumerable: true, configurable: true
    },
    //The sprite's parent's x and y position
    parentX: {
      get() {return this.x + this.parent.x}
    },
    parentY: {
      get() {return this.y + this.parent.y}
    },
    //The sprite's world position
    worldX: {
      get() {return this.worldTransform.tx}
    },
    worldY: {
      get() {return this.worldTransform.ty}
    }
  });
  //Create `add` and `remove` methods to manage child objects
  sprite.add = (...spritesToAdd) => {
    spritesToAdd.forEach((spriteToAdd) => {
      sprite.addChild(spriteToAdd);
    });
  };
  sprite.remove = (...spritesToRemove) => {
    spritesToRemove.forEach((spriteToRemove) => {
      //Remove the sprite from this container
      sprite.removeChild(spriteToRemove);
    });
  };
  //Return the sprite with the added properties
  return sprite;
}

export function rectangle(
    width = 32, height = 32,  
    fillStyle = 0xFF3300, strokeStyle = 0x0033CC, lineWidth = 0,
    x = 0, y = 0 
  ){
  //Draw the rectangle
  let rectangle = new PIXI.Graphics();
  rectangle.beginFill(fillStyle);
  if (lineWidth > 0) {
    rectangle.lineStyle(lineWidth, strokeStyle, 1);
  }
  rectangle.drawRect(0, 0, width, height);
  rectangle.endFill();
  //Remove default padding of 10 pixels on graphics objects
  rectangle.boundsPadding = 0;
  //Generate a texture from the rectangle
  let texture = rectangle.generateTexture();
  //Use the texture to create a sprite
  let sprite = new PIXI.Sprite(texture);
  //Position the sprite
  sprite.x = x;
  sprite.y = y;
  //Add some extra properties to the sprite
  addProperties(sprite);
  //Add the `sprite` to the `stage` 
  stage.addChild(sprite);
  return sprite;
}

export function circle(
    diameter = 32, fillStyle = 0xFF3300, strokeStyle = 0x0033CC, lineWidth = 0,
    x = 0, y = 0 
  ){
  //Draw the circle
  let circle = new PIXI.Graphics();
  circle.beginFill(fillStyle);
  if (lineWidth > 0) {
    circle.lineStyle(lineWidth, strokeStyle, 1);
  }
  circle.drawCircle(0, 0, diameter / 2);
  circle.endFill();
  //Remove default padding of 10 pixels on graphics objects
  circle.boundsPadding = 0;
  //Generate a texture from the rectangle
  let texture = circle.generateTexture();
  //Use the texture to create a sprite
  let sprite = new PIXI.Sprite(texture);
  //Position the sprite
  sprite.x = x;
  sprite.y = y;
  //Add some extra properties to the sprite
  addProperties(sprite);
  //Add `diameter` and `radius` getters and setters
  makeCircular(sprite);
  //Add the `sprite` to the `stage` 
  stage.addChild(sprite);
  return sprite;
}

function makeCircular(sprite) {
  Object.defineProperties(sprite, {
    diameter: {
      get() {
        return this.width;
      },
      set(value) {
        this.width = value;
        this.height = value;
      }, 
      enumerable: true, configurable: true
    },
    radius: {
      get() {
        return this.width / 2;
      },
      set(value) {
        this.width = value * 2;
        this.height = value * 2;
      }, 
      enumerable: true, configurable: true
    }
  });
}

export function line(
    strokeStyle = 0x000000, lineWidth = 1, 
    ax = 0, ay = 0, bx = 32, by = 32
  ){
  //Create the line object
  let line = new PIXI.Graphics();
  //Add properties
  line._ax = ax;
  line._ay = ay;
  line._bx = bx;
  line._by = by;
  line.strokeStyle = strokeStyle;
  line.lineWidth = lineWidth;

  //A helper function that draws the line
  line.draw = () => {
    line.clear();
    line.lineStyle(lineWidth, strokeStyle, 1);
    line.moveTo(line._ax, line._ay);
    line.lineTo(line._bx, line._by);
  };
  line.draw();

  //Define getters and setters that redefine the line's start and 
  //end points and re-draws it if they change
  Object.defineProperties(line, {
    ax: {
      get() {
        return this._ax;
      },
      set(value) {
        this._ax = value;
        this.draw();
      }, 
      enumerable: true, configurable: true
    },
    ay: {
      get() {
        return this._ay;
      },
      set(value) {
        this._ay = value;
        this.draw();
      }, 
      enumerable: true, configurable: true
    },
    bx: {
      get() {
        return this._bx;
      },
      set(value) {
        this._bx = value;
        this.draw();
      }, 
      enumerable: true, configurable: true
    },
    by: {
      get() {
        return this._by;
      },
      set(value) {
        this._by = value;
        this.draw();
      }, 
      enumerable: true, configurable: true
    },
  });
  //Add the `line` to the `stage` 
  stage.addChild(line);
  return line;
}

export function sprite(source, x = 0, y = 0, tiling = false, width, height) {
  let texture, sprite;

  //Create a sprite if the `source` is a string 
  if (typeof source === "string") {
    //Access the texture in the cache if its there
    if (PIXI.TextureCache[source]) {
      texture = PIXI.TextureCache[source];
    }
    //If it's not is the cache, load it from the source file
    else {
      texture = PIXI.Texture.fromImage(source);
    }
    //If the texture was created, make the sprite
    if(texture) {
      //If `tiling` is `false`, make a regular `Sprite`
      if(!tiling) {
        sprite = new PIXI.Sprite(texture);
      } 
      //If `tiling` is `true` make a `TilingSprite`
      else {
        sprite = new PIXI.TilingSprite(texture, width, height);
      }
    }
    //But if the source still can't be found, alert the user
    else {
      console.log(`${source} cannot be found`);
    }
  } 
  //Create a sprite if the `source` is a texture
  else if (source instanceof PIXI.Texture) {
    if (!tiling) {
      sprite = new PIXI.Sprite(source);
    }else{
      sprite = new PIXI.TilingSprite(source, width, height);
    }
  }
  //Create a `MovieClip` sprite if the `source` is an array
  else if (source instanceof Array) {
    //Is it an array of frame ids or textures?
    if(typeof source[0] === "string") {
      //They're strings, but are they pre-existing texture or
      //paths to image files?
      //Check to see if the first element matches a texture in the
      //cache
      if(PIXI.TextureCache[source[0]]){
        //It does, so it's an array of frame ids
        sprite = PIXI.MovieClip.prototype.fromFrames(source);
      }
      else {
        //It's not already in the cache, so let's load them from files
        sprite = PIXI.MovieClip.prototype.fromImages(source);
      }
    }
    //If the `source` isn't an array of strings, check whether
    //it's an array of textures
    else if (source[0] instanceof PIXI.Texture) {
      //Yes, it's an array of textures. 
      //Use them to make a MovieClip sprite 
      sprite = new PIXI.MovieClip(source);
    }
  }
  //If the sprite was successfully created, set intialize it
  if(sprite) {
    //Position the sprite
    sprite.x = x;
    sprite.y = y;
    //Set optional width and height
    if (width) sprite.width = width;
    if (height) sprite.height = height;
    //Add some extra properties to the sprite
    addProperties(sprite);
    //Add the `sprite` to the `stage` 
    stage.addChild(sprite);
    return sprite;
  }
}

//Make a texture from a frame in another texture or image
export function frame(source, x, y, width, height) {
  let texture, imageFrame;
  //If the source is a string, it's either a texture in the
  //cache or an image file
  if (typeof source === "string") {
    if (PIXI.TextureCache[source]) {
      texture = new PIXI.Texture(PIXI.TextureCache[source]);
    } 
  }
  //If the `source` is a texture,  use it
  else if (source instanceof PIXI.Texture) {
    texture = new PIXI.Texture(source);
  }
  if(!texture) {
    console.log(`Please load the ${source} texture into the cache.`);
  } else {
    //Make a rectangle the size of the sub-image
    imageFrame = new PIXI.Rectangle(x, y, width, height);
    texture.setFrame(imageFrame);
    return texture;
  }
}

//Make an array of textures from a 2D array of frame x and y coordinates in
//texture
export function frames(source, coordinates, frameWidth, frameHeight) {
  let baseTexture, textures;
  //If the source is a string, it's either a texture in the
  //cache or an image file
  if (typeof source === "string") {
    if (PIXI.TextureCache[source]) {
      baseTexture = new PIXI.Texture(PIXI.TextureCache[source]);
    } 
  }
  //If the `source` is a texture,  use it
  else if (source instanceof PIXI.Texture) {
    baseTexture = new PIXI.Texture(source);
  }
  if(!baseTexture) {
    console.log(`Please load the ${source} texture into the cache.`);
  } else {
    let textures = coordinates.map((position) => {
      let x = position[0],
          y = position[1];
      let imageFrame = new PIXI.Rectangle(x, y, frameWidth, frameHeight);
      let frameTexture = new PIXI.Texture(baseTexture);
      frameTexture.setFrame(imageFrame);
      return frameTexture 
    });
    return textures;
  }
}

export function text(
    content = "message", font = "16px sans",
    fillStyle = "red", x = 0, y = 0
  ){
  let message = new PIXI.Text(content, {font: font, fill: fillStyle});
  message.x = x;
  message.y = y;
  //Add a `_text` property with a getter/setter
  message._content = content;
  Object.defineProperty(message, "content", {
    get() {
      return this._content;
    },
    set(value) {
      this._content = value;
      this.setText(value);
    },
    enumerable: true, configurable: true
  });
  //Add some extra sprite properties
  addProperties(message);
  //Add the `message` to the `stage` 
  stage.addChild(message);
  return message;
}


/*
group and batch
---------------
*/

export function group(...spritesToGroup) {
  let container = new PIXI.DisplayObjectContainer();
  spritesToGroup.forEach((sprite) => {
    container.addChild(sprite); 
  });
  //Add the group properties
  addGroupProperties(container);
  //Add the sprite properties, so you make the
  //group draggable or change its layer position
  addProperties(container);
  //Add the `container` to the `stage` 
  stage.addChild(container);
  return container;
}

export function batch(...spritesToGroup) {
  let container = new PIXI.SpriteBatch();
  spritesToGroup.forEach((sprite) => {
    container.addChild(sprite); 
  });
  //Add the group properties
  addGroupProperties(container);
  //Add the `container` to the `stage` 
  stage.addChild(container);
  return container;
}

export function remove(...spritesToRemove) {
  spritesToRemove.forEach((sprite) => {
    //Remove the sprite from the stage
    sprite.parent.removeChild(sprite);
  });
}

function addGroupProperties(container){
  //Create `add` and `remove` methods to manage child objects
  container.add = (...spritesToAdd) => {
    spritesToAdd.forEach((sprite) => {
      container.addChild(sprite);
    });
  };
  container.remove = (...spritesToRemove) => {
    spritesToRemove.forEach((sprite) => {
      //Remove the sprite from this container
      container.removeChild(sprite);
    });
  };
  //Add getters and setters
  container._layer = 0;
  Object.defineProperties(container, {
    //Use `empty` to check whether this group contains sprites
    empty: {
      get() {
        return (this.children.length > 0) ? false : true;
      },
      enumerable: true, configurable: true
    },
    layer: {
      get() {
        return this._layer;
      },
      set(value) {
        this._layer = value;
        this.parent.children.sort(byLayer);
      }, 
      enumerable: true, configurable: true
    }
  });
  return container;
}

/*
grid
----
*/

export function grid(
    columns = 5, rows = 5, cellWidth = 32, cellHeight = 32, 
    centerCell = false, xOffset = 0, yOffset = 0,
    makeSprite = undefined, 
    extra = undefined
  ){ 
  //Create an empty DisplayObjectContainer
  let container = group();
  //The `create` method
  container.createGrid = () => {
    let length = columns * rows;
    for(let i = 0; i < length; i++) {
      let x = ((i % columns) * cellWidth),
          y = (Math.floor(i / columns) * cellWidth);

      //Use the `makeSprite` method supplied in the constructor
      //to make the a sprite for the grid cell
      let sprite = makeSprite();
      container.addChild(sprite);

      //Should the sprite be centered in the cell?
      if (!centerCell) {
        sprite.x = x + xOffset;
        sprite.y = y + yOffset;
      }
      else {
        sprite.x = x + (sprite.width / 2) + xOffset;
        sprite.y = y + (sprite.height / 2) + yOffset;
      }

      //Run any optional extra code. This calls the
      //`extra` method supplied by the constructor
      if (extra) extra(sprite);
    }
  };
  container.createGrid();
  stage.addChild(container);
  return container;
}

/*
button
------
*/

export function button(textureArray, press = undefined, release = undefined){
  let buttonSprite = new Button(textureArray);
  if (press) buttonSprite.press = press;
  if (release) buttonSprite.release = release;
  stage.addChild(buttonSprite);
  return buttonSprite;
}

class Button extends PIXI.MovieClip {
  constructor(textureArray) {
    //Check to see if the button states are textures. If they're
    //not, they must be frames, so create textures from the frames
    let newTextures;
    if(textureArray[0] instanceof PIXI.Texture) {
      newTextures = textureArray;
    } else {
      newTextures = textureArray.map((texture) => {
        return PIXI.Texture.fromFrame(texture);
      }); 
    } 
    //Create the `MovieClip` sprite using the textures
    super(newTextures);

    //Make the sprite interactive
    if (!stage.interacive) stage.setInteractive(true);
    this.interactive = true;
    this.buttonMode = true;

    //The buttons's local and parent coordinates
    this.localX = 0;
    this.localY = 0;
    this.parentX = 0;
    this.parentY = 0;

    //The button's `state` and `action`
    this.state = "up";
    this.action = "";

    //If the mouse is pressed or the button is touched
    this.mousedown 
      = this.touchstart 
      = (data) => {
        this.action = "press";
        this.state = "down";
        this.isDown = true;
        //Display the last texture in the list (down or over)
        this.gotoAndStop(newTextures.length -1);
        if (this.press) this.press();
      };

    //If the mouse is released or the touch ends
    this.mouseup 
      = this.touchend 
      = this.mouseupoutside 
      = this.touchendoutside 
      = (data) => {
          this.isDown = false;
          if (this.isOver) {
            this.state = "over";
            //Display the over texture
            this.gotoAndStop(1);
          } else {
            this.state = "up";
            this.action = "release";
            //Display the first texture (up)
            this.gotoAndStop(0);
            if (this.release) this.release();
          }
        };

    //If the mouse moves over the sprite   
    this.mouseover = (data) => {
      this.state = "over";
      this.isOver = true;
      if (this.isDown) return;
      //Display the second texture (over)
      this.gotoAndStop(1);
    }; 

    //If the mouse leaves the sprite
    this.mouseout = (data) => {
      this.state = "up";
      this.isOver = false;
      if (this.isDown) return;
      //Display the first texture (up)
      this.gotoAndStop(0);
    };

    //If the mouse is clicked or this sprite is tapped
    this.click = this.tap = (data) => {
      this.action = "release";
      if (this.release) this.release();
    };

    //If the pointer moves
    this.mousemove = this.touchmove = (data) => {
      //Set the local and parent x/y pointer positions
      let localPosition = data.getLocalPosition(this); 
      let parentPosition = data.getLocalPosition(this.parent);
      this.localX = localPosition.x;
      this.localY = localPosition.y;
      this.parentX = parentPosition.x;
      this.parentY = parentPosition.y;
    };
  }
}

export class Pointer {
  constructor() {
    if (!stage.interactive) stage.interactive = true;
    stage.mousemove = stage.touchmove = (data) => {
      this.localPosition = data.getLocalPosition(stage); 
    }
  }
  get x() {
    return this.localPosition.x;
  }
  get y() {
    return this.localPosition.y;
  }
}


/*
makeDraggable
-------------
*/

function makeDraggable(sprite) {
  sprite.interactive = true;
  sprite.buttonMode = true;
  if (stage.interactive !== true) stage.setInteractive(true);

  //If the pointer is down
  sprite.mousedown 
    = sprite.touchstart 
    = (data) => {
      data.originalEvent.preventDefault();

      //store a reference to the data on this spite to
      //support multi-touch
      sprite.data = data;
      //Flag that dragging has started
      sprite.dragging = true;

      //Reset the `oldDragX` and `oldDragY` values to 
      //`0` so that we can start calculating the pointer's velocity
      sprite.oldPointerX = 0;
      sprite.oldPointerY = 0;

      //To display the selected sprite above the other sprites,
      //splice it out of its current position in the `displayList`
      //add add it to the end
      let displayList = sprite.parent.children;
      let index = displayList.indexOf(sprite);
      displayList.splice(index, 1);
      displayList.push(sprite);
    };

  //If the pointer is up
  sprite.mouseup 
    = sprite.mouseupoutside 
    = sprite.touchend 
    = sprite.touchendoutside 
    = (data) => {
      //Set `pointerging` to `false` and clear the pointer event `data`
      sprite.dragging = false;
      sprite.data = null;
    };

  // set the callbacks for when the mouse or a touch moves
  sprite.mousemove = sprite.touchmove = (data) => {
    if(sprite.dragging && sprite._draggable === true) {
      sprite.pointer = sprite.data.getLocalPosition(sprite.parent);
      if(sprite.oldPointerX !== 0 && sprite.oldPointerY !== 0) {
        sprite.pointerVx = sprite.pointer.x - sprite.oldPointerX;
        sprite.pointerVy = sprite.pointer.y - sprite.oldPointerY;
        sprite.x += sprite.pointerVx;
        sprite.y += sprite.pointerVy;
      }
      sprite.oldPointerX = sprite.pointer.x;
      sprite.oldPointerY = sprite.pointer.y;
    }
  }
}
export let progressBar = {
  maxWidth: 0, 
  height: 0,
  backgroundColor: 0xC0C0C0, //gray
  foregroundColor: 0x00FFFF, //cyan
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
      this.backBar = rectangle(this.maxWidth, 32, this.backgroundColor);
      this.backBar.x = (canvas.width / 2) - (this.maxWidth / 2);
      this.backBar.y = (canvas.height / 2) - 16;

      //2. Create the blue foreground. This is the element of the 
      //progress bar that will increase in width as assets load
      this.frontBar = rectangle(this.maxWidth, 32, this.foregroundColor);
      this.frontBar.x = (canvas.width / 2) - (this.maxWidth / 2);
      this.frontBar.y = (canvas.height / 2) - 16;
      this.frontBar.scale.x = 0;
      //
      //3. A text sprite that will display the percentage
      //of assets that have loaded
      this.percentage = text("0%", "28px sans-serif", "black");
      this.percentage.x = (canvas.width / 2) - (this.maxWidth / 2) + 12;
      this.percentage.y = (canvas.height / 2) - 16;

      //Flag the progressBar as having been initialized
      this.initialized = true;
    }
  },
  update() {
    //Change the width of the blue `frontBar` to match the 
    //ratio of assets that have loaded
    this.frontBar.scale.x = this.assets.loaded / this.assets.toLoad;
      //(this.maxWidth / this.assets.toLoad) * this.assets.loaded;
    //Display the percentage
    this.percentage.content = 
      `${Math.floor((this.assets.loaded / this.assets.toLoad) * 100)}%`;
  },
  remove() {
    //Remove the progress bar
    stage.removeChild(this.frontBar);
    stage.removeChild(this.backBar);
    stage.removeChild(this.percentage);
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



