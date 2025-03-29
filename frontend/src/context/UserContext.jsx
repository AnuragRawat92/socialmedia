import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Configure axios instance
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
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function registerUser(formdata) {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", formdata);
      localStorage.setItem("token", data.token); // Store token
      toast.success(data.message);
      setIsAuth(true);
      setUser(data.user);
      navigate("/");
      return data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function loginUser(email, password) {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token); // Store token
      toast.success(data.message);
      setIsAuth(true);
      setUser(data.user);
      navigate("/");
      return data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function fetchUser() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/user/me");
      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
      setUser(null);
      console.error("Fetch user error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function logoutUser() {
    try {
      const { data } = await api.post("/api/auth/logout");
      localStorage.removeItem("token"); // Remove token
      toast.success(data.message);
      setUser(null);
      setIsAuth(false);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  }

  async function followUser(id) {
    try {
      const { data } = await api.post(`/api/user/follow/${id}`);
      toast.success(data.message);
      await fetchUser(); // Refresh user data
    } catch (error) {
      toast.error(error.response?.data?.message || "Follow action failed");
    }
  }

  async function updateProfilePic(formdata) {
    try {
      const { data } = await api.put(`/api/user/${user?._id}`, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(data.message);
      await fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    }
  }

  async function updateProfileName(name) {
    try {
      const { data } = await api.put(`/api/user/${user?._id}`, { name });
      toast.success(data.message);
      await fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || "Name update failed");
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isAuth,
        loading,
        registerUser,
        loginUser,
        logoutUser,
        fetchUser,
        followUser,
        updateProfilePic,
        updateProfileName,
      }}
    >
      {children}
      <Toaster position="top-right" />
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
