import React, { useState, useEffect } from 'react';
import { bannerApi, adminBannerApi } from '../../lib/api';

function BannerManagement() {
  const [messages, setMessages] = useState([]);
  const [displayCount, setDisplayCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadBannerData();
  }, []);

  const loadBannerData = async () => {
    try {
      setLoading(true);
      const data = await bannerApi.getAll();
      setMessages(data.messages || []);
      setDisplayCount(data.display_count || 3);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMessage = () => {
    setMessages([...messages, { text: '', active: true }]);
    setEditingIndex(messages.length);
    setEditText('');
  };

  const handleEditMessage = (index) => {
    setEditingIndex(index);
    setEditText(messages[index].text);
  };

  const handleSaveMessage = async () => {
    if (editText.trim() === '') {
      setError('Message cannot be empty');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const updatedMessages = [...messages];
    updatedMessages[editingIndex] = { text: editText, active: true };
    setMessages(updatedMessages);
    setEditingIndex(null);
    setEditText('');

    try {
      await adminBannerApi.updateMessages(updatedMessages);
      setSuccess('Messages updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteMessage = async (index) => {
    const updatedMessages = messages.filter((_, i) => i !== index);
    setMessages(updatedMessages);

    try {
      await adminBannerApi.updateMessages(updatedMessages);
      setSuccess('Message deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDisplayCountChange = async (newCount) => {
    setDisplayCount(newCount);

    try {
      await adminBannerApi.updateSettings({ display_count: newCount });
      setSuccess('Display count updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading banner settings...</div>;
  }

  return (
    <div className="admin-section">
      <h2>Banner Management</h2>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="admin-form">
        <div className="form-group">
          <label>Number of Messages to Display</label>
          <select
            value={displayCount}
            onChange={(e) => handleDisplayCountChange(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-section-header">
        <h3>Banner Messages</h3>
        <button className="btn-primary" onClick={handleAddMessage}>
          + Add Message
        </button>
      </div>

      <div className="banner-messages-list">
        {messages.map((msg, index) => (
          <div key={index} className="banner-message-item">
            {editingIndex === index ? (
              <div className="banner-message-edit">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Enter banner message"
                  autoFocus
                />
                <div className="banner-message-actions">
                  <button className="btn-primary" onClick={handleSaveMessage}>
                    Save
                  </button>
                  <button className="btn-secondary" onClick={() => setEditingIndex(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="banner-message-content">
                  <span className="banner-message-number">{index + 1}</span>
                  <span className="banner-message-text">{msg.text || '(Empty message)'}</span>
                  {index < displayCount && <span className="badge-active">Active</span>}
                </div>
                <div className="banner-message-actions">
                  <button className="btn-edit" onClick={() => handleEditMessage(index)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteMessage(index)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="admin-empty">
          <p>No banner messages yet. Add your first message!</p>
        </div>
      )}

      <div className="banner-preview">
        <h3>Preview</h3>
        <div className="preview-banner">
          {messages.slice(0, displayCount).map((msg, index) => (
            <div key={index} className="preview-banner-item">
              {msg.text || '(Empty message)'}
            </div>
          ))}
          {messages.length === 0 && <div className="preview-empty">No messages to display</div>}
        </div>
      </div>
    </div>
  );
}

export default BannerManagement;
