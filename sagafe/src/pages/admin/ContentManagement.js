import React, { useState, useEffect } from 'react';
import { adminContentApi } from '../../lib/api';

const ContentManagement = () => {
  const [content, setContent] = useState({
    about_heading: '',
    about_description: '',
    events_heading: '',
    events_description: '',
    photos_heading: '',
    photos_description: '',
    contact_heading: '',
    contact_description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminContentApi.getContent();
      setContent(data);
    } catch (err) {
      setError(err.message || 'Failed to load content');
      // If API not implemented, use default empty state
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContent({ ...content, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await adminContentApi.updateContent(content);
      setSuccess('Content updated successfully! Changes will appear on the website.');

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message || 'Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading content...</div>;
  }

  return (
    <div className="content-management">
      <h2 className="admin-section-title">Content & Prompts Management</h2>

      <div className="info-banner">
        <strong>Manage Site Content:</strong> Update headings, descriptions, and prompts that appear throughout the website.
        These changes will be reflected immediately on the live site.
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit} className="content-form">
        <div className="content-section">
          <h3 className="section-heading">About Page Content</h3>
          <div className="form-group">
            <label>About Page Heading</label>
            <input
              type="text"
              name="about_heading"
              value={content.about_heading}
              onChange={handleInputChange}
              placeholder="e.g., About Our Golf Club"
            />
          </div>
          <div className="form-group">
            <label>About Page Description</label>
            <textarea
              name="about_description"
              value={content.about_description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter the main description for the about page..."
            />
          </div>
        </div>

        <div className="content-section">
          <h3 className="section-heading">Events Page Content</h3>
          <div className="form-group">
            <label>Events Page Heading</label>
            <input
              type="text"
              name="events_heading"
              value={content.events_heading}
              onChange={handleInputChange}
              placeholder="e.g., Upcoming Events"
            />
          </div>
          <div className="form-group">
            <label>Events Page Description</label>
            <textarea
              name="events_description"
              value={content.events_description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter a description for the events page..."
            />
          </div>
        </div>

        <div className="content-section">
          <h3 className="section-heading">Photos Page Content</h3>
          <div className="form-group">
            <label>Photos Page Heading</label>
            <input
              type="text"
              name="photos_heading"
              value={content.photos_heading}
              onChange={handleInputChange}
              placeholder="e.g., Event Gallery"
            />
          </div>
          <div className="form-group">
            <label>Photos Page Description</label>
            <textarea
              name="photos_description"
              value={content.photos_description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter a description for the photos page..."
            />
          </div>
        </div>

        <div className="content-section">
          <h3 className="section-heading">Contact Page Content</h3>
          <div className="form-group">
            <label>Contact Page Heading</label>
            <input
              type="text"
              name="contact_heading"
              value={content.contact_heading}
              onChange={handleInputChange}
              placeholder="e.g., Get In Touch"
            />
          </div>
          <div className="form-group">
            <label>Contact Page Description</label>
            <textarea
              name="contact_description"
              value={content.contact_description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter a description for the contact page..."
            />
          </div>
        </div>

        <div className="form-actions-sticky">
          <button type="submit" disabled={saving} className="btn-primary btn-large">
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .info-banner {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 2rem;
        }

        .content-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .content-section {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .section-heading {
          margin: 0 0 1.5rem 0;
          color: #1f2937;
          font-size: 1.2rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-actions-sticky {
          position: sticky;
          bottom: 0;
          background: white;
          padding: 1.5rem 0;
          border-top: 2px solid #e5e7eb;
          margin-top: 2rem;
          display: flex;
          justify-content: flex-end;
        }

        .btn-large {
          padding: 0.75rem 2rem;
          font-size: 1rem;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .content-section {
            padding: 1rem;
          }

          .form-actions-sticky {
            padding: 1rem 0;
          }

          .btn-large {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ContentManagement;
