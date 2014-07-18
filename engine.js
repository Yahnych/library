module utilities from "library/utilities";
module display from "library/display";
module collision from "library/collision";
module interactive from "library/interactive";
module sound from "library/sound";
module haiku from "library/haiku";
module tween from "library/plugins/Tween";
module pixiDisplay from "library/pixiDisplay";

export class Game {
  constructor(config) {
    //Copy all the imported library code into 
    //properties on this class
    Object.assign(this, utilities);
    Object.assign(this, display);
    Object.assign(this, collision);
    Object.assign(this, interactive);
    Object.assign(this, sound);
    Object.assign(this, haiku);
    Object.assign(this, tween);

    //Create the canvas
    this.canvas = this.makeCanvas({
      width: config.width || 250,
      height: config.height || 250,
    });

    //Initialize the pointer
    this.pointer.initialize();

    //Set the game `state`
    this.state = undefined;

    //Set the user-defined `load` and `setup` states
    this.load = config.load || undefined;
    this.setup = config.setup || undefined;

    //The `setup` function is required, so throw an error if it's
    //missing
    if(this.setup === undefined) {
      throw new Error(
        "Please supply the setup function in the Game constructor"
      );
    }

    //Get the user-defined array that listed the assets 
    //that have to load
    this.assetFilePaths = config.assets || undefined;

    //A Boolean to let us pause the game
    this.paused = false;

  }

  //The engine's game loop
  gameLoop() {
    requestAnimationFrame(this.gameLoop.bind(this), this.canvas);
    //Update the buttons
    this.updateButtons();
    //Update the TWEEN object
    this.TWEEN.update();
    //Run the current game state if it's been defined and
    //the game isn't paused
    if(this.state && !this.paused) {
      this.state();
    }
    //Render the canvas
    this.render(this.canvas);
  }

  //The `start` method that gets the whole engine going
  start() {
    if (this.assetFilePaths) {
      //Use the supplied file paths to load the assets then run
      //the user-defined `setup` function
      this.assets
        .load(this.assetFilePaths)
        .then(() => {
          //Clear the game state for now to stop the loop
          this.state = undefined;
          //Call the `setup` function
          this.setup();
        });
      //While the assets are loading, set the user-defined `load`
      //function as the game state. That will make it run in a loop
      this.state = this.load || undefined;
    }
    //If there aren't any assets to load, 
    //just run the user-defined `setup` functions
    else {  
      this.setup();
    }
    //Start the game loop
    this.gameLoop();
  }
  //Pause and resume methods
  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
  }
  //Update all the buttons in the game
  updateButtons() {
    if (this.buttons.length > 0) {
      this.canvas.style.cursor = "auto";
      for(let i = 0; i < this.buttons.length; i++) {
        let button = this.buttons[i];
        button.update(this.pointer, this.canvas);
        if (button.state === "over" || button.state === "down") {
          this.canvas.style.cursor = "pointer";
        }
      }
    }
  }
}

/*
game
----
A Haiku API convenience function for creating new Game object
(This is not in the `haiku.js` file so that it avoids 
//a circular dependancy)
*/

export function game(width, height, setup, assets, load) {
  return new Game({width, height, setup, assets, load});
}

/*
PixiGame
--------
*/

export class PixiGame {
  constructor(width, height, setupFunction, assetsToLoad, loadFunction, renderer) {
    //Copy all the imported library code into 
    //properties on this class
    Object.assign(this, utilities);
    Object.assign(this, collision);
    Object.assign(this, interactive);
    Object.assign(this, sound);
    Object.assign(this, tween);
    //Replace the `display` module with `pixiDisplay`
    Object.assign(this, pixiDisplay);

    //Create the Pixi and renderer using the config 
    //object's `height` and `width` properties
    let dips = 1;//window.devicePixelRatio;
    switch (renderer) {
      case "auto":
        this.renderer = PIXI.autoDetectRenderer(width * dips, height * dips);
        break;

      case "canvas":
        this.renderer = new PIXI.CanvasRenderer(width * dips, height * dips);
        break;

      case "gl":
        this.renderer = new PIXI.WebGLRenderer(width * dips, height * dips);
        break;

      default:
        this.renderer = PIXI.autoDetectRenderer(width * dips, height * dips);
    }
    this.canvas = this.renderer.view;
    document.body.appendChild(this.canvas);

    //Add a border around the canvas
    this.canvas.style.border = "1px dashed black";
    
    //Initialize the Pixi Pointer in library/pixiDisplay
    this.pointer = new this.Pointer();

    //Set the game `state`
    this.state = undefined;

    //Set the user-defined `load` and `setup` states
    this.load = loadFunction || undefined;
    this.setup = setupFunction || undefined;

    //The `setup` function is required, so throw an error if it's
    //missing
    if(this.setup === undefined) {
      throw new Error(
        "Please supply the setup function in the constructor"
      );
    }

    //Get the user-defined array that listed the assets 
    //that have to load
    this.assetFilePaths = assetsToLoad || undefined;

    //A Boolean to let us pause the game
    this.paused = false;
  }
    
  //The engine's game loop
  gameLoop() {
    requestAnimationFrame(this.gameLoop.bind(this), this.canvas);
    //Update the TWEEN object
    this.TWEEN.update();
    //Run the current game state if it's been defined and
    //the game isn't paused
    if(this.state && !this.paused) {
      this.state();
    }
    //Render the canvas
    this.renderer.render(this.stage);
  }

  //The `start` method that gets the whole engine going
  start() {
    if (this.assetFilePaths) {
      //Use the supplied file paths to load the assets then run
      //the user-defined `setup` function
      this.assets
        .load(this.assetFilePaths)
        .then(() => {
          //Clear the game state for now to stop the loop
          this.state = undefined;
          //Call the `setup` function
          this.setup();
        });
      //While the assets are loading, set the user-defined `load`
      //function as the game state. That will make it run in a loop
      this.state = this.load || undefined;
    }
    //If there aren't any assets to load, 
    //just run the user-defined `setup` functions
    else {  
      this.setup();
    }
    //Start the game loop
    this.gameLoop();
  }
  //Pause and resume methods
  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
  }
}


