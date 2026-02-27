import React, { useState, useEffect } from 'react';
import { scholarshipRecipientsApi } from '../lib/api';


export default function ScholarshipsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);

  
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'scholarship-overview', 'eligibility', 'application', 'dates', 'selection', 'mission', 'sponsor', 'how-to-apply', 'past-winners'];
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Fetch scholarship recipients
  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoadingRecipients(true);
      const data = await scholarshipRecipientsApi.getAll();
      setRecipients(data);
    } catch (err) {
      console.error('Failed to load recipients:', err);
      setRecipients([]);
    } finally {
      setLoadingRecipients(false);
    }
  };

  // Group recipients by year
  const recipientsByYear = recipients.reduce((acc, recipient) => {
    const year = recipient.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(recipient);
    return acc;
  }, {});

  const years = Object.keys(recipientsByYear).sort((a, b) => b - a);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  const tocItems = [
    { id: 'overview', label: 'About the Scholarship' },
    { id: 'scholarship-overview', label: 'Scholarship Overview' },
    { id: 'eligibility', label: 'Eligibility Criteria' },
    { id: 'application', label: 'Application Requirements' },
    { id: 'dates', label: 'Important Dates' },
    { id: 'selection', label: 'Selection Process' },
    { id: 'mission', label: 'Our Mission' },
    { id: 'sponsor', label: 'About Our Sponsor' },
    { id: 'how-to-apply', label: 'How to Apply' },
    { id: 'past-winners', label: 'Past Winners' }
  ];

  return (
    <div className="saga-page-container">
      {/* Hero Section */}
      <div className="saga-hero">
          <div className="hero-content-wrapper">
            <h1 className="saga-title">SAGA Junior College Scholarship</h1>
            <p className="saga-subtitle">Supporting excellence in academics, golf, leadership, and character</p>
          </div>
        </div>

      <div className="saga-content-wrapper">
        {/* Table of Contents Sidebar */}
        <aside className="saga-toc">
          <div className="saga-toc-sticky">
            <h3>On This Page</h3>
            <nav>
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`toc-item ${activeSection === item.id ? 'active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="saga-main-content">
          {/* About the Scholarship */}
          <section id="overview" className="content-section">
            <h2>SAGA Junior College Scholarship</h2>
            <p>
              The SAGA Junior College Scholarship is an annual, one-year scholarship program offered by the SAGA 
              to support high-achieving, college-bound students who demonstrate excellence in academics, golf, 
              leadership, and character.
            </p>
            <p>
              Now entering its <strong>8th year</strong>, the SAGA Junior College Scholarship recognizes students 
              who embody the values that golf helps instill—integrity, perseverance, discipline, and respect. SAGA 
              believes that success on the golf course and in the classroom builds a strong foundation for lifelong 
              achievement.
            </p>
            <div className="highlight-box">
              <p className="highlight-stat">
                <strong>30 scholarships</strong> awarded to deserving students to date
              </p>
            </div>
          </section>

          {/* Scholarship Overview */}
          <section id="scholarship-overview" className="content-section">
            <h2>Scholarship Overview</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>Scholarship Type</strong>
                <p>One-year grant</p>
              </div>
              <div className="info-item">
                <strong>Total Annual Funding</strong>
                <p>$5,000</p>
              </div>
              <div className="info-item">
                <strong>Number of Recipients</strong>
                <p>Two or more students each year</p>
              </div>
              <div className="info-item">
                <strong>Award Distribution</strong>
                <p>Individual award amounts may vary annually</p>
              </div>
              <div className="info-item">
                <strong>Award Timing</strong>
                <p>Scholarships are awarded in the spring</p>
              </div>
              <div className="info-item">
                <strong>Fund Usage</strong>
                <p>Intended for students attending an accredited college full-time in the fall semester</p>
              </div>
            </div>
            <p className="note">
              All scholarship recipients are selected by the Anish Joshi / SAGA Scholarship Committee. 
              The committee's decision is final.
            </p>
          </section>

          {/* Eligibility Criteria */}
          <section id="eligibility" className="content-section">
            <h2>Eligibility Criteria</h2>
            <p>Applicants must meet or exceed the following criteria:</p>

            <div className="criteria-section">
              <h3>Academic Requirements</h3>
              <ul>
                <li>Maintain a minimum GPA of 3.0</li>
                <li>Anticipate attending an accredited college full-time in the fall</li>
              </ul>
            </div>

            <div className="criteria-section">
              <h3>Golf Participation</h3>
              <p>Applicants must be actively involved in golf. Acceptable evidence includes one or more of the following:</p>
              <ul>
                <li>Active GHIN handicap</li>
                <li>Current golf club membership</li>
                <li>High school golf team participation</li>
                <li>Current SAGA junior membership</li>
              </ul>
            </div>

            <div className="criteria-section">
              <h3>Leadership and Character</h3>
              <ul>
                <li>Demonstrated leadership in school, athletics, or the community</li>
                <li>Volunteer activities or leadership roles in clubs, teams, or organizations</li>
                <li>Alignment with SAGA ethics and core values</li>
              </ul>
            </div>
          </section>

          {/* Application Requirements */}
          <section id="application" className="content-section">
            <h2>Application Requirements</h2>
            <p>A complete application must include:</p>
            <ul className="checklist">
              <li>Completed application form</li>
              <li>Most recent academic transcripts or grades</li>
              <li>Proof of active golf participation</li>
              <li>Evidence of leadership or community involvement</li>
              <li>Two letters of recommendation</li>
              <li>A personal essay on the topic: <em>"How golf enhances one's character"</em></li>
            </ul>
            <div className="warning-box">
              <strong>⚠️ Important:</strong> Incomplete or late applications will not be considered.
            </div>
          </section>

          {/* Important Dates */}
          <section id="dates" className="content-section">
            <h2>Important Dates</h2>
            <div className="dates-timeline">
              <div className="date-item">
                <div className="date-marker">Sep 30</div>
                <div className="date-details">
                  <strong>Application Deadline</strong>
                  <p>Submit all required materials by this date annually</p>
                </div>
              </div>
              <div className="date-item">
                <div className="date-marker">Oct 5</div>
                <div className="date-details">
                  <strong>Scholarship Announcement</strong>
                  <p>Recipients will be notified</p>
                </div>
              </div>
              <div className="date-item">
                <div className="date-marker">Spring</div>
                <div className="date-details">
                  <strong>Scholarship Awarded</strong>
                  <p>Prior to college enrollment</p>
                </div>
              </div>
            </div>
          </section>

          {/* Selection Process */}
          <section id="selection" className="content-section">
            <h2>Selection Process</h2>
            <p>Scholarship recipients are selected based on:</p>
            <ul>
              <li>Academic achievement</li>
              <li>Commitment to golf</li>
              <li>Leadership qualities</li>
              <li>Alignment with SAGA ethics and core values</li>
              <li>Strength of application materials</li>
              <li>Number of applicants and available scholarship funds</li>
            </ul>
            <p className="note">
              Final selections are made by the Anish Joshi / SAGA Scholarship Committee.
            </p>
          </section>
        
          {/* Our Mission */}
          <section id="mission" className="content-section">
            <h2>Our Mission</h2>
            <div className="mission-box">
              <p>
                SAGA believes that golf builds character by fostering <strong>integrity</strong>, 
                <strong> perseverance</strong>, <strong>discipline</strong>, and <strong>resilience</strong>. 
                A healthy body supports a healthy mind, and when young students strive for excellence both 
                academically and athletically, SAGA is proud to support them.
              </p>
              <p>
                The SAGA Junior College Scholarship exists to reward hard work, encourage personal growth, 
                and help students take the next important step toward their future.
              </p>
            </div>
          </section>

          {/* About Our Sponsor */}
          <section id="sponsor" className="content-section">
            <h2>A Word About Our Sponsor</h2>
            <p>
              The SAGA Junior College Scholarship is made possible through the generous support of 
              <strong> Dr. and Mrs. Joshi and the Joshi family</strong>, long-standing champions of the 
              South Asian community and proud supporters of SAGA for over a decade.
            </p>
            <p>
              Known for their commitment to philanthropy, education, and community impact, the Joshi family 
              shares SAGA's belief in investing in the next generation. Their support enables deserving 
              junior golfers—particularly in the tri-state area—to pursue higher education while continuing 
              to grow through the game of golf.
            </p>
            <p className="gratitude">
              The SAGA community is deeply grateful for their continued partnership and generosity.
            </p>
          </section>

{/* How to Apply */}
<section id="how-to-apply" className="content-section">
            <h2>How to Apply</h2>
            <p>
              Ready to apply for the SAGA Junior College Scholarship? Follow these simple steps:
            </p>

            <div className="apply-steps">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Download the Application</h4>
                  <p>Click the button below to download the official SAGA Junior Scholarship Application Form (PDF).</p>
                  <a 
                    href="/SAGA Scholarship Form.pdf" 
                    download="SAGA_Scholarship_Application.pdf"
                    className="btn-download"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Application Form
                  </a>
                </div>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Complete the Application</h4>
                  <p>Fill out the application form completely and gather all required materials:</p>
                  <ul>
                    <li>Completed application form</li>
                    <li>Latest grades/transcripts</li>
                    <li>Proof of golf participation</li>
                    <li>Evidence of leadership/community involvement</li>
                    <li>Two letters of recommendation</li>
                    <li>Essay on "How golf enhances one's character" (max 500 words, typed, double-spaced)</li>
                  </ul>
                </div>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Submit Your Application</h4>
                  <p>Email your completed application and all supporting documents to:</p>
                  <div className="email-submission">
                    <div className="email-box">
                      <strong>Email:</strong> <a href="mailto:sagaevents@sagagolf.com">sagaevents@sagagolf.com</a>
                    </div>
                    <div className="subject-box">
                      <strong>Subject Line:</strong> <span className="subject-format">[Your Full Name] SAGA Junior Scholarship Application</span>
                      <p className="example-text">Example: "John Doe SAGA Junior Scholarship Application"</p>
                    </div>
                  </div>
                  <p className="deadline-reminder">
                    <strong>⚠️ Deadline:</strong> September 30th each year
                  </p>
                </div>
              </div>
            </div>

            <div className="contact-help">
              <h4>Questions?</h4>
              <p>If you have any questions about the application process, please contact us:</p>
              <p>
                <strong>Email:</strong> <a href="mailto:sagaevents@sagagolf.com">sagaevents@sagagolf.com</a><br />
                <strong>Phone:</strong> (609) 558-5079
              </p>
            </div>
          </section>

          
          {/* Past Winners */}
          <section id="past-winners" className="content-section">
            <h2>Past Winners</h2>
            
            {loadingRecipients ? (
              <div className="loading-recipients">
                <p>Loading recipients...</p>
              </div>
            ) : recipients.length === 0 ? (
              <div className="no-recipients">
                <p>Recipient information will be updated here as scholarships are awarded.</p>
              </div>
            ) : (
              years.map((year) => (
                <div key={year} className="year-section">
                  <h3 className="winners-year-title">{year} Recipients</h3>
                  <div className="winners-grid">
                    {recipientsByYear[year].map((recipient) => (
                      <div key={recipient.id} className="winner-card">
                        <h4>{recipient.full_name}</h4>
                        <p className="winner-year-label">Class of {recipient.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </main>
      </div>

      <style jsx>{`
        .saga-page-container {
          min-height: 100vh;
        }
        .saga-hero {
            position: relative;
            background: #2960A1;
            padding: 5rem 2rem 3rem;
            text-align: center;
            overflow: hidden;
            }

        .saga-hero::before {
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

        .saga-title {
        font-size: 3rem;
        font-weight: 800;
        color: white;
        margin: 0 0 1rem 0;
        letter-spacing: -0.02em;
        }

        .saga-subtitle {
        font-size: 1.25rem;
        color: rgba(255, 255, 255, 0.9);
        margin: 0 0 1.5rem 0;
        }

        @media (max-width: 768px) {
          .saga-hero {
            padding: 3rem 1.5rem;
          }

          .saga-section h2 {
            font-size: 1.5rem;
          }

          .content-card {
            padding: 1.5rem;
          }
        }

        .saga-content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
          padding: 3rem 2rem;
        }

        .saga-toc {
          position: relative;
        }

        .saga-toc-sticky {
          position: sticky;
          top: 100px;
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .saga-toc h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .saga-toc nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .toc-item {
          background: none;
          border: none;
          padding: 0.75rem 1rem;
          text-align: left;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
          color: var(--text-secondary);
          font-size: 0.9rem;
          border-left: 3px solid transparent;
        }

        .toc-item:hover {
          background: #f3f4f6;
          color: var(--text-primary);
        }

        .toc-item.active {
          background: #eff6ff;
          color: var(--primary);
          border-left-color: var(--primary);
          font-weight: 500;
        }

        .saga-main-content {
          max-width: 900px;
        }

        .content-section {
          margin-bottom: 4rem;
          scroll-margin-top: 100px;
        }

        .content-section h2 {
          font-size: 2rem;
          margin: 0 0 1.5rem 0;
          color: var(--text-primary);
          border-bottom: 3px solid var(--primary);
          padding-bottom: 0.5rem;
        }

        .content-section h3 {
          font-size: 1.5rem;
          margin: 2rem 0 1rem 0;
          color: var(--text-primary);
        }

        .content-section p {
          line-height: 1.8;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .content-section ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .content-section li {
          margin-bottom: 0.75rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .highlight-box {
          background: var(--primary);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          margin: 2rem 0;
          text-align: center;
        }

        .highlight-stat {
          color: white !important;
          font-size: 1.5rem;
          margin: 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .info-item {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid var(--primary);
        }

        .info-item strong {
          display: block;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .info-item p {
          margin: 0;
          color: var(--text-secondary);
        }

        .criteria-section {
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .criteria-section h3 {
          margin-top: 0;
          color: var(--primary);
        }

        .checklist {
          list-style: none;
          padding: 0;
        }

        .checklist li {
          padding-left: 2rem;
          position: relative;
        }

        .checklist li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--primary);
          font-weight: bold;
          font-size: 1.2rem;
        }

        .warning-box {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          color: #92400e;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin: 2rem 0;
        }

        .dates-timeline {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin: 2rem 0;
        }

        .date-item {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .date-marker {
          background: var(--primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          white-space: nowrap;
          min-width: 100px;
          text-align: center;
        }

        .date-details strong {
          display: block;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .date-details p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .mission-box {
          background: #f0fdf4;
          border: 2px solid #86efac;
          padding: 2rem;
          border-radius: 12px;
          margin: 2rem 0;
        }

        .mission-box p {
          color: #166534;
          margin-bottom: 1rem;
        }

        .mission-box p:last-child {
          margin-bottom: 0;
        }

        .gratitude {
          font-style: italic;
          color: var(--primary);
          font-weight: 500;
        }

        .winners-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          margin: 2rem 0;
        }

        .winner-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .winner-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .winner-card h4 {
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
          font-size: 0.95rem;
          line-height: 1.3;
        }

        .winner-year-label {
          color: var(--primary);
          font-weight: 600;
          font-size: 0.8rem;
          margin: 0 0 0.5rem 0;
        }

        

        .winners-year-title {
          font-size: 1.75rem;
          color: var(--primary);
          margin: 2rem 0 1.5rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--primary);
        }

        .year-section {
          margin-bottom: 3rem;
        }

        .loading-recipients,
        .no-recipients {
          text-align: center;
          padding: 3rem 2rem;
          background: #f9fafb;
          border-radius: 12px;
          color: #6b7280;
        }

        .note {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 1rem 1.5rem;
          border-radius: 4px;
          margin: 2rem 0;
          color: #1e40af;
        }

        @media (max-width: 1024px) {
          .saga-content-wrapper {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .saga-toc {
            display: none;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .winners-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .saga-hero-content h1 {
            font-size: 2rem;
          }

          .saga-hero-subtitle {
            font-size: 1rem;
          }

          .content-section h2 {
            font-size: 1.5rem;
          }

          .winners-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .winners-grid {
            grid-template-columns: 1fr;
          }
        }

        /* How to Apply Section Styles */
        .apply-steps {
          margin: 2rem 0;
        }

        .step-card {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          transition: all 0.3s ease;
        }

        .step-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .step-number {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .step-content {
          flex: 1;
        }

        .step-content h4 {
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
          font-size: 1.3rem;
        }

        .step-content p {
          margin-bottom: 1rem;
        }

        .step-content ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .step-content li {
          margin-bottom: 0.5rem;
        }

        .btn-download {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary);
          color: white;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
          margin-top: 1rem;
        }

        .btn-download:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-download svg {
          flex-shrink: 0;
        }

        .email-submission {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1rem 0;
        }

        .email-box,
        .subject-box {
          margin-bottom: 1rem;
        }

        .email-box:last-child,
        .subject-box:last-child {
          margin-bottom: 0;
        }

        .email-box a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }

        .email-box a:hover {
          text-decoration: underline;
        }

        .subject-format {
          color: var(--primary);
          font-family: 'Courier New', monospace;
          background: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
          display: inline-block;
          margin-top: 0.25rem;
        }

        .example-text {
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
          margin: 0.5rem 0 0 0;
        }

        .deadline-reminder {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          color: #92400e;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1.5rem;
          font-size: 1rem;
        }

        .contact-help {
          background: #f0fdf4;
          border: 2px solid #86efac;
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .contact-help h4 {
          margin-top: 0;
          color: #166534;
        }

        .contact-help p {
          margin-bottom: 0.5rem;
          color: #166534;
        }

        .contact-help a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }

        .contact-help a:hover {
          text-decoration: underline;
        }

        @media (max-width: 1024px) {
          .saga-content-wrapper {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .saga-toc {
            display: none;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .winners-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .saga-hero-content h1 {
            font-size: 2rem;
          }

          .saga-hero-subtitle {
            font-size: 1rem;
          }

          .content-section h2 {
            font-size: 1.5rem;
          }

          .winners-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .winners-grid {
            grid-template-columns: 1fr;
          }
        }

      `}</style>
    </div>
  );
}