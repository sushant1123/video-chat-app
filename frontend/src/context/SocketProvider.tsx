import { ReactNode, createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);

  return socket;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socket = io("localhost:3001");

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
