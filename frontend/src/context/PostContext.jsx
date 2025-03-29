import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Configure axios instance with base settings
const api = axios.create({
  baseURL: 'https://socialmedia-s1pl.onrender.com',
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
      // Optionally redirect to login page
    }
    return Promise.reject(error);
  }
);

const PostContext = createContext();

export const PostContextProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);

  async function fetchPosts() {
    setLoading(true);
    try {
      const { data } = await api.get('/api/post/all');
      setPosts(data.posts || []);
      setReels(data.reels || []);
    } catch (error) {
      console.error('Fetch posts error:', error);
      toast.error(error.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  async function addPost(formdata, setCaption, setFile, setFilePrev, type) {
    setAddLoading(true);
    try {
      const { data } = await api.post(`/api/post/new?type=${type}`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(data.message);
      await fetchPosts();
      setCaption('');
      setFile('');
      setFilePrev('');
    } catch (error) {
      console.error('Add post error:', error);
      toast.error(error.response?.data?.message || 'Failed to add post');
    } finally {
      setAddLoading(false);
    }
  }

  async function likePost(id) {
    try {
      const { data } = await api.post(`/api/post/like/${id}`);
      toast.success(data.message);
      await fetchPosts();
    } catch (error) {
      console.error('Like post error:', error);
      toast.error(error.response?.data?.message || 'Failed to like post');
    }
  }

  async function addComment(id, comment, setComment, setShow) {
    try {
      const { data } = await api.post(`/api/post/comment/${id}`, { comment });
      toast.success(data.message);
      await fetchPosts();
      setComment('');
      setShow(false);
    } catch (error) {
      console.error('Add comment error:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  }

  async function deletePost(id) {
    setLoading(true);
    try {
      const { data } = await api.delete(`/api/post/${id}`);
      toast.success(data.message);
      await fetchPosts();
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setLoading(false);
    }
  }

  async function deleteComment(id, commentId) {
    try {
      const { data } = await api.delete(
        `/api/post/comment/${id}?commentId=${commentId}`
      );
      toast.success(data.message);
      await fetchPosts();
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <PostContext.Provider
      value={{
        reels,
        posts,
        addPost,
        likePost,
        addComment,
        loading,
        addLoading,
        fetchPosts,
        deletePost,
        deleteComment,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePostData = () => useContext(PostContext);
