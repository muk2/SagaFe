import React, { useState, useEffect } from 'react';
import { newsApi } from '../lib/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await newsApi.getAll();
        setNewsItems(data);
      } catch (err) {
        console.error('Failed to fetch news:', err);
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>News & Press Coverage</h1>
        <p className="page-subtitle">Stay up to date with SAGA announcements and press coverage</p>
      </div>

      {loading ? (
        <div className="loading">Loading news...</div>
      ) : newsItems.length === 0 ? (
        <div className="empty-state">No news items yet — check back soon.</div>
      ) : (
        <section className="news-grid-section">
          <div className="news-grid-cards">
            {newsItems.map(item => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card-item"
              >
                <div className="news-card-thumb">
                  <img
                    src={getFullImageUrl(item.thumbnail_url)}
                    alt={item.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="news-card-body">
                  {item.site_name && <span className="news-card-site">{item.site_name}</span>}
                  <h3 className="news-card-title">{item.title}</h3>
                  {item.description && <p className="news-card-description">{item.description}</p>}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
