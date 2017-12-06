
var game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'stage', { preload: preload, create: create, update: update, render: render });

function preload() {

  game.load.image('block', 'img/sprites/block.png');
  game.load.spritesheet('ninja-tiles', 'img/sprites/ninja-tiles128.png', 128, 128, 34);

  game.load.atlasJSONHash('ghost', 'img/sprites/ghost.png', 'img/sprites/ghost.json');

}

// TEMP
function gameControlVector(data) {
  console.log('vec', data);
}

function gameTap(data) {
  console.log('tap');
}

var sprite1;
var sprite2;
var tile;
var cursors;

function create() {

  game.physics.startSystem(Phaser.Physics.NINJA);
  game.physics.ninja.gravity = 0.25;

  sprite1 = game.add.sprite(100, 450, 'ghost');
  sprite1.scale.setTo(1.5, 1.5);
  sprite1.name = 'ghost1';

  // Animation
  var frames = Phaser.Animation.generateFrameNames('ghost_standing', 1, 7, '.png', 4);
  sprite1.animations.add('idle', frames, 10, true, false);

  frames = Phaser.Animation.generateFrameNames('ghost_walk', 1, 4, '.png', 4);
  sprite1.animations.add('fly', frames, 10, true, false);

  sprite1.animations.play('idle');

  sprite2 = game.add.sprite(600, 450, 'block');
  sprite2.name = 'blockB';
  sprite2.tint = Math.random() * 0xffffff;

  game.physics.ninja.enableAABB([sprite1, sprite2]);

  cursors = game.input.keyboard.createCursorKeys();

}

function update() {

  game.physics.ninja.collide(sprite1, sprite2);

  if (cursors.left.isDown)
  {
    sprite1.body.moveLeft(20);
    sprite1.animations.play('fly');
    sprite1.scale.setTo(-1.5, 1.5);
  } else if (cursors.right.isDown)
  {
    sprite1.body.moveRight(20);
    sprite1.animations.play('fly');
    sprite1.scale.setTo(1.5, 1.5);
  } else {
    // TODO - make sure idle is playing
    sprite1.animations.play('idle');
  }

  if (cursors.up.isDown)
  {
    sprite1.body.moveUp(40);
  } else if (cursors.down.isDown)
  {
    sprite1.body.moveDown(30);
  }

  // console.log('facing', sprite1.body.facing);

}

function render() {

  game.debug.text('left: ' + sprite1.body.touching.left, 32, 32);
  game.debug.text('right: ' + sprite1.body.touching.right, 256, 32);
  game.debug.text('up: ' + sprite1.body.touching.up, 32, 64);
  game.debug.text('down: ' + sprite1.body.touching.down, 256, 64);

}
