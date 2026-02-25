import React, { useState, useEffect, useRef} from 'react';
import {adminEventsApi, adminMediaApi } from '../../lib/api';
import { formatTime, toDateInputFormat} from '../../lib/dateUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [formData, setFormData] = useState({
    golf_course: '',
    township: '',
    state: '',
    zipcode:'',
    date: '',
    start_time: '',
    guest_price: '',
    member_price: '',
    capacity:'',
    image_url: ''
  });

  const formRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Helper to get full image URL
  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_URL}${url}`;
    return `${API_URL}/${url}`;
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminEventsApi.getAll('date', sortOrder);
      setEvents(data);
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

  const handleCapacityChange = (e) => {
    const value = e.target.value;
    
    // Only allow digits
    if (value === '' || /^\d+$/.test(value)) {
      setFormData({ ...formData, capacity: value });
    }
  };

  // ✅ Updated image upload to use proper file upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await adminMediaApi.uploadImage(formDataUpload);
      setFormData(prev => ({ ...prev, image_url: response.url }));
      setSuccess('Image uploaded successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      // Validate zipcode
      const zipcodeRegex = /^\d{5}$/;
      if (!zipcodeRegex.test(formData.zipcode)) {
        setError('Zipcode must be exactly 5 digits');
        return;
      }

      const dataToSend = {
        golf_course: formData.golf_course,
        township: formData.township,
        state: formData.state,
        zipcode: formData.zipcode,
        date: formData.date,
        start_time: formData.start_time,
        guest_price: parseFloat(formData.guest_price),
        member_price: parseFloat(formData.member_price),
        capacity: parseInt(formData.capacity),
        image_url: formData.image_url || null
      };

      

      if (editingEvent) {
        await adminEventsApi.update(editingEvent.id, dataToSend);
        
        setSuccess('Event updated successfully');
      } else {
        await adminEventsApi.create(dataToSend);
        setSuccess('Event created successfully');
      }

      await fetchEvents();
      handleCancel();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      golf_course: event.golf_course,
      township: event.township,
      state: event.state,
      zipcode: event.zipcode,
      date: toDateInputFormat(event.date),
      start_time: event.start_time,
      guest_price: event.guest_price,
      member_price: event.member_price,
      capacity: event.capacity,
      image_url: event.image_url || ''
    });
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"?`)) {
      return;
    }

    try {
      setError(null);
      await adminEventsApi.delete(eventId);
      setEvents(events.filter(e => e.id !== eventId));
      setSuccess('Event deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      golf_course: '',
      township: '',
      state: '',
      zipcode: '',
      date: '',
      start_time: '',
      guest_price: '',
      member_price: '',
      capacity: '',
      image_url: ''
    });
  };

  const handleSortToggle = async () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    
    try {
      const data = await adminEventsApi.getAll('date', newOrder);
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to sort events');
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="event-management">
      <div className="section-header">
        <h2 className="admin-section-title">Event Management</h2>
        <div className="header-actions">
          <button onClick={handleSortToggle} className="btn-secondary">
            Sort by Date: {sortOrder === 'asc' ? '↑ Oldest First' : '↓ Newest First'}
          </button>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              + Add New Event
            </button>
          )}
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {showForm && (
        <div className="event-form-card" ref={formRef}>
          <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label>Golf Course *</label>
                <input
                  type="text"
                  name="golf_course"
                  value={formData.golf_course}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Pebble Beach Golf Links"
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
                  placeholder="e.g., Pebble Beach"
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
                  required
                  maxLength="2"
                  placeholder="e.g., CA"
                />
              </div>
              <div className="form-group">
                <label>Zipcode *</label>
                <input
                  type="text"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleInputChange}
                  required
                  pattern="\d{5}"
                  placeholder="e.g., 93953"
                />
                <small className="help-text">Must be 5 digits</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Guest Price *</label>
                <input
                  type="number"
                  name="guest_price"
                  value={formData.guest_price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Member Price *</label>
                <input
                  type="number"
                  name="member_price"
                  value={formData.member_price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Capacity *</label>
              <input
                type="text"
                name="capacity"
                value={formData.capacity}
                onChange={handleCapacityChange}
                required
                placeholder="e.g., 50"
                inputMode="numeric"
              />
            </div>

            <div className="form-group">
              <label>Event Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && (
                <p style={{ color: '#3b82f6', marginTop: '0.5rem' }}>
                  Uploading image...
                </p>
              )}
              {formData.image_url && (
                <div className="image-preview-container">
                  <img
                    src={getFullImageUrl(formData.image_url)}
                    alt="Event preview"
                    className="image-preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn-danger btn-sm"
                  >
                    Remove Image
                  </button>
                </div>
              )}
              <small className="help-text">
                Upload an image for the event (max 5MB). Recommended: 800x400px
              </small>
            </div>

         

            <div className="form-actions" style={{display:"flex", gap: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={uploadingImage}>
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="events-table">
        <table>
          <thead>
            <tr>
              <th>Golf Course</th>
              <th>Location</th>
              <th>Date</th>
              <th>Time</th>
              <th>Capacity</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  <div className="event-cell-with-image">
                    {event.image_url && (
                      <img
                        src={getFullImageUrl(event.image_url)}
                        alt={event.golf_course}
                        className="event-thumbnail"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <strong>{event.golf_course}</strong>
                  </div>
                </td>
                <td>{event.township}, {event.state}</td>
                <td>{new Date(event.date).toLocaleDateString()}</td>
                <td>{formatTime(event.start_time)}</td>
                <td>{event.capacity}</td>
                <td>{event.registered || 0}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(event)}
                      className="btn-secondary btn-sm"
                    >
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
      </div>

      <style jsx>{`
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
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
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .image-preview-container {
          margin-top: 0.75rem;
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .image-preview {
          max-width: 400px;
          max-height: 200px;
          object-fit: cover;
          border-radius: 4px;
          display: block;
          margin-bottom: 0.75rem;
        }

        .events-table {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .events-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .events-table th {
          background: #f9fafb;
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .events-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .events-table tr:hover {
          background: #f9fafb;
        }

        .event-cell-with-image {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .event-thumbnail {
          width: 60px;
          height: 40px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .header-actions button {
            width: 100%;
          }

          .events-table {
            overflow-x: auto;
          }

          .events-table table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
};

export default EventManagement;
