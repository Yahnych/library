module utilities from "library/utilities";
module display from "library/display";
module collision from "library/collision";
module interactive from "library/interactive";
module sound from "library/sound";
module haiku from "library/haiku";
module tween from "library/plugins/Tween";
//import "library/plugins/tween.js/build/tween.min";
/*
System.import('library/plugins/tween.js/build/tween.min').then(function(app) {
  console.dir(app)
    });
*/

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
    this.canvas = display.makeCanvas({
      width: config.width || 250,
      height: config.height || 250,
    });

    //Initialize the pointer
    this.pointer.initialize();

    //Set the game state
    //The game's state and the initial state that should run when the
    //assets have finsihed loading
    this.state = undefined;
    this.loadingState = config.load || undefined;
    this.setupState = config.setup || undefined;
    this.playState = config.play || undefined;
    this.assetFilePaths = config.assets || undefined;
  }
  gameLoop() {
    requestAnimationFrame(this.gameLoop.bind(this), this.canvas);
    if (this.state) {
      //Run the current game state
      this.state();
      //Update the buttons
      this.updateButtons();
      //Render the canvas
      this.render(this.canvas);
    }
  }
  start() {
    //Two helper functions will run the initialization tasks:
    //1. The tasks that have to happen to run the setup and
    //play states
    let runSetupAndPlay = () => {
      //Run the setup state
      this.setupState();
      //Render the canvas to display sprites created
      //during the setup state
      this.render(this.canvas);
      //After the setup state has run, set the game
      //state to the playState
      if (this.playState) {
        this.state = this.playState;
      }
    };
    //2. The tasks that have to happen to load the assets
    let loadAssets = () => {
      this.assets.load(this.assetFilePaths);
      //While the assets are loading, run the user-defined `loadingState`
      this.state = this.loadingState || undefined;
      //When the assets have finished loading, run 
      //the setup and play functions
      this.assets.whenLoaded = () => {
        runSetupAndPlay();
      };
    };
    //This is the important part.
    //Load the assets, if there are any
    if (this.assetFilePaths) {
      loadAssets();
    }
    //Otherwise, just run the setup and play functions
    else {  
      runSetupAndPlay();
    }
    //Start the game loop
    this.gameLoop();
  }
  updateButtons() {
    if (this.buttons.length > 0) {
      for(let i = 0; i < this.buttons.length; i++) {
        let button = this.buttons[i];
        button.update(this.pointer, this.canvas);
      }
    }
  }
}

/*
game
----
Zen-mode convenience function for creating new Game object
(This is not in the `zen.js` file so that it avoids 
//a circular dependancy)
*/

export function game(width, height, setup, play, assets, load) {
  return new Game({width, height, setup, play, assets, load});
}


