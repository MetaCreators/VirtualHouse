/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";

const VirtualSpace = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUsers, setOtherUsers] = useState<
    Array<{ id: string; position: { x: number; y: number } }>
  >([]);
  const [latestMessage, setLatestMessage] = useState("");
  const [userMsg, setUserMsg] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      setSocket(socket);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "userId":
          setUserId(message.id);
          break;

        case "userList":
          setOtherUsers(
            message.users.filter((user: any) => user.id !== userId)
          );
          break;

        case "userMove":
          if (message.userId !== userId) {
            setOtherUsers((prevUsers) => {
              const updatedUsers = prevUsers.map((user) =>
                user.id === message.userId
                  ? { ...user, position: message.position }
                  : user
              );
              const userExists = prevUsers.some(
                (user) => user.id === message.userId
              );
              if (!userExists) {
                updatedUsers.push({
                  id: message.userId,
                  position: message.position,
                });
              }
              return updatedUsers;
            });
          }
          break;

        case "chat":
          setLatestMessage(`${message.userId}: ${message.message}`);
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, [userId]);

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

    // Send move to server
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "move",
          position: position,
        })
      );
    }
  }, [position, socket]);

  // Handle keyboard movement
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
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

  // Send chat message
  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "chat",
          message: userMsg,
        })
      );
      setUserMsg("");
    }
  };

  if (!socket) {
    return <div>Connecting to WebSocket server...</div>;
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
        {/* Grid background */}
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

        {/* Main player avatar */}
        <div
          className="absolute w-12 h-12 bg-blue-500 rounded-full flex justify-center items-center"
          style={{
            left: position.x - 24,
            top: position.y - 24,
            transition: "all 0.1s linear",
          }}
        >
          {userId}
        </div>

        {/* Other connected users */}
        {otherUsers.map((user) => (
          <div
            key={user.id}
            className="absolute w-12 h-12 bg-red-500 rounded-full flex justify-center items-center"
            style={{
              left: user.position.x - 24,
              top: user.position.y - 24,
              transition: "all 0.1s linear",
            }}
          >
            {user.id}
          </div>
        ))}
      </div>

      {/* UI overlays */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
        <div>Your ID: {userId}</div>
        <div>X: {Math.round(position.x)}</div>
        <div>Y: {Math.round(position.y)}</div>
      </div>

      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow">
        <div>Latest message: By userId: {latestMessage}</div>
      </div>

      <div className="absolute top-16 right-4 bg-white p-2 rounded shadow">
        <input
          value={userMsg}
          onChange={(e) => setUserMsg(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default VirtualSpace;
