import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LoadingAnimation } from "../components/Loading";
import { FiSearch } from "react-icons/fi";

const Search = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Add debounce to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        fetchUsers();
      } else {
        setUsers([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/user/all?search=" + search);
      setUsers(data);
      setHasSearched(true);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Search Input */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search users by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingAnimation />
          </div>
        ) : (
          <div className="space-y-3">
            {hasSearched && users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found matching "{search}"
              </div>
            ) : (
              users.map((user) => (
                <Link
                  key={user._id}
                  to={`/user/${user._id}`}
                  className="block bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.profilepic.url}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="text-center py-8 text-gray-500">
            Start typing to search for users
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;