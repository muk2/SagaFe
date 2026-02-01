import React, { useState, useEffect } from 'react';
import { adminMediaApi } from '../../lib/api';

function MediaManagement() {
  const [carouselImages, setCarouselImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    loadCarouselImages();
  }, []);

  const loadCarouselImages = async () => {
    try {
      setLoading(true);
      const data = await adminMediaApi.getCarouselImages();
      setCarouselImages(data.images || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setUploading(true);
      const response = await adminMediaApi.uploadImage(file, 'carousel');
      const updatedImages = [...carouselImages, response.image_url];
      await adminMediaApi.updateCarouselImages(updatedImages);
      setCarouselImages(updatedImages);
      setSuccess('Image uploaded successfully');
      setTimeout(() => setSuccess(null), 3000);
      e.target.value = '';
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = async () => {
    if (!newImageUrl.trim()) {
      setError('Please enter an image URL');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const updatedImages = [...carouselImages, newImageUrl];
      await adminMediaApi.updateCarouselImages(updatedImages);
      setCarouselImages(updatedImages);
      setNewImageUrl('');
      setSuccess('Image URL added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveImage = async (index) => {
    if (!window.confirm('Remove this image from the carousel?')) {
      return;
    }

    try {
      const updatedImages = carouselImages.filter((_, i) => i !== index);
      await adminMediaApi.updateCarouselImages(updatedImages);
      setCarouselImages(updatedImages);
      setSuccess('Image removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;

    const updatedImages = [...carouselImages];
    [updatedImages[index - 1], updatedImages[index]] = [updatedImages[index], updatedImages[index - 1]];

    try {
      await adminMediaApi.updateCarouselImages(updatedImages);
      setCarouselImages(updatedImages);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleMoveDown = async (index) => {
    if (index === carouselImages.length - 1) return;

    const updatedImages = [...carouselImages];
    [updatedImages[index], updatedImages[index + 1]] = [updatedImages[index + 1], updatedImages[index]];

    try {
      await adminMediaApi.updateCarouselImages(updatedImages);
      setCarouselImages(updatedImages);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading media...</div>;
  }

  return (
    <div className="admin-section">
      <h2>Media Management</h2>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="media-upload-section">
        <h3>Homepage Carousel Images</h3>
        <p>These images will rotate on the homepage hero section. All images should have the same dimensions for best results.</p>

        <div className="upload-options">
          <div className="upload-option">
            <h4>Upload Image File</h4>
            <label className="btn-upload">
              {uploading ? 'Uploading...' : 'Choose File'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            <small>Max 5MB, JPG/PNG/GIF</small>
          </div>

          <div className="upload-option">
            <h4>Add Image URL</h4>
            <div className="url-input-group">
              <input
                type="url"
                placeholder="https://..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <button className="btn-primary" onClick={handleAddUrl}>
                Add URL
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="carousel-images-grid">
        {carouselImages.map((imageUrl, index) => (
          <div key={index} className="carousel-image-item">
            <img src={imageUrl} alt={`Carousel ${index + 1}`} />
            <div className="carousel-image-overlay">
              <span className="image-order">#{index + 1}</span>
              <div className="image-actions">
                <button
                  className="btn-icon"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  className="btn-icon"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === carouselImages.length - 1}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleRemoveImage(index)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {carouselImages.length === 0 && (
        <div className="admin-empty">
          <p>No carousel images yet. Upload your first image!</p>
        </div>
      )}

      {carouselImages.length > 0 && (
        <div className="carousel-preview">
          <h3>Preview</h3>
          <p>Current carousel will show {carouselImages.length} image(s) in rotation</p>
        </div>
      )}
    </div>
  );
}

export default MediaManagement;
