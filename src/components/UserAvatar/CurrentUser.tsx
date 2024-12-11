import { CurrUserPosType } from "@/types/UserPositionType";
import avatar1 from "../../assets/avatar1.jpeg";

const CurrentUser: React.FC<CurrUserPosType> = ({ x, y }) => {
  return (
    <div
      className="absolute w-12 h-12 flex justify-center items-center"
      style={{
        left: x - 24,
        top: y - 24,
        transition: "all 0.1s linear",
      }}
    >
      <img src={avatar1} />
    </div>
  );
};

export default CurrentUser;
