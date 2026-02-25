import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className='about-page'>
      <div className="about-hero">
        <div className="hero-content-wrapper">
          <div className="hero-overlay"></div>
          <div className="hero-content-wrapper"></div>
          <h1 className="about-title">About SAGA</h1>
          <p className="about-subtitle">South Asian Golf Association of New Jersey</p>
        </div>
      </div>
      
      <div className="page-container">
        {/* About Us Section */}
        <section className="content-section about-us-section">
          <h2>About Us</h2>
          <div className="about-text">
            <p>
              The <strong>South Asian Golf Association (SAGA)</strong> was founded to bring South Asian golfers together 
              from around the world and grow the game within our community. What began as a shared passion 
              has evolved into a global network built on competition, connection, and respect for the sport.
            </p>
            <p>
              SAGA is also part of the <strong>SAGA Foundation</strong>: a 501(c)(3) nonprofit organization 
              dedicated to promoting health, life skills, and inclusion through golf, with a special focus 
              on youth and women. Our work includes organizing tournaments and leagues, hosting training 
              clinics and camps, and awarding college scholarships to support the next generation of 
              student golfers.
            </p>
          </div>

          <div className="core-values">
            <h3>Our Core Values</h3>
            <div className="values-grid">
              <div className="value-item">
                <div className="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4>Integrity</h4>
              </div>
              <div className="value-item">
                <div className="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <h4>Camaraderie</h4>
              </div>
              <div className="value-item">
                <div className="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <h4>Golf Etiquette</h4>
              </div>
              <div className="value-item">
                <div className="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                  </svg>
                </div>
                <h4>Competition</h4>
              </div>
            </div>
          </div>

          <p className="closing-statement">
            SAGA is more than a golf association—it's a community brought together by the love of the game.
          </p>
        </section>

        {/* Feature Cards Section */}
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

            <div 
              className="about-card clickable" 
              onClick={() => navigate('/saga-tour')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/saga-tour')}
            >
              <div className="about-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <h3>SAGA Tour <span className="arrow">→</span></h3>
              <p>Join our competitive season-long tour featuring championship events, skill-based flights, and year-end rewards for top performers across all levels.</p>
            </div>

            <div className="about-card">
              <div className="about-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3>Giving Back</h3>
              <p>As a non-profit organization, we're committed to giving back to the community through charity events, scholarships, and supporting youth golf programs.</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="content-section stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">75+</span>
              <span className="stat-label">Active Members</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">8</span>
              <span className="stat-label">Partner Courses</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">9</span>
              <span className="stat-label">Events Per Year</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2004</span>
              <span className="stat-label">Founded</span>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="content-section">
          <h2>Our Mission</h2>
          <p className="mission-text">
            To promote the game of golf within the South Asian community of New Jersey,
            creating opportunities for networking, friendship, and healthy competition
            while giving back to our local communities through charitable initiatives.
          </p>
        </section>
      </div>

      {/* Add styles for new sections */}
      <style jsx>{`
        .about-us-section {
          background: white;
          padding: 3rem 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          margin-bottom: 3rem;
        }

        .about-us-section h2 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin: 0 0 2rem 0;
          text-align: center;
        }

        .about-text {
          max-width: 900px;
          margin: 0 auto 3rem;
          text-align:center;
        }

        .about-text p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .about-text strong {
          color: var(--primary);
          font-weight: 600;
        }

        .core-values {
          max-width: 1000px;
          margin: 0 auto 2rem;
        }

        .core-values h3 {
          font-size: 1.75rem;
          color: var(--text-primary);
          text-align: center;
          margin: 0 0 2rem 0;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .value-item {
          text-align: center;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .value-item:hover {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }

        .value-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .value-icon svg {
          width: 32px;
          height: 32px;
          color: white;
        }

        .value-item h4 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .closing-statement {
          text-align: center;
          font-size: 1.25rem;
          color: var(--text-primary);
          font-weight: 500;
          font-style: italic;
          margin: 2rem 0 0 0;
          padding: 2rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%);
          border-radius: 12px;
          border-left: 4px solid var(--primary);
        }

        @media (max-width: 1024px) {
          .values-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .about-us-section {
            padding: 2rem 1.5rem;
          }

          .about-us-section h2 {
            font-size: 2rem;
          }

          .about-text p {
            font-size: 1rem;
          }

          .values-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .closing-statement {
            font-size: 1.1rem;
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}