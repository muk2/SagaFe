/**
 * API Client for SagaFe Backend
 * Centralized API handling with token management and error handling
 */

// API Base URL - uses environment variable or falls back to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Makes an authenticated API request
 * Automatically handles token attachment and 401 responses
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    // Dispatch custom event for auth state change
    window.dispatchEvent(new CustomEvent('auth-expired'));
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * API methods
 */
export const api = {
  /**
   * GET request
   */
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

  /**
   * POST request with JSON body
   */
  post: (endpoint, data) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * PUT request with JSON body
   */
  put: (endpoint, data) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * DELETE request
   */
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

/**
 * Auth-specific API methods
 */
export const authApi = {
  /**
   * User login
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{access_token: string, token_type: string, user: object}>}
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    // Store token and user data
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  /**
   * User registration
   * @param {object} userData - { first_name, last_name, email, password, phone_number?, golf_handicap? }
   * @returns {Promise<{message: string, user: object}>}
   */
  signup: async (userData) => {
    return api.post('/auth/signup', userData);
  },

  /**
   * User logout - invalidates token on server
   */
  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      // Ignore logout errors - still clear local storage
      console.warn('Logout API call failed:', error.message);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser: () => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

/**
 * Events API methods
 */
export const eventsApi = {
  /**
   * Get all events
   * @returns {Promise<Array<{id: number, township: string, golf_course: string, date: date}>>}
   */
  getAll: async () => {
    return api.get('/api/events/');
  },
};


/**
 * Banner Messages API methods
 */
export const bannerApi = {
  /**
   * Get all events
   * @returns {Promise<Array<{id: number, message: string}>>}
   */
  getAll: async () => {
    return api.get('/api/banner_messages/');
  },
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.status === 'healthy';
  } catch {
    return false;
  }
};

export default api;
