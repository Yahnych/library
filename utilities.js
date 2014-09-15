
/* 
utilities.js
==============

This JavaScript file contains useful functions for
adding interactivity to sprites. See the sprites.js file for
sprite prototype objects can use this code

*/

//Dependencies
/*
import Sound from "library/sound";
*/

/*
assets
------

This is an object to help you load and use game assets, like images, fonts and sounds,
and texture atlases. 
Here's how to use to load an image, a font and a texture atlas:

    assets.load([
      "images/cat.png",
      "fonts/puzzler.otf",
      "images/animals.json",
    ]).then(() => setup());
    
When all the assets have finsihed loading, the makeSprites function
will run. (Replace makeSprites with an other function you need).
When you've loaded an asset, you can acccess it like this:

    imageObject = assets["images/cat.png"];

Access individual frames in a texture atlas using the frame's name, like this:

    frame = assets["hedgehog.png"];

(Just use the image name without the extension.)

*/

export let assets = {
  //Properties to help track the assets being loaded
  toLoad: 0,
  loaded: 0,

  //File extensions for different types of assets
  imageExtensions: ["png", "jpg", "gif"],
  fontExtensions: ["ttf", "otf", "ttc", "woff"],
  jsonExtensions: ["json"],
  audioExtensions: ["mp3", "ogg", "wav", "webm"],
  
  //The `load` method creates and loads all the assets. Use it like this:
  //`assets.load(["images/anyImage.png", "fonts/anyFont.otf"]);`
  load(sources) {
    //The `load` method will return a Promise when everything has
    //loaded
    return new Promise(resolve => {
      //The `loadHandler` counts the number of assets loaded, compares
      //it to the total number of assets that need to be loaded, and
      //resolves the Promise when everything has loaded
      let loadHandler = () => {
        this.loaded += 1;
        console.log(this.loaded);
        //Check whether everything has loaded
        if (this.toLoad === this.loaded) {
          //Reset `toLoad` and `loaded` to `0` so you can use them
          //to load more assets later if you need to
          this.toLoad = 0;
          this.loaded = 0;      
          console.log("Assets finished loading");
          //Resolve the promise
          resolve();
        }
      };

      //Display a console message to confirm that the assets are
      //being loaded
      console.log("Loading assets...");

      //Find the number of files that need to be loaded
      this.toLoad = sources.length;

      //Loop through all the source file names and find out how
      //they should be interpreted
      sources.forEach(source => {
        //Find the file extension of the asset
        let extension = source.split(".").pop();
        //Load images that have file extensions that match 
        //the imageExtensions array
        if (this.imageExtensions.find(x => x === extension)) {
          this.loadImage(source, loadHandler);
        }
        //Load fonts 
        else if (this.fontExtensions.find(x => x === extension)) {
          this.loadFont(source, loadHandler);
        }
        //Load JSON files  
        else if (this.jsonExtensions.find(x => x === extension)) {
          this.loadJson(source, loadHandler);
        }
        //Load audio files  
        else if (this.audioExtensions.find(x => x === extension)) {
          this.loadSound(source, loadHandler);
        }
        //Display a message if a file type isn't recognized
        else {
          console.log("File type not recognized: " + source);
        }
      });
    });
  },

  loadImage(source, loadHandler) {
    //Create a new image and call the `loadHandler` when the image
    //file has loaded
    let image = new Image();
    image.addEventListener("load", loadHandler, false);
    //Assign the image as a property of the `assets` object so
    //you can access it like this: `assets["path/imageName.png"]`
    this[source] = image;

    //Alternatively, if you only want the file name without the full
    //path, you can get it like this:
    //image.name = source.split("/").pop();
    //this[image.name] = image; 
    //This will allow you to access the image like this:
    //assets["imageName.png"];

    //Set the image's `src` property to start loading the image
    image.src = source;
  },

  loadFont(source, loadHandler) {
    //Use the font's file name as the `fontFamily` name
    let fontFamily = source.split("/").pop().split(".")[0];
    //Append an `@afont-face` style rule to the head of the HTML
    //document. It's kind of a hack, but until HTML5 has a
    //proper font loading API, it will do for now
    let newStyle = document.createElement("style");
    let fontFace = "@font-face {font-family: '" + fontFamily + "'; src: url('" + source + "');}";
    newStyle.appendChild(document.createTextNode(fontFace));
    document.head.appendChild(newStyle);
    //Tell the `loadHandler` we're loading a font
    loadHandler();
  },

  loadJson(source, loadHandler) {
    //Create a new `xhr` object and an object to store the file
    let xhr = new XMLHttpRequest();

    //Use xhr to load the JSON file
    xhr.open("GET", source, true);
    
    //Tell xhr that it's a text file
    xhr.responseType = "text";
    
    //Create an `onload` callback function that
    //will handle the file loading    
    xhr.onload = event => {
      //Check to make sure the file has loaded properly
      if (xhr.status === 200) {
        //Convert the JSON data file into an ordinary object
        let file = JSON.parse(xhr.responseText);
        //Get the file name
        file.name = source;
        //Assign the file as a property of the assets object so
        //you can access it like this: `assets["file.json"]`
        this[file.name] = file;
        //Texture atlas support:
        //If the JSON file has a `frames` property then 
        //it's in Texture Packer format
        if (file.frames) {
          //Create the tileset frames
          this.createTilesetFrames(file, source, loadHandler);
        } else {
          //Alert the load handler that the file has loaded
          loadHandler();
        }
      }
    };
    //Send the request to load the file
    xhr.send();
  },
  createTilesetFrames(file, source, loadHandler) {
    //Get the tileset image's file path
    let baseUrl = source.replace(/[^\/]*$/, "");
    //Here's how this regular expression works:
    //http://stackoverflow.com/questions/7601674/id-like-to-remove-the-filename-from-a-path-using-javascript
    
    //Use the `baseUrl` and `image` name property from the JSON 
    //file's `meta` object to construct the full image source path 
    let imageSource = baseUrl + file.meta.image;
    
    //The image's load handler
    let imageLoadHandler = () => {
      //Assign the image as a property of the `assets` object so
      //your can access it like this:
      //`assets["images/imageName.png"]`
      this[imageSource] = image;

      //Loop through all the frames
      Object.keys(file.frames).forEach(frame => {
        //The `frame` object contains all the size and position
        //data for each sub-image.
        //Add the frame data to the asset object so that you
        //can access it later like this: `assets["frameName.png"]`
        this[frame] = file.frames[frame];

        //Get a reference to the source so that it will be easy for
        //us to access it later
        this[frame].source = image;
      });
      
      //Alert the load handler that the file has loaded
      loadHandler();
    };

    //Load the tileset image
    let image = new Image();
    image.addEventListener("load", imageLoadHandler, false);
    image.src = imageSource;
  },

  loadSound(source, loadHandler) {
    console.log("loadSound called");
  }
};
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

