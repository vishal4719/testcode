import axios from 'axios';
import { useAuth } from './AuthContext';

/**
 * Custom hook to perform logout: calls backend and clears frontend state.
 * Usage: const logoutUser = useLogout(); logoutUser();
 */
export function useLogout() {
  const { logout } = useAuth();

  return async function logoutUser() {
    try {
      // Call backend logout endpoint
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : ''}`
        }
      });
    } catch (err) {
      // Optionally handle error (e.g., already logged out)
      // console.error('Backend logout failed:', err);
    } finally {
      // Always clear frontend state
      logout();
    }
  };
} 