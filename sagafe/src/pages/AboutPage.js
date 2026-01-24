import React from 'react';

export default function AboutPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>About SAGA</h1>
        <p className="page-subtitle">South Asian Golf Association of New Jersey</p>
      </div>

      <section className="content-section">
        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3>Our Community</h3>
            <p>SAGA brings together golf enthusiasts from the South Asian community across New Jersey, fostering friendships and healthy competition on the greens.</p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
              </svg>
            </div>
            <h3>Tournaments</h3>
            <p>We organize regular tournaments throughout the season, from casual weekend outings to competitive championship events for players of all skill levels.</p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h3>Giving Back</h3>
            <p>As a non-profit organization, we're committed to giving back to the community through charity events and supporting youth golf programs.</p>
          </div>
        </div>
      </section>

      <section className="content-section stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">150+</span>
            <span className="stat-label">Active Members</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">Partner Courses</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24</span>
            <span className="stat-label">Events Per Year</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">2018</span>
            <span className="stat-label">Founded</span>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h2>Our Mission</h2>
        <p className="mission-text">
          To promote the game of golf within the South Asian community of New Jersey,
          creating opportunities for networking, friendship, and healthy competition
          while giving back to our local communities through charitable initiatives.
        </p>
      </section>
    </div>
  );
}
