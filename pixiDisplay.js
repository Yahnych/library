
export let stage = new PIXI.Stage(0xCCFFCC);

function addProperties(sprite) {
  sprite.v = {x: 0, y: 0};
  sprite._layer = 0;
  sprite._draggable = undefined;

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
    center: {
      get() {
        return {
          x: this.x + this.halfWidth,
          y: this.y + this.halfHeight
        };
      },
      enumerable: true, configurable: true
    },
    bottom: {
      get () {
        return {
          x: this.x + this.halfWidth,
          y: this.y + this.height
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
      }
    }
  });
  //Create `add` and `remove` methods to manage child objects
  sprite.add = (...spritesToAdd) => {
    spritesToAdd.forEach((spriteToAdd) => {
      sprite.addChild(spriteToAdd);
    });
  };
  sprite.remove = (...spritesRemove) => {
    spritesToRemove.forEach((spriteToRemove) => {
      //Remove the sprite from this container
      sprite.removeChild(spriteToRemove);
    });
  };
  //Return the sprite with the added properties
  return sprite;
}

export function rectangle(
    x = 0, y = 0, width = 32, height = 32, rotation = 0, 
    fillStyle = 0xFF3300, strokeStyle = 0x0033CC, lineWidth = 0
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
  //Rotate it
  if (rotation !== 0) {
    //Move the sprite's pivot point to its center
    sprite.pivot.x = sprite.halfWidth;
    sprite.pivot.y = sprite.halfHeight;
    //Rotate the sprite
    sprite.rotation = rotation;
    //Add half the sprite's height and width to re-position
    //it according to its original x/y position
    sprite.x += sprite.halfWidth;
    sprite.y += sprite.halfHeight;
  }
  //Add the `sprite` to the `stage` 
  stage.addChild(sprite);
  return sprite;
}

export function circle(
    x = 0, y = 0, diameter = 32, rotation = 0,
    fillStyle = 0xFF3300, strokeStyle = 0x0033CC, lineWidth = 0
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
  //Rotate it
  if (rotation !== 0) {
    //Move the sprite's pivot point to its center
    sprite.pivot.x = sprite.halfWidth;
    sprite.pivot.y = sprite.halfHeight;
    //Rotate the sprite
    sprite.rotation = rotation;
    //Add half the sprite's height and width to re-position
    //it according to its original x/y position
    sprite.x += sprite.halfWidth;
    sprite.y += sprite.halfHeight;
  }
  //Add `diameter` and `radius` getters and setters
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
  //Add the `sprite` to the `stage` 
  stage.addChild(sprite);
  return sprite;
}

export function line(
    ax = 0, ay = 0, bx = 32, by = 32, 
    strokeStyle = 0x000000, lineWidth = 1 
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
  //Add the `sprite` to the `stage` 
  stage.addChild(line);
  return line;
}

export function tile(
    x = 0, y = 0, width = 32, height = 32, rotation = 0,
    source = undefined, sourceX = 0, sourceY = 0, 
    sourceWidth = 32, sourceHeight = 32
  ){
  let base, section, texture, sprite;

  //Use the source to make the texture
  base = new PIXI.BaseTexture(source);
  let section = new PIXI.Rectangle(
    sourceX, sourceY, sourceWidth, sourceHeight
  );
  texture = new PIXI.Texture(base, section);
  sprite = new PIXI.Sprite(texture);

  //Save a reference to the base texture and the source position
  //so we can use them later if we need to
  sprite._baseTexture = base;
  sprite._sourceX = sourceX;
  sprite._sourceY = sourceY;
  sprite._sourceWidth = sourceWidth;
  sprite._sourceHeight = sourceHeight;

  //Position the sprite
  sprite.x = x;
  sprite.y = y;

  //Add some extra properties to the sprite
  addProperties(sprite);

  //Rotate it
  if (rotation !== 0) {
    //Move the sprite's pivot point to its center
    sprite.pivot.x = sprite.halfWidth;
    sprite.pivot.y = sprite.halfHeight;
    //Rotate the sprite
    sprite.rotation = rotation;
    //Add half the sprite's height and width to re-position
    //it according to its original x/y position
    sprite.x += sprite.halfWidth;
    sprite.y += sprite.halfHeight;
  }

  //A helper method that lets sprites change their texture
  //based on new `sourceX` and `sourceY` values
  sprite.makeTexture = (sprite, sourceX, sourceY) => {
    let section = new PIXI.Rectangle(
      sourceX, sourceY, sprite._sourceWidth, sprite._sourceHeight
    );
    sprite.texture = new PIXI.Texture(sprite._baseTexture, section);
    //sprite.setTexture(texture);
  };

  //Define getters and setters that redefine the line's start and 
  //end points and re-draws it if they change
  Object.defineProperties(sprite, {
    sourceX: {
      set(value) {
        this._sourceX = value;
        this.makeTexture(this, this._sourceX, this._sourceY);
      }, 
      enumerable: true, configurable: true
    },
    sourceY: {
      set(value) {
        this._sourceY = value;
        this.makeTexture(this, this._sourceX, this._sourceY);
      }, 
      enumerable: true, configurable: true
    },
  });
  //Add the `sprite` to the `stage` 
  stage.addChild(sprite);
  return sprite;
}

export function roundTile( 
    x = 0, y = 0, diameter = 32, rotation = 0,
    source = undefined, sourceX = 0, sourceY = 0, 
    sourceWidth = 32, sourceHeight = 32
  ){
  //Make an ordinary `tile` sprite;
  let sprite = tile(
    x, y, diameter, diameter, rotation,
    source, sourceX, sourceY, sourceWidth, sourceHeight
  );
  //Add `diameter` and `radius` getters and setters
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
  //The `sprite` has already been added to the stage when the
  //`tile` was made
  return sprite; 
}

export function message(
    x = 0, y = 0, text = "message", 
    font = "16px sans", fillStyle = "red"
  ){
  let message = new PIXI.Text(text, {font: font, fill: fillStyle});
  message.x = x;
  message.y = y;
  message.changeText = (newText) => {
    message.setText(newText);
  };
  //Add a `_text` property with a getter/setter
  message._text = text;
  Object.defineProperty(message, "content", {
    get() {
      return this._text;
    },
    set(value) {
      this._text = value;
      this.setText(value);
    },
    enumerable: true, configurable: true
  });
  //Add the `message` to the `stage` 
  stage.addChild(message);
  return message;
}

export function image(x = 0, y = 0, rotation = 0, source = undefined) {
  let base, texture, sprite;
  //Use the source to make the texture
  base = new PIXI.BaseTexture(source);
  texture = new PIXI.Texture(base);
  sprite = new PIXI.Sprite(texture);

  //Position the sprite
  sprite.x = x;
  sprite.y = y;
  
  //Add some extra properties to the sprite
  addProperties(sprite);
  
  //Rotate it
  if (rotation !== 0) {
    //Move the sprite's pivot point to its center
    sprite.pivot.x = sprite.halfWidth;
    sprite.pivot.y = sprite.halfHeight;
    //Rotate the sprite
    sprite.rotation = rotation;
    //Add half the sprite's height and width to re-position
    //it according to its original x/y position
    sprite.x += sprite.halfWidth;
    sprite.y += sprite.halfHeight;
  }

  //Allow the user to change the image's source
  Object.defineProperty(sprite, "source", {
    set(value) {
      let base = new PIXI.BaseTexture(value);
      sprite.texture = new PIXI.Texture(base);
    },
    enumerable: true, configurable: true
  });

  //Add the `sprite` to the `stage` 
  stage.addChild(sprite);
  return sprite;
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
    stage.removeChild(sprite);
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
    xOffset = 0, yOffset = 0, columns = 5, rows = 5,  
    cellWidth = 32, cellHeight = 32, centerCell = false,
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

  return container;
}

/*
button
------
*/

export function button(
    x = 0, y = 0, width = 32, height = 32, rotation = 0,
    source = undefined, sourceWidth = 32, sourceHeight = 32,
    upX, upY, overX, overY, downX, downY,
    press = undefined, release = undefined
  ){

  //Make a `tile` sprite
  let button = tile(
    x, y, width, height, rotation, 
    source, upX, upY, sourceWidth, sourceHeight
  ); 
  
  //Assign the button's properties
  button.upX = upX;
  button.upY = upY;
  button.overX = overX;
  button.overY = overY;
  button.downX = downX;
  button.downY = downY;
  button.press = press;
  button.release = release
  //Make the sprite interactive
  if (!stage.interacive) stage.setInteractive(true);
  button.interactive = true;
  button.buttonMode = true;

  //The button's local and parent coordinates
  button.localX = 0;
  button.localY = 0;
  button.parentX = 0;
  button.parentY = 0;

  //The button's `state` and `action`
  button.state = "up";
  button.action = "";

  //If the left mouse button is pressed or
  //the button is touched
  button.mousedown 
    = button.touchstart 
    = (data) => {
      button.action = "press";
      button.state = "down";
			button.isDown = true;
      button.sourceX = button.downX;
      button.sourceY = button.downY;
      if (button.press) button.press();
		};

  //If the left mouse button is released or the
  //touch ends
  button.mouseup 
    = button.touchend 
    = button.mouseupoutside 
    = button.touchendoutside 
    = (data) => {
        button.isDown = false;
        if (button.isOver) {
          button.state = "over";
          button.sourceX = button.overX
          button.sourceY = button.overY;
        } else {
          button.state = "up";
          button.action = "release";
          button.sourceX = button.upX;
          button.sourceY = button.upY;
          if (button.release) button.release();
        }
		  };

  //If the mouse moves over the sprite   
  button.mouseover = (data) => {
    button.state = "over";
    button.isOver = true;
    if (button.isDown) return;
    button.sourceX = button.overX
    button.sourceY = button.overY;
  }; 

  //If the mouse leaves the sprite
  button.mouseout = (data) => {
    button.state = "up";
		button.isOver = false;
		if (button.isDown) return;
    button.sourceX = button.upX
    button.sourceY = button.upY;
	};

  //If the left mouse button is clicked or tapped
  button.click = button.tap = (data) => {
    button.action = "release";
    if (button.release) button.release();
  };

  button.mousemove = button.touchmove = (data) => {
    //Set the local and parent x/y pointer positions
    let localPosition = data.getLocalPosition(button); 
    let parentPosition = data.getLocalPosition(button.parent);
    button.localX = localPosition.x;
    button.localY = localPosition.y;
    button.parentX = parentPosition.x;
    button.parentY = parentPosition.y;
  };
  return button;
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



