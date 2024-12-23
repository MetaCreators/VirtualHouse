import { Button } from "@/components/ui/button";
import { ChevronRightCircle } from "lucide-react";
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
      <div className="absolute top-16 right-4 bg-white p-2 rounded shadow flex justify-center items-center space-x-2 pr-2">
        <input
          value={userMsg}
          onChange={(e) => setUserMsg(e.target.value)}
          placeholder="Type a message"
          className="border rounded-md placeholder:p-2 p-1"
        />

        {!userMsg ? (
          <Button
            onClick={sendMessage}
            className="bg-inherit shadow-none hover:bg-inherit"
            disabled={true}
          >
            <ChevronRightCircle className="text-black" />
          </Button>
        ) : (
          <Button
            onClick={sendMessage}
            className="bg-inherit shadow-none hover:bg-inherit"
          >
            <ChevronRightCircle className="text-black" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
