import { AUTO, Scale, Types } from "phaser";
import { Boot } from "./scenes/Boot";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";

// Extend Phaser's GameConfig type to include our custom plugin
interface GameConfigWithPlugins extends Types.Core.GameConfig {
  plugins: {
    scene: Array<{
      plugin: typeof PhaserMatterCollisionPlugin;
      key: string;
      mapping: string;
    }>;
  };
}

export const GameConfig: GameConfigWithPlugins = {
  type: AUTO,
  backgroundColor: "#000000",
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
    width: 2992,
    height: 3352,
    parent: "game-container",
    // zoom: 2,
  },
  scene: [Boot, Preloader, MainMenu],
  physics: {
    default: "matter",
    matter: {
      debug: true,
      gravity: { x: 0, y: 0 },
    },
  },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin,
        key: "matterCollision",
        mapping: "matterCollision",
      },
    ],
  },
  input: {
    keyboard: true,
  },
};
