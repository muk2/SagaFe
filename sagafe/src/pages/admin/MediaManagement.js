import React, { useState, useEffect } from 'react';
import { adminMediaApi } from '../../lib/api';

const MediaManagement = () => {
  const [carouselImages, setCarouselImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    fetchCarouselImages();
  }, []);

  const fetchCarouselImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminMediaApi.getCarouselImages();
      setCarouselImages(data.images || []);
    } catch (err) {
      setError(err.message || 'Failed to load carousel images');
      // Default to empty array if API not implemented
      setCarouselImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, imageType = 'carousel') => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', imageType);

      const response = await adminMediaApi.uploadImage(formData);

      if (imageType === 'carousel') {
        setCarouselImages([...carouselImages, response.url]);
        setSuccess('Image uploaded successfully! Remember to save changes.');
      }

      // Reset file input
      e.target.value = '';
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(newImageUrl);
      setCarouselImages([...carouselImages, newImageUrl]);
      setNewImageUrl('');
      setSuccess('Image URL added! Remember to save changes.');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Please enter a valid URL');
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = carouselImages.filter((_, i) => i !== index);
    setCarouselImages(newImages);
    setSuccess('Image removed. Remember to save changes.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSaveCarousel = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (carouselImages.length === 0) {
        setError('Please add at least one image to the carousel');
        return;
      }

      await adminMediaApi.updateCarousel(carouselImages);
      setSuccess('Carousel images saved successfully!');

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message || 'Failed to save carousel images');
    }
  };

  const moveImage = (index, direction) => {
    const newImages = [...carouselImages];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newImages.length) return;

    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setCarouselImages(newImages);
  };

  if (loading) {
    return <div className="loading">Loading media settings...</div>;
  }

  return (
    <div className="media-management">
      <h2 className="admin-section-title">Media & Image Management</h2>

      <div className="info-banner">
        <strong>Homepage Carousel:</strong> Upload or add images that will rotate on the homepage hero section.
        All images should have the same dimensions (recommended: 1920x800px) for best results.
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="carousel-section">
        <h3>Homepage Carousel Images</h3>
        <p className="section-description">
          Images will rotate automatically on the homepage. Drag to reorder or use the arrow buttons.
        </p>

        <div className="upload-methods">
          <div className="upload-card">
            <h4>Upload Image File</h4>
            <label className="file-upload-button">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'carousel')}
                disabled={uploading}
              />
              {uploading ? 'Uploading...' : 'Choose File'}
            </label>
            <small className="help-text">Max size: 5MB | Formats: JPG, PNG, WebP</small>
          </div>

          <div className="upload-card">
            <h4>Add Image URL</h4>
            <div className="url-input-group">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <button onClick={handleAddImageUrl} className="btn-primary">
                Add
              </button>
            </div>
            <small className="help-text">Use an existing image URL</small>
          </div>
        </div>

        {carouselImages.length === 0 ? (
          <div className="empty-state">
            No carousel images yet. Upload or add an image URL to get started.
          </div>
        ) : (
          <>
            <div className="images-grid">
              {carouselImages.map((imageUrl, index) => (
                <div key={index} className="image-card">
                  <div className="image-preview">
                    <img
                      src={imageUrl}
                      alt={`Carousel ${index + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                      }}
                    />
                    <div className="image-overlay">
                      <div className="order-controls">
                        <button
                          onClick={() => moveImage(index, 'up')}
                          disabled={index === 0}
                          className="btn-icon"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <span className="order-number">#{index + 1}</span>
                        <button
                          onClick={() => moveImage(index, 'down')}
                          disabled={index === carouselImages.length - 1}
                          className="btn-icon"
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="image-info">
                    <div className="image-url" title={imageUrl}>
                      {imageUrl.length > 40 ? imageUrl.substring(0, 40) + '...' : imageUrl}
                    </div>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="save-section">
              <button onClick={handleSaveCarousel} className="btn-primary btn-large">
                Save Carousel Images
              </button>
            </div>
          </>
        )}
      </div>

      <div className="additional-info">
        <h3>Other Site Images</h3>
        <div className="info-card">
          <p>
            To update other site images (logo, background images, event covers, etc.),
            upload them to your server or hosting service and update the image URLs
            in the relevant sections (Events, Photos, Content).
          </p>
          <p>
            For best performance, use optimized images:
          </p>
          <ul>
            <li>Hero/Carousel: 1920x800px (16:9 ratio)</li>
            <li>Event covers: 800x600px</li>
            <li>Photo album covers: 600x400px</li>
            <li>Logo: 200x80px (transparent PNG)</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .info-banner {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 2rem;
        }

        .carousel-section {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
        }

        .carousel-section h3 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
        }

        .section-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .upload-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .upload-card {
          background: white;
          padding: 1.5rem;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .upload-card h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
        }

        .file-upload-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .file-upload-button:hover {
          background: #2563eb;
        }

        .file-upload-button input {
          display: none;
        }

        .url-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .url-input-group input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }

        .help-text {
          display: block;
          color: #6b7280;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .image-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-preview {
          position: relative;
          width: 100%;
          height: 180px;
          background: #f3f4f6;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .image-card:hover .image-overlay {
          opacity: 1;
        }

        .order-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: white;
        }

        .btn-icon {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid white;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .btn-icon:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .btn-icon:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .order-number {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .image-info {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }

        .image-url {
          flex: 1;
          font-size: 0.85rem;
          color: #6b7280;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-remove {
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

        .save-section {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-large {
          padding: 0.75rem 2rem;
          font-size: 1rem;
        }

        .additional-info {
          background: #fefce8;
          border: 1px solid #fde047;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .additional-info h3 {
          margin: 0 0 1rem 0;
          color: #854d0e;
        }

        .info-card {
          color: #713f12;
        }

        .info-card p {
          margin: 0 0 1rem 0;
        }

        .info-card ul {
          margin: 0.5rem 0 0 1.5rem;
        }

        .info-card li {
          margin-bottom: 0.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .upload-methods {
            grid-template-columns: 1fr;
          }

          .images-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MediaManagement;
