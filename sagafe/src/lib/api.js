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

  // Handle 401 Unauthorized
  if (response.status === 401) {
    const error = await response.json().catch(() => ({ detail: 'Unauthorized' }));
    
    if (token && headers['Authorization']) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth-expired'));
      throw new Error('Session expired. Please log in again.');
    }
    
    // For login failures, throw the actual error message
    throw new Error(error.detail || 'Unauthorized');
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

  /**
   * Request password reset
   * @param {string} email - User's email address
   * @returns {Promise<{message: string}>}
   */
  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {string} new_password - New password
   * @returns {Promise<{message: string}>}
   */
  resetPassword: async (token, new_password) => {
    return api.post('/auth/reset-password', { token, new_password });
  },
  
  /* Grabs the data associated with the logged-in user*/
  getMe: async () => {
    return api.get('/api/users/me');
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
 * Users API methods (for admin)
 */
export const usersApi = {
  /**
   * Get all users (admin only)
   * @returns {Promise<Array<User>>}
   */
  getAll: async () => {
    return api.get('/api/admin/users');
  },

  /**
   * Update user role (admin only)
   * @param {number} userId
   * @param {string} role
   */
  updateRole: async (userId, role) => {
    return api.put(`/api/admin/users/${userId}/role`, { role });
  },

  /**
   * Delete user (admin only)
   * @param {number} userId
   */
  delete: async (userId) => {
    return api.delete(`/api/admin/users/${userId}`);
  },

  /**
   * Get event registrations for a specific event (admin only)
   * @param {number} eventId
   */
  getEventRegistrations: async (eventId) => {
    return api.get(`/api/admin/events/${eventId}/registrations`);
  },
};

/**
 * Admin Events API methods
 */
export const adminEventsApi = {
  /**
   * Create new event (admin only)
   * @param {object} eventData
   */
  create: async (eventData) => {
    return api.post('/api/admin/events', eventData);
  },

  /**
   * Update event (admin only)
   * @param {number} eventId
   * @param {object} eventData
   */
  update: async (eventId, eventData) => {
    return api.put(`/api/admin/events/${eventId}`, eventData);
  },

  /**
   * Delete event (admin only)
   * @param {number} eventId
   */
  delete: async (eventId) => {
    return api.delete(`/api/admin/events/${eventId}`);
  },
};

/**
 * Admin Banner API methods
 */
export const adminBannerApi = {
  /**
   * Update banner messages (admin only)
   * @param {Array<{id?: number, message: string}>} messages
   */
  updateMessages: async (messages) => {
    return api.put('/api/admin/banner-messages', { messages });
  },

  /**
   * Update banner display count (admin only)
   * @param {number} count
   */
  updateDisplayCount: async (count) => {
    return api.put('/api/admin/banner-settings', { display_count: count });
  },
};

/**
 * Admin Photos API methods
 */
export const adminPhotosApi = {
  /**
   * Get all photo albums (admin only)
   */
  getAll: async () => {
    return api.get('/api/admin/photo-albums');
  },

  /**
   * Create photo album (admin only)
   * @param {object} albumData
   */
  create: async (albumData) => {
    return api.post('/api/admin/photo-albums', albumData);
  },

  /**
   * Update photo album (admin only)
   * @param {number} albumId
   * @param {object} albumData
   */
  update: async (albumId, albumData) => {
    return api.put(`/api/admin/photo-albums/${albumId}`, albumData);
  },

  /**
   * Delete photo album (admin only)
   * @param {number} albumId
   */
  delete: async (albumId) => {
    return api.delete(`/api/admin/photo-albums/${albumId}`);
  },
};

/**
 * Admin Content API methods
 */
export const adminContentApi = {
  /**
   * Get site content/prompts (admin only)
   */
  getContent: async () => {
    return api.get('/api/admin/content');
  },

  /**
   * Update site content/prompts (admin only)
   * @param {object} content
   */
  updateContent: async (content) => {
    return api.put('/api/admin/content', content);
  },
};

/**
 * Admin Media API methods
 */
export const adminMediaApi = {
  /**
   * Upload image (admin only)
   * @param {FormData} formData - Must contain 'file' and 'type' (e.g., 'hero', 'carousel', 'logo')
   */
  uploadImage: async (formData) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/admin/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // Don't set Content-Type for FormData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  },

  /**
   * Get carousel images (admin only)
   */
  getCarouselImages: async () => {
    return api.get('/api/admin/media/carousel');
  },

  /**
   * Update carousel images (admin only)
   * @param {Array<string>} imageUrls
   */
  updateCarousel: async (imageUrls) => {
    return api.put('/api/admin/media/carousel', { images: imageUrls });
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
