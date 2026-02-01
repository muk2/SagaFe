import React, { useState, useEffect } from 'react';
import { eventsApi, adminEventsApi } from '../../lib/api';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    golf_course: '',
    township: '',
    state: '',
    date: '',
    start_time: '',
    price: '',
    member_price: '',
    spots: '',
    description: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getAll();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      if (editingEvent) {
        await adminEventsApi.update(editingEvent.id, formData);
        setSuccess('Event updated successfully');
      } else {
        await adminEventsApi.create(formData);
        setSuccess('Event created successfully');
      }

      // Refresh events list
      await fetchEvents();

      // Reset form
      setShowForm(false);
      setEditingEvent(null);
      setFormData({
        golf_course: '',
        township: '',
        state: '',
        date: '',
        start_time: '',
        price: '',
        member_price: '',
        spots: '',
        description: '',
      });

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
      date: event.date,
      start_time: event.start_time,
      price: event.price,
      member_price: event.member_price || event.price,
      spots: event.spots,
      description: event.description || '',
    });
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
    setFormData({
      golf_course: '',
      township: '',
      state: '',
      date: '',
      start_time: '',
      price: '',
      member_price: '',
      spots: '',
      description: '',
    });
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
                  value={formData.date}
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
                  value={formData.price}
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
                  value={formData.member_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
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
                placeholder="Optional event description"
              />
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
            <th>Course</th>
            <th>Location</th>
            <th>Date</th>
            <th>Time</th>
            <th>Price (Guest/Member)</th>
            <th>Capacity</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td><strong>{event.golf_course}</strong></td>
              <td>{event.township}, {event.state}</td>
              <td>{new Date(event.date).toLocaleDateString()}</td>
              <td>{event.start_time}</td>
              <td>${event.price} / ${event.member_price || event.price}</td>
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
        }
      `}</style>
    </div>
  );
};

export default EventManagement;
