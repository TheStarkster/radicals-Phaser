let game;
let gameOptions = {
  shipHorizontalSpeed: 400, // ship horizontal speed, can be modified to change gameplay
  barrierSpeed: 100, // barrier vertical speed, can be modified to change gameplay
  barrierGap: 150, // gap between two barriers, in pixels
  safeZones: 5 // amount of possible safe zone. It affects safe zone width
};
window.onload = function() {
  let gameConfig = {
    type: Phaser.AUTO,
    backgroundColor: 0x222222,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: "thegame",
      width: 320,
      height: 480
    },
    scene: playGame,
    physics: {
      default: "arcade",
      arcade: {
        gravity: {
          y: 0
        }
      }
    }
  };
  game = new Phaser.Game(gameConfig);
  window.focus();
};
class playGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }
  preload() {
    this.load.image("ship", "ship.png");
    this.load.image("barrier", "barrier.png");
  }
  create() {
    this.ship = this.physics.add.sprite(
      game.config.width / 2,
      (game.config.height / 5) * 4,
      "ship"
    );
    this.input.on("pointerdown", this.moveShip, this);
    this.input.on("pointerup", this.stopShip, this);
    this.addBarriers();
  }
  moveShip(p) {
    let speedMultiplier = p.x < game.config.width / 2 ? -1 : 1;
    this.ship.body.velocity.x =
      gameOptions.shipHorizontalSpeed * speedMultiplier;
  }
  stopShip() {
    this.ship.body.velocity.x = 0;
  }
  addBarriers() {
    this.horizontalBarrierGroup = this.physics.add.group();
    for (let i = 0; i < 10; i++) {
      this.horizontalBarrierPool = [
        this.horizontalBarrierGroup.create(0, 0, "barrier"),
        this.horizontalBarrierGroup.create(0, 0, "barrier")
      ];
      this.placeHorizontalBarriers();
    }
    this.horizontalBarrierGroup.setVelocityY(gameOptions.barrierSpeed);
  }
  getTopmostBarrier() {
    let topmostBarrier = game.config.height;
    this.horizontalBarrierGroup.getChildren().forEach(function(barrier) {
      topmostBarrier = Math.min(topmostBarrier, barrier.y);
    });
    return topmostBarrier;
  }
  placeHorizontalBarriers() {
    let topmost = this.getTopmostBarrier();
    let holePosition = Phaser.Math.Between(0, gameOptions.safeZones - 1);
    this.horizontalBarrierPool[0].x =
      (holePosition * game.config.width) / gameOptions.safeZones;
    this.horizontalBarrierPool[0].y = topmost - gameOptions.barrierGap;
    this.horizontalBarrierPool[0].setOrigin(1, 0);
    this.horizontalBarrierPool[1].x =
      ((holePosition + 1) * game.config.width) / gameOptions.safeZones;
    this.horizontalBarrierPool[1].y = topmost - gameOptions.barrierGap;
    this.horizontalBarrierPool[1].setOrigin(0, 0);
    this.horizontalBarrierPool = [];
  }
  update() {
    this.ship.x = Phaser.Math.Wrap(this.ship.x, 0, game.config.width);
    this.physics.world.collide(
      this.ship,
      this.horizontalBarrierGroup,
      function() {
        this.scene.start("PlayGame");
      },
      null,
      this
    );
    this.horizontalBarrierGroup.getChildren().forEach(function(barrier) {
      if (barrier.y > game.config.height) {
        this.horizontalBarrierPool.push(barrier);
        if (this.horizontalBarrierPool.length == 2) {
          this.placeHorizontalBarriers();
        }
      }
    }, this);
  }
}
