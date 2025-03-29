import { createContext, useContext, useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import { UserData } from "./UserContext";
import toast from "react-hot-toast";

const EndPoint = "https://socialmedia-s1pl.onrender.com";

const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const { user } = UserData();

  const setupSocket = useCallback(() => {
    if (!user?._id) {
      console.log("Socket not initialized - no user ID");
      return null;
    }

    const newSocket = io(EndPoint, {
      query: {
        userId: user._id,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on("connect", () => {
      setIsConnected(true);
      setConnectionStatus("connected");
      console.log("Socket connected:", newSocket.id);
      toast.success("Real-time connection established", { duration: 2000 });
    });

    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // The server explicitly disconnected, need to manually reconnect
        newSocket.connect();
      }
    });

    newSocket.on("connect_error", (error) => {
      setConnectionStatus("connection_error");
      console.error("Socket connection error:", error.message);
      toast.error("Connection error. Trying to reconnect...");
    });

    newSocket.on("reconnect", (attempt) => {
      setConnectionStatus("connected");
      console.log(`Reconnected after ${attempt} attempts`);
      toast.success("Reconnected successfully", { duration: 2000 });
    });

    newSocket.on("reconnect_attempt", (attempt) => {
      setConnectionStatus(`reconnecting (attempt ${attempt})`);
      console.log(`Reconnection attempt ${attempt}`);
    });

    newSocket.on("reconnect_error", (error) => {
      setConnectionStatus("reconnection_error");
      console.error("Reconnection error:", error.message);
    });

    newSocket.on("reconnect_failed", () => {
      setConnectionStatus("reconnection_failed");
      console.error("Reconnection failed");
      toast.error("Failed to reconnect. Please refresh the page.");
    });

    // Application-specific events
    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
      console.log("Online users updated:", users);
    });

    newSocket.on("newMessage", (message) => {
      console.log("New message received:", message);
      // You might want to use a state management solution here
      toast.success(`New message from ${message.sender.name}`, {
        duration: 3000,
      });
    });

    newSocket.on("notification", (notification) => {
      console.log("New notification:", notification);
      toast(notification.message, {
        icon: "🔔",
      });
    });

    return newSocket;
  }, [user?._id]);

  useEffect(() => {
    const newSocket = setupSocket();

    return () => {
      if (newSocket) {
        console.log("Cleaning up socket connection");
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("connect_error");
        newSocket.off("reconnect");
        newSocket.off("reconnect_attempt");
        newSocket.off("reconnect_error");
        newSocket.off("reconnect_failed");
        newSocket.off("getOnlineUsers");
        newSocket.off("newMessage");
        newSocket.off("notification");
        newSocket.disconnect();
      }
    };
  }, [setupSocket]);

  // Expose a function to manually reconnect
  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect();
    }
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isConnected,
        connectionStatus,
        reconnect,
        emitEvent: (event, data) => {
          if (socket && isConnected) {
            socket.emit(event, data);
          } else {
            console.error("Cannot emit - socket not connected");
            toast.error("Connection not ready. Please try again.");
          }
        },
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
