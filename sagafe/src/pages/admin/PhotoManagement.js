import React, { useState, useEffect } from 'react';
import { adminPhotosApi } from '../../lib/api';

function PhotoManagement() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    cover_image_url: '',
    google_drive_url: '',
    photo_count: 0,
  });

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const data = await adminPhotosApi.getAll();
      setAlbums(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAlbum) {
        await adminPhotosApi.update(editingAlbum.id, formData);
        setSuccess('Album updated successfully');
      } else {
        await adminPhotosApi.create(formData);
        setSuccess('Album created successfully');
      }

      setTimeout(() => setSuccess(null), 3000);
      resetForm();
      loadAlbums();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title,
      cover_image_url: album.cover_image_url || '',
      google_drive_url: album.google_drive_url || '',
      photo_count: album.photo_count || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (albumId, albumTitle) => {
    if (!window.confirm(`Delete album "${albumTitle}"?`)) {
      return;
    }

    try {
      await adminPhotosApi.delete(albumId);
      setSuccess('Album deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      loadAlbums();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      cover_image_url: '',
      google_drive_url: '',
      photo_count: 0,
    });
    setEditingAlbum(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="admin-loading">Loading photo albums...</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Photo Album Management</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Album'}
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <h3>{editingAlbum ? 'Edit Album' : 'Create New Album'}</h3>

          <div className="form-group">
            <label>Album Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Cover Image URL</label>
            <input
              type="url"
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleInputChange}
              placeholder="https://..."
            />
            <small>Enter a URL for the cover image</small>
          </div>

          <div className="form-group">
            <label>Google Drive Album URL *</label>
            <input
              type="url"
              name="google_drive_url"
              value={formData.google_drive_url}
              onChange={handleInputChange}
              placeholder="https://drive.google.com/..."
              required
            />
            <small>This link will open when users click on the album</small>
          </div>

          <div className="form-group">
            <label>Photo Count</label>
            <input
              type="number"
              name="photo_count"
              value={formData.photo_count}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingAlbum ? 'Update Album' : 'Create Album'}
            </button>
          </div>
        </form>
      )}

      <div className="photo-albums-grid">
        {albums.map(album => (
          <div key={album.id} className="photo-album-card">
            {album.cover_image_url && (
              <img
                src={album.cover_image_url}
                alt={album.title}
                className="album-cover"
              />
            )}
            {!album.cover_image_url && (
              <div className="album-cover-placeholder">No image</div>
            )}
            <div className="album-info">
              <h4>{album.title}</h4>
              {album.photo_count > 0 && (
                <p className="album-count">{album.photo_count} photos</p>
              )}
              {album.google_drive_url && (
                <a
                  href={album.google_drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="album-link"
                >
                  View on Google Drive →
                </a>
              )}
            </div>
            <div className="album-actions">
              <button className="btn-edit" onClick={() => handleEdit(album)}>
                Edit
              </button>
              <button className="btn-delete" onClick={() => handleDelete(album.id, album.title)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {albums.length === 0 && !showForm && (
        <div className="admin-empty">
          <p>No photo albums yet. Create your first album!</p>
        </div>
      )}
    </div>
  );
}

export default PhotoManagement;
