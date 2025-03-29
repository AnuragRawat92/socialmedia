import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserData } from "../context/UserContext";
import { PostData } from "../context/PostContext";
import PostCard from "../components/PostCard";
import {FaArrowDown, FaArrowUp, FaSignOutAlt, FaLock } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import Modal from "../components/Modal";
import axios from "axios";
import { Loading } from "../components/Loading";
import toast from "react-hot-toast";

const Account = ({ user }) => {
  const navigate = useNavigate();
  const { logoutUser, updateProfilePic, updateProfileName } = UserData();
  const { posts, reels, loading } = PostData();

  // State management
  const [type, setType] = useState("post");
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [followingsData, setFollowingsData] = useState([]);
  const [file, setFile] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [showUpdatePass, setShowUpdatePass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Filter posts and reels
  const myPosts = posts?.filter((post) => post.owner._id === user._id) || [];
  const myReels = reels?.filter((reel) => reel.owner._id === user._id) || [];

  // Handlers
  const logoutHandler = () => logoutUser(navigate);
  
  const prevReel = () => index > 0 && setIndex(index - 1);
  const nextReel = () => index < myReels.length - 1 && setIndex(index + 1);

  const changeFileHandler = (e) => setFile(e.target.files[0]);

  const changleImageHandler = () => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }
    const formdata = new FormData();
    formdata.append("file", file);
    updateProfilePic(user._id, formdata, setFile);
  };

  const UpdateName = () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    updateProfileName(user._id, name, setShowInput);
  };

  async function updatePassword(e) {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/user/" + user._id, {
        oldPassword,
        newPassword,
      });
      toast.success(data.message);
      setOldPassword("");
      setNewPassword("");
      setShowUpdatePass(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Password update failed");
    }
  }

  async function followData() {
    try {
      const { data } = await axios.get(`/api/user/followdata/${user._id}`);
      setFollowersData(data.followers);
      setFollowingsData(data.followings);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    followData();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* Profile Section */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Picture Section */}
            <div className="flex-shrink-0 mx-auto md:mx-0 relative group">
              <img
                src={user.profilepic.url}
                alt={user.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer text-white text-center p-2">
                  <input
                    type="file"
                    onChange={changeFileHandler}
                    className="hidden"
                    accept="image/*"
                  />
                  <span className="text-xs block">Change Photo</span>
                </label>
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {showInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Name"
                      required
                      autoFocus
                    />
                    <button
                      onClick={UpdateName}
                      className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowInput(false)}
                      className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {user.name}
                    <button 
                      onClick={() => setShowInput(true)}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <CiEdit size={20} />
                    </button>
                  </h1>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpdatePass(!showUpdatePass)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    <FaLock size={14} />
                    {showUpdatePass ? "Cancel" : "Password"}
                  </button>
                  <button
                    onClick={logoutHandler}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
                  >
                    <FaSignOutAlt size={14} />
                    Logout
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-gray-600">{user.email}</p>
                {user.gender && (
                  <p className="text-gray-500 text-sm capitalize">{user.gender}</p>
                )}
              </div>

              <div className="flex gap-6 mt-4">
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

              {file && (
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={changleImageHandler}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    Update Profile Picture
                  </button>
                  <button
                    onClick={() => setFile("")}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Update Form */}
        {showUpdatePass && (
          <div className="mt-6 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <IoSettingsOutline /> Update Password
            </h2>
            <form onSubmit={updatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Old Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>
        )}

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
                            <FaArrowDown className="text-gray-700" />
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

export default Account;