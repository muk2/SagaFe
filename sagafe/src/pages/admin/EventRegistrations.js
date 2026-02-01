import React, { useState, useEffect } from 'react';
import { eventsApi, usersApi } from '../../lib/api';

const EventRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getAll();
      setEvents(data);

      // Auto-select first event if available
      if (data.length > 0) {
        setSelectedEvent(data[0]);
        fetchRegistrations(data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId) => {
    try {
      setLoadingRegistrations(true);
      setError(null);
      const data = await usersApi.getEventRegistrations(eventId);
      setRegistrations(data);
    } catch (err) {
      setError(err.message || 'Failed to load registrations');
      setRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleEventChange = (e) => {
    const eventId = parseInt(e.target.value);
    const event = events.find(ev => ev.id === eventId);
    setSelectedEvent(event);
    if (event) {
      fetchRegistrations(event.id);
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Handicap', 'Registration Date'];
    const rows = registrations.map(reg => [
      reg.name || `${reg.first_name} ${reg.last_name}`,
      reg.email,
      reg.phone || reg.phone_number || 'N/A',
      reg.handicap || reg.golf_handicap || 'N/A',
      new Date(reg.created_at || reg.registered_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent.golf_course}_registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="event-registrations">
      <h2 className="admin-section-title">Event Registrations</h2>

      {error && <div className="error">{error}</div>}

      {events.length === 0 ? (
        <div className="empty-state">
          No events available. Create an event first to see registrations.
        </div>
      ) : (
        <>
          <div className="registrations-header">
            <div className="form-group">
              <label>Select Event:</label>
              <select
                value={selectedEvent?.id || ''}
                onChange={handleEventChange}
                className="event-selector"
              >
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.golf_course} - {new Date(event.date).toLocaleDateString()} at {event.start_time}
                  </option>
                ))}
              </select>
            </div>

            {registrations.length > 0 && (
              <button onClick={exportToCSV} className="btn-primary">
                Export to CSV
              </button>
            )}
          </div>

          {selectedEvent && (
            <div className="event-details-card">
              <h3>{selectedEvent.golf_course}</h3>
              <div className="event-info">
                <div className="info-item">
                  <span className="label">Location:</span>
                  <span className="value">{selectedEvent.township}, {selectedEvent.state}</span>
                </div>
                <div className="info-item">
                  <span className="label">Date:</span>
                  <span className="value">{new Date(selectedEvent.date).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="label">Time:</span>
                  <span className="value">{selectedEvent.start_time}</span>
                </div>
                <div className="info-item">
                  <span className="label">Capacity:</span>
                  <span className="value">{selectedEvent.spots} spots</span>
                </div>
                <div className="info-item">
                  <span className="label">Registered:</span>
                  <span className={`value ${registrations.length >= selectedEvent.spots ? 'full' : 'available'}`}>
                    {registrations.length} / {selectedEvent.spots}
                  </span>
                </div>
              </div>
              <div className="capacity-bar">
                <div
                  className="capacity-fill"
                  style={{
                    width: `${Math.min((registrations.length / selectedEvent.spots) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {loadingRegistrations ? (
            <div className="loading">Loading registrations...</div>
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              No registrations yet for this event.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Handicap</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, index) => (
                  <tr key={reg.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{reg.name || `${reg.first_name} ${reg.last_name}`}</strong>
                    </td>
                    <td>{reg.email}</td>
                    <td>{reg.phone || reg.phone_number || 'N/A'}</td>
                    <td>{reg.handicap || reg.golf_handicap || 'N/A'}</td>
                    <td>{new Date(reg.created_at || reg.registered_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <style jsx>{`
        .registrations-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .event-selector {
          width: 100%;
          max-width: 500px;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .event-details-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .event-details-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .event-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-item .label {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .info-item .value {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .info-item .value.full {
          color: #fca5a5;
        }

        .info-item .value.available {
          color: #86efac;
        }

        .capacity-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          overflow: hidden;
        }

        .capacity-fill {
          height: 100%;
          background: white;
          transition: width 0.3s ease;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .registrations-header {
            flex-direction: column;
            align-items: stretch;
          }

          .event-selector {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EventRegistrations;
