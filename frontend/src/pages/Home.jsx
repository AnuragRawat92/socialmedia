import React from "react";
import AddPost from "../components/AddPost";
import PostCard from "../components/PostCard";
import { PostData } from "../context/PostContext";
import { Loading } from "../components/Loading";

const Home = () => {
  const { posts, loading } = PostData();

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          <AddPost type="post" />
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard 
                value={post} 
                key={post._id} 
                type="post" 
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No posts yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;