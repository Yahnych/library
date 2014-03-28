module utilities from "utilities";
module display from "display";
module collision from "collision";
module interactive from "interactive";
module sound from "sound";

export default class {
  constructor(config) {
    //Copy all the imported library code into 
    //properties on this class
    Object.keys(utilities).forEach((key) => {
      this[key] = utilities[key];
    });
    Object.keys(display).forEach((key) => {
      this[key] = display[key];
    });
    Object.keys(collision).forEach((key) => {
      this[key] = collision[key];
    });
    Object.keys(interactive).forEach((key) => {
      this[key] = interactive[key];
    });
    Object.keys(sound).forEach((key) => {
      this[key] = sound[key];
    });

    //Create the canvas
    this.canvas = display.makeCanvas({
      width: config.width || 250,
      height: config.height || 250,
    });

    //Initialize the pointer
    //this.pointer = interactive.pointer;
    this.pointer.initialize();

    //Set the game state
    //The game's state and the initial state that should run when the
    //assets have finsihed loading
    this.state = undefined;
    this.setupState = config.setupState || undefined;
    //Load the assets if they've been provided
    if (config.assets) {
      let loadingStarted = false;
      let load = () => {
        if (!loadingStarted) {
          loadingStarted = true;
          this.assets.load(config.assets);
          //While the assets are loading, run the user-defined `loadingState`
          this.state = config.loadingState || undefined;
          //When the assets have finished loading, change the 
          //state to the user-defined `setupState`
          this.assets.whenLoaded = () => {
            this.state = this.setupState;
          };
        } 
      };
      load();
    } else {
      //If no assets need to load just set the state to the 
      //user-defined `setupState`
      this.state = this.setupState;
    }

    //this.state = this.setupState;
    //Start the game loop. The loop shouldn't run before this class
    //has been properly instantiated. That means we should wait for
    //one frame to pass before running the setup state.
    let classInstanitiated = false;
    this.gameLoop = () => {
      requestAnimationFrame(this.gameLoop, this.canvas);
      if (this.state) {
        if (classInstanitiated) {
          //Run the current game state
          this.state();
          //Render the canvas
          this.render(this.canvas);
        }
        classInstanitiated = true;
      }
    }
    this.gameLoop();
  }
  //Some convenience methods for creating new sprites
  rectangle(config) {
    return new this.Rectangle(config);
  }
  circle(config) {
    return new this.Circle(config);
  }
  tile(config) {
    return new this.Tile(config);
  }
  line(config) {
    return new this.Line(config);
  }
  message(config) {
    return new this.Message(config);
  }
}


