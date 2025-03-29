import React, { useState } from 'react';
import { PostData } from '../context/PostContext';
import { LoadingAnimation } from './Loading';

const AddPost = ({ type }) => {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState("");
  const [filePrev, setFilePrev] = useState("");
  const { addPost, addLoading } = PostData();

  const fileHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFilePrev(reader.result);
      setFile(file);
    };
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("caption", caption);
    formdata.append("file", file);
    addPost(formdata, setCaption, setFile, setFilePrev, type);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <form onSubmit={submitHandler} className="space-y-4">
        <div>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {type === "post" ? "Upload Image" : "Upload Video"}
          </label>
          <input
            type="file"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            accept={type === "post" ? "image/*" : "video/*"}
            onChange={fileHandler}
            required
          />
        </div>

        {filePrev && (
          <div className="mt-2">
            {type === "post" ? (
              <img 
                src={filePrev} 
                alt="Preview" 
                className="max-h-96 w-auto rounded-md object-contain"
              />
            ) : (
              <video
                controls
                src={filePrev}
                className="max-h-96 w-full rounded-md object-contain"
              />
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={addLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            addLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {addLoading ? <LoadingAnimation /> : "Post"}
        </button>
      </form>
    </div>
  );
};

export default AddPost;