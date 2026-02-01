import React, { useState, useEffect } from 'react';
import { bannerApi, adminBannerApi } from '../../lib/api';

const BannerManagement = () => {
  const [messages, setMessages] = useState([]);
  const [displayCount, setDisplayCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchBannerMessages();
  }, []);

  const fetchBannerMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bannerApi.getAll();
      setMessages(data.map(msg => ({ id: msg.id, message: msg.message })));
    } catch (err) {
      setError(err.message || 'Failed to load banner messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageChange = (index, value) => {
    const newMessages = [...messages];
    newMessages[index].message = value;
    setMessages(newMessages);
  };

  const handleAddMessage = () => {
    setMessages([...messages, { message: '' }]);
  };

  const handleRemoveMessage = (index) => {
    const newMessages = messages.filter((_, i) => i !== index);
    setMessages(newMessages);
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Filter out empty messages
      const validMessages = messages.filter(msg => msg.message.trim() !== '');

      if (validMessages.length === 0) {
        setError('Please add at least one message');
        return;
      }

      await adminBannerApi.updateMessages(validMessages);
      setSuccess('Banner messages updated successfully');

      // Refresh messages
      await fetchBannerMessages();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update banner messages');
    }
  };

  const handleDisplayCountChange = async (newCount) => {
    try {
      setDisplayCount(newCount);
      await adminBannerApi.updateDisplayCount(newCount);
      setSuccess('Display count updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update display count');
    }
  };

  if (loading) {
    return <div className="loading">Loading banner settings...</div>;
  }

  return (
    <div className="banner-management">
      <h2 className="admin-section-title">Banner Management</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="banner-settings">
        <div className="settings-card">
          <h3>Display Settings</h3>
          <div className="form-group">
            <label>Number of messages to display:</label>
            <div className="display-count-selector">
              {[1, 2, 3, 4, 5].map(count => (
                <button
                  key={count}
                  className={`count-button ${displayCount === count ? 'active' : ''}`}
                  onClick={() => handleDisplayCountChange(count)}
                >
                  {count}
                </button>
              ))}
            </div>
            <small className="help-text">
              Only the first {displayCount} message(s) will be shown on the banner
            </small>
          </div>
        </div>

        <div className="messages-card">
          <h3>Banner Messages</h3>
          <p className="help-text">
            Create and manage messages that appear in the rotating banner at the top of the site
          </p>

          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={index} className="message-item">
                <div className="message-header">
                  <span className="message-number">Message #{index + 1}</span>
                  {index < displayCount && (
                    <span className="badge-active">Active</span>
                  )}
                  <button
                    onClick={() => handleRemoveMessage(index)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={msg.message}
                  onChange={(e) => handleMessageChange(index, e.target.value)}
                  placeholder="Enter banner message..."
                  rows="2"
                  className="message-input"
                />
              </div>
            ))}

            {messages.length === 0 && (
              <div className="empty-state">
                No messages yet. Click "Add Message" to create your first banner message.
              </div>
            )}
          </div>

          <div className="messages-actions">
            <button onClick={handleAddMessage} className="btn-secondary">
              + Add Message
            </button>
            <button onClick={handleSave} className="btn-primary">
              Save All Messages
            </button>
          </div>
        </div>

        <div className="preview-card">
          <h3>Preview</h3>
          <p className="help-text">This is how your banner will look:</p>
          <div className="banner-preview">
            {messages.slice(0, displayCount).map((msg, index) => (
              msg.message.trim() && (
                <div key={index} className="preview-message">
                  {msg.message}
                </div>
              )
            ))}
            {messages.filter(m => m.message.trim()).length === 0 && (
              <div className="preview-message empty">
                No messages to display
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .banner-settings {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-card,
        .messages-card,
        .preview-card {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .settings-card h3,
        .messages-card h3,
        .preview-card h3 {
          margin: 0 0 1rem 0;
          color: #1f2937;
        }

        .help-text {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }

        .display-count-selector {
          display: flex;
          gap: 0.5rem;
          margin: 1rem 0;
        }

        .count-button {
          padding: 0.75rem 1.5rem;
          border: 2px solid #d1d5db;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .count-button:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .count-button.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1rem 0;
        }

        .message-item {
          background: white;
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #d1d5db;
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .message-number {
          font-weight: 600;
          color: #374151;
        }

        .badge-active {
          background: #10b981;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .btn-remove {
          margin-left: auto;
          background: transparent;
          color: #ef4444;
          border: 1px solid #ef4444;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .btn-remove:hover {
          background: #ef4444;
          color: white;
        }

        .message-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
          font-family: inherit;
          resize: vertical;
        }

        .message-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .messages-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .banner-preview {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 6px;
          min-height: 80px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .preview-message {
          text-align: center;
          font-size: 1rem;
          line-height: 1.5;
        }

        .preview-message.empty {
          opacity: 0.6;
          font-style: italic;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .display-count-selector {
            flex-wrap: wrap;
          }

          .messages-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default BannerManagement;
