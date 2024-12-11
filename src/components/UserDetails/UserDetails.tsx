import { CurrUserPosType } from "@/types/UserPositionType";
interface UserDetailsProps {
  userId: string | null;
  position: CurrUserPosType;
}

const UserDetails: React.FC<UserDetailsProps> = ({ userId, position }) => {
  return (
    <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
      <div>Your ID: {userId}</div>
      <div>X: {Math.round(position.x)}</div>
      <div>Y: {Math.round(position.y)}</div>
    </div>
  );
};

export default UserDetails;
