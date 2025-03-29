import React, { useEffect, useState } from "react";
import { ChatData } from "../context/ChatContext";
import axios from "axios";
import { FaSearch, FaTimes } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import Chat from "../components/chat/Chat";
import MessageContainer from "../components/chat/MessageContainer";
import { SocketData } from "../context/SocketContext";
import { LoadingAnimation } from "../components/Loading";

const ChatPage = ({ user }) => {
  const { createChat, selectedChat, setSelectedChat, chats, setChats } =
    ChatData();

  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  async function fetchAllUsers() {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/user/all?search=" + query);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  const getAllChats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/messages/chats");
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (query.trim() !== "") {
      const timer = setTimeout(() => fetchAllUsers(), 500);
      return () => clearTimeout(timer);
    } else {
      setUsers([]);
    }
  }, [query]);

  useEffect(() => {
    getAllChats();
  }, []);

  async function createNewChat(id) {
    await createChat(id);
    setSearch(false);
    setQuery("");
    getAllChats();
    if (mobileView) setSelectedChat(chats.find(c => c.users.some(u => u._id === id)));
  }

  const { onlineUsers } = SocketData();

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
                      src={user.profilepic.url}
                      className="w-10 h-10 rounded-full object-cover"
                      alt={user.name}
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
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <Chat
                    key={chat._id}
                    chat={chat}
                    setSelectedChat={setSelectedChat}
                    isOnline={onlineUsers.includes(chat.users[0]._id)}
                  />
                ))
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
              Hello {user.name}!
            </h2>
            <p className="text-gray-600 mb-6">
              Select a chat to start your conversation
            </p>
            <button
              onClick={() => setSearch(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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