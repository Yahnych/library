
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
  //If you have no idea what the source is, or it's undefined,
  //create a MovieClip with a red rectangle as a place holder
  //and decide what to do with it later
  else if (!source) {
    //Draw a rectangle
    let rectangle = new PIXI.Graphics();
    rectangle.beginFill(0, 0xFF0000);
    rectangle.drawRect(0, 0, width, height);
    rectangle.endFill();
    //Remove default padding of 10 pixels on graphics objects
    rectangle.boundsPadding = 0;
    //Generate a texture from the rectangle
    let texture = rectangle.generateTexture();
    //Use the texture to create a sprite
    sprite = new PIXI.MovieClip([texture]);
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
    //Make the `stage` interactive if it isn't already
    if (!stage.interactive) stage.interactive = true;

    //The pointer's position
    this._x = 0;
    this._y = 0;
    this.localPosition;
    
    //The pointer's `state` and `action`
    this.state = "up";
    this.action = "";

    //If the pointer is pressed down
    stage.mousedown = stage.touchstart = (data) => {
        this.action = "press";
        this.state = "down";
        this.isDown = true;
        //Call the `press` method if it's been defined
        if (this.press) this.press();
    };

    //If the pointer is released
    stage.mouseup 
      = stage.touchend 
      = stage.mouseupoutside 
      = stage.touchendoutside 
      = (data) => {
        this.isDown = false;
        this.state = "up";
        this.action = "release";
        //Call the `release` method if it's been defined
        if (this.release) this.release();
    };

    //Update the pointer's x and y position if its moving
    stage.mousemove = stage.touchmove = (data) => {
      this.localPosition = data.getLocalPosition(stage); 
    };
  }
  //Get the pointer's x and y position
  get x() {
    if (this.localPosition) {
      this._x = this.localPosition.x;
    } 
    return this._x;
  }
  get y() {
    if (this.localPosition) {
      this._y = this.localPosition.y;
    } 
    return this._y;
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
makeTiledMap
*/

export function makeTiledWorld(tiledMap, tileset) {
  //Create a group called `world` to contain all the layers, sprites
  //and objects from the `tiledMap`. The `world` object is going to be
  //returned to the main game program
  let world = group();
  world.tileheight = tiledMap.tileheight;
  world.tilewidth = tiledMap.tilewidth;
  //Calculate the `width` and `height` of the world, in pixels
  world.width = tiledMap.width * tiledMap.tilewidth;
  world.height = tiledMap.height * tiledMap.tileheight;
  //Get a reference to the world's height and width in
  //tiles, in case you need to know this later (you will!)
  world.widthInTiles = tiledMap.width;
  world.heightInTiles = tiledMap.height;

  //Create an `objects` array to store references to any
  //named objects in the map. Named objects all have
  //a `name` property that was assigned in Tiled Editor
  world.objects = [];
  
  //The optional spacing (padding) around each tile
  //This is to account for spacing around tiles
  //that's commonly used with texture atlas tilesets. Set the 
  //`spacing` property when you create a new map in Tiled Editor 
  let spacing = tiledMap.tilesets[0].spacing;  

  //Figure out how many columns there are on the tileset.
  //This is the width of the image, divided by the width
  //of each tile, plus any optional spacing thats around each tile
  let numberOfTilesetColumns =
    Math.floor(
      tiledMap.tilesets[0].imagewidth 
      / (tiledMap.tilewidth + spacing)
    );

  //Loop through all the map layers
  tiledMap.layers.forEach((tiledLayer) => {
    //Make a PIXI.DisplayObjectContainer for this layer and copy
    //all of the layer properties onto it. 
    let layerGroup = group();
    Object.assign(layerGroup, tiledLayer);
    //Translate `opacity` to `alpha`
    layerGroup.alpha = tiledLayer.opacity;
    //Add the group to the `world`
    world.addChild(layerGroup);

    //Push the group into the world's `objects` array
    //So you can access it later
    world.objects.push(layerGroup);

    //Is this current layer a `tilelayer`?
    if (tiledLayer.type === "tilelayer") {
      
      //Loop through the `data` array of this layer 
      tiledLayer.data.forEach((gid, index) => {
        let tileSprite, texture, mapX, mapY, tilesetX, tilesetY, 
            mapColumn, mapRow, tilesetColumn, tilesetRow; 
        //If the grid id number (`gid`) isn't zero, create a sprite
        if (gid !== 0) {
          //Figure out the map column and row number that we're on, and then
          //calculate the grid cell's x and y pixel position.
          mapColumn = index % world.widthInTiles;
          mapRow = Math.floor(index / world.widthInTiles);
          mapX =  mapColumn * world.tilewidth;
          mapY =  mapRow * world.tileheight;

          //Figure out the column and row number that the tileset
          //image is on, and then use those values to calculate
          //the x and y pixel position of the image on the tileset
          tilesetColumn = ((gid - 1) % numberOfTilesetColumns);
          tilesetRow = Math.floor((gid - 1) / numberOfTilesetColumns);
          tilesetX = tilesetColumn * world.tilewidth;
          tilesetY = tilesetRow * world.tileheight;

          //Compensate for any optional spacing (padding) around the tiles if
          //there is any. This bit of code accumlates the spacing offsets from the 
          //left side of the tileset and adds them to the current tile's position 
          if (spacing > 0) {
            tilesetX 
              += spacing 
              + (spacing * ((gid - 1) % numberOfTilesetColumns)); 
            tilesetY 
              += spacing 
              + (spacing * Math.floor((gid - 1) / numberOfTilesetColumns));
          }

          //Use the above values to create the sprite's texture from
          //the tileset image
          texture = frame(
            tileset, tilesetX, tilesetY, 
            world.tilewidth, world.tileheight
          );

          //What kind of sprite do you want to make? I've decided that
          //any tiles that have a `name` property will be MovieClip
          //sprites. That gives me the option to add animated frames
          //to them later. Tiles without a `name` property will be
          //created as ordinary sprites

          let tileproperties = tiledMap.tilesets[0].tileproperties,
              key = String(gid - 1);

          //If the JSON `tileproperties` object has a sub-object that
          //matches the current tile, and that sub-object has a `name` property,
          //then create a MovieClip sprite
          if (tileproperties[key] && tileproperties[key].name) {
            //Make a MovieClip sprite by intializing the sprite
            //with an array containing a texture. (The sprite has just one
            //texture in the tileset, but wrap it in square
            //brackets to show that it's the first texture in an array)
            tileSprite = sprite([texture]);

            //Copy all of the tile's properties onto the sprite
            //(This includes the `name` property)
            Object.assign(tileSprite, tileproperties[key]);

            //Push the sprite into the world's `objects` array
            //so that you can access it by `name` later
            world.objects.push(tileSprite);
          }

          //If the tile doesn't have a `name` property, just use it to
          //create an ordinary sprite (it will only need one texture)
          else {
            tileSprite = sprite(texture);
          }
          
          //Position the sprite on the map
          tileSprite.x = mapX;
          tileSprite.y = mapY;

          //Make a record of the sprite's index number in the array
          //(We'll use this for collision detection later)
          tileSprite.index = index;

          //Make a record of the sprite's `gid` on the tileset.
          //This will also be useful for collision detection later
          tileSprite.gid = gid;
          
          //Add the sprite to the current layer group
          layerGroup.addChild(tileSprite);
        }
      });
    }

    //Is this layer an `objectgroup`?
    if (tiledLayer.type === "objectgroup") { 
      tiledLayer.objects.forEach((object) => {
        //We're just going to capture the object's properties
        //so that we can decide what to do with it later

        //Translate `opacity` to `alpha`
        object.alpha = object.opacity;

        //Get a reference to the layer group the object is in
        object.group = layerGroup;

        //Push the object into the world's `objects` array
        world.objects.push(object);
      });
    }
  });

  //Search functions
  //`world.getObject` and `world.getObjects`  search for and return
  //any sprites or objects in the `world.objects` array. 
  //Any object that has a `name` propery in 
  //Tiled Editor will show up in a search.
  //`getObject` gives you a single object, `getObjects` gives you an array
  //of objects.
  //`getObject` returns the actual search function, so you 
  //can use the following format to directly access a single object:
  //sprite.x = world.getObject("anySprite").x;
  //sprite.y = world.getObject("anySprite").y;

  world.getObject = function (objectName) {
    this.searchForObject = () => {
      let foundObject;
      world.objects.some((object) => {
        if (object.name && object.name === objectName) {
          foundObject = object;
          return true;
        }
      });
      if (foundObject) {
        return foundObject;
      } else {
        console.log(`There is no object with the property name: ${objectName}`);
      }
    };
    //Return the search function
    return this.searchForObject();
  };

  world.getObjects = function (...objectNames) {
    let foundObjects = [];
    world.objects.forEach((object) => {
      if (object.name && objectNames.indexOf(object.name) !== -1) {
        foundObjects.push(object);
      }
    });
    if (foundObjects.length > 0) {
      return foundObjects;
    } else {
      console.log(`I could not find those objects`);
    }
    return foundObjects;
  };

  //That's it, we're done!
  //Finally, return the `world` object back to the game program
  return world;
}

/*
makeIsoTiledWorld
=================

An interpreter for isometric Tiled Editor JSON output.
Important: To work it requires to custom map properties:
`cartTilewidth` and `cartTileheight`. These are the Cartesian
(flat 2D) dimensions of the tile map array. These are needed
because it's common to have a 32x32 tile map array that displays
64x64 sprites.
*/


export function makeIsoTiledWorld(tiledMap, tileset) {

  if (!tiledMap.properties.cartTilewidth 
  && !tiledMap.properties.cartTileheight) {
    throw new Error("Please set custom cartTilewidth and cartTileheight map properties in Tiled Editor");
  }
  
  //Create a group called `world` to contain all the layers, sprites
  //and objects from the `tiledMap`. The `world` object is going to be
  //returned to the main game program
  let world = group();
  world.tileheight = tiledMap.tileheight * 2;
  world.tilewidth = tiledMap.tilewidth;

  //Define the cartesian dimesions of each tile
  world.cartTileheight = parseInt(tiledMap.properties.cartTileheight);
  world.cartTilewidth = parseInt(tiledMap.properties.cartTilewidth);

  //Calculate the `width` and `height` of the world, in pixels
  world.width = tiledMap.width * parseInt(tiledMap.properties.cartTilewidth);
  world.height = tiledMap.height * parseInt(tiledMap.properties.cartTileheight);
  //Get a reference to the world's height and width in
  //tiles, in case you need to know this later
  world.widthInTiles = tiledMap.width;
  world.heightInTiles = tiledMap.height;

  //Create an `objects` array to store references to any
  //named objects in the map. Named objects all have
  //a `name` property that was assigned in Tiled Editor
  world.objects = [];
  
  //The spacing (padding) around each tile
  //This is to account for spacing around tiles
  //that's commonly used with texture atlas tilesets. Set the 
  //`spacing` property when you create a new map in Tiled Editor 
  let spacing = tiledMap.tilesets[0].spacing;  

  //Figure out how many columns there are on the tileset.
  //This is the width of the image, divided by the width
  //of each tile, plus any optional spacing thats around each tile
  let numberOfTilesetColumns =
    Math.floor(
      tiledMap.tilesets[0].imagewidth 
      / (tiledMap.tilewidth + spacing)
    );

  //A `z` property to help track which depth level the sprites are on
  let z = 0;

  //Loop through all the map layers
  tiledMap.layers.forEach((tiledLayer) => {
  
    //Make a PIXI.DisplayObjectContainer for this layer and copy
    //all of the layer properties onto it. 
    let layerGroup = group();
    Object.assign(layerGroup, tiledLayer);
    //Translate `opacity` to `alpha`
    layerGroup.alpha = tiledLayer.opacity;
    //Add the group to the `world`
    world.addChild(layerGroup);

    //Push the group into the world's `objects` array
    //So you can access it later
    world.objects.push(layerGroup);

    //Is it a `tilelayer`?
    if (tiledLayer.type === "tilelayer") {
      
      //Loop through the `data` array of this layer 
      tiledLayer.data.forEach((gid, index) => {
        let tileSprite, texture, mapX, mapY, tilesetX, tilesetY, 
            mapColumn, mapRow, tilesetColumn, tilesetRow; 
        //If the grid id number (`gid`) isn't zero, create a sprite
        if (gid !== 0) {
          //Figure out the map column and row number that we're on, and then
          //calculate the grid cell's x and y pixel position.
          mapColumn = index % tiledMap.width;
          mapRow = Math.floor(index / tiledMap.width);
          mapX =  mapColumn * world.cartTilewidth;
          mapY =  mapRow * world.cartTileheight;

          //Figure out the column and row number that the tileset
          //image is on, and then use those values to calculate
          //the x and y pixel position of the image on the tileset
          tilesetColumn = ((gid - 1) % numberOfTilesetColumns);
          tilesetRow = Math.floor((gid - 1) / numberOfTilesetColumns);
          tilesetX = tilesetColumn * world.tilewidth;
          tilesetY = tilesetRow * world.tileheight;

          //Compensate for any optional spacing (padding) around the tiles if
          //there is any. This bit of code accumlates the spacing offsets from the 
          //left side of the tileset and adds them to the current tile's position 
          if (spacing > 0) {
            tilesetX 
              += spacing 
              + (spacing * ((gid - 1) % numberOfTilesetColumns)); 
            tilesetY 
              += spacing 
              + (spacing * Math.floor((gid - 1) / numberOfTilesetColumns));
          }

          //Use the above values to create the sprite's texture from
          //the tileset image
          texture = frame(
            tileset, tilesetX, tilesetY, 
            world.tilewidth, world.tileheight
          );

          //What kind of sprite do you want to make? I've decided that
          //any tiles that have a `name` property will be MovieClip
          //sprites. That gives me the option to add animated frames
          //to them later. Tiles without a `name` property will be
          //created as ordinary sprites

          let tileproperties = tiledMap.tilesets[0].tileproperties,
              key = String(gid - 1);

          //If the JSON `tileproperties` object has a sub-object that
          //matches the current tile, and it has a `name` property,
          //create a MovieClip sprite
          if (tileproperties[key] && tileproperties[key].name) {
            //Make a MovieClip sprite by intializing the sprite
            //with an array containing a texture
            tileSprite = sprite([texture]);
            //Copy all of the tile's properties onto the sprite
            //(This includes the `name` property)
            Object.assign(tileSprite, tileproperties[key]);
            //Push the sprite into the world's `objects` array
            //so that you can access it by `name` later
            world.objects.push(tileSprite);
          }
          //The tile doesn't have a `name` property, so just use it to
          //create an ordinary sprite (it will only need one texture)
          else {
            tileSprite = sprite(texture);
          }
          
          //Add properties to the sprite to help work between Cartesian
          //and isometric properties
          let addIsoProperties = (s, x, y, width, height) => {
            //Cartisian (flat 2D) properties
            s.cartX = x;
            s.cartY = y;
            s.cartWidth = width;
            s.cartHeight = height;

            //Add a getter/setter for the isometric properties
            Object.defineProperties(s, {
              isoX: {
                get() {return this.cartX - this.cartY;},
                enumerable: true, configurable: true
              },
              isoY: {
                get() {return (this.cartX + this.cartY) / 2;},
                enumerable: true, configurable: true
              },
            });
          };
          
          addIsoProperties(tileSprite, mapX, mapY, world.cartTilewidth, world.cartTileheight);

          //Use the isometric position to add the sprite to the world
          tileSprite.x = tileSprite.isoX;
          tileSprite.y = tileSprite.isoY;
          tileSprite.z = z;

          //Make a record of the sprite's index number in the array
          //(We'll use this for collision detection later)
          tileSprite.index = index;

          //Make a record of the sprite's `gid` on the tileset.
          //This will also be useful for collision detection
          tileSprite.gid = gid;
          
          //Add the sprite to the current layer group
          layerGroup.addChild(tileSprite);
        }
      });
    }

    //Is this later an `objectgroup`?
    if (tiledLayer.type === "objectgroup") { 
      tiledLayer.objects.forEach((object) => {
        //We're just going to capturei the object's properties
        //so that we can decide what to do with it later
        //Translate `opacity` to `alpha`
        object.alpha = object.opacity;
        //object.z = z;
        //Get a reference to the layer group the object is in
        object.group = layerGroup;
        //Push the object into the world's `objects` array
        world.objects.push(object);
      });
    }
    //Add 1 to the z index (the first layer will have a z index of `1`)
    z += 1;
  });

  //Search functions
  //`world.getObject` and `world.getObjects`  search for and return
  //any sprites or objects in the `world.objects` array. 
  //Any object that has a `name` propery in 
  //Tiled Editor will show up in a search.
  //`getObject` gives you a single object, `getObjects` gives an array
  //of objects.
  //`getObject` returns itself, so you 
  //can use this format to directly access single object:
  //sprite.x = world.getObject("anySprite").x;
  //sprite.y = world.getObject("anySprite").y;

  world.getObject = function (objectName) {
    this.searchForObject = () => {
      let foundObject;
      world.objects.some((object) => {
        if (object.name && object.name === objectName) {
          foundObject = object;
          return true;
        }
      });
      if (foundObject) {
        return foundObject;
      } else {
        console.log(`There is no object with the property name: ${objectName}`);
      }
    };
    return this.searchForObject();
  };

  world.getObjects = function (...objectNames) {
    let foundObjects = [];
    world.objects.forEach((object) => {
      if (object.name && objectNames.indexOf(object.name) !== -1) {
        foundObjects.push(object);
      }
    });
    if (foundObjects.length > 0) {
      return foundObjects;
    } else {
      console.log(`I could not find those objects`);
    }
    return foundObjects;
  };

  //Isometric collision and depth functions
  //The `getIndex` helper function
  //converts a sprite's x and y position to an array index number.
  //It returns a single index value that tells you the map array
  //index number that the sprite is in
  world.getIndex = (x, y, tilewidth, tileheight, mapWidthInTiles) => {
    let index = {};
    //Convert pixel coordinates to map index coordinates
    index.x = Math.floor(x / tilewidth);
    index.y = Math.floor(y / tileheight);
    //Return the index number
    return index.x + (index.y * mapWidthInTiles);
  };

  //The `getPoints` function takes a sprite and returns
  //and object that tells you what all its corner points are
  //For isometric maps, make sure you use half of the sprite's `width`
  world.getPoints = (s) => {
    return {
      topLeft: {x: s.cartX, y: s.cartY},
      topRight: {x: s.cartX + (s.cartWidth) - 1, y: s.cartY},
      bottomLeft: {x: s.cartX, y: s.cartY + s.cartHeight - 1},
      bottomRight: {x: s.cartX + (s.cartWidth) - 1, y: s.cartY + s.cartHeight - 1}
    }; 
  }

  //`hitTestTile` function
  world.hitTestTile = (sprite, mapArray, collisionGid, world, pointsToCheck = "some") => {
    //The collision object that will be returned by this functon
    let collision = {}; 

    //Which points do you want to check?
    //"every", "some" or "center"?
    switch (pointsToCheck) {
      case "center":
        //`hit` will be true only if the center point is touching 
        let ca = sprite.collisionArea,
            point = {},
            s = sprite;
        if (sprite.collisionArea !== undefined) {
          point = {
            center: {
              x: s.cartX + ca.x + (ca.width / 2),
              y: s.cartY + ca.y + (ca.height / 2)
            }
          };
        } else {
          point = {center: {x: sprite.centerX, y: sprite.centerY}};
        }
        sprite.collisionPoints = point;
        collision.hit = Object.keys(sprite.collisionPoints).some(checkPoints);
        break;
      case "every":
        //`hit` will be true if every point is touching
        sprite.collisionPoints = world.getPoints(sprite); 
        collision.hit = Object.keys(sprite.collisionPoints).every(checkPoints);
        break;
      case "some":
        //`hit` will be true only if some points are touching
        sprite.collisionPoints = world.getPoints(sprite); 
        collision.hit = Object.keys(sprite.collisionPoints).some(checkPoints);
        break;
    }

    //Loop through the sprite's corner points to find out if they are inside 
    //an array cell that you're interested in. Return `true` if they are
    
    function checkPoints (key) {
      //Get a reference to the current point to check. 
      //(`topLeft`, `topRight`, `bottomLeft` or `bottomRight` )
      let point = sprite.collisionPoints[key];

      //Find the point's index number in the map array
      collision.index = world.getIndex(
        point.x, point.y, 
        world.cartTilewidth, world.cartTileheight, world.widthInTiles
      );

      //Find out what the gid value is in the map position
      //that the point is currently over
      let currentGid = mapArray[collision.index];

      //If it matches the value of the gid that we're interested, in
      //then there's been a collision
      if (currentGid === collisionGid) { 
        return true;
      } else {
        return false;
      }
    }

    //Return the collision object.
    //`collision.hit` will be true if a collision is detected.
    //`collision.index` tells you the map array index number where the
    //collision occured
    return collision;
  }

  
  //Sort `byDepth` function
  world.byDepth = (a, b) => {
    //Calculate the depths of `a` and `b`
    //(add `1` to `a.z` and `b.x` to avoid multiplying by 0)
    a.depth = (a.cartX + a.cartY) * (a.z + 1);
    b.depth = (b.cartX + b.cartY) * (b.z + 1);

    //Move sprites with a lower depth to a higher position in the array
    if (a.depth < b.depth) {
      return -1;
    } else if (a.depth > b.depth) {
      return 1;
    } else {
      return 0;
    }
  }

  //Return the `world` object back to the game program
  return world;
}

export function worldCamera(world, canvas) {
  let camera = {
    width: canvas.width,
    height: canvas.height,
    x: 0,
    y: 0,
    get rightInnerBoundary() {
      return this.x + (this.width / 2) + (this.width / 4);
    },
    get leftInnerBoundary() {
      return this.x + (this.width / 2) - (this.width / 4);
    },
    get topInnerBoundary() {
      return this.y + (this.height / 2) - (this.height / 4);
    },
    get bottomInnerBoundary() {
      return this.y + (this.height / 2) + (this.height / 4);
    },
    follow (sprite) {
      //Check the sprites position in relation to the inner boundary
      if(sprite.x < this.leftInnerBoundary) {
        //Move the camera to follow the sprite if the sprite strays outside
        this.x = Math.floor(sprite.x - (this.width / 4));
      }
      if(sprite.y < this.topInnerBoundary) {
        this.y = Math.floor(sprite.y - (this.height / 4));
      }
      if(sprite.x + sprite.width > this.rightInnerBoundary) {
        this.x = Math.floor(sprite.x + sprite.width - (this.width / 4 * 3));
      }
      if(sprite.y + sprite.height > this.bottomInnerBoundary) {
        this.y = Math.floor(sprite.y + sprite.height - (this.height / 4 * 3));
      }
      //If the camera reaches the edge of the map, stop it from moving
      if(this.x < 0) {
        this.x = 0;
      }
      if(this.y < 0) {
        this.y = 0;
      }
      if(this.x + this.width > world.width) {
        this.x = world.width - this.width;
      }
      if(this.y + this.height > world.height) {
        this.y = world.height - this.height;
      } 
      this.updateWorldPosition();
    },
    centerOver (sprite) {
      //Center the camera over a sprite
      this.x = (sprite.x + sprite.halfWidth) - (this.width / 2);
      this.y = (sprite.y + sprite.halfHeight) - (this.height / 2);
      this.updateWorldPosition();
    },
    updateWorldPosition () {
      //Change the position of the world if the camera's position
      //changes
      world.x = -this.x;
      world.y = -this.y;
    }
  };

  return camera;
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



