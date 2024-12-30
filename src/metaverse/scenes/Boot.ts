import { Scene } from "phaser";
import leftSprite from "../../assets/left.png";
import rightSprite from "../../assets/right.png";
import upSprite from "../../assets/back.png";
import downSprite from "../../assets/front.png";
import idleSprite from "../../assets/idle.png";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.spritesheet("left", leftSprite, {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("right", rightSprite, {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("up", upSprite, {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("down", downSprite, {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("idle", idleSprite, {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    this.scene.start("Preloader");
  }
}
