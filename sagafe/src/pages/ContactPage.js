import React, { useState, useEffect } from 'react';
import { faqApi } from '../lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoadingFaqs(true);
      const data = await faqApi.getAll();
      console.log('Fetched FAQs:', data);
      setFaqs(data);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
      setFaqs([]);
    } finally {
      setLoadingFaqs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      // ✅ Send email via backend API
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  
  return (
    <div className="contact-page">
    <div className="events-hero">
      <div className="hero-content-wrapper">
        <div className="hero-overlay"></div>
        <div className="hero-content-wrapper"></div>
        <h1 className="events-title">Contact Us</h1>
        <p className="events-subtitle">Get in touch with the SAGA team</p>
        </div>
      </div>
    <div className="page-container">
      <div className="contact-layout">
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3>Email</h3>
       
            <a href="mailto:sagagolfevents@gmail.com" className="contact-link">
              sagaevents@sagagolf.com
            </a>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <h3>Phone</h3>
            <a href="tel:+16095585079" className="contact-link">
              (609) 558-5079
            </a>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h3>Location</h3>
            <p>Serving all of NJ</p>
          </div>

          <div className="social-links">
            <h3>Follow Us</h3>
            <div className="social-icons">
            <a href="https://www.instagram.com/sagagolfofficial/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          {submitStatus === 'success' && (
            <div className="form-message success-message">
              ✅ Thank you for your message! We'll get back to you soon.
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="form-message error-message">
              ❌ Failed to send message. Please try again or email us directly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="John Doe"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                placeholder="john@example.com"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
                disabled={submitting}
              >
                <option value="">Select a subject...</option>
                <option value="membership inquiry">Membership Inquiry</option>
                <option value="event information">Event Information</option>
                <option value="sponsorship opportunities">Sponsorship Opportunities</option>
                <option value="general question">General Question</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
                placeholder="How can we help you?"
                rows="5"
                disabled={submitting}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Message'}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        
        {loadingFaqs ? (
          <div className="faq-loading">
            <div className="spinner"></div>
            <p>Loading FAQs...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="faq-empty">
            <p>No FAQs available at this time.</p>
          </div>
        ) : (
          <div className="faq-accordion">
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className={`faq-item ${openFaq === faq.id ? 'open' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={openFaq === faq.id}
                >
                  <h4>{faq.question}</h4>
                  <svg 
                    className="faq-icon"
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        /* Contact Link Styles */
        .contact-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .contact-link:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        /* Form Messages */
        .form-message {
          padding: 1rem 1.5rem;
          border-radius: var(--radius);
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .success-message {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Collapsible FAQ Styles */
        .faq-loading,
        .faq-empty {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          font-size: 1rem;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .faq-item {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          box-shadow: var(--shadow-md);
        }

        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          background: white;
          border: none;
          cursor: pointer;
          text-align: left;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .faq-question:hover {
          background: var(--border-light);
        }

        .faq-icon {
          flex-shrink: 0;
          transition: transform 0.3s ease;
          color: var(--primary);
        }

        .faq-item.open .faq-icon {
          transform: rotate(180deg);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
        }

        .faq-item.open .faq-answer {
          max-height: 500px;
          padding: 1rem 1.5rem 1.25rem 1.5rem;
        }

        .faq-answer p {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.7;
        }

       

        @media (max-width: 768px) {
          .faq-question {
            font-size: 0.95rem;
            padding: 1rem 1.25rem;
          }

          .faq-item.open .faq-answer {
            padding: 0 1.25rem 1rem 1.25rem;
          }

        }

      `}</style>
    </div>
    </div>
  );
}