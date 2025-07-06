import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import { useLogout } from '../Authentication/Logout';
import UserDashboard from './UserDashboard';
import logo from '../Images/logo.png';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const logoutUser = useLogout();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };
  // Prevent right-click context menu
   document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => window.location.reload()}
                />
                <h1 className="text-xl font-bold text-orange-600">Vcoding</h1>
              </div>
              <Link
                to="/compiler"
                className="text-gray-700 hover:text-orange-600 transition-colors"
              >
                Code Compiler
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <UserDashboard />
      </main>
    </div>
  );
}

export default Dashboard;