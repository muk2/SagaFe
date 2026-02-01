import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function DashboardPage() {
  const { user, updateUser} = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  console.log('DashboardPage - user:', user);
  // Handicap form state
  const [handicapForm, setHandicapForm] = useState({
    handicap: user?.handicap || ''
  });

  useEffect(() => {
    if (user) {
      setHandicapForm({ handicap: user.handicap || '' });
    }
  }, [user]);

  
  // Password reset form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // User events state
  const [pastEvents, setPastEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);


  // Fetch user's registered events
  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setEventsLoading(true);
        const response = await api.get('/api/users/events');
        
        const userEvents = response.events || [];
        // Separate past and upcoming events
        const now = new Date();
        const past = [];
        const upcoming = [];

        userEvents.forEach(event => {
          const eventDate = new Date(event.date);
          if (eventDate < now) {
            past.push(event);
          } else {
            upcoming.push(event);
          }
        });

        setPastEvents(past);
        setUpcomingEvents(upcoming);
      } catch (error) {
        console.error('Failed to fetch user events:', error);
        // If endpoint doesn't exist yet, we'll just show empty states
        setPastEvents([]);
        setUpcomingEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const handleHandicapUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/api/users/profile', {
        handicap: handicapForm.handicap
      });
      updateUser(response);
      // Update user in context
      updateUser({ ...user, handicap: handicapForm.handicap });

      setMessage({ type: 'success', text: 'Golf handicap updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update handicap' });
    } finally {
      setLoading(false);
    }
  };

  console.log(JSON.parse(localStorage.getItem('user')));

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }


    try {
      await api.put('/api/users/password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });

      setMessage({ type: 'success', text: 'Password reset successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="page-container dashboard-page">
      <div className="page-header">
        <h1>My Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user.first_name}!</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          My Events
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>Golf Handicap</h3>
                  <p className="stat-value">{user.handicap || 'Not set'}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>Upcoming Events</h3>
                  <p className="stat-value">{upcomingEvents.length}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>Events Played</h3>
                  <p className="stat-value">{pastEvents.length}</p>
                </div>
              </div>
            </div>

            <div className="profile-card">
              <h2>Profile Information</h2>
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span>{user.first_name} {user.last_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span>{user.email}</span>
                </div>
                {user.phone_number && (
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span>{user.phone_number}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Member Since:</span>
                  <span>{new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="events-section">
            <div className="events-subsection">
              <h2>Upcoming Events</h2>
              {eventsLoading ? (
                <p className="loading-text">Loading events...</p>
              ) : upcomingEvents.length > 0 ? (
                <div className="events-list-dashboard">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="event-card-dashboard">
                      <div className="event-date-badge">
                        <span className="badge-month">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="badge-day">{new Date(event.date).getDate()}</span>
                      </div>
                      <div className="event-info">
                        <h3>{event.golf_course}</h3>
                        <p className="event-location">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {event.township}, {event.state}
                        </p>
                        <p className="event-time">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {event.date}
                        </p>
                      </div>
                      <div className="event-status">
                        <span className="status-badge upcoming">Registered</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't registered for any upcoming events yet.</p>
                  <button className="primary-btn" onClick={() => navigate('/events')}>
                    Browse Events
                  </button>
                </div>
              )}
            </div>

            <div className="events-subsection">
              <h2>Past Events</h2>
              {eventsLoading ? (
                <p className="loading-text">Loading events...</p>
              ) : pastEvents.length > 0 ? (
                <div className="events-list-dashboard">
                  {pastEvents.map(event => (
                    <div key={event.id} className="event-card-dashboard past">
                      <div className="event-date-badge">
                        <span className="badge-month">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="badge-day">{new Date(event.date).getDate()}</span>
                      </div>
                      <div className="event-info">
                        <h3>{event.golf_course}</h3>
                        <p className="event-location">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {event.township}, {event.state}
                        </p>
                      </div>
                      <div className="event-status">
                        <span className="status-badge completed">Completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No past events found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <div className="settings-card">
              <h2>Update Golf Handicap</h2>
              <form onSubmit={handleHandicapUpdate} className="settings-form">
                <div className="form-group">
                  <label htmlFor="golf_handicap">Golf Handicap</label>
                  <input
                    type="text"
                    id="golf_handicap"
                    value={handicapForm.handicap}
                    onChange={(e) => setHandicapForm({ handicap: e.target.value })}
                    placeholder="Enter your handicap (e.g., 12.5)"
                    disabled={loading}
                  />
                  <small>Enter your current USGA handicap index</small>
                </div>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Handicap'}
                </button>
              </form>
            </div>

            <div className="settings-card">
              <h2>Reset Password</h2>
              <form onSubmit={handlePasswordReset} className="settings-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="Confirm new password"
                  />
                </div>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
