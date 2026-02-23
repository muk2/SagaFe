import React, { useState, useEffect } from 'react';
import { photosApi } from '../lib/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function PhotosPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const data = await photosApi.getAll();
      setAlbums(data.albums || data);
    } catch (err) {
      console.error('Failed to fetch albums:', err);
      setError('Unable to load photo albums');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openAlbum = (album) => {
    if (album.googleDriveLink || album.google_drive_link) {
      window.open(album.googleDriveLink || album.google_drive_link, '_blank');
    }
  };

  const getImageUrl = (album) => {
    const coverImage = album.coverImage || album.cover_image;
    if (coverImage && coverImage.startsWith('/')) {
      return `${API_URL}${coverImage}`;
    }
    return coverImage;
  };

  

  if (error) {
    return (
      <div className="photos-page">
        <div className="photos-hero">
          <div className="hero-content-wrapper">
            <h1 className="photos-title">Photo Gallery</h1>
            <p className="photos-subtitle">Capturing moments from our tournaments and events</p>
          </div>
        </div>
        <div className="photos-container">
          <div className="error-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="64" height="64">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="photos-page">
      {/* Hero Section */}
      <div className="photos-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content-wrapper">
          <h1 className="photos-title">Photo Gallery</h1>
          <p className="photos-subtitle">Capturing Moments From Saga Tournaments and Events</p>
          {albums.length > 0 && (
            <div className="album-count">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {albums.length} {albums.length === 1 ? 'Album' : 'Albums'}
            </div>
          )}
        </div>
      </div>

      <div className="photos-container">
        {albums.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" width="80" height="80">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3>No albums yet</h3>
            <p>Check back soon for photos from our latest events!</p>
          </div>
        ) : (
          <div className="albums-grid-modern">
            {albums.map(album => (
              <div
                key={album.id}
                className="album-card-modern"
                onClick={() => openAlbum(album)}
              >
                <div className="album-image-wrapper">
                  <img 
                    src={getImageUrl(album)}
                    alt={album.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/600x400/0d9488/ffffff?text=SAGA+Golf';
                    }}
                    className="album-image"
                  />
                  <div className="album-overlay-gradient"></div>
                  
                  {/* Photo Count Badge */}
                  {(album.photoCount || album.photo_count) > 0 && (
                    <div className="photo-count-badge">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                      </svg>
                      {album.photoCount || album.photo_count}
                    </div>
                  )}

                  {/* View Button on Hover */}
                  <div className="album-hover-action">
                    <button className="view-album-btn">
                      <span>View Album</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="album-info-modern">
                  <h3 className="album-title-modern">{album.title}</h3>
                  <div className="album-date-modern">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {formatDate(album.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .photos-page {
          min-height: 100vh;
          background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
        }

        /* Hero Section */
        .photos-hero {
          position: relative;
          background: #2960A1;
          padding: 5rem 2rem 3rem;
          text-align: center;
          overflow: hidden;
        }

        .photos-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect fill="rgba(255,255,255,0.05)" width="50" height="50"/><rect fill="rgba(255,255,255,0.05)" x="50" y="50" width="50" height="50"/></svg>');
          opacity: 0.3;
        }

        .hero-content-wrapper {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
        }

        .photos-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin: 0 0 1rem 0;
          letter-spacing: -0.02em;
        }

        .photos-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 1.5rem 0;
        }

        .album-count {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
        }

        /* Container */
        .photos-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        /* Loading State */
        .loading-spinner {
          text-align: center;
          padding: 4rem 2rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-top-color: #0d9488;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Empty/Error States */
        .empty-state-modern,
        .error-state {
          text-align: center;
          padding: 5rem 2rem;
        }

        .empty-icon {
          color: #cbd5e1;
          margin-bottom: 1.5rem;
        }

        .empty-state-modern h3,
        .error-state p:first-child {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .empty-state-modern p,
        .error-state p:last-child {
          font-size: 1.1rem;
          color: #6b7280;
          margin: 0;
        }

        .error-state svg {
          color: #ef4444;
          margin-bottom: 1rem;
        }

        /* Albums Grid */
        .albums-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        /* Album Card */
        .album-card-modern {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: 1px solid #f1f5f9;
        }

        .album-card-modern:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .album-image-wrapper {
          position: relative;
          width: 100%;
          height: 280px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .album-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .album-card-modern:hover .album-image {
          transform: scale(1.08);
        }

        .album-overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .album-card-modern:hover .album-overlay-gradient {
          opacity: 1;
        }

        /* Photo Count Badge */
        .photo-count-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          color: white;
          padding: 0.5rem 0.875rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          z-index: 2;
        }

        /* View Album Button */
        .album-hover-action {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 3;
        }

        .album-card-modern:hover .album-hover-action {
          opacity: 1;
        }

        .view-album-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          color: #0d9488;
          border: none;
          padding: 0.875rem 1.75rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        .view-album-btn:hover {
          background: #0d9488;
          color: white;
          transform: scale(1.05);
        }

        /* Album Info */
        .album-info-modern {
          padding: 1.5rem;
        }

        .album-title-modern {
          font-size: 1.18rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
          line-height: 1.4;
        }

        .album-date-modern {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .album-date-modern svg {
          color: #0d9488;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .photos-title {
            font-size: 2rem;
          }

          .photos-subtitle {
            font-size: 1rem;
          }

          .photos-hero {
            padding: 3rem 1rem 2rem;
          }

          .photos-container {
            padding: 2rem 1rem;
          }

          .albums-grid-modern {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .album-image-wrapper {
            height: 220px;
          }
        }
      `}</style>
    </div>
  );
}