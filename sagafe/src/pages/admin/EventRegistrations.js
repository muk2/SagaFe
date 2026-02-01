import React, { useState, useEffect } from 'react';
import { eventsApi, adminUsersApi } from '../../lib/api';

function EventRegistrations() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadRegistrations = async (eventId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminUsersApi.getEventRegistrations(eventId);
      setRegistrations(data);
    } catch (err) {
      setError(err.message);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEventId(eventId);
    if (eventId) {
      loadRegistrations(eventId);
    } else {
      setRegistrations([]);
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Handicap', 'Registration Date'];
    const csvContent = [
      headers.join(','),
      ...registrations.map(reg =>
        [
          `"${reg.user_name}"`,
          reg.user_email,
          reg.user_phone || '',
          reg.user_handicap || '',
          new Date(reg.registered_at).toLocaleString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-registrations-${selectedEventId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const selectedEvent = events.find(e => e.id === parseInt(selectedEventId));

  return (
    <div className="admin-section">
      <h2>Event Registrations</h2>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-form">
        <div className="form-group">
          <label>Select Event</label>
          <select value={selectedEventId} onChange={handleEventChange}>
            <option value="">-- Choose an event --</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.golf_course} - {event.township} ({new Date(event.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedEvent && (
        <div className="event-info-card">
          <h3>{selectedEvent.golf_course}</h3>
          <p><strong>Location:</strong> {selectedEvent.township}</p>
          <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
          {selectedEvent.capacity && (
            <p>
              <strong>Capacity:</strong>{' '}
              <span className={registrations.length >= selectedEvent.capacity ? 'status-full' : 'status-available'}>
                {registrations.length} / {selectedEvent.capacity}
              </span>
            </p>
          )}
          <div className="capacity-bar">
            <div
              className="capacity-fill"
              style={{ width: `${selectedEvent.capacity ? (registrations.length / selectedEvent.capacity) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {loading && <div className="admin-loading">Loading registrations...</div>}

      {!loading && registrations.length > 0 && (
        <>
          <div className="admin-section-header">
            <h3>Registrations ({registrations.length})</h3>
            <button className="btn-primary" onClick={exportToCSV}>
              Export to CSV
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Handicap</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, idx) => (
                  <tr key={idx}>
                    <td>{reg.user_name}</td>
                    <td>{reg.user_email}</td>
                    <td>{reg.user_phone || '-'}</td>
                    <td>{reg.user_handicap || '-'}</td>
                    <td>{new Date(reg.registered_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && selectedEventId && registrations.length === 0 && (
        <div className="admin-empty">
          <p>No registrations yet for this event</p>
        </div>
      )}

      {!selectedEventId && (
        <div className="admin-empty">
          <p>Select an event to view registrations</p>
        </div>
      )}
    </div>
  );
}

export default EventRegistrations;
