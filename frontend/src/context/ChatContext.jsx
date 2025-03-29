import axios from "axios";
import { useContext, useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";

// Create configured axios instance
const api = axios.create({
  baseURL: "https://socialmedia-s1pl.onrender.com",
  withCredentials: true,
});

// Add request interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      toast.error('Session expired. Please login again.');
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);

const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);

  async function createChat(id) {
    setLoading(true);
    try {
      const { data } = await api.post("/api/messages", {
        receiverId: id,
        message: "hii" // Consider making this customizable
      });
      setChats(prev => [...prev, data.chat]); // Update chats state
      setSelectedChat(data.chat); // Auto-select the new chat
      toast.success("Chat created successfully");
      return data.chat; // Return the chat for further processing
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create chat");
      console.error("Chat creation error:", error);
      throw error; // Re-throw for component-level handling
    } finally {
      setLoading(false);
    }
  }

  async function fetchChats() {
    try {
      const { data } = await api.get("/api/messages/chats");
      setChats(data.chats);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load chats");
      console.error("Fetch chats error:", error);
    }
  }

  return (
    <ChatContext.Provider 
      value={{
        createChat,
        fetchChats,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        loading
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatData = () => useContext(ChatContext);
