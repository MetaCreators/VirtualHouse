import { CurrUserPosType } from "@/types/UserPositionType";
import { Dispatch, SetStateAction } from "react";

export const handleKeyPress = (
  e: KeyboardEvent,
  setPosition: Dispatch<SetStateAction<CurrUserPosType>>,
  SPEED: number
) => {
  const movement = { x: 0, y: 0 };

  switch (e.key) {
    case "ArrowUp":
    case "w":
      movement.y = -SPEED;
      break;
    case "ArrowDown":
    case "s":
      movement.y = SPEED;
      break;
    case "ArrowLeft":
    case "a":
      movement.x = -SPEED;
      break;
    case "ArrowRight":
    case "d":
      movement.x = SPEED;
      break;
    default:
      return;
  }

  setPosition((prev) => ({
    x: prev.x + movement.x,
    y: prev.y + movement.y,
  }));
};
