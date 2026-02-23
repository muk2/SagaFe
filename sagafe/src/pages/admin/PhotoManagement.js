import React, { useState, useEffect } from 'react';
import { adminPhotosApi, adminMediaApi } from '../../lib/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const PhotoManagement = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    coverImage: '',
    googleDriveLink: ''
  });

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminPhotosApi.getAll();
      // Handle both response formats
      setAlbums(data.albums || data);
    } catch (err) {
      setError(err.message || 'Failed to load photo albums');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Selected file:', file.name, file.type, file.size); // ✅ Debug log

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file...');

      const response = await adminMediaApi.uploadImage(formData);
      
      console.log('Upload response:', response);

      setFormData(prev => ({ ...prev, coverImage: response.url }));
      setSuccess('Image uploaded successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      if (!formData.coverImage) {
        setError('Please provide a cover image URL');
        return;
      }

      const dataToSend = {
        title: formData.title,
        date: formData.date,
        coverImage: formData.coverImage,
        googleDriveLink: formData.googleDriveLink,
      };

      if (editingAlbum) {
        await adminPhotosApi.update(editingAlbum.id, dataToSend);
        setSuccess('Album updated successfully');
      } else {
        await adminPhotosApi.create(dataToSend);
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
    
    // ✅ Convert date to YYYY-MM-DD format for date input
    const dateValue = album.date 
      ? (typeof album.date === 'string' 
          ? album.date.split('T')[0]  // If it's ISO string, take date part
          : new Date(album.date).toISOString().split('T')[0])  // Convert to ISO and take date part
      : '';
    
    setFormData({
      title: album.title,
      date: dateValue,
      coverImage: album.coverImage || album.cover_image || '',
      googleDriveLink: album.googleDriveLink || album.google_drive_link || '',
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
      googleDriveLink: ''
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
        <strong>📸 How it works:</strong> Create an album by:
        <ol style={{ marginTop: '0.5rem', marginLeft: '1.5rem', marginBottom: '0' }}>
          <li>Providing an album title and date</li>
          <li>Adding the Google Photos/Drive link to the full album</li>
          <li>Uploading a cover image from your computer</li>
        </ol>
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
              <label>Google Photos or Drive Link *</label>
              <input
                type="url"
                name="googleDriveLink"
                value={formData.googleDriveLink}
                onChange={handleInputChange}
                placeholder="https://photos.app.goo.gl/... or https://drive.google.com/..."
                required
              />
              <small className="help-text">
                Link to your Google Photos album or Google Drive folder
              </small>
            </div>


            <div className="form-group">
              <label>Cover Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && (
                <p style={{ color: '#3b82f6', marginTop: '0.5rem' }}>
                  Uploading image...
                </p>
              )}
              {formData.coverImage && (
                <div className="cover-preview">
                  <img 
                    src={formData.coverImage.startsWith('/') 
                      ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${formData.coverImage}`
                      : formData.coverImage
                    }
                    alt="Cover preview"
                    onError={(e) => {
                      console.error('Image load error:', e.target.src);
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = 'https://via.placeholder.com/200x150?text=Image+Not+Found';
                    }}
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      display: 'block'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                    className="btn-secondary btn-sm"
                    style={{ marginTop: '0.5rem' }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
              <small className="help-text">
                Upload a cover image from your computer (max 5MB)
              </small>
            </div>


            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={!formData.coverImage || uploadingImage}
              >
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
                src={
                  (album.coverImage || album.cover_image).startsWith('/')
                    ? `${API_URL}${album.coverImage || album.cover_image}`
                    : (album.coverImage || album.cover_image)
                }
                  alt={album.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://lh3.googleusercontent.com/pw/AP1GczMDhxeTP_i_sF-nhrQNTZzDwiLR4dFbpNJgPVGuRRMMS_NJFc-0TvXoWMaRhIv8OZyeysQpdQJJrEBEoL7991GlmOOaaiMI7boiBImpg2gWb_MZnia0NXXRGtLsh0nlIzc9nu4j6XyQYemGYiA9FugrcQ=w2338-h1556-s-no-gm?authuser=0';
                  }}
                />
              </div>
              <div className="album-info">
                <h3>{album.title}</h3>
                <p className="album-date">{new Date(album.date).toLocaleDateString()}</p>
                {album.googleDriveLink || album.google_drive_link ? (
                  
                    <a href={album.googleDriveLink || album.google_drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="drive-link"
                  >
                    View Album →
                  </a>
                ) : (
                  <span className="no-link">No album link</span>
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

        .info-banner ol {
          margin: 0;
          padding-left: 1.5rem;
        }

        .info-banner li {
          margin: 0.25rem 0;
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
          display: block;
        }

        .cover-preview {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
        }

        .cover-preview img {
          max-width: 200px;
          max-height: 150px;
          object-fit: cover;
          border-radius: 4px;
          display: inline-block;
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