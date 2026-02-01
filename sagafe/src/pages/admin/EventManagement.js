import React, { useState, useEffect } from 'react';
import { eventsApi, adminEventsApi } from '../../lib/api';

function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(null);

  const [formData, setFormData] = useState({
    golf_course: '',
    township: '',
    date: '',
    time: '',
    capacity: '',
    description: '',
    guest_price: '',
    member_price: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getAll();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingEvent) {
        await adminEventsApi.update(editingEvent.id, formData);
        setSuccess('Event updated successfully');
      } else {
        await adminEventsApi.create(formData);
        setSuccess('Event created successfully');
      }

      setTimeout(() => setSuccess(null), 3000);
      resetForm();
      loadEvents();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      golf_course: event.golf_course,
      township: event.township,
      date: event.date,
      time: event.time || '',
      capacity: event.capacity || '',
      description: event.description || '',
      guest_price: event.guest_price || '',
      member_price: event.member_price || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId, eventName) => {
    if (!window.confirm(`Delete "${eventName}"? This will also delete all registrations for this event.`)) {
      return;
    }

    try {
      await adminEventsApi.delete(eventId);
      setSuccess('Event deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      loadEvents();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleImageUpload = async (eventId, file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setUploadingImage(eventId);
      await adminEventsApi.uploadCoverImage(eventId, file);
      setSuccess('Cover image uploaded successfully');
      setTimeout(() => setSuccess(null), 3000);
      loadEvents();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploadingImage(null);
    }
  };

  const resetForm = () => {
    setFormData({
      golf_course: '',
      township: '',
      date: '',
      time: '',
      capacity: '',
      description: '',
      guest_price: '',
      member_price: '',
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="admin-loading">Loading events...</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Event Management</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Event'}
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>

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
              <label>Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Guest Price ($)</label>
              <input
                type="number"
                name="guest_price"
                value={formData.guest_price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Member Price ($)</label>
              <input
                type="number"
                name="member_price"
                value={formData.member_price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cover Image</th>
              <th>Golf Course</th>
              <th>Location</th>
              <th>Date</th>
              <th>Time</th>
              <th>Pricing</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>
                  <div className="event-image-cell">
                    {event.cover_image_url ? (
                      <img
                        src={event.cover_image_url}
                        alt={event.golf_course}
                        className="event-cover-thumbnail"
                      />
                    ) : (
                      <div className="event-cover-placeholder">No image</div>
                    )}
                    <label className="btn-upload-image">
                      {uploadingImage === event.id ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(event.id, e.target.files[0])}
                        disabled={uploadingImage === event.id}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </td>
                <td>{event.golf_course}</td>
                <td>{event.township}</td>
                <td>{new Date(event.date).toLocaleDateString()}</td>
                <td>{event.time || '-'}</td>
                <td>
                  <div className="pricing-info">
                    {event.guest_price && <div>Guest: ${event.guest_price}</div>}
                    {event.member_price && <div>Member: ${event.member_price}</div>}
                    {!event.guest_price && !event.member_price && '-'}
                  </div>
                </td>
                <td>
                  {event.capacity ? (
                    <span className={event.registrations_count >= event.capacity ? 'status-full' : 'status-available'}>
                      {event.registrations_count || 0} / {event.capacity}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit" onClick={() => handleEdit(event)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(event.id, event.golf_course)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {events.length === 0 && !showForm && (
        <div className="admin-empty">
          <p>No events yet. Create your first event!</p>
        </div>
      )}
    </div>
  );
}

export default EventManagement;
