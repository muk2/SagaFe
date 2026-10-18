import React, { useState, useEffect, useRef } from 'react';
import { adminNewsApi, adminMediaApi } from '../../lib/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const NewsManagement = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    site_name: '',
    thumbnail_url: '',
    description: '',
    display_order: 0,
  });

  useEffect(() => {
    fetchNewsItems();
  }, []);

  const fetchNewsItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminNewsApi.getAll();
      setNewsItems(data);
    } catch (err) {
      setError(err.message || 'Failed to load news items');
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_URL}${url}`;
    return `${API_URL}/${url}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFetchMetadata = async () => {
    if (!formData.url) {
      setError('Enter the article URL first');
      return;
    }

    try {
      setFetchingMetadata(true);
      setError(null);
      const meta = await adminNewsApi.fetchMetadata(formData.url);
      setFormData(prev => ({
        ...prev,
        title: prev.title || meta.title || prev.title,
        description: meta.description || prev.description,
        site_name: prev.site_name || meta.site_name || prev.site_name,
        thumbnail_url: prev.thumbnail_url || meta.image_url || prev.thumbnail_url,
      }));
      setSuccess('Fetched details from the page — review before saving');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Could not fetch details from that URL. Fill the fields in manually.');
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    try {
      setUploadingThumbnail(true);
      setError(null);

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await adminMediaApi.uploadImage(formDataUpload);
      setFormData(prev => ({ ...prev, thumbnail_url: response.url }));
      setSuccess('Thumbnail uploaded successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      if (!formData.thumbnail_url) {
        setError('Please provide a thumbnail (fetch from the URL or upload one)');
        return;
      }

      const dataToSend = {
        title: formData.title,
        url: formData.url,
        site_name: formData.site_name || null,
        thumbnail_url: formData.thumbnail_url,
        description: formData.description || null,
        display_order: editingItem
          ? (parseInt(formData.display_order) || 0)
          : newsItems.length,
      };

      if (editingItem) {
        await adminNewsApi.update(editingItem.id, dataToSend);
        setSuccess('News item updated successfully');
      } else {
        await adminNewsApi.create(dataToSend);
        setSuccess('News item added successfully');
      }

      await fetchNewsItems();
      handleCancel();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save news item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      url: item.url,
      site_name: item.site_name || '',
      thumbnail_url: item.thumbnail_url || '',
      description: item.description || '',
      display_order: item.display_order || 0,
    });
    setShowForm(true);

    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const handleDelete = async (itemId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await adminNewsApi.delete(itemId);
      setNewsItems(newsItems.filter(n => n.id !== itemId));
      setSuccess('News item deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete news item');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      title: '',
      url: '',
      site_name: '',
      thumbnail_url: '',
      description: '',
      display_order: 0,
    });
  };

  const moveUp = async (item, index) => {
    if (index === 0) return;

    try {
      const prevItem = newsItems[index - 1];
      await adminNewsApi.update(item.id, { display_order: prevItem.display_order });
      await adminNewsApi.update(prevItem.id, { display_order: item.display_order });
      await fetchNewsItems();
      setSuccess('News order updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to reorder news items');
      console.error(err);
    }
  };

  const moveDown = async (item, index) => {
    if (index === newsItems.length - 1) return;

    try {
      const nextItem = newsItems[index + 1];
      await adminNewsApi.update(item.id, { display_order: nextItem.display_order });
      await adminNewsApi.update(nextItem.id, { display_order: item.display_order });
      await fetchNewsItems();
      setSuccess('News order updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to reorder news items');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading news items...</div>;
  }

  return (
    <div className="news-management">
      <div className="section-header">
        <h2 className="admin-section-title">News Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add News Item
          </button>
        )}
      </div>

      <div className="info-banner">
        <strong>📰 Press Coverage:</strong> Paste the article link and click "Fetch Details" to
        pull in a title, description and image automatically — then edit anything before saving.
        These appear on the homepage News section, newest first by order below.
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {showForm && (
        <div className="news-form-card" ref={formRef}>
          <h3>{editingItem ? 'Edit News Item' : 'Add News Item'}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Article URL *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/article"
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleFetchMetadata}
                  disabled={fetchingMetadata || !formData.url}
                >
                  {fetchingMetadata ? 'Fetching...' : 'Fetch Details'}
                </button>
              </div>
              <small className="help-text">Clicking the title on the homepage sends readers here</small>
            </div>

            <div className="form-group">
              <label>News Site Name</label>
              <input
                type="text"
                name="site_name"
                value={formData.site_name}
                onChange={handleInputChange}
                placeholder="e.g., NJ.com"
              />
              <small className="help-text">"Fetch Details" fills this in from the page, or type it in yourself</small>
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., SAGA Golf featured in NJ.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="A brief description shown under the title"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Thumbnail (news site logo) *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                disabled={uploadingThumbnail}
              />
              {uploadingThumbnail && <p style={{ color: '#3b82f6', marginTop: '0.5rem' }}>Uploading thumbnail...</p>}
              {formData.thumbnail_url && (
                <div className="logo-preview">
                  <img
                    src={getFullImageUrl(formData.thumbnail_url)}
                    alt="Thumbnail preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/200x100?text=Thumbnail';
                    }}
                  />
                </div>
              )}
              <small className="help-text">
                "Fetch Details" will pull an image from the article automatically, or upload one manually (max 5MB)
              </small>
            </div>

            <div className="form-actions" style={{ display: "flex", gap: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={!formData.thumbnail_url || uploadingThumbnail}>
                {editingItem ? 'Update News Item' : 'Add News Item'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {newsItems.length === 0 && !showForm ? (
        <div className="empty-state">
          No news items added yet. Click "Add News Item" to get started.
        </div>
      ) : (
        <div className="news-items-list">
          {newsItems.map((item, index) => (
            <div key={item.id} className="news-admin-item">
              <div className="news-thumb-container">
                <img
                  src={getFullImageUrl(item.thumbnail_url)}
                  alt={item.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200x100?text=Thumbnail';
                  }}
                />
              </div>
              <div className="news-admin-info">
                {item.site_name && <span className="news-admin-site">{item.site_name}</span>}
                <h4>{item.title}</h4>
                {item.description && <p className="news-admin-description">{item.description}</p>}
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-admin-url">
                  {item.url}
                </a>
                <span className="news-admin-order">Order: {item.display_order}</span>
              </div>
              <div className="news-admin-controls">
                <div className="order-buttons">
                  <button onClick={() => moveUp(item, index)} disabled={index === 0} className="btn-icon" title="Move up">
                    ↑
                  </button>
                  <button onClick={() => moveDown(item, index)} disabled={index === newsItems.length - 1} className="btn-icon" title="Move down">
                    ↓
                  </button>
                </div>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(item)} className="btn-secondary btn-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id, item.title)} className="btn-danger btn-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .info-banner {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .news-form-card {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
          scroll-margin-top: 2rem;
        }

        .news-form-card h3 {
          margin: 0 0 1.5rem 0;
        }

        .news-form-card textarea {
          width: 100%;
          font-family: inherit;
          resize: vertical;
        }

        .logo-preview {
          margin-top: 0.75rem;
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
        }

        .logo-preview img {
          max-width: 200px;
          max-height: 100px;
          object-fit: contain;
        }

        .news-items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .news-admin-item {
          display: grid;
          grid-template-columns: 160px 1fr auto;
          gap: 1.5rem;
          align-items: center;
          background: white;
          padding: 1.25rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: box-shadow 0.2s;
        }

        .news-admin-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .news-thumb-container {
          width: 160px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 0.5rem;
          overflow: hidden;
        }

        .news-thumb-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
        }

        .news-admin-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }

        .news-admin-info h4 {
          margin: 0;
          font-size: 1.1rem;
          color: #1f2937;
        }

        .news-admin-site {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #0d9488;
        }

        .news-admin-description {
          margin: 0;
          font-size: 0.9rem;
          color: #4b5563;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .news-admin-url {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.85rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .news-admin-url:hover {
          text-decoration: underline;
        }

        .news-admin-order {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .news-admin-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .order-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .btn-icon:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #0d9488;
          color: #0d9488;
        }

        .btn-icon:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .news-admin-item {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .news-thumb-container {
            width: 100%;
          }

          .news-admin-controls {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }

          .action-buttons {
            width: 100%;
          }

          .btn-sm {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NewsManagement;
