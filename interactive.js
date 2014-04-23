/* 
interactive.js
==============

This JavaScript file contains objects useful for
adding interactivity to sprites. See the display.js file for
sprite classes that can use this code

*/

//Dependencies
//Hand.js (a polyfill for PointerEvents)
import "library/plugins/hand.minified-1.3.7";
//`sprites` array for the pointer's dragAndDrop function
import {sprites} from "library/display";
//`hitTestPoint` for the pointer's dragAndDrop
import {hitTestPoint} from "library/collision";

/*
pointer
-------

A pointer object for mouse or touch based interfaces.
Initialize it like this:

    pointer.initialize();
    
You can initialize it with configuration options like this:

    pointer.initialize({
      element: canvas,
      cursor: "none"
    });
    
You can then check for pointer events like this:

    if (pointer.tapped) {//...};
    if (pointer.isUp) {//...};
    if (pointer.isDown) {//...};
    
The pointer also has a drag and drop feature. To implement it,
first set a sprite's draggable property to true:

    let sprite = new Rectangle({
      draggable: true
    });
    
Run the pointer's `dragAndDrop` function inside the game loop,
with a reference to the canvas

    pointer.dragAndDrop(canvas);
    
The pointer has a property called `dragSprite` that won't be null
if the pointer is dragging a sprite. Test for it like this:

    if(pointer.dragSprite) {
      //The pointer is dragging sprite
    }

The pointer's p.x and p.y properties tells you its postion:

    pointer.p.x
    pointer.p.y

*/
export let pointer = {
  p: {
    x: 0,
    y: 0
  },
  get center() {
    "use strict";
    return {
      x: this.p.x,
      y: this.p.y
    };
  },
  //Properties required for drag and drop
  dragOffset: {
    x: 0,
    y: 0
  },
  dragSprite: null,
  //Booleans to track the pointer state
  isDown: false,
  isUp: true,
  tapped: false,
  //Properties to help measure the time between up and down states
  downTime: 0,
  elapsedTime: 0,
  moveHandler(event) {
    //Get the element that's firing the event
    let element = event.target;
    //Find the pointer's x and y position (for mouse)
    //Subtract the element's top and left offset from the browser window
    this.p.x = event.pageX - element.offsetLeft;
    this.p.y = event.pageY - element.offsetTop;
  },
  downHandler(event) {
    //Find the pointer's x and y position (for touch)
    let element = event.target;
    this.p.x = event.pageX - element.offsetLeft;
    this.p.y = event.pageY - element.offsetTop;
    //Set the down states
    this.isDown = true;
    this.isUp = false;
    this.tapped = false;
    //Capture the current time
    this.downTime = Date.now();
  },
  upHandler(event) {
    //Figure out how much time the pointer has been down
    this.elapsedTime = Math.abs(this.downTime - Date.now());
    //If it's less than 200 milliseconds, it must be
    //a tap or click
    if (this.elapsedTime <= 200) {
      this.tapped = true;
    }
    this.isUp = true;
    this.isDown = false;
  },
  initialize(config) {
    //Set the configuration variables
    let config = config || {},
        element = config.element || document.querySelector("canvas"),
        cursor = config.cursor || "auto";

    //Bind the events to the handlers
    element.addEventListener(
      "pointermove", this.moveHandler.bind(this), false
    );
    element.addEventListener(
      "pointerdown", this.downHandler.bind(this), false
    );
    element.addEventListener(
      "pointerup", this.upHandler.bind(this), false
    );

    //Disable the default pan and zoom actions on the element
    element.style.touchAction = "none";

    //Hide the mouse arrow
    element.style.cursor = cursor;
  },
  dragAndDrop(canvas) {
    if (this.isDown) {
      //Capture the co-ordinates at which the pointer was 
      //alreadyPressed down and find out if it's touching a sprite
      if (this.dragSprite === null) {
        //Loop through the sprites in reverse to start searching at the bottom of the stack
        for (let i = sprites.length - 1; i > -1; i--) {
          let sprite = sprites[i];
          //Check for a collision with the pointer using hitTestPoint
          if (hitTestPoint(this.p, sprite) && sprite.draggable) {
            //Calculate the difference between the pointer's 
            //position and the sprite's position
            this.dragOffset.x = this.p.x - sprite.p.x;
            this.dragOffset.y = this.p.y - sprite.p.y;
            //Set the sprite as the pointer's `dragSprite` property
            this.dragSprite = sprite;
            //The next two lines re-order the `sprites` array so that the
            //selected sprite is displayed above all the others.
            //First, push the `dragSprite` to the end of the `sprites` array so that it's 
            //displayed last, above all the other sprites 
            sprites.push(sprite);
            //Next, splice the `dragSprite` from its previous position in the sprites array
            sprites.splice(i, 1);
            break;
          }
        }
      } else {
        //If the pointer has a `dragSprite`, make it follow the pointer's
        //position, with the calculated offset
        this.dragSprite.p.x = this.p.x - this.dragOffset.x;
        this.dragSprite.p.y = this.p.y - this.dragOffset.y;
      }
    }
    //If the pointer is up, drop the `dragSprite` by setting it to `null`
    if (this.isUp) {
      this.dragSprite = null;
    }
    //Change the mouse arrow pointer to a hand if it's over a sprite
    sprites.some((sprite) => {
      if (hitTestPoint(this.p, sprite) && sprite.draggable) {
        canvas.style.cursor = "pointer";
        return true;
      } else {
        canvas.style.cursor = "auto";
        return false;
      }
    });
  }
};

/*
keyboard
---

A keyboard object for keyboard interactivity.
Initialize it with the names of the keys and their code values like this:

    keyboard.initialize({
      space: 32,
      left: 37,
      up: 38,
      right: 39,
      down: 40,
    });
    
You can then check for key actions like this:

    if (keyboard.space.isUp) {//...};
    if (keyboard.left.isDown) {//...}

*/

export let keyboard = {
  initialize(config) {
    //Create new objects for each key
    if (config !== undefined) {
      Object.keys(config).forEach((key) => {
        //Create a new empty sub-object 
        this[key] = {};
        //Set its `code`, `isDown` and `isUp` properties
        this[key].code = config[key];
        this[key].isDown = false;
        this[key].isUp = true;
        this[key].alreadyPressed = false;
        //Set its `upHandler` and `downHandler`
        this[key].downHandler = (event) => {
          if (event.keyCode === this[key].code) {
            this[key].isDown = true;
            this[key].isUp = false;
          }
        };
        this[key].upHandler = (event) => {
          if (event.keyCode === this[key].code) {
            this[key].isUp = true;
            this[key].isDown = false;
            this[key].alreadyPressed = false;
          }
        };
        //Attach event listeners
        window.addEventListener(
          "keydown", this[key].downHandler.bind(this[key]), false
        );
        window.addEventListener(
          "keyup", this[key].upHandler.bind(this[key]), false
        );
      });
    }
  }
};
