import React from 'react';

const NEWS_ITEMS = [
  {
    id: 1,
    title: "2026 Season Schedule Announced",
    date: "2026-01-15",
    category: "Announcements",
    excerpt: "We're excited to announce our full 2026 tournament schedule featuring 12 events across New Jersey's finest courses.",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
    featured: true
  },
  {
    id: 2,
    title: "Member Spotlight: Raj Patel Wins Club Championship",
    date: "2026-01-10",
    category: "Member News",
    excerpt: "Congratulations to Raj Patel for his outstanding performance at the 2025 Club Championship, shooting a career-best 72.",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800",
    featured: false
  },
  {
    id: 3,
    title: "New Partnership with Royce Brook Golf Club",
    date: "2026-01-05",
    category: "Partnerships",
    excerpt: "SAGA members now receive exclusive rates and priority tee times at Royce Brook Golf Club in Hillsborough.",
    image: "https://images.unsplash.com/photo-1600569436985-b50f3882e8ed?w=800",
    featured: false
  },
  {
    id: 4,
    title: "Youth Golf Initiative Reaches 100 Kids",
    date: "2025-12-20",
    category: "Community",
    excerpt: "Our charity program introducing golf to underserved youth has now reached over 100 young participants.",
    image: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800",
    featured: false
  },
  {
    id: 5,
    title: "Winter Golf Tips from the Pros",
    date: "2025-12-15",
    category: "Tips & Advice",
    excerpt: "Stay sharp during the off-season with these practice tips from local PGA professionals.",
    image: "https://images.unsplash.com/photo-1592919505780-303950717480?w=800",
    featured: false
  }
];

export default function NewsPage() {
  const featuredNews = NEWS_ITEMS.find(item => item.featured);
  const regularNews = NEWS_ITEMS.filter(item => !item.featured);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>News & Updates</h1>
        <p className="page-subtitle">Stay up to date with SAGA announcements and golf news</p>
      </div>

      {featuredNews && (
        <section className="featured-news">
          <div className="featured-image" style={{ backgroundImage: `url(${featuredNews.image})` }}>
            <div className="featured-overlay">
              <span className="news-category">{featuredNews.category}</span>
              <h2>{featuredNews.title}</h2>
              <p>{featuredNews.excerpt}</p>
              <div className="featured-meta">
                <span className="news-date">{formatDate(featuredNews.date)}</span>
                <button className="read-more-btn">Read More</button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="news-grid-section">
        <div className="news-grid">
          {regularNews.map(item => (
            <article key={item.id} className="news-card">
              <div className="news-image" style={{ backgroundImage: `url(${item.image})` }}></div>
              <div className="news-content">
                <span className="news-category">{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <div className="news-footer">
                  <span className="news-date">{formatDate(item.date)}</span>
                  <button className="news-link">Read More →</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="newsletter-section">
        <div className="newsletter-box">
          <h3>Subscribe to Our Newsletter</h3>
          <p>Get the latest news, event updates, and exclusive offers delivered to your inbox.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
