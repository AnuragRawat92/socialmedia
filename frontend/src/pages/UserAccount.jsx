import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PostData } from "../context/PostContext";
import PostCard from "../components/PostCard";
import { FaArrowDownLong, FaArrowUp, FaUserCheck, FaUserPlus } from "react-icons/fa6";
import axios from "axios";
import { Loading } from "../components/Loading";
import { UserData } from "../context/UserContext";
import Modal from "../components/Modal";
import { SocketData } from "../context/SocketContext";

const UserAccount = ({ user: loggedInUser }) => {
  const navigate = useNavigate();
  const { posts, reels } = PostData();
  const { followUser } = UserData();
  const { onlineUsers } = SocketData();
  const params = useParams();

  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("post");
  const [index, setIndex] = useState(0);
  const [followed, setFollowed] = useState(false);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [followingsData, setFollowingsData] = useState([]);

  // Fetch user data
  async function fetchUser() {
    try {
      const { data } = await axios.get("/api/user/" + params.id);
      setUser(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  // Fetch follow data
  async function followData() {
    try {
      const { data } = await axios.get("/api/user/followdata/" + user._id);
      setFollowersData(data.followers);
      setFollowingsData(data.followings);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  useEffect(() => {
    followData();
  }, [user]);

  useEffect(() => {
    if (user.followers && user.followers.includes(loggedInUser._id)) {
      setFollowed(true);
    }
  }, [user]);

  // Filter posts and reels
  const myPosts = posts?.filter((post) => post.owner._id === user._id) || [];
  const myReels = reels?.filter((reel) => reel.owner._id === user._id) || [];

  // Reel navigation
  const prevReel = () => index > 0 && setIndex(index - 1);
  const nextReel = () => index < myReels.length - 1 && setIndex(index + 1);

  // Follow handler
  const followHandler = () => {
    setFollowed(!followed);
    followUser(user._id, fetchUser);
  };

  if (loading) return <Loading />;
  if (!user) return <div className="text-center py-10">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* User Profile Section */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={user.profilepic.url}
                alt={user.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-md"
              />
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  {user.name}
                  {onlineUsers.includes(user._id) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  )}
                </h1>
                
                {user._id !== loggedInUser._id && (
                  <button
                    onClick={followHandler}
                    className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                      followed 
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
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
              
              <p className="text-gray-600 mt-1">{user.email}</p>
              {user.gender && (
                <p className="text-gray-500 text-sm mt-1 capitalize">{user.gender}</p>
              )}
              
              <div className="flex gap-4 mt-4">
                <button 
                  onClick={() => setShow(true)}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className="font-semibold">{user.followers.length}</span> followers
                </button>
                <button 
                  onClick={() => setShow1(true)}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className="font-semibold">{user.followings.length}</span> following
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
                          >
                            <FaArrowUp className="text-gray-700" />
                          </button>
                        )}
                        {index < myReels.length - 1 && (
                          <button
                            onClick={nextReel}
                            className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
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