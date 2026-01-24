import React, { useState } from 'react';

const PHOTO_ALBUMS = [
  {
    id: 1,
    title: "Fall Championship 2025",
    date: "2025-10-15",
    coverImage: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800",
    photoCount: 48,
    photos: [
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800",
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
      "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800",
      "https://images.unsplash.com/photo-1600569436985-b50f3882e8ed?w=800"
    ]
  },
  {
    id: 2,
    title: "Summer Invitational 2025",
    date: "2025-07-20",
    coverImage: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
    photoCount: 62,
    photos: [
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
      "https://images.unsplash.com/photo-1592919505780-303950717480?w=800",
      "https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800"
    ]
  },
  {
    id: 3,
    title: "Charity Classic 2025",
    date: "2025-05-18",
    coverImage: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800",
    photoCount: 85,
    photos: [
      "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800",
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800"
    ]
  },
  {
    id: 4,
    title: "Spring Championship 2025",
    date: "2025-04-12",
    coverImage: "https://images.unsplash.com/photo-1600569436985-b50f3882e8ed?w=800",
    photoCount: 54,
    photos: [
      "https://images.unsplash.com/photo-1600569436985-b50f3882e8ed?w=800",
      "https://images.unsplash.com/photo-1592919505780-303950717480?w=800"
    ]
  },
  {
    id: 5,
    title: "Member Social Events",
    date: "2025-03-01",
    coverImage: "https://images.unsplash.com/photo-1592919505780-303950717480?w=800",
    photoCount: 37,
    photos: [
      "https://images.unsplash.com/photo-1592919505780-303950717480?w=800"
    ]
  },
  {
    id: 6,
    title: "Course Highlights",
    date: "2025-01-15",
    coverImage: "https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800",
    photoCount: 29,
    photos: [
      "https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800"
    ]
  }
];

export default function PhotosPage() {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openAlbum = (album) => {
    setSelectedAlbum(album);
  };

  const closeAlbum = () => {
    setSelectedAlbum(null);
    setLightboxIndex(null);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextPhoto = () => {
    if (lightboxIndex < selectedAlbum.photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Photo Gallery</h1>
        <p className="page-subtitle">Memories from SAGA events and tournaments</p>
      </div>

      {!selectedAlbum ? (
        <section className="albums-section">
          <div className="albums-grid">
            {PHOTO_ALBUMS.map(album => (
              <div
                key={album.id}
                className="album-card"
                onClick={() => openAlbum(album)}
              >
                <div className="album-cover" style={{ backgroundImage: `url(${album.coverImage})` }}>
                  <div className="album-overlay">
                    <span className="photo-count">{album.photoCount} Photos</span>
                  </div>
                </div>
                <div className="album-info">
                  <h3>{album.title}</h3>
                  <span className="album-date">{formatDate(album.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="album-view">
          <button className="back-btn" onClick={closeAlbum}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Albums
          </button>
          <h2>{selectedAlbum.title}</h2>
          <p className="album-date-detail">{formatDate(selectedAlbum.date)}</p>

          <div className="photos-grid">
            {selectedAlbum.photos.map((photo, index) => (
              <div
                key={index}
                className="photo-item"
                onClick={() => openLightbox(index)}
              >
                <img src={photo} alt={`${selectedAlbum.title} - ${index + 1}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && selectedAlbum && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="32" height="32">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {lightboxIndex > 0 && (
            <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prevPhoto(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="32" height="32">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          <img
            src={selectedAlbum.photos[lightboxIndex]}
            alt={`Gallery item ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxIndex < selectedAlbum.photos.length - 1 && (
            <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); nextPhoto(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="32" height="32">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          <div className="lightbox-counter">
            {lightboxIndex + 1} / {selectedAlbum.photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
