import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Authentication/AuthContext';
import AdminNavbar from './AdminNavbar';

function UserDetails() {
  const { user } = useAuth();
  const token = user?.token;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'loggedIn', 'notLoggedIn'

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/users/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (err) {
        setError('Failed to fetch user details');
      }
    };
    if (token) fetchUsers();
  }, [token]);

  // Filter and search users
  useEffect(() => {
    let filtered = users;

    // Apply status filter
    if (statusFilter === 'loggedIn') {
      filtered = filtered.filter(u => u.loggedIn);
    } else if (statusFilter === 'notLoggedIn') {
      filtered = filtered.filter(u => !u.loggedIn);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term))
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter]);

  const handleClearStatus = async (userId) => {
    setUpdatingUser(userId);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/admin/users/${userId}/clear-status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId || u._id === userId 
            ? { ...u, loggedIn: false }
            : u
        )
      );
    } catch (err) {
      setError('Failed to clear user status');
    } finally {
      setUpdatingUser(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!users || users.length === 0) {
    return <div>Loading user details...</div>;
  }

  return (
    <div>
      <AdminNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">All User Details</h1>
        
        {/* Search and Filter Section */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="loggedIn">Logged In</option>
                <option value="notLoggedIn">Not Logged In</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Roles</th>
                <th className="px-4 py-2 border">Current Status</th>
                <th className="px-4 py-2 border">Actions</th>
                <th className="px-4 py-2 border">Created At</th>
                <th className="px-4 py-2 border">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => (
                <tr key={u.id || u._id || idx}>
                  <td className="px-4 py-2 border">{u.name||'no name field added in v1'}</td>
                  <td className="px-4 py-2 border">{u.email}</td>
                  <td className="px-4 py-2 border">{Array.isArray(u.roles) ? u.roles.join(', ') : u.roles||'nill for now'}</td>
                  <td className="px-4 py-2 border">
                    {u.loggedIn ? (
                      <span className="text-green-600 font-semibold">🟢 Logged In</span>
                    ) : (
                      <span className="text-gray-500">⚪ Not Logged In</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {u.loggedIn && (
                      <button
                        onClick={() => {
                          console.log('u.id:', u.id, 'u._id:', u._id);
                          let userId = u.id || u._id;
                          if (userId && typeof userId === 'object') {
                            userId = userId.$oid || userId.toString();
                          }
                          console.log('userId to send:', userId);
                          handleClearStatus(userId);
                        }}
                        disabled={updatingUser === (u.id || u._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                      >
                        {updatingUser === (u.id || u._id) ? 'Clearing...' : 'Clear Status'}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2 border">{u.createdAt ? new Date(u.createdAt).toLocaleString() : 'before production no input was given'}</td>
                  <td className="px-4 py-2 border">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'not yet login'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results Message */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDetails;