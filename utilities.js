
/* 
utilities.js
==============

This JavaScript file contains useful functions for
adding interactivity to sprites. See the sprites.js file for
sprite prototype objects can use this code

*/

//Dependencies
import Sound from "library/sound";
import "library/plugins/Font.js/Font";
import {TWEEN} from "library/plugins/Tween";

/*
distance
----------------

Find the distance in pixels between two sprites.
Parameters: 
a. A sprite object with `center.x` and `center.y` properties. 
b. A sprite object with `center.x` and `center.y` properties. 
The function returns the number of pixels distance between the sprites.

*/

export let distance = (s1, s2) => {
  let v = {};
  v.x = s2.center.x - s1.center.x;
  v.y = s2.center.y - s1.center.y;
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/*
ease
----------------

Make a sprite ease to the position of another sprite.
Parameters: 
a. A sprite object with `center.x` and `center.y` properties. This is the `follower`
sprite.
b. A sprite object with `center.x` and `center.y` properties. This is the `leader` sprite that
the follower will chase
c. The easing value, such as 0.3. A higher number makes the follower move faster

*/
export let ease = (follower, leader, speed) => {
  //Declare the variables we'll use in this function
  let distance, v = {};
  
  //Figure out the distance between the sprites
  v.x = leader.center.x - follower.center.x;
  v.y = leader.center.y - follower.center.y;
  distance = Math.sqrt(v.x * v.x + v.y * v.y);
  
  //Move the follower if it's more than 1 pixel 
  //away from the leader
  if (distance >= 1) {
    follower.p.x += v.x * speed;
    follower.p.y += v.y * speed;
  }
}

export let easeProperty = (start, end, speed) => {
  //Calculate the distance
  let distance = end - start;
  //Move the follower if it's more than 1 pixel 
  //away from the leader
  if (distance >= 1) {
    return distance * speed;
  } else {
    return 0;
  }
}

/*
follow
----------------

Make a sprite move towards another sprite at a regular speed.
Parameters: 
a. A sprite object with `center.x` and `center.y` properties. This is the `follower`
sprite.
b. A sprite object with `center.x` and `center.y` properties. This is the `leader` sprite that
the follower will chase
c. The speed value, such as 3. The is the pixels per frame that the sprite will move. A higher number makes the follower move faster.

*/

export let follow = (follower, leader, speed) => {
  let distance, v = {};
  
  //Figure out the distance between the sprites
  v.x = leader.center.x - follower.center.x;
  v.y = leader.center.y - follower.center.y;
  distance = Math.sqrt(v.x * v.x + v.y * v.y);
  
  //Move the follower if it's more than 1 move 
  //away from the leader
  if (distance >= speed) {
    follower.p.x += (v.x / distance) * speed;
    follower.p.y += (v.y / distance) * speed;
  }
}

/*
angle
-----

Return the angle in Radians between two sprites.
Parameters: 
a. A sprite object with `center.x` and `center.y` properties.
b. A sprite object with `center.x` and `center.y` properties.
You can use it to make a sprite rotate towards another sprite like this:

    box.rotation = angle(box, pointer);

*/

export let angle = (s1, s2) => {
  return Math.atan2(
    s2.center.y - s1.center.y,
    s2.center.x - s1.center.x
  );
}

/*
random
------

Return a random integer between a minimum and maximum value
Parameters: 
a. An integer.
b. An integer.
Here's how you can use it to get a random number betwee, 1 and 10:

    random(1, 10);

*/

export let random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/*
assets
------

This is an object to help you load and use game assets, like images, fonts and sounds. 
(To preload fonts, use Font.js). Here's how to use to load
an image and a font:

    assets.load(["images/spritesheet.png", "fonts/puzzler.otf"]);
    assets.whenLoaded = makeSprites;

When all the assets have finsihed loading, the makeSprites function
will run. (Replace makeSprites with an other function you need).
When you've loaded an asset, you can acccess it like this:

    imageObject = assets["spritesheet.png"];

(Just use the image name without the extension.)

*/
export let assets = {
  // Properties to help track the assets being loaded
  toLoad: 0,
  loaded: 0,

  //File extensions for different types of assets
  imageExtensions: ["png", "jpg", "gif"],
  fontExtensions: ["ttf", "otf", "ttc", "woff"],
  jsonExtensions: ["json"],
  audioExtensions: ["mp3", "ogg", "wav", "webm"],

  //The callback function that should run when all assets have loaded.
  //Assign this when you load the fonts, 
  //like this: `assets.whenLoaded = makeSprites;`
  whenLoaded: undefined,

  //If Pixi is being used as the renderer, use Pixi's
  //ImageLoader to add the image to the texture cache
  pixi: true,

  //The load method creates and loads all the assets. Use it like this:
  //`assets.load(["images/anyImage.png", "fonts/anyFont.otf"]);`
  load(sources) {
    return new Promise((resolve) => {
      let loadHandler = () => {
        this.loaded += 1;
        console.log(this.loaded);
        //Check whether everything has loaded
        if (this.toLoad === this.loaded) {
          //If it has, run the callback function that was
          //assigned to the `whenLoaded` property
          //this.whenLoaded();
          this.toLoad = 0;
          this.loaded = 0;      
          console.log("Assets finished loading");
          //Resolve the promise
          resolve();
        }
      }
      console.log("Loading assets...");
      //Find the number of files that need to be loaded
      this.toLoad = sources.length;
    
      sources.forEach((source) => {
        //Find the file extension of the asset
        let extension = source.split('.').pop();

        //Load images that have file extensions that match. 
        //the imageExtensions array
        if (this.imageExtensions.indexOf(extension) !== -1) {

          //If you're using Pixi, Pixi's `ImageLoader` adds the
          //image to the texture cache. The asset name will be a
          //string that references the correct texture in the cache
          if(this.pixi && PIXI) {
            let loader = new PIXI.ImageLoader(source);
            loader.onLoaded = () => { 
              //Get the file name from the full source path
              let name = source.split("/").pop();
              //Use the file name to reference the correct texture
              this[name] = PIXI.TextureCache[source];
              //Alert the load handler that the image has loaded
              //and the texture has been cached
              loadHandler();
            };
            //Start loading
            loader.load();

          //If you're not using Pixi, load an image. The asset name
          //will be an ordinary JavaScript image object
          } else {
            //Create a new image and add a loadHandler
            let image = new Image();
            //image.addEventListener("load", this.loadHandler.bind(this), false);
            image.addEventListener("load", loadHandler.bind(this), false);
            //Get the image file name
            image.name = source.split("/").pop();
            //Assign the image as a property of the assets object so
            //we can access it like this: `assets["imageName.png"]`
            this[image.name] = image;
            //Set the image's src property so we can start loading the image
            image.src = source;
          }
        }

        //Load fonts that have file extensions that match 
        //the fontExtensions array 
        else if (this.fontExtensions.indexOf(extension) !== -1) {
          //Create a new font using font.js (https://github.com/Pomax/Font.js)
          let font = new Font();
          //Use the font's file name as the fontFamily name
          font.fontFamily = source.split("/").pop().split(".")[0];
          //Set the loadHander and assign the source to start 
          //loading the font
          font.onload = loadHandler.bind(this);
          font.src = source;
        }

        //Load json files that have file extensions that match 
        //the jsonExtensions array 
        else if (this.jsonExtensions.indexOf(extension) !== -1) {
          //If Pixi is being used, then load the JSON file with Pixi's
          //`JsonLoader`. It will parse Texture Packer and Spine data
          if (this.pixi && PIXI) {
            let loader = new PIXI.JsonLoader(source);
            loader.onLoaded = () => { 
              //Get access to the parsed JSON object
              let file = loader.json;
              //Get the file name
              file.name = source.split("/").pop();
              //Assign the file as a property of the assets object so
              //we can access it like this: `assets["file.json"]`
              this[file.name] = file;
              
              //Copy a reference of each image on the tileset into
              //this `assets` object. That means you'll be able to 
              //access each image like this: `assets["imageName"]`
              if (file.frames) {
                Object.keys(file.frames).forEach((frame) => {
                  this[frame] = PIXI.TextureCache[frame];
                });
              }

              //Alert the load handler that the file has loaded
              loadHandler();
            };
            loader.load();
          }
          
          //If Pixi isn't being used, load the JSON file as usual 
          else {
            //Create a new xhr object and an object to store the file
            let xhr = new XMLHttpRequest();
            let file = {};
            //Use xhr to load the JSON file
            xhr.open("GET", source, true);
            xhr.addEventListener("readystatechange", () => {
              //Check to make sure the file has loaded properly
              if (xhr.status === 200 && xhr.readyState === 4) {
                //Convert the JSON data file into an ordinary object
                file = JSON.parse(xhr.responseText);
                //Get the file name
                file.name = source.split("/").pop();
                //Assign the file as a property of the assets object so
                //we can access it like this: `assets["file.json"]`
                this[file.name] = file;
                //Alert the load handler that the file has loaded
                loadHandler();
              }
            });
            //Send the request to load the file
            xhr.send();
          }
        }

        //Load audio files that have file extensions that match 
        //the audioExtensions array 
        else if (this.audioExtensions.indexOf(extension) !== -1) {
          //Create a sound sprite
          let soundSprite = new Sound({
            source: source,
            //loadHandler: this.loadHandler.bind(this)
            loadHandler: loadHandler.bind(this)
          });
          //Get the sound file name
          soundSprite.name = source.split("/").pop();
          //Assign the sound as a property of the assets object so
          //we can access it like this: `assets["sound.mp3"]`
          this[soundSprite.name] = soundSprite;
          console.log("Audio data loaded");
          console.log(soundSprite.name);
        }

        //Display a message if a file type isn't recognized
        else {
          throw new Error("File type not recognized: " + source);
        }
      });
    });
  }

  //The loadHandler will be called each time an 
  //asset finishes loading
  /*
  loadHandler() {
    this.loaded += 1;
    console.log(this.loaded);
    //Check whether everything has loaded
    if (this.toLoad === this.loaded) {
      //If it has, run the callback function that was
      //assigned to the `whenLoaded` property
      //this.whenLoaded();
      this.toLoad = 0;
      this.loaded = 0;      
      console.log("Assets finished loading");
      resolve();
    }
  }
  */
};

/*
Wait
----

Lets you set up a timed sequence of events

    wait(1000)
      .then(() => console.log("One"))
      .then(() => wait(1000))
      .then(() => console.log("Two"))
      .then(() => wait(1000))
      .then(() => console.log("Three"))

*/

export function wait(duration = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, duration);
  });
}

/*
Move
----

Move a sprite by adding it's velocity to it's position

    move(sprite);
*/

export function move(...sprites) {
  if (sprites.length === 1) {
    let s = sprites[0];
    s.x += s.vx;
    s.y += s.vy;
  }
  else {
    for (let i = 0; i < sprites.length; i++) {
      let s = sprites[i];
      s.x += s.vx;
      s.y += s.vy;
    }
  }
}

//Tween functions

export let slide = (sprite, x, y, time) => {
  let tween = new TWEEN.Tween(
    {x: sprite.x, y: sprite.y})
    .to({x: x, y: y},
    time
  );
  tween.easing(TWEEN.Easing.Circular.Out);
  tween.onUpdate(function() {
    sprite.x = this.x;
    sprite.y = this.y;
  });
  tween.start();
  return tween;
};

export let fade = (sprite, alpha, time) => {
  let tween = new TWEEN.Tween(
    {alpha: sprite.alpha})
    .to({alpha: alpha},
    time
  );
  tween.easing(TWEEN.Easing.Linear.None);
  tween.onUpdate(function() {
    sprite.alpha = this.alpha;
  });
  tween.start();
};
