import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/types/ChatTypes";
import { ChevronRightCircle, Lock } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
//import avatar1 from "../../assets/avatar1.jpeg";
import avatar1 from "../../../assets/avatar1.jpeg";
interface GroupChatProps {
  latestMessage: ChatMessage[] | [];
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
    <div className="flex">
      <div className="absolute top-44 right-4 bg-white p-2 rounded shadow w-64">
        <div className="border py-1 px-3 bg-indigo-600 rounded-xl font-semibold text-white text-center shadow">
          Messages
        </div>
        <div>
          {latestMessage.map((item) => (
            <div key={item.userId} className="flex items-center mt-2">
              <div className="flex justify-center items-center">
                <img src={avatar1} className="rounded-lg h-8 w-9" />
              </div>
              <div className="w-full pl-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-500">
                    user {item.userId}
                  </div>
                  <div className="text-xs font-light text-slate-500">
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>
                <div>{item.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-16 right-4 bg-white p-2 rounded-lg shadow flex justify-center items-center space-x-2 pr-2">
        <div className="space-y-1">
          <div className="flex w-full justify-evenly space-x-1">
            <Button className="w-1/2 bg-slate-200 text-slate-600">All</Button>
            <Button
              className="w-1/2 bg-white text-slate-400 border-none shadow-none"
              disabled={true}
            >
              <Lock />
              <div>Private</div>
            </Button>
          </div>

          <input
            value={userMsg}
            onChange={(e) => setUserMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && userMsg.trim()) {
                sendMessage();
              }
            }}
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
    </div>
  );
};

export default GroupChat;
