/**
 * Event Image Utilities
 * Helper functions for managing event thumbnail images
 */

// Default fallback image URL
const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800";

/**
 * Get image URL for an event
 * Checks localStorage first, then falls back to event.image_url or default
 * @param {object} event - Event object with id and optional image_url
 * @returns {string} Image URL
 */
export const getEventImage = (event) => {
  if (!event) return DEFAULT_EVENT_IMAGE;
  
  // Check localStorage for uploaded image
  const storedImage = localStorage.getItem(`event_image_${event.id}`);
  if (storedImage) {
    return storedImage;
  }
  
  // Fall back to event's image_url if exists
  if (event.image_url) {
    return event.image_url;
  }
  
  // Final fallback to default image
  return DEFAULT_EVENT_IMAGE;
};

/**
 * Save event image to localStorage
 * @param {number} eventId - Event ID
 * @param {string} imageData - Base64 image data
 */
export const saveEventImage = (eventId, imageData) => {
  if (!eventId || !imageData) return;
  localStorage.setItem(`event_image_${eventId}`, imageData);
};

/**
 * Remove event image from localStorage
 * @param {number} eventId - Event ID
 */
export const removeEventImage = (eventId) => {
  if (!eventId) return;
  localStorage.removeItem(`event_image_${eventId}`);
};

/**
 * Get all event images from localStorage
 * @returns {object} Object with eventId as key and image URL as value
 */
export const getAllEventImages = () => {
  const images = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('event_image_')) {
      const eventId = key.replace('event_image_', '');
      images[eventId] = localStorage.getItem(key);
    }
  }
  return images;
};

export default {
  getEventImage,
  saveEventImage,
  removeEventImage,
  getAllEventImages,
  DEFAULT_EVENT_IMAGE
};
