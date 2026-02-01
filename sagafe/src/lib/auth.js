/**
 * Authentication and Authorization Utilities
 */

/**
 * Check if current user has admin role
 * @returns {boolean}
 */
export const isAdmin = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;

    const user = JSON.parse(userStr);
    return user.role === 'admin';
  } catch {
    return false;
  }
};

/**
 * Get current user from localStorage
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

/**
 * Check if user has specific role
 * @param {string} role
 * @returns {boolean}
 */
export const hasRole = (role) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;

    const user = JSON.parse(userStr);
    return user.role === role;
  } catch {
    return false;
  }
};
