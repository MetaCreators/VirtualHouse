/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import CurrentUser from "@/components/UserAvatar/CurrentUser";
import OtherUser from "@/components/UserAvatar/OtherUser";
import { handleKeyPress } from "@/lib/helperFns/handleKeyPress";
import UserDetails from "@/components/UserDetails/UserDetails";
import GroupChat from "@/components/Chat/GroupChat/GroupChat";

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

    const handleOpen = () => {
      console.log("Connected to Server");
      setSocket(socket);
    };

    const handleMessage = (event: MessageEvent) => {
      try {
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

          case "proximity":
            console.log("Proximity message received:", message);
            if (message.currentUserId === userId && message.nearbyUsers) {
              const nearbyUsers = message.nearbyUsers;
              if (nearbyUsers.length > 0) {
                setProximityMessage(
                  `User/s ${nearbyUsers.join(", ")} is near you`
                );
              }
            } else {
              setProximityMessage(null);
            }
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    const handleError = (error: Event) => {
      console.error("WebSocket error:", error);
    };

    const handleClose = () => {
      console.log("WebSocket connection closed");
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("message", handleMessage);
    socket.addEventListener("error", handleError);
    socket.addEventListener("close", handleClose);

    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("message", handleMessage);
      socket.removeEventListener("error", handleError);
      socket.removeEventListener("close", handleClose);
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
  }, [position, socket, otherUsers, userId]);

  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const SPEED = 5;

  const onKeyPress = useCallback((e: KeyboardEvent) => {
    handleKeyPress(e, setPosition, SPEED);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => {
      window.removeEventListener("keydown", onKeyPress);
    };
  }, [onKeyPress]);

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

        <CurrentUser x={position.x} y={position.y} />
        {otherUsers.map((user) => (
          <OtherUser user={user} />
        ))}
      </div>
      <UserDetails userId={userId} position={position} />

      <GroupChat
        latestMessage={latestMessage}
        userMsg={userMsg}
        setUserMsg={setUserMsg}
        sendMessage={sendMessage}
      />

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
