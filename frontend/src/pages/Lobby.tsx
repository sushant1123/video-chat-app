import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const [email, setEmail] = useState<string>("abc@test.com");
  const [room, setRoom] = useState<string>("1");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      socket?.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback((data) => {
    console.log("Data from BE", data);
    const { room } = data;
    navigate(`/room/${room}`);
  }, []);

  useEffect(() => {
    socket?.on("room:join", handleJoinRoom);

    return () => {
      socket?.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div>
      <h1>Lobby</h1>

      <form onSubmit={handleSubmitForm}>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <br />
        <div>
          <label htmlFor="room">Room Number</label>
          <input type="text" id="room" value={room} onChange={(e) => setRoom(e.target.value)} />
        </div>
        <br />

        <div>
          <button type="submit">Join</button>
        </div>
      </form>
    </div>
  );
};

export default Lobby;
