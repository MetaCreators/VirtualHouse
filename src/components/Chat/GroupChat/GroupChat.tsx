import { Dispatch, SetStateAction } from "react";

interface GroupChatProps {
  latestMessage: string;
  userMsg: string;
  setUserMsg: Dispatch<SetStateAction<string>>;
  sendMessage: () => void;
}

const GroupChat: React.FC<GroupChatProps> = ({
  latestMessage,
  userMsg,
  setUserMsg,
  sendMessage,
}) => {
  return (
    <div>
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
    </div>
  );
};

export default GroupChat;
