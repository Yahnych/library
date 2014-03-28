//Create the audio context
var actx = new AudioContext();

export default class {
  constructor(config) {
    //Set the default properties
    this.actx = actx;
    this.volumeNode = this.actx.createGain();
    this.panNode = this.actx.createPanner();
    this.panNode.panningModel = "equalpower";
    this.soundNode = undefined;
    this.buffer = undefined;
    this.source = undefined;
    this.loop = false;
    this.isPlaying = false;
    //The function that should run when the sound is loaded
    this.loadHandler = undefined;
    //Values for the pan and volume getters/setters
    this.panValue = 0;
    this.volumeValue = 1;
    //Values to help track and set the start and pause times
    this.startTime = 0;
    this.startOffset = 0;
    //Add the confguration object properties
    Object.keys(config).forEach((key) => {
      this[key] = config[key];
    });
    //Load the sound
    this.load();   
  }
  //The sound object's methods
  play() {
    //Set the start time (it will be `0` when the sound
    //first starts
    this.startTime = this.actx.currentTime;
    //Create a sound node 
    this.soundNode = this.actx.createBufferSource();
    //Set the sound node's buffer property to the loaded sound
    this.soundNode.buffer = this.buffer;
    //Connect the sound to the pan, connect the pan to the
    //volume, and connect the volume to the destination
    this.soundNode.connect(this.panNode);
    this.panNode.connect(this.volumeNode);
    this.volumeNode.connect(this.actx.destination);
    //Will the sound loop? This can be `true` or `false`
    this.soundNode.loop = this.loop;
    //Finally, use the `start` method to play the sound.
    //The start time will either be `0`,
    //or a later time if the sound was paused
    this.soundNode.start(
      0, this.startOffset % this.buffer.duration
    );
    //Set `isPlaying` to `true` to help control the 
    //`pause` and `restart` methods
    this.isPlaying = true;
  }
  pause() {
    //Pause the sound if it's playing, and caluclate the
    //`startOffset` to save the current position 
    if (this.isPlaying) {
      this.soundNode.stop();
      this.startOffset += this.actx.currentTime - this.startTime;
      this.isPlaying = false;
    }
  }
  restart() {
    //Stop the sound if it's playing, reset the start and offset times,
    //then call the `play` method again
    if (this.isPlaying) {
      this.soundNode.stop();
    }
    this.startOffset = 0,
    //this.startTime = 0,
    this.play();
  }
  playFrom(value) {
    if (this.isPlaying) {
      this.soundNode.stop();
    }
    this.startOffset = value;
    this.play();
  }
  //Volume and pan getters/setters
  get volume() {
    return this.volumeValue;
  }
  set volume(value) {
    this.volumeNode.gain.value = value;
    this.volumeValue = value;
  }
  get pan() {
    return this.panValue;
  }
  set pan(value) {
    //Panner objects accept x, y and z coordinates for 3D 
    //sound. However, because we're only doing 2D left/right
    //panning we're only interested in the the x coordinate, 
    //the first one. However, for a natural effect, the z
    //value also has to be set proportionately.
    var x = value,
        y = 0,
        z = 1 - Math.abs(x);
    this.panNode.setPosition(x, y, z);
    this.panValue = value;
  }
  load() {
    var xhr = new XMLHttpRequest();
    //Use xhr to load the sound file
    xhr.open("GET", this.source, true);
    xhr.responseType = "arraybuffer";
    xhr.addEventListener("load", () => {
      //Decode the sound and store a reference to the buffer 
      this.actx.decodeAudioData(
        xhr.response, 
        (buffer) => {
          this.buffer = buffer;
          this.hasLoaded = true;
          //This next bit is optional, but important.
          //If you have a load manager in your game, call it here so that
          //the sound is registered as having loaded. 
          if (this.loadHandler) {
            this.loadHandler();
          }
        }, 
        //Throw an error if the sound can't be decoded
        (error) => {
          throw new Error("Audio could not be decoded: " + error);
        }
      );
    });
    //Send the request to load the file
    xhr.send();
  }
}
