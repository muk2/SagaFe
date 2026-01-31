import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userEvents, setUserEvents] = useState({ upcoming: [], past: [] });
  const [eventsLoading, setEventsLoading] = useState(true);
  const [handicapForm, setHandicapForm] = useState({ handicap: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Wait for auth to load before redirecting
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch user's registered events
  useEffect(() => {
    if (user) {
      fetchUserEvents();
      setHandicapForm({ handicap: user.golf_handicap || '' });
    }
  }, [user]);

  const fetchUserEvents = async () => {
    try {
      setEventsLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/users/events', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      // const data = await response.json();

      // Mock data for now
      const mockEvents = {
        upcoming: [],
        past: []
      };
      setUserEvents(mockEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      showMessage('error', 'Failed to load your events');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleUpdateHandicap = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/users/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ golf_handicap: handicapForm.handicap })
      // });

      // Update local user state
      const updatedUser = { ...user, golf_handicap: handicapForm.handicap };
      updateUser(updatedUser);
      showMessage('success', 'Golf handicap updated successfully!');
    } catch (error) {
      console.error('Failed to update handicap:', error);
      showMessage('error', 'Failed to update handicap. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/users/password', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     currentPassword: passwordForm.currentPassword,
      //     newPassword: passwordForm.newPassword
      //   })
      // });

      showMessage('success', 'Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to reset password:', error);
      showMessage('error', 'Failed to reset password. Please check your current password.');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if user is not authenticated
  if (!user) {
    return null;
  }

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Welcome back, {user.first_name}!</p>
      </div>

      {message.text && (
        <div className={`dashboard-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          My Events
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">⛳</div>
                <div className="stat-info">
                  <p className="stat-label">Golf Handicap</p>
                  <p className="stat-value">{user.golf_handicap || 'Not set'}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <p className="stat-label">Upcoming Events</p>
                  <p className="stat-value">{userEvents.upcoming.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✓</div>
                <div className="stat-info">
                  <p className="stat-label">Past Events</p>
                  <p className="stat-value">{userEvents.past.length}</p>
                </div>
              </div>
            </div>

            <div className="profile-card">
              <h3>Profile Information</h3>
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span>{user.first_name} {user.last_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span>{user.email}</span>
                </div>
                {user.phone_number && (
                  <div className="info-row">
                    <span className="info-label">Phone:</span>
                    <span>{user.phone_number}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Member Since:</span>
                  <span>{memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="events-tab">
            <div className="events-section">
              <h3>Upcoming Events</h3>
              {eventsLoading ? (
                <p>Loading events...</p>
              ) : userEvents.upcoming.length > 0 ? (
                <div className="events-list">
                  {userEvents.upcoming.map((event) => (
                    <div key={event.id} className="event-card">
                      <h4>{event.golf_course}</h4>
                      <p className="event-date">{event.date} at {event.start_time}</p>
                      <p className="event-location">{event.township}, {event.state}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't registered for any upcoming events yet.</p>
                  <button className="browse-events-btn" onClick={() => navigate('/events')}>
                    Browse Events
                  </button>
                </div>
              )}
            </div>

            <div className="events-section">
              <h3>Past Events</h3>
              {eventsLoading ? (
                <p>Loading events...</p>
              ) : userEvents.past.length > 0 ? (
                <div className="events-list">
                  {userEvents.past.map((event) => (
                    <div key={event.id} className="event-card past">
                      <h4>{event.golf_course}</h4>
                      <p className="event-date">{event.date}</p>
                      <p className="event-location">{event.township}, {event.state}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No past events to display.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="settings-section">
              <h3>Update Golf Handicap</h3>
              <form onSubmit={handleUpdateHandicap} className="settings-form">
                <div className="form-group">
                  <label htmlFor="handicap">Golf Handicap</label>
                  <input
                    type="number"
                    id="handicap"
                    value={handicapForm.handicap}
                    onChange={(e) => setHandicapForm({ handicap: e.target.value })}
                    placeholder="e.g., 12"
                    step="0.1"
                  />
                </div>
                <button type="submit" className="submit-btn">Update Handicap</button>
              </form>
            </div>

            <div className="settings-section">
              <h3>Reset Password</h3>
              <form onSubmit={handleResetPassword} className="settings-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
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
                  />
                </div>
                <button type="submit" className="submit-btn">Reset Password</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
