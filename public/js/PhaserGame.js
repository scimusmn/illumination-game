
var game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'stage', { preload: preload, create: create, update: update, render: render });

function preload() {

  // Game Settings...

  // Prevent game from pausing when browser loses focus
  game.stage.disableVisibilityChange = true;

  game.load.image('block', 'img/sprites/block.png');
  game.load.image('block-damaged', 'img/sprites/block-damaged.png');
  game.load.spritesheet('ninja-tiles', 'img/sprites/ninja-tiles128.png', 128, 128, 34);

  game.load.atlasJSONHash('ghost', 'img/sprites/ghost.png', 'img/sprites/ghost.json');

}

// TEMP
var flyerVector = {x:0, y:0};
var flyerSpeedVertical = 60;
var flyerSpeedHorizontal = 45;
var flyerMagnitude = 0.0;

function gameControlVector(data) {

  // var userId = data.userid;
  flyerMagnitude = data.magnitude;
  flyerVector = {x:Math.cos(data.angle) * data.magnitude, y:Math.sin(data.angle * data.magnitude)};

}

function gameControlTap(data) {
  console.log('tap');
}

var sprite1;
var sprite2;
var tile;
var cursors;

var brickMap;
var brickLayer;
var bricksWide = 62;
var bricksHigh = 42;
var brickPlatforms;

function create() {

  game.physics.startSystem(Phaser.Physics.NINJA);
  game.physics.ninja.gravity = 0.25;

  sprite1 = game.add.sprite(400, 650, 'ghost');
  sprite1.scale.setTo(1.5, 1.5);
  sprite1.name = 'ghost1';

  // Animation
  var frames = Phaser.Animation.generateFrameNames('ghost_standing', 1, 7, '.png', 4);
  sprite1.animations.add('idle', frames, 10, true, false);

  frames = Phaser.Animation.generateFrameNames('ghost_walk', 1, 4, '.png', 4);
  sprite1.animations.add('fly', frames, 10, true, false);

  sprite1.animations.play('idle');
  sprite1.tint = Math.random() * 0xffffff;

  game.physics.ninja.enableBody(sprite1);

  sprite2 = game.add.sprite(600, 450, 'block');
  sprite2.name = 'blockB';
  sprite2.tint = Math.random() * 0xffffff;

  game.physics.ninja.enableAABB([sprite1, sprite2]);

  cursors = game.input.keyboard.createCursorKeys();

  createBrickPlatforms();

}

function createBrickPlatforms() {

  brickPlatforms = game.add.group();

  var brickRects = [
                      {x:100,y:100},
                      {x:900,y:300},
                      {x:100,y:500},
                      {x:200,y:500},
                      {x:300,y:500},
                      {x:400,y:500},
                    ];

  var platform;

  for (var i = 0; i < brickRects.length; i++) {

    var br = brickRects[i];

    var platform = brickPlatforms.create(br.x, br.y, 'block');

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

  game.physics.ninja.collide(sprite1, brickPlatforms);

  game.physics.ninja.collide(sprite1, sprite2);

  // Temp Debug
  keyboardInput();

  controllerInput();

}

function controllerInput() {

  if (flyerVector.x < 0) {

    sprite1.body.moveLeft(flyerSpeedHorizontal * Math.abs(flyerVector.x));
    sprite1.animations.play('fly');
    sprite1.scale.setTo(-1.5, 1.5);

  } else if (flyerVector.x > 0) {

    sprite1.body.moveRight(flyerSpeedHorizontal * Math.abs(flyerVector.x));
    sprite1.animations.play('fly');
    sprite1.scale.setTo(1.5, 1.5);

  } else {

    sprite1.animations.play('idle');

  }

  if (flyerVector.y < 0) {

    sprite1.body.moveUp(flyerSpeedVertical * Math.abs(flyerVector.y));

  } else if (flyerVector.y > 0) {

    sprite1.body.moveDown(flyerSpeedVertical * Math.abs(flyerVector.y));

  }

}

function keyboardInput() {

  if (cursors.left.isDown) {

    sprite1.body.moveLeft(flyerSpeedHorizontal);
    sprite1.animations.play('fly');
    sprite1.scale.setTo(-1.5, 1.5);

  } else if (cursors.right.isDown) {

    sprite1.body.moveRight(flyerSpeedHorizontal);
    sprite1.animations.play('fly');
    sprite1.scale.setTo(1.5, 1.5);

  } else {

    sprite1.animations.play('idle');

  }

  if (cursors.up.isDown) {

    sprite1.body.moveUp(flyerSpeedVertical);

  } else if (cursors.down.isDown) {

    sprite1.body.moveDown(flyerSpeedVertical);

  }

}

function render() {

  game.debug.text('left: ' + sprite1.body.touching.left, 32, 32);
  game.debug.text('right: ' + sprite1.body.touching.right, 256, 32);
  game.debug.text('up: ' + sprite1.body.touching.up, 32, 64);
  game.debug.text('down: ' + sprite1.body.touching.down, 256, 64);

}
