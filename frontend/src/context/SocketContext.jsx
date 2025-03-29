import { createContext, useContext, useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import { UserData } from "./UserContext";

const EndPoint = "http://localhost:7000";

const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = UserData();

  const setupSocket = useCallback(() => {
    if (!user?._id) return;

    const newSocket = io(EndPoint, {
      query: {
        userId: user._id,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    newSocket.on("getOnlineUser", (users) => {
      setOnlineUsers(users);
    });

    // Add more event listeners as needed
    newSocket.on("newMessage", (message) => {
      // Handle new messages
      console.log("New message received:", message);
      // You might want to add this to a state or context
    });

    return newSocket;
  }, [user?._id]);

  useEffect(() => {
    const newSocket = setupSocket();

    return () => {
      if (newSocket) {
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("getOnlineUser");
        newSocket.off("newMessage");
        newSocket.close();
      }
    };
  }, [setupSocket]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const SocketData = () => useContext(SocketContext);