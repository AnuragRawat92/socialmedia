import React, { useEffect, useState, useCallback } from "react";
import { ChatData } from "../context/ChatContext";
import { FaSearch, FaTimes } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import Chat from "../components/chat/Chat";
import MessageContainer from "../components/chat/MessageContainer";
import { SocketData } from "../context/SocketContext";
import { LoadingAnimation } from "../components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

// Configure axios instance directly in the component file
const api = axios.create({
  baseURL: "https://socialmedia-s1pl.onrender.com",
  withCredentials: true,
});

// Add request interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      toast.error("Session expired. Please login again.");
    }
    return Promise.reject(error);
  }
);

const ChatPage = ({ user }) => {
  const { createChat, selectedChat, setSelectedChat, chats, setChats } = ChatData();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const { onlineUsers } = SocketData();

  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/user/all?search=${query}`);
      setUsers(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const getAllChats = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/messages/chats");
      setChats(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load chats");
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  }, [setChats]);

  const handleResize = useCallback(() => {
    setMobileView(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (query.trim() !== "") {
      const timer = setTimeout(() => fetchAllUsers(), 500);
      return () => clearTimeout(timer);
    } else {
      setUsers([]);
    }
  }, [query, fetchAllUsers]);

  useEffect(() => {
    getAllChats();
  }, [getAllChats]);

  const createNewChat = useCallback(async (id) => {
    try {
      await createChat(id);
      setSearch(false);
      setQuery("");
      await getAllChats();
      if (mobileView) {
        setSelectedChat(chats.find(c => c.users.some(u => u._id === id)));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create chat");
    }
  }, [createChat, getAllChats, mobileView, chats, setSelectedChat]);

  const filteredChats = chats?.filter(chat => 
    chat.users.some(u => u._id !== user?._id)
  ) || [];

  return (
    <div className="w-full h-screen flex bg-gray-50">
      {/* Sidebar - Chat List */}
      <div className={`bg-white border-r border-gray-200 ${mobileView && selectedChat ? 'hidden' : 'w-full md:w-1/3 lg:w-1/4'}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
            <button
              onClick={() => setSearch(!search)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              aria-label={search ? "Close search" : "Search users"}
            >
              {search ? <FaTimes /> : <FaSearch />}
            </button>
          </div>

          {search && (
            <div className="mt-3 relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search users"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          )}
        </div>

        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <LoadingAnimation size={24} />
            </div>
          ) : search ? (
            <div className="divide-y divide-gray-100">
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => createNewChat(user._id)}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <img
                      src={user.profilepic?.url || "/default-avatar.jpg"}
                      className="w-10 h-10 rounded-full object-cover"
                      alt={user.name}
                      loading="lazy"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {onlineUsers.includes(user._id) ? (
                          <span className="text-green-500">Online</span>
                        ) : (
                          "Offline"
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-gray-500">
                  {query ? "No users found" : "Start typing to search"}
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => {
                  const otherUser = chat.users.find(u => u._id !== user?._id);
                  return (
                    <Chat
                      key={chat._id}
                      chat={chat}
                      setSelectedChat={setSelectedChat}
                      isOnline={onlineUsers.includes(otherUser?._id)}
                    />
                  );
                })
              ) : (
                <p className="p-4 text-center text-gray-500">
                  No conversations yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedChat ? (
        <div className={`flex-1 flex flex-col ${mobileView && selectedChat ? 'w-full' : ''}`}>
          {mobileView && (
            <button
              onClick={() => setSelectedChat(null)}
              className="p-3 md:hidden flex items-center text-gray-600 hover:text-gray-900"
              aria-label="Back to chat list"
            >
              <IoIosArrowBack className="mr-1" />
              Back
            </button>
          )}
          <MessageContainer selectedChat={selectedChat} setChats={setChats} />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center p-6 max-w-md">
            <div className="text-5xl mb-4">👋</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Hello {user?.name}!
            </h2>
            <p className="text-gray-600 mb-6">
              Select a chat to start your conversation
            </p>
            <button
              onClick={() => setSearch(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              New Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
