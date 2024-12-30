import { Scene, Input, Physics, Tilemaps } from "phaser";

interface InputKeys {
  up: Input.Keyboard.Key;
  down: Input.Keyboard.Key;
  left: Input.Keyboard.Key;
  right: Input.Keyboard.Key;
}

export class MainMenu extends Scene {
  private player!: Physics.Matter.Sprite;
  private inputKeys!: InputKeys;
  private map!: Tilemaps.Tilemap;
  private tileset!: Tilemaps.Tileset;
  private groundLayer!: Tilemaps.TilemapLayer;
  private object!: Tilemaps.TilemapLayer;
  private walls!: Tilemaps.TilemapLayer;
  private objectLayer!: Tilemaps.TilemapLayer;

  constructor() {
    super("MainMenu");
  }

  preload(): void {
    this.load.tilemapTiledJSON("map", "../src/assets/map/map.json");

    this.load.image("tiles", "../src/assets/map/FinalTileSet.jpeg");
  }

  create(): void {
    this.map = this.make.tilemap({ key: "map" });

    this.tileset = this.map.addTilesetImage("FinalTileSet", "tiles")!;

    this.groundLayer = this.map.createLayer(
      "Ground Layer",
      this.tileset,
      0,
      0
    )!;

    this.object = this.map.createLayer("Objects", this.tileset, 0, 0)!;

    this.walls = this.map.createLayer("Walls", this.tileset, 0, 0)!;

    this.objectLayer = this.map.createLayer(
      "Objects Layer",
      this.tileset,
      0,
      0
    )!;

    // this.walls.setCollisionByProperty({ collide: true });
    // const wallTiles = this.walls.filterTiles((tile: Tilemaps.Tile) => {
    //   return tile.properties?.collide === true;
    // });

    // wallTiles.forEach((tile) => {
    //   const tileBody = this.matter.add.rectangle(
    //     tile.pixelX + tile.width / 2,
    //     tile.pixelY + tile.height / 2,
    //     tile.width,
    //     tile.height,
    //     {
    //       isStatic: true,
    //       label: "wall",
    //     }
    //   );
    // });

    // // Convert the tiles to Matter physics bodies
    // this.matter.world.convertTilemapLayer(this.walls);

    this.player = this.matter.add.sprite(100, 100, "idle");
    console.log(this.player);
    this.player.setScale(1);

    const playerCollider = this.matter.bodies.circle(
      this.player.x,
      this.player.y,
      48,
      {
        isSensor: false,
        label: "playerCollider",
      }
    );

    // Create a compound body
    const compoundBody = this.matter.body.create({
      parts: [playerCollider],
      frictionAir: 0.35,
    });

    // Attach the collider to the player
    this.player.setExistingBody(compoundBody);
    this.player.setOrigin(0.5, 0.5);
    this.player.setFixedRotation();

    // Create animations
    this.createAnimations();

    // Setup input keys with null check
    if (!this.input.keyboard) {
      throw new Error("Keyboard plugin is not available!");
    }

    this.inputKeys = this.input.keyboard.addKeys({
      up: Input.Keyboard.KeyCodes.UP,
      down: Input.Keyboard.KeyCodes.DOWN,
      left: Input.Keyboard.KeyCodes.LEFT,
      right: Input.Keyboard.KeyCodes.RIGHT,
    }) as InputKeys;

    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    this.cameras.main.startFollow(this.player);

    this.player.play("idle");
  }

  private createAnimations(): void {
    const animConfig = [
      { key: "left", start: 0, end: 0 },
      { key: "right", start: 0, end: 0 },
      { key: "up", start: 0, end: 0 },
      { key: "down", spriteKey: "idle", start: 0, end: 0 },
      { key: "idle", start: 0, end: 0 },
    ];

    animConfig.forEach((config) => {
      this.anims.create({
        key: config.key,
        frames: this.anims.generateFrameNumbers(
          config.spriteKey || config.key,
          {
            start: config.start,
            end: config.end,
          }
        ),
        frameRate: 10,
        repeat: -1,
      });
    });
  }

  update(): void {
    const speed = 10;
    const playerVelocity = new Phaser.Math.Vector2();

    // Make sure inputKeys is defined before using it
    if (!this.inputKeys) {
      return;
    }

    // Handle movement input
    if (this.inputKeys.left.isDown) {
      playerVelocity.x = -1;
    } else if (this.inputKeys.right.isDown) {
      playerVelocity.x = 1;
    }

    if (this.inputKeys.up.isDown) {
      playerVelocity.y = -1;
    } else if (this.inputKeys.down.isDown) {
      playerVelocity.y = 1;
    }

    // Handle animations
    if (playerVelocity.x < 0) {
      this.player.anims.play("left", true);
    } else if (playerVelocity.x > 0) {
      this.player.anims.play("right", true);
    } else if (playerVelocity.y < 0) {
      this.player.anims.play("up", true);
    } else if (playerVelocity.y > 0) {
      this.player.anims.play("down", true);
    } else {
      this.player.anims.play("idle", true);
    }

    playerVelocity.normalize();
    playerVelocity.scale(speed);
    this.player.setVelocity(playerVelocity.x, playerVelocity.y);
  }
}
