import React, { useState, useEffect } from 'react';
import { adminPhotosApi } from '../../lib/api';

const PhotoManagement = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    coverImage: '',
    googleDriveLink: '',
    photoCount: 0,
  });

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminPhotosApi.getAll();
      setAlbums(data);
    } catch (err) {
      setError(err.message || 'Failed to load photo albums');
      // If API not implemented, use empty state
      setAlbums([]);
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

      if (editingAlbum) {
        await adminPhotosApi.update(editingAlbum.id, formData);
        setSuccess('Album updated successfully');
      } else {
        await adminPhotosApi.create(formData);
        setSuccess('Album created successfully');
      }

      await fetchAlbums();
      handleCancel();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save album');
    }
  };

  const handleEdit = (album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title,
      date: album.date,
      coverImage: album.coverImage || album.cover_image,
      googleDriveLink: album.googleDriveLink || album.google_drive_link || '',
      photoCount: album.photoCount || album.photo_count || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (albumId, albumTitle) => {
    if (!window.confirm(`Are you sure you want to delete the album "${albumTitle}"?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await adminPhotosApi.delete(albumId);
      setAlbums(albums.filter(album => album.id !== albumId));
      setSuccess('Album deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete album');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAlbum(null);
    setFormData({
      title: '',
      date: '',
      coverImage: '',
      googleDriveLink: '',
      photoCount: 0,
    });
  };

  if (loading) {
    return <div className="loading">Loading photo albums...</div>;
  }

  return (
    <div className="photo-management">
      <div className="section-header">
        <h2 className="admin-section-title">Photo Album Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add New Album
          </button>
        )}
      </div>

      <div className="info-banner">
        <strong>Note:</strong> Albums will link to Google Drive instead of displaying photos directly on the site.
        When users click on an album cover, they'll be redirected to the Google Drive link you provide.
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {showForm && (
        <div className="album-form-card">
          <h3>{editingAlbum ? 'Edit Album' : 'Create New Album'}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Album Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Summer Tournament 2024"
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

            <div className="form-group">
              <label>Cover Image URL *</label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleInputChange}
                placeholder="https://example.com/cover-image.jpg"
                required
              />
              <small className="help-text">
                URL to the cover image that will be displayed on the photos page
              </small>
            </div>

            <div className="form-group">
              <label>Google Drive Link *</label>
              <input
                type="url"
                name="googleDriveLink"
                value={formData.googleDriveLink}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/drive/folders/..."
                required
              />
              <small className="help-text">
                Link to the Google Drive folder containing all photos for this album
              </small>
            </div>

            <div className="form-group">
              <label>Photo Count</label>
              <input
                type="number"
                name="photoCount"
                value={formData.photoCount}
                onChange={handleInputChange}
                min="0"
                placeholder="Number of photos in album"
              />
              <small className="help-text">
                Optional: Display how many photos are in the album
              </small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingAlbum ? 'Update Album' : 'Create Album'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {albums.length === 0 && !showForm ? (
        <div className="empty-state">
          No photo albums created yet. Click "Add New Album" to create your first album.
        </div>
      ) : (
        <div className="albums-grid">
          {albums.map((album) => (
            <div key={album.id} className="album-card">
              <div className="album-cover">
                <img
                  src={album.coverImage || album.cover_image}
                  alt={album.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                {(album.photoCount || album.photo_count) > 0 && (
                  <div className="photo-count">
                    {album.photoCount || album.photo_count} photos
                  </div>
                )}
              </div>
              <div className="album-info">
                <h3>{album.title}</h3>
                <p className="album-date">{new Date(album.date).toLocaleDateString()}</p>
                {album.googleDriveLink || album.google_drive_link ? (
                  <a
                    href={album.googleDriveLink || album.google_drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="drive-link"
                  >
                    View on Google Drive →
                  </a>
                ) : (
                  <span className="no-link">No Google Drive link</span>
                )}
              </div>
              <div className="album-actions">
                <button onClick={() => handleEdit(album)} className="btn-secondary btn-sm">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(album.id, album.title)}
                  className="btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
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
        }

        .album-form-card {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
        }

        .album-form-card h3 {
          margin: 0 0 1.5rem 0;
        }

        .help-text {
          color: #6b7280;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .albums-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .album-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .album-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .album-cover {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .album-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-count {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .album-info {
          padding: 1rem;
        }

        .album-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          color: #1f2937;
        }

        .album-date {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0 0 0.5rem 0;
        }

        .drive-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
        }

        .drive-link:hover {
          text-decoration: underline;
        }

        .no-link {
          color: #9ca3af;
          font-size: 0.9rem;
          font-style: italic;
        }

        .album-actions {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-sm {
          flex: 1;
          padding: 0.5rem;
          font-size: 0.85rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .albums-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PhotoManagement;
