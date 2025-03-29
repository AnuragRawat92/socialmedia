import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PostData } from "../context/PostContext";
import PostCard from "../components/PostCard";
import { FaArrowDownLong, FaArrowUp, FaUserCheck, FaUserPlus } from "react-icons/fa6";
import { Loading } from "../components/Loading";
import { UserData } from "../context/UserContext";
import Modal from "../components/Modal";
import { SocketData } from "../context/SocketContext";
import axios from "axios";
import toast from "react-hot-toast";

// Configure axios instance directly in the component
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

const UserAccount = ({ user: loggedInUser }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { posts, reels } = PostData();
  const { followUser } = UserData();
  const { onlineUsers } = SocketData();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("post");
  const [index, setIndex] = useState(0);
  const [followed, setFollowed] = useState(false);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [followingsData, setFollowingsData] = useState([]);

  // Fetch user data
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/user/${id}`);
      setUser(data);
      checkIfFollowed(data);
    } catch (error) {
      console.error("User fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Check if current user follows this user
  const checkIfFollowed = useCallback((userData) => {
    if (userData?.followers?.includes(loggedInUser?._id)) {
      setFollowed(true);
    } else {
      setFollowed(false);
    }
  }, [loggedInUser?._id]);

  // Fetch follow data
  const fetchFollowData = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      const { data } = await api.get(`/api/user/followdata/${user._id}`);
      setFollowersData(data.followers || []);
      setFollowingsData(data.followings || []);
    } catch (error) {
      console.error("Follow data error:", error);
      toast.error("Failed to load follow data");
    }
  }, [user?._id]);

  // Filter posts and reels
  const myPosts = posts?.filter((post) => post?.owner?._id === user?._id) || [];
  const myReels = reels?.filter((reel) => reel?.owner?._id === user?._id) || [];

  // Reel navigation
  const prevReel = () => index > 0 && setIndex(index - 1);
  const nextReel = () => index < myReels.length - 1 && setIndex(index + 1);

  // Follow handler
  const handleFollow = async () => {
    try {
      await followUser(user._id);
      setFollowed(!followed);
      await fetchUser(); // Refresh user data
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update follow status");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?._id) {
      fetchFollowData();
    }
  }, [user?._id, fetchFollowData]);

  if (loading) return <Loading />;
  if (!user) return <div className="text-center py-10">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* User Profile Section */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 mx-auto md:mx-0 relative">
              <img
                src={user.profilepic?.url || "/default-avatar.jpg"}
                alt={user.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-md"
                loading="lazy"
              />
              {onlineUsers.includes(user._id) && (
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {user.name}
                  </h1>
                  <p className="text-gray-600 mt-1">{user.email}</p>
                  {user.gender && (
                    <p className="text-gray-500 text-sm mt-1 capitalize">
                      {user.gender}
                    </p>
                  )}
                </div>
                
                {user._id !== loggedInUser?._id && (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                      followed 
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                    aria-label={followed ? "Unfollow user" : "Follow user"}
                  >
                    {followed ? (
                      <>
                        <FaUserCheck /> Unfollow
                      </>
                    ) : (
                      <>
                        <FaUserPlus /> Follow
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="flex gap-4 mt-4">
                <button 
                  onClick={() => setShow(true)}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  aria-label="View followers"
                >
                  <span className="font-semibold">{user.followers?.length || 0}</span> followers
                </button>
                <button 
                  onClick={() => setShow1(true)}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  aria-label="View following"
                >
                  <span className="font-semibold">{user.followings?.length || 0}</span> following
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Type Toggle */}
        <div className="flex justify-center mt-6">
          <div className="inline-flex bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setType("post")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                type === "post" 
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="View posts"
            >
              Posts
            </button>
            <button
              onClick={() => setType("reel")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                type === "reel" 
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="View reels"
            >
              Reels
            </button>
          </div>
        </div>

        {/* Content Display */}
        <div className="mt-6">
          {type === "post" ? (
            <div className="space-y-4">
              {myPosts.length > 0 ? (
                myPosts.map((post) => (
                  <PostCard type="post" value={post} key={post._id} />
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">No posts yet</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {myReels.length > 0 ? (
                <>
                  <div className="relative w-full max-w-md">
                    <PostCard
                      type="reel"
                      value={myReels[index]}
                      key={myReels[index]._id}
                    />
                    {myReels.length > 1 && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
                        {index > 0 && (
                          <button
                            onClick={prevReel}
                            className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                            aria-label="Previous reel"
                          >
                            <FaArrowUp className="text-gray-700" />
                          </button>
                        )}
                        {index < myReels.length - 1 && (
                          <button
                            onClick={nextReel}
                            className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                            aria-label="Next reel"
                          >
                            <FaArrowDownLong className="text-gray-700" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {index + 1} of {myReels.length}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm w-full">
                  <p className="text-gray-500">No reels yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {show && (
        <Modal
          value={followersData}
          title="Followers"
          setShow={setShow}
        />
      )}
      {show1 && (
        <Modal
          value={followingsData}
          title="Following"
          setShow={setShow1}
        />
      )}
    </div>
  );
};

export default UserAccount;
