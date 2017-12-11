
var game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'stage', { preload: preload, create: create, update: update, render: render });

function preload() {

  // Game Settings...

  // Prevent game from pausing when browser loses focus
  game.stage.disableVisibilityChange = true;

  game.load.image('block', 'img/sprites/block.png');
  game.load.image('block-damaged', 'img/sprites/block-damaged.png');
  game.load.image('debug-block', 'img/sprites/square1.png');

  game.load.spritesheet('ninja-tiles', 'img/sprites/ninja-tiles128.png', 128, 128, 34);

  game.load.atlasJSONHash('ghost', 'img/sprites/ghost.png', 'img/sprites/ghost.json');

  // Fonts
  game.load.bitmapFont('carrier_command', 'fonts/bitmapFonts/carrier_command.png', 'fonts/bitmapFonts/carrier_command.xml');

}

// TEMP
var flyerGroup;
var flyerSprite;
var flyerRange;
var flyerVector = {x:0, y:0};
var flyerSpeedVertical = 60;
var flyerSpeedHorizontal = 45;
var flyerMagnitude = 0.0;
var flyerName;

function gameControlVector(data) {

  // var userId = data.userid;
  flyerMagnitude = data.magnitude;
  flyerVector = {x:Math.cos(data.angle) * data.magnitude, y:Math.sin(data.angle * data.magnitude)};

}

function gameControlTap(data) {
  flyerSwipe(data.userid);
}

var tile;
var cursors;

var brickWidth = 86;
var brickHeight = 36;
var brickPlatforms;

function create() {

  // Physics system
  game.physics.startSystem(Phaser.Physics.NINJA);
  game.physics.ninja.gravity = 0.25;

  flyerGroup = game.add.sprite(775, 480, '');

  flyerSprite = game.add.sprite(0, 0, 'ghost');
  flyerSprite.scale.setTo(1.5, 1.5);
  flyerSprite.name = 'flyer-sprite';

  // Swipe collision object.
  flyerRange = game.add.sprite(0, 0, '');

  flyerRange.anchor.x = 0.5;
  flyerRange.anchor.y = 0.5;

  flyerRange.width = 200;
  flyerRange.height = 200;

  // Display Name
  // flyerName = flyerGroup.add.bitmapText(10, 100, 'carrier_command','Bodenator',34);
  var style = { font: '18px Arial', fill: '#ffaaff' };
  flyerName = game.add.text(0, -70, 'Bodenator', style);
  flyerName.anchor.x = 0.5;
  flyerName.anchor.y = 0.5;

  // Animation
  var frames = Phaser.Animation.generateFrameNames('ghost_standing', 1, 7, '.png', 4);
  flyerSprite.animations.add('idle', frames, 10, true, false);

  frames = Phaser.Animation.generateFrameNames('ghost_walk', 1, 4, '.png', 4);
  flyerSprite.animations.add('fly', frames, 10, true, false);

  flyerSprite.animations.play('idle');
  flyerSprite.tint = Math.random() * 0xffffff;
  flyerSprite.anchor.x = 0.5;
  flyerSprite.anchor.y = 0.5;

  // Combine into single flyer sprite
  flyerGroup.addChild(flyerRange);
  flyerGroup.addChild(flyerName);
  flyerGroup.addChild(flyerSprite);

  game.physics.ninja.enableAABB(flyerGroup, false);

  // Keyboard for debug
  cursors = game.input.keyboard.createCursorKeys();
  spaceButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  spaceButton.onDown.add(flyerSwipe, this);

  // Generate brick tile pattern.
  createBrickPlatforms();

}

function createBrickPlatforms() {

  brickPlatforms = game.add.group();

  var brickRects = [{x:440,y:0,w:brickWidth,h:brickHeight},
                      {x:700,y:100,w:brickWidth,h:brickHeight},
                      {x:900,y:300,w:brickWidth * 3,h:4 * brickHeight},
                      {x:100,y:500,w:brickWidth,h:brickHeight},
                      {x:200,y:500,w:brickWidth,h:brickHeight},
                      {x:300,y:500,w:brickWidth,h:brickHeight},
                      {x:400,y:500,w:brickWidth,h:brickHeight},
                      {x:-40,y:500,w:brickWidth,h:brickHeight},
                      {x:1900,y:400,w:brickWidth,h:brickHeight},
                      {x:1800,y:400,w:brickWidth,h:brickHeight},
                      {x:1700,y:400,w:brickWidth,h:brickHeight},
                      {x:1600,y:400,w:brickWidth,h:brickHeight},
                      {x:1900,y:200,w:brickWidth,h:brickHeight},
                      {x:1800,y:200,w:brickWidth,h:brickHeight},
                      {x:1700,y:200,w:brickWidth,h:brickHeight},
                      {x:1600,y:200,w:brickWidth,h:brickHeight},
                      {x:1900,y:600,w:brickWidth,h:brickHeight},
                      {x:1800,y:600,w:brickWidth,h:brickHeight},
                      {x:1700,y:600,w:brickWidth,h:brickHeight},
                      {x:1600,y:600,w:brickWidth,h:brickHeight},
                    ];

  brickRects = BrickTileMap; // Variable from ./BrickTileMap.js

  // De-center all bricks (brick-mapper exports as centered)
  for (var i = 0; i < brickRects.length; i++) {
    var b = brickRects[i];
    b.x -= (b.w / 2);
    b.y -= (b.h / 2);
  }

  console.log(brickRects);

  var platform;

  for (var i = 0; i < brickRects.length; i++) {

    var br = brickRects[i];

    var platform = brickPlatforms.create(br.x, br.y, 'block');
    platform.width = br.w;
    platform.height = br.h;

    game.physics.ninja.enable(platform, 3);
    platform.body.immovable = true;
    platform.body.gravityScale = 0;

  }

  // TEMP - Demo tile swap
  setTimeout(function() {
    brickPlatforms.getChildAt(4).loadTexture('block-damaged');
  }, 4000);

  setTimeout(function() {
    brickPlatforms.removeChildAt(4);
  }, 6000);

}

function update() {

  game.physics.ninja.collide(flyerGroup, brickPlatforms);

  // Temp Debug
  keyboardInput();

  controllerInput();

}

function controllerInput() {

  if (flyerVector.x < 0) {

    flyerGroup.body.moveLeft(flyerSpeedHorizontal * Math.abs(flyerVector.x));
    flyerSprite.animations.play('fly');
    flyerSprite.scale.setTo(-1.5, 1.5);

  } else if (flyerVector.x > 0) {

    flyerGroup.body.moveRight(flyerSpeedHorizontal * Math.abs(flyerVector.x));
    flyerSprite.animations.play('fly');
    flyerSprite.scale.setTo(1.5, 1.5);

  } else {

    flyerSprite.animations.play('idle');

  }

  if (flyerVector.y < 0) {

    flyerGroup.body.moveUp(flyerSpeedVertical * Math.abs(flyerVector.y));

  } else if (flyerVector.y > 0) {

    flyerGroup.body.moveDown(flyerSpeedVertical * Math.abs(flyerVector.y));

  }

}

function keyboardInput() {

  if (cursors.left.isDown) {

    flyerGroup.body.moveLeft(flyerSpeedHorizontal);
    flyerSprite.animations.play('fly');
    flyerSprite.scale.setTo(-1.5, 1.5);

  } else if (cursors.right.isDown) {

    flyerGroup.body.moveRight(flyerSpeedHorizontal);
    flyerSprite.animations.play('fly');
    flyerSprite.scale.setTo(1.5, 1.5);

  } else {

    flyerSprite.animations.play('idle');

  }

  if (cursors.up.isDown) {

    flyerGroup.body.moveUp(flyerSpeedVertical);

  } else if (cursors.down.isDown) {

    flyerGroup.body.moveDown(flyerSpeedVertical);

  }

}

function flyerSwipe(userid) {
  // console.log('flyer swipe now', userid);

  // Show swipe animation

  // Detect if any bricks were hit
  // game.physics.ninja.collide(flyerSprite, brickPlatforms, flyerSwipedBrick, null, this);
  // if (game.physics.ninja.overlap(flyerRange, brickPlatforms, flyerSwipedBrick, processKill, this)){

  //   console.log('HIT');

  // };

  // var intersects = Phaser.Rectangle.intersection(flyerRange.hitArea, rectB);

  // if (intersects) {
  //   console.log('HIT');
  // }

  // Detect if any items were hit

  // Detect if any other players hit

}

function flyerSwipedBrick(_swiper, _brick) {

  console.log('*** flyerSwipedBrick');
  console.log(_brick);

  if (_brick.key == 'block') {
    _brick.loadTexture('block-damaged');
  } else {
    _brick.kill();

    //brickPlatforms.removeChildAt(4);
  }

  return true;

}

function processKill() {

}

function render() {

  /*  game.debug.text('left: ' + flyerSprite.body.touching.left, 32, 32);
    game.debug.text('right: ' + flyerSprite.body.touching.right, 256, 32);
    game.debug.text('up: ' + flyerSprite.body.touching.up, 32, 64);
    game.debug.text('down: ' + flyerSprite.body.touching.down, 256, 64);*/

  game.debug.body(flyerGroup);

}
