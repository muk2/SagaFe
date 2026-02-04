import React, { useState, useEffect } from 'react';
import { eventsApi, adminEventsApi } from '../../lib/api';
import { formatTime, toDateInputFormat} from '../../lib/dateUtils';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [formData, setFormData] = useState({
    golf_course: '',
    township: '',
    state: '',
    date: '',
    start_time: '',
    guest_price: '',
    member_price: '',
    spots: '',
    image_url: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getAll();

      // Load images from localStorage
      const eventsWithImages = data.map(event => ({
        ...event,
        image_url: localStorage.getItem(`event_image_${event.id}`) || event.image_url || ''
      }));
      
      setEvents(eventsWithImages);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const sortEventsByDate = (eventsArray, order = 'desc') => {
    return [...eventsArray].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (order === 'desc') {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB for localStorage)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    // Read and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      setImagePreview(base64Image);
      setFormData({ ...formData, image_url: base64Image });
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image_url: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      const dataToSend = {
        ...formData,
        date: formData.date, // Already in YYYY-MM-DD from the input
      };

      let eventId;
      if (editingEvent) {
        await adminEventsApi.update(editingEvent.id, dataToSend);
        eventId = editingEvent.id;
        setSuccess('Event updated successfully');
      } else {
        const response = await adminEventsApi.create(dataToSend);
        eventId = response.id;
        setSuccess('Event created successfully');
      }

      // Save image to localStorage if exists
      if (formData.image_url && formData.image_url.startsWith('data:image')) {
        localStorage.setItem(`event_image_${eventId}`, formData.image_url);
      }

      // Refresh events list
      await fetchEvents();

      // Reset form
      handleCancel();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Full error:', err);
      setError(err.message || 'Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      golf_course: event.golf_course,
      township: event.township,
      state: event.state,
      date: toDateInputFormat(event.date),
      start_time: event.start_time,
      guest_price: event.guest_price,
      member_price: event.member_price,
      spots: event.spots,
      description: event.description || '',
      image_url: event.image_url || '',
    });
    
    // Set preview if image exists
    if (event.image_url) {
      setImagePreview(event.image_url);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"? This will also delete all registrations.`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await adminEventsApi.delete(eventId);

      // Remove image from localStorage
      localStorage.removeItem(`event_image_${eventId}`);

      setEvents(events.filter(event => event.id !== eventId));
      setSuccess('Event deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
    setImagePreview(null);
    setFormData({
      golf_course: '',
      township: '',
      state: '',
      date: '',
      start_time: '',
      guest_price: '',
      member_price: '',
      spots: '',
      description: '',
      image_url: '',
    });
  };

  const sortedEvents = sortEventsByDate(events, sortOrder);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="event-management">
      <div className="section-header">
        <h2 className="admin-section-title">Event Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add New Event
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {showForm && (
        <div className="event-form-card">
          <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            {/* Image Upload Section */}
            <div className="image-upload-section">
              <label className="upload-label">Event Thumbnail Image</label>
              <p className="help-text">Recommended size: 800x600px. Max 2MB. All event thumbnails will be displayed at the same size.</p>
              
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Event preview" className="event-image-preview" />
                  <button type="button" onClick={handleRemoveImage} className="btn-remove-image">
                    Remove Image
                  </button>
                </div>
              ) : (
                <label className="file-upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <span className="upload-icon">📷</span>
                  <span>Choose Image File</span>
                </label>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Golf Course *</label>
                <input
                  type="text"
                  name="golf_course"
                  value={formData.golf_course}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Township *</label>
                <input
                  type="text"
                  name="township"
                  value={formData.township}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g., MI"
                  maxLength="2"
                  required
                />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={toDateInputFormat(formData.date)}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Spots *</label>
                <input
                  type="number"
                  name="spots"
                  value={formData.spots}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Guest Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={parseFloat(formData.guest_price).toFixed(2) || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Member Price ($) *</label>
                <input
                  type="number"
                  name="member_price"
                  value={parseFloat(formData.member_price).toFixed(2) || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>


            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Course</th>
            <th>Location</th>
            <th 
              onClick={toggleSortOrder} 
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Date {sortOrder === 'desc' ? '↓' : '↑'} 
            </th>
            <th>Time</th>
            <th>Price (Guest/Member)</th>
            <th>Capacity</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedEvents.map((event) => (
            <tr key={event.id}>
              <td>
                <div className="table-image-container">
                  {event.image_url ? (
                    <img 
                      src={event.image_url} 
                      alt={event.golf_course}
                      className="table-thumbnail"
                    />
                  ) : (
                    <div className="table-thumbnail-placeholder">No Image</div>
                  )}
                </div>
              </td>
              <td><strong>{event.golf_course}</strong></td>
              <td>{event.township}, {event.state}</td>
              <td>{new Date(event.date).toLocaleDateString()}</td>
              <td>{formatTime(event.start_time)}</td>
              <td>${parseFloat(event.guest_price).toFixed(2)} / ${parseFloat(event.member_price).toFixed(2)}</td>
              <td>{event.spots}</td>
              <td>
                <span className={event.registered >= event.spots ? 'badge-full' : 'badge-available'}>
                  {event.registered || 0} / {event.spots}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(event)} className="btn-secondary btn-sm">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id, event.golf_course)}
                    className="btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {events.length === 0 && !showForm && (
        <div className="empty-state">
          No events created yet. Click "Add New Event" to get started.
        </div>
      )}

      <style jsx>{`
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .event-form-card {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
        }

        .event-form-card h3 {
          margin: 0 0 1.5rem 0;
          color: #1f2937;
        }

        .image-upload-section {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 2px dashed #d1d5db;
          margin-bottom: 2rem;
          text-align: center;
        }

        .upload-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .help-text {
          color: #6b7280;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .file-upload-button {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 2rem 3rem;
          background: #f9fafb;
          border: 2px dashed #9ca3af;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .file-upload-button:hover {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .upload-icon {
          font-size: 3rem;
        }

        .image-preview-container {
          position: relative;
          display: inline-block;
        }

        .event-image-preview {
          max-width: 400px;
          max-height: 300px;
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-remove-image {
          display: block;
          margin: 1rem auto 0;
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .btn-remove-image:hover {
          background: #dc2626;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-sm {
          padding: 0.25rem 0.75rem;
          font-size: 0.85rem;
        }

        .table-image-container {
          width: 80px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .table-thumbnail {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .table-thumbnail-placeholder {
          width: 80px;
          height: 60px;
          background: #f3f4f6;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: #9ca3af;
          text-align: center;
          padding: 0.25rem;
        }

        .badge-full {
          color: #dc2626;
          font-weight: 600;
        }

        .badge-available {
          color: #059669;
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .event-image-preview {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EventManagement;
