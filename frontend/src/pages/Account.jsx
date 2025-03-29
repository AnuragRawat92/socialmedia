import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserData } from "../context/UserContext";
import { PostData } from "../context/PostContext";
import PostCard from "../components/PostCard";
import { FaArrowDown, FaArrowUp, FaSignOutAlt, FaLock } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import Modal from "../components/Modal";
import { Loading } from "../components/Loading";
import toast from "react-hot-toast";
import axios from "axios";

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

const Account = ({ user }) => {
  const navigate = useNavigate();
  const { logoutUser } = UserData();
  const { posts, reels, loading } = PostData();

  // State management
  const [type, setType] = useState("post");
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [followingsData, setFollowingsData] = useState([]);
  const [file, setFile] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [showUpdatePass, setShowUpdatePass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter posts and reels
  const myPosts = posts?.filter((post) => post?.owner?._id === user?._id) || [];
  const myReels = reels?.filter((reel) => reel?.owner?._id === user?._id) || [];

  // Handlers
  const logoutHandler = async () => {
    try {
      await api.post("/api/auth/logout");
      localStorage.removeItem("token");
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to logout");
    }
  };

  const updateProfilePic = async (formdata) => {
    try {
      const { data } = await api.put(`/api/user/${user._id}`, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateProfileName = async (name) => {
    try {
      const { data } = await api.put(`/api/user/${user._id}`, { name });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const changeImageHandler = async () => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setIsUpdating(true);
      const formdata = new FormData();
      formdata.append("file", file);
      await updateProfilePic(formdata);
      setFile(null);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile picture");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateName = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setIsUpdating(true);
      await updateProfileName(name);
      setShowInput(false);
      toast.success("Name updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update name");
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Both fields are required");
      return;
    }

    try {
      setIsUpdating(true);
      const { data } = await api.put(`/api/user/${user._id}/password`, {
        oldPassword,
        newPassword,
      });
      toast.success(data.message);
      setOldPassword("");
      setNewPassword("");
      setShowUpdatePass(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Password update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchFollowData = async () => {
    try {
      const { data } = await api.get(`/api/user/followdata/${user._id}`);
      setFollowersData(data.followers || []);
      setFollowingsData(data.followings || []);
    } catch (error) {
      toast.error("Failed to load follow data");
      console.error("Follow data error:", error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchFollowData();
    }
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* Profile Section */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ... (rest of your JSX remains exactly the same) ... */}
      </div>
    </div>
  );
};

export default Account;
