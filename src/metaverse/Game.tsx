import { useEffect, useRef } from "react";
import { Game as PhaserGame } from "phaser";
import { GameConfig } from "./main";

export const Game = () => {
  const gameRef = useRef<PhaserGame | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new PhaserGame(GameConfig);
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      id="game-container"
      className="absolute"
      style={{
        width: "3000px",
        height: "3000px",
        backgroundImage:
          "linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)",
        backgroundSize: "50px 50px",
        left: "-1500px",
        top: "-1500px",
      }}
    />
  );
};
