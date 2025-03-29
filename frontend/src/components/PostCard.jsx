import React, { useEffect, useState } from 'react';
import { BsThreeDotsVertical, BsChatFill } from "react-icons/bs";
import { IoHeartSharp, IoHeartOutline } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
import { UserData } from '../context/UserContext';
import { PostData } from '../context/PostContext';
import { format } from "date-fns";
import { Link } from 'react-router-dom';
import SimpleModal from './SimpleModal';
import { LoadingAnimation } from './Loading';
import toast from "react-hot-toast";
import axios from "axios";
import { SocketData } from "../context/SocketContext";
const PostCard = ({ type, value }) => {
  const [isLike, setIsLike] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { user } = UserData();
  const { likePost, addComment, deletePost, loading, fetchPosts } = PostData();
  const formatDate = format(new Date(value.createdAt), "MMMM do");
  const [showModal, setShowModal] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [caption, setCaption] = useState(value.caption || "");
  const [captionLoading, setCaptionLoading] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setIsLike(value.likes.includes(user._id));
  }, [value.likes, user._id]);

  const likeHandler = () => {
    setIsLike(!isLike);
    likePost(value._id);
  };

  const addCommentHandler = (e) => {
    e.preventDefault();
    addComment(value._id, comment, setComment, setShowComments);
  };

  const closeModal = () => setShowModal(false);

  const deleteHandler = () => deletePost(value._id);

  const editHandler = () => {
    setShowModal(false);
    setShowInput(true);
  };

  const updateCaption = async () => {
    setCaptionLoading(true);
    try {
      const { data } = await axios.put("/api/post/" + value._id, { caption });
      toast.success(data.message);
      fetchPosts();
      setShowInput(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update caption");
    } finally {
      setCaptionLoading(false);
    }
  };
  
  const { onlineUsers } = SocketData();
  return (
    <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <Link 
          to={`/user/${value.owner._id}`}
          className="flex items-center space-x-3"
        >
          <img 
            src={value.owner.profilepic.url} 
            alt={value.owner.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          
          <div>
            <p className="font-semibold text-gray-800">{value.owner.name}</p>
            <p className="text-xs text-gray-500">{formatDate}</p>
          </div>
        </Link>
        
        {value.owner._id === user._id && (
          <button 
            onClick={() => setShowModal(true)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <BsThreeDotsVertical size={18} />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="p-4">
        {showInput ? (
          <div className="flex items-center gap-2 mb-4">
            <input
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Edit caption"
            />
            <button
              onClick={updateCaption}
              disabled={captionLoading}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-70"
            >
              {captionLoading ? <LoadingAnimation size={16} /> : "Save"}
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="mb-4 text-gray-800">{value.caption}</p>
        )}

        <div className="mb-4">
          {type === "post" ? (
            <img 
              src={value.post.url} 
              alt="Post" 
              className="w-full h-auto rounded-md object-cover"
            />
          ) : (
            <video 
        src={value.post.url}
        autoPlay
        loop
      
        playsInline
        controls
        className="w-full rounded-md max-h-[600px] object-contain bg-black"
      />
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between border-b pb-3">
          <button 
            onClick={likeHandler}
            className="flex items-center space-x-1 text-gray-700 hover:text-red-500"
          >
            {isLike ? (
              <IoHeartSharp className="text-red-500 text-xl" />
            ) : (
              <IoHeartOutline className="text-xl" />
            )}
            <span>{value.likes.length} likes</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-700 hover:text-blue-500"
          >
            <BsChatFill />
            <span>{value.comments.length} comments</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 space-y-3">
            <form onSubmit={addCommentHandler} className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button 
                type="submit"
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Post
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-3">
              {value.comments.length > 0 ? (
                value.comments.map((comment) => (
                  <Comment 
                    key={comment._id}
                    value={comment}
                    user={user}
                    owner={value.owner._id}
                    id={value._id}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 py-2">No comments yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit/Delete Modal */}
      <SimpleModal isOpen={showModal} onClose={closeModal}>
        <div className="space-y-2 p-4">
          {value.owner._id === user._id && (
            <>
              <button
                onClick={editHandler}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                <MdEdit /> Edit
              </button>
              <button
                onClick={deleteHandler}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-md"
              >
                {loading ? <LoadingAnimation size={16} /> : <MdDelete />} Delete
              </button>
            </>
          )}
        </div>
      </SimpleModal>
    </div>
  );
};

const Comment = ({ value, user, owner, id }) => {
  const { deleteComment } = PostData();

  return (
    <div className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
      <Link to={`/user/${value.user._id}`}>
        <img
          src={value.user.profilepic.url}
          className="w-8 h-8 rounded-full object-cover"
          alt=""
        />
      </Link>
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/user/${value.user._id}`}>
              <p className="font-semibold text-sm">{value.user.name}</p>
            </Link>
            <p className="text-gray-700 text-sm">{value.comment}</p>
          </div>
          
          {(owner === user._id || value.user._id === user._id) && (
            <button 
              onClick={() => deleteComment(id, value._id)}
              className="text-gray-400 hover:text-red-500 p-1"
            >
              <MdDelete size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;