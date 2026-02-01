/**
 * Authentication and Authorization Utilities
 * Provides role-based access control (RBAC) helpers
 */

/**
 * Get the current logged-in user from localStorage
 * @returns {Object|null} User object or null if not logged in
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

/**
 * Check if the current user is an admin
 * @returns {boolean} True if user has admin role
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

/**
 * Check if the current user has a specific role
 * @param {string} role - The role to check for
 * @returns {boolean} True if user has the specified role
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.role === role;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};
