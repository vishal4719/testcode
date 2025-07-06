import React from 'react';

function UserNavbar({ showSubmission, onSubmissionClick, user, onLogout }) {
  return (
    <nav className="bg-orange-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="text-xl font-bold tracking-wide">User Dashboard</div>
      <div className="flex items-center space-x-4">
        {user && (
          <span className="font-semibold text-white bg-orange-700 px-3 py-1 rounded-lg">{user.name || user.email || 'User'}</span>
        )}
        {showSubmission && (
          <button
            className="bg-white text-orange-600 px-4 py-2 rounded font-semibold hover:bg-orange-100 transition"
            onClick={onSubmissionClick}
          >
            Submission
          </button>
        )}
        <button
          className="bg-white text-orange-600 px-4 py-2 rounded font-semibold hover:bg-orange-100 transition"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default UserNavbar; 