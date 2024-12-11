/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import avatar1 from "../assets/avatar1.jpeg";
import avatar2 from "../assets/avatar2.jpeg";
import checkProximity from "@/lib/helperFns/checkProximity";

const VirtualSpace = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUsers, setOtherUsers] = useState<
    Array<{ id: string; position: { x: number; y: number } }>
  >([]);
  const [latestMessage, setLatestMessage] = useState("");
  const [userMsg, setUserMsg] = useState("");
  const [proximityMessage, setProximityMessage] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_WS_SERVER_URL);

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

  useEffect(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    setCameraOffset({
      x: -(position.x - viewportWidth / 2),
      y: -(position.y - viewportHeight / 2),
    });

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "move",
          position: position,
        })
      );
    }

    const proximity = checkProximity(otherUsers, position);
    if (proximity) {
      setProximityMessage(`User ${proximity} is near you`);
    } else {
      setProximityMessage(null);
    }
  }, [position, socket, otherUsers]);

  // const checkProximity = () => {
  //   let nearUser = null;

  //   for (const user of otherUsers) {
  //     const distance = Math.sqrt(
  //       Math.pow(user.position.x - position.x, 2) +
  //         Math.pow(user.position.y - position.y, 2)
  //     );

  //     if (distance < PROXIMITY_THRESHOLD) {
  //       nearUser = user.id;
  //       break;
  //     }
  //   }

  //   if (nearUser) {
  //     setProximityMessage(`User ${nearUser} is near you`);
  //   } else {
  //     setProximityMessage(null);
  //   }
  // };

  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const SPEED = 5;

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

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

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
      <div
        className="absolute"
        style={{
          transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`,
          transition: "transform 0.1s linear",
        }}
      >
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
        <div
          className="absolute w-12 h-12 flex justify-center items-center"
          style={{
            left: position.x - 24,
            top: position.y - 24,
            transition: "all 0.1s linear",
          }}
        >
          <img src={avatar1} />
        </div>
        {otherUsers.map((user) => (
          <div
            key={user.id}
            className="absolute w-12 h-12 flex justify-center items-center"
            style={{
              left: user.position.x - 24,
              top: user.position.y - 24,
              transition: "all 0.1s linear",
            }}
          >
            <img src={avatar2} />
          </div>
        ))}
      </div>
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
        <div>Your ID: {userId}</div>
        <div>X: {Math.round(position.x)}</div>
        <div>Y: {Math.round(position.y)}</div>
      </div>
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow">
        <div>Latest message: {latestMessage}</div>
      </div>
      <div className="absolute top-16 right-4 bg-white p-2 rounded shadow">
        <input
          value={userMsg}
          onChange={(e) => setUserMsg(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      {proximityMessage && (
        <div className="absolute top-28 right-4 bg-red-100 text-red-600 p-2 rounded shadow">
          {proximityMessage}
        </div>
      )}
    </div>
  );
};

export default VirtualSpace;
