import { useSocket } from "../context/SocketProvider";
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { peerService } from "../services/peer";

const Room = () => {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState<String | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const handleUserJoined = useCallback(({ email, id }: { email: string; id: string }) => {
    console.log("user:joined", email);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const offer = await peerService.getOffer();

    socket?.emit("call:user", { to: remoteSocketId, offer });

    setMyStream(stream);

    // if we have video object, we can play the video without any external package
    // const video = document.getElementById("video") as HTMLVideoElement;

    // video.srcObject = stream;
    // video.play();
  }, [remoteSocketId, socket]);

  const handleIncominCall = useCallback(
    async ({ from, offer }: { from: string; offer: any }) => {
      console.log("incoming call", from, offer);
      setRemoteSocketId(from);

      const userStream = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setMyStream(userStream);

      const answer = await peerService.getAnswer(offer);
      socket?.emit("call:accepted", { to: from, answer });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream?.getTracks()) {
      peerService.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, answer }: { from: string; answer: any }) => {
      peerService.setLocalDescription(answer);
      console.log("Call Accepted!");

      sendStreams();
    },
    [sendStreams]
  );

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peerService.getOffer();
    socket?.emit("peer:negotiation:needed", { offer, to: remoteSocketId });
  }, [socket, remoteSocketId]);

  const handleIncomingNegotiation = useCallback(
    async ({ from, offer }) => {
      const answer = await peerService.getAnswer(offer);
      socket?.emit("peer:negotiation:done", { answer, to: from });
    },
    [socket]
  );

  const handleFinalNegotiation = useCallback(
    async ({ from, answer }: { from: string; answer: any }) => {
      await peerService.setLocalDescription(answer);
    },
    [socket]
  );

  // socket events useEffect
  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incoming:call", handleIncominCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:negotiation:needed", handleIncomingNegotiation);
    socket?.on("peer:negotiation:final", handleFinalNegotiation);

    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incoming:call", handleIncominCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:negotiation:needed", handleIncomingNegotiation);
      socket?.off("peer:negotiation:final", handleFinalNegotiation);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncominCall,
    handleCallAccepted,
    handleIncomingNegotiation,
    handleFinalNegotiation,
  ]);

  // negotiation needed useEffect
  useEffect(() => {
    peerService.peer.addEventListener("negotiationneeded", handleNegotiationNeeded);

    return () => {
      peerService.peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    };
  }, [handleNegotiationNeeded]);

  // peer events useEffect
  useEffect(() => {
    peerService?.peer?.addEventListener("track", async (trackEvent) => {
      const remoteStream = trackEvent.streams;
      console.log("got track", remoteStream);
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  return (
    <div>
      <h1>Room</h1>
      {remoteSocketId ? <h4>{remoteSocketId} joined the room.</h4> : "No one is in the room."}

      {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
      {myStream && <button onClick={sendStreams}>Send Stream</button>}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {myStream && (
          <div>
            <h1>My Stream</h1>
            <ReactPlayer url={myStream} height="100px" width="200px" playing />
          </div>
        )}

        {remoteStream && (
          <div>
            <h1>Remote Stream</h1>
            <ReactPlayer url={remoteStream} height="100px" width="200px" playing />
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
