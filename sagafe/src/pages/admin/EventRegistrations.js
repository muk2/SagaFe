import React, { useState, useEffect } from 'react';
import { eventsApi, usersApi } from '../../lib/api';
import { formatTime } from '../../lib/dateUtils';

const EventRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const formatToEastern = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getAll();
      
      // Sort: upcoming events first (by earliest date), then past events
      const now = new Date();
      const sortedEvents = data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        const isAUpcoming = dateA >= now;
        const isBUpcoming = dateB >= now;
        
        if (isAUpcoming === isBUpcoming) {
          return dateA - dateB;
        }
        
        return isAUpcoming ? -1 : 1;
      });
      
      setEvents(sortedEvents);
  
      if (sortedEvents.length > 0) {
        setSelectedEvent(sortedEvents[0]);
        fetchRegistrations(sortedEvents[0].id);
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
      console.log('Registrations data:', data); // ✅ Debug log
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

  const handleDeleteRegistration = async (registration) => {
    const userName = registration.user_name || registration.email;
    if (!window.confirm(`Remove ${userName} from ${selectedEvent.golf_course}?`)) {
      return;
    }

    try {
      setDeletingId(registration.id);
      await usersApi.deleteEventRegistration(registration.id);
      
      // Remove from local state
      setRegistrations(prevRegs => 
        prevRegs.filter(reg => reg.id !== registration.id)
      );
      
      setSuccessMessage(`Successfully removed ${userName} from the event`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err);
      setTimeout(() => setError(null), 10000);
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Updated CSV export with membership column
  const exportToCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations to export');
      return;
    }
  
    const headers = ['Name', 'Email', 'Phone', 'Handicap', 'Membership', 'Registration Date'];
    const rows = registrations.map(reg => [
      reg.user_name || 'Unknown',
      reg.email,
      reg.phone || reg.phone_number || 'N/A',
      reg.handicap || reg.golf_handicap || 'N/A',
      (reg.membership || 'guest').toUpperCase(),  
      formatToEastern(reg.created_at),
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
                    {event.golf_course} - {new Date(event.date).toLocaleDateString()} at {formatTime(event.start_time)}
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
                  <span className="value">{formatTime(selectedEvent.start_time)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Capacity:</span>
                  <span className="value">{selectedEvent.capacity} spots</span>
                </div>
                <div className="info-item">
                  <span className="label">Registered:</span>
                  <span className={`value ${registrations.length >= selectedEvent.capacity ? 'full' : 'available'}`}>
                    {registrations.length} / {selectedEvent.capacity}
                  </span>
                </div>
              </div>
              <div className="capacity-bar">
                <div
                  className="capacity-fill"
                  style={{
                    width: `${Math.min((registrations.length / selectedEvent.capacity) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
           {successMessage && (
        <div className="event-registration-banner event-registration-banner-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>{successMessage}</span>
        
        </div>
      )}

      {error && (
        <div className="event-registration-banner event-registration-banner-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
          
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
                  <th>Membership</th>  
                  <th>Registered At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, index) => (
                  <tr key={reg.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{reg.user_name || 'Unknown'}</strong>
                    </td>
                    <td>{reg.email}</td>
                    <td>{reg.phone || reg.phone_number || 'N/A'}</td>
                    <td>{reg.handicap || reg.golf_handicap || 'N/A'}</td>
                    {/* ✅ Add membership badge */}
                    <td>
                      <span className={`membership-badge ${reg.membership || 'guest'}`}>
                        {(reg.membership || 'guest').toUpperCase()}
                      </span>
                    </td>
                    <td>{formatToEastern(reg.created_at)}</td>
                    <td>
                    <button
                      onClick={() => handleDeleteRegistration(reg)}
                      disabled={deletingId === reg.id}
                      className="btn-delete"
                      title="Remove from event"
                    >
                      {deletingId === reg.id ? '⏳' : '✕'}
                    </button>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <style jsx>{`

          /* Banner Styles */
          .event-registration-banner {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.25rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            animation: slideDown 0.3s ease-out;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .event-registration-banner svg {
            flex-shrink: 0;
          }

          .event-registration-banner span {
            flex: 1;
            font-size: 0.95rem;
            font-weight: 500;
          }


          .event-registration-banner-success {
            background: #f0fdf4;
            border: 1px solid #86efac;
            color: #166534;
          }

          .event-registration-banner-success {
            color: #166534;
          }

          .event-registration-banner-error {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            color: #991b1b;
          }

          .event-registration-banner-error {
            color: #991b1b;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

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

        /* ✅ Membership badges */
        .membership-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .membership-badge.individual {
          background: #dbeafe;
          color: #1e40af;
        }

        .membership-badge.junior {
          background: #fef3c7;
          color: #92400e;
        }

        .membership-badge.brunswick {
          background: #fee2e2;
          color: #991b1b;
        }

        .membership-badge.guest {
          background: #f3f4f6;
          color: #4b5563;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .admin-table th:last-child,
        .admin-table td:last-child {
          width: 80px;
          text-align: center;
        }

        .btn-delete {
          background: none;
          border: 1px solid #ffffff;
          border-radius: 6px;
          padding: 0.5rem;
          width: 36px;
          height: 36px;
          cursor: pointer;
          color: #dc2626;
          font-size: 1.25rem;
          transition: all 0.2s ease;
        }

        .btn-delete:hover:not(:disabled) {
          background: #fef2f2;
          border-color: #dc2626;
          transform: scale(1.1);
        }

        .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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