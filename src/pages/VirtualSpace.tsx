/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";

const VirtualSpace = () => {
  // Player position state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [latestmessage, setLatestMessage] = useState("");
  const [userMsg, setUserMsg] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      console.log("browser connected");
      setSocket(socket);
    };

    socket.onmessage = (message) => {
      console.log("received msg is:", message.data);
      setLatestMessage(message.data);
    };

    return () => {
      socket.close();
    };
  }, []);

  // Camera/viewport offset state (for centered player)
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  // Movement speed in pixels
  const SPEED = 5;

  // Update camera to follow player
  useEffect(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    setCameraOffset({
      x: -(position.x - viewportWidth / 2),
      y: -(position.y - viewportHeight / 2),
    });
  }, [position]);

  // Handle keyboard movement
  const handleKeyPress = useCallback((e: any) => {
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
  }, []);

  // Set up keyboard listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  if (!socket) {
    return <div> connecting to ws server</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      {/* World container that moves opposite to player movement */}
      <div
        className="absolute"
        style={{
          transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`,
          transition: "transform 0.1s linear",
        }}
      >
        {/* Grid pattern for visual reference */}
        <div
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

        {/* Player avatar - centered on screen */}
        <div
          className="absolute w-12 h-12 bg-blue-500 rounded-full"
          style={{
            left: position.x - 24, // Center the avatar (half of width)
            top: position.y - 24, // Center the avatar (half of height)
            transition: "all 0.1s linear",
          }}
        >
          {/* Direction indicator */}
          <div className="absolute w-4 h-4 bg-white rounded-full top-1 left-4" />
        </div>

        {/* Example static objects in the world */}
        <div
          className="absolute w-20 h-20 bg-red-500 rounded-lg"
          style={{ left: 200, top: 200 }}
        />
        <div
          className="absolute w-20 h-20 bg-green-500 rounded-lg"
          style={{ left: -200, top: -200 }}
        />
      </div>

      {/* UI overlay */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
        <div>X: {Math.round(position.x)}</div>
        <div>Y: {Math.round(position.y)}</div>
      </div>
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow">
        <div> latest msg is {latestmessage}</div>
      </div>
      <div className="absolute top-16 right-4 bg-white p-2 rounded shadow">
        <input
          onChange={(e) => {
            setUserMsg(e.target.value);
          }}
        />
        <button
          onClick={() => {
            socket.send(userMsg);
          }}
        >
          send
        </button>
      </div>
    </div>
  );
};

export default VirtualSpace;
