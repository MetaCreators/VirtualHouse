import avatar2 from "../../assets/avatar2.jpeg";

// Define the prop type explicitly
interface OtherUserProps {
  user: {
    id: string;
    position: {
      x: number;
      y: number;
    };
  };
}

function OtherUser({ user }: OtherUserProps) {
  return (
    <div
      key={user.id}
      className="absolute w-12 h-12 flex justify-center items-center"
      style={{
        left: user.position.x - 24,
        top: user.position.y - 24,
        transition: "all 0.1s linear",
      }}
    >
      <img src={avatar2} alt="User avatar" />
    </div>
  );
}

export default OtherUser;
