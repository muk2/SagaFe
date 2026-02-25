import React, { useState, useEffect } from 'react';

export default function SagaTourPage() {
  const [activeSection, setActiveSection] = useState('overview');

  // Track which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'overview',
        'teams',
        'season-play',
        'makeup-rounds',
        'awards',
        'anish-joshi',
        'saga-champions',
        'saga-open',
        'uhc-cup'
      ];

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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const tocItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'teams', label: 'Teams' },
    { id: 'season-play', label: 'Season Play & Rounds' },
    { id: 'makeup-rounds', label: 'Makeup Rounds' },
    { id: 'awards', label: 'Awards Overview' },
    { id: 'anish-joshi', label: 'Anish Joshi Trophy' },
    { id: 'saga-champions', label: 'SAGA Champions' },
    { id: 'saga-open', label: 'SAGA Open' },
    { id: 'uhc-cup', label: 'United Healthcare Cup' },
  ];

  return (
    <div className="saga-tour-page">
      <div className="tour-hero">
          <div className="hero-content-wrapper">
            <h1 className="tour-title">SAGA Tour</h1>
            <p className="tour-subtitle">Information & Competition Structure</p>
          </div>
        </div>

      <div className="page-container">
        <div className="tour-layout">
          {/* Sidebar Table of Contents */}
          <aside className="tour-sidebar">
            <div className="toc-container">
              <h3 className="toc-title">On This Page</h3>
              <nav className="toc-nav">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    className={`toc-link ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="tour-content">
            {/* Overview */}
            <section id="overview" className="tour-section">
              <h2>How SAGA Tour Works</h2>
              <div className="content-card">
                <p>
                  SAGA operates with two teams and begins the season with approximately 100 players. 
                  Our tour combines competitive golf with camaraderie, featuring regular rounds, playoffs, 
                  and championship finals across multiple flight divisions.
                </p>
              </div>
            </section>

            {/* Teams */}
            <section id="teams" className="tour-section">
              <h2>Teams</h2>
              <div className="teams-grid">
                <div className="team-card linksmen">
                  <div className="team-color-bar"></div>
                  <div className="team-header">
                    <h3>Linksmen</h3>
                    <div className="team-color-circle"></div>
                  </div>
                </div>

                <div className="team-card brunswick">
                  <div className="team-color-bar"></div>
                  <div className="team-header">
                    <h3>Brunswick</h3>
                    <div className="team-color-circle"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Season Play */}
            <section id="season-play" className="tour-section">
              <h2>Season Play & Rounds</h2>
              <div className="content-card">
                <ul className="info-list">
                  <li>Each team hosts regular rounds at its home facility</li>
                  <li>All rounds are co-sanctioned by SAGA</li>
                  <li>Rounds count toward a combined leaderboard across both teams</li>
                </ul>
              </div>
            </section>

            {/* Makeup Rounds */}
            <section id="makeup-rounds" className="tour-section">
              <h2>Makeup Rounds & Scheduling</h2>
              <div className="content-card">
                <div className="highlight-box">
                  <h4>📋 Key Information</h4>
                  <p>
                    Players may play a makeup round at the other team's facility by declaring 
                    it in advance to their team captain.
                  </p>
                </div>

                <h4>SAGA Tour Rules</h4>
                <ul className="info-list">
                  <li>
                    Players may declare all seven rounds at the beginning of the season if they 
                    know they will miss a scheduled round
                  
                  <li>
                    <strong>Example:</strong> If a player cannot attend the first round, they may 
                    select a future round from the other team's schedule to count as their first round
                  </li>
                
                  </li>
                  <li>All round declarations must be made at the start of the season due to limited availability</li>
                  <li>Makeup rounds requested during the season are subject to availability</li>
                </ul>

                <h4>Approvals Process</h4>
                <ul className="info-list">
                  <li>Any changes to declared rounds must be communicated well in advance</li>
                  <li>
                    All changes must be approved by the team captain and the Competition Committee 
                    before the makeup round is played
                  </li>
                </ul>
              </div>
            </section>

            {/* Awards Overview */}
            <section id="awards" className="tour-section">
              <h2>Awards Overview</h2>
              <div className="awards-grid">
                <div className="award-card">
                  <div className="award-icon">🏆</div>
                  <h3>Anish Joshi Trophy</h3>
                  <p>Highest stableford point total of finals, playoffs and reset points amongst the 3 flight champions</p>
                </div>

                <div className="award-card">
                  <div className="award-icon">👑</div>
                  <h3>SAGA Tour Champions</h3>
                  <p>Reset Points + Playoff round + finals determining SAGA champions (3 flights)</p>
                </div>

                <div className="award-card">
                  <div className="award-icon">⭐</div>
                  <h3>SAGA Open Champions</h3>
                  <p>Highest stableford points and low gross winner awarded per event</p>
                </div>

                <div className="award-card">
                  <div className="award-icon">🏅</div>
                  <h3>United Healthcare Cup</h3>
                  <p>Team championship between SAGA Linksmen and Brunswick teams</p>
                </div>
              </div>
            </section>

            {/* Anish Joshi Trophy */}
            <section id="anish-joshi" className="tour-section">
              <h2>Anish Joshi Trophy</h2>
              <div className="content-card featured">
                <div className="trophy-header">
                  <span className="trophy-icon">🏆</span>
                  <p className="trophy-subtitle">Our Most Prestigious Champion's Trophy</p>
                </div>

                <p>
                  The Anish Joshi Trophy will be awarded to the total highest point getter 
                  (Playoff + SAGA Finals) amongst the three flight winners in the SAGA Finals.
                </p>

                <div className="sponsor-info">
                  <p>
                    <strong>Sponsored by:</strong> Dr. Joshi and his wife Anju in memory of their 
                    son Anish, who was a SAGA Tour member
                  </p>
                </div>

                <h4>Eligibility Requirements</h4>
                <ul className="checklist">
                  <li>Must be a registered member of the SAGA Tour</li>
                  <li>Must have played the regular season and registered at one of the two teams</li>
                  <li>Must have qualified to play the playoffs</li>
                </ul>
              </div>
            </section>

            {/* SAGA Champions */}
            <section id="saga-champions" className="tour-section">
              <h2>SAGA Champions</h2>
              <div className="content-card">
                <h4>Qualifying for Playoffs/Finals</h4>
                <ul className="info-list">
                  <li> Upon making the playoffs and depending on your regular season position, players qualifying into playoffs will be placed in three flights based on handicap
                  </li>
                  <li>Reset points will be awarded for players in each chapter (FedEx Cup style)</li>
                </ul>

                <h4>In the Playoffs/Finals</h4>
                <div className="formula-box">
                  <p className="formula">
                    <strong>Championship Formula:</strong><br/>
                    Reset Points + Playoff Stableford Points + Finals Stableford Points = SAGA Champion
                  </p>
                  <p className="formula-note">Winners determined for Flight 1, 2, and 3</p>
                </div>

                <h4>Eligibility Requirements</h4>
                <ul className="checklist">
                  <li>Must be a registered member of the SAGA Tour</li>
                  <li>Must have played the regular season and registered at one of the chapters</li>
                  <li>Must have qualified to play the playoffs</li>
                </ul>
              </div>
            </section>

            {/* SAGA Open */}
            <section id="saga-open" className="tour-section">
              <h2>SAGA Open</h2>
              <div className="content-card">
                <h4>On the Day of Finals</h4>
                <p>
                  If not competing in the SAGA Championships Finals, Stableford Points and 
                  Low Gross will determine the SAGA Open winners.
                </p>

                <div className="note-box">
                  <p>
                    <strong>Note:</strong> This is designed to bring competition to those who 
                    are not in the hunt on the day of the finals. This can happen for many reasons.
                  </p>
                </div>

                <h4>Eligibility Requirements</h4>
                <ul className="checklist">
                  <li>Anyone can play that day if they have a registered handicap</li>
                  <li>Must be vouched for by a member of the SAGA executive committee or a captain</li>
                </ul>
              </div>
            </section>

            {/* United Healthcare Cup */}
            <section id="uhc-cup" className="tour-section">
              <h2>United Healthcare Cup</h2>
              <div className="content-card">
                <h4>Team Competition Format</h4>
                <ul className="info-list">
                  <li>The 2 captains will pick 8 players each from their players who have qualified for the Playoffs and Finals</li>
                  <li>Team with the highest cumulative Stableford score (top 6 players each) will win the UHC Cup</li>
                </ul>

                <h4>Scoring System</h4>
                <div className="formula-box">
                  <p className="formula">
                    <strong>Team Score Calculation:</strong><br/>
                    Add the highest Stableford points from Playoff round and Finals for each player<br/>
                    <em>(NO RESET POINTS)</em>
                  </p>
                  <p className="formula-note">The TOP 6 players' scores will count for the cumulative team score</p>
                </div>

                <div className="note-box">
                  <p>
                    <strong>Substitution Rule:</strong> If a player who played in the Playoff round 
                    cannot play the Finals for any reason, the captain will be allowed to substitute 
                    that player with another from their team (if that player was not on any team before). 
                    The 2 scores will be counted as one player's score toward the total score.
                  </p>
                  <p><strong>Important:</strong> A player can only be on one team.</p>
                </div>

                <h4>Eligibility Requirements</h4>
                <ul className="checklist">
                  <li>Must be a registered member of the SAGA Tour</li>
                  <li>Must have played the regular season and registered at one of the chapters</li>
                  <li>Must have qualified to play the playoffs</li>
                </ul>
              </div>
            </section>
          </main>
        </div>
      </div>

      <style jsx>{`
        

        .tour-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
          margin-top: 2rem;
          position: relative;
        }

        /* Sidebar Navigation */
        .tour-sidebar {
          position: relative;
        }

        .toc-container {
          position: sticky;
          top: 100px;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .toc-title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
        }

        .toc-nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .toc-link {
          text-align: left;
          padding: 0.625rem 0.75rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.875rem;
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .toc-link:hover {
          background: var(--border-light);
          color: var(--text-primary);
        }

        .toc-link.active {
          background: rgba(13, 148, 136, 0.1);
          color: var(--primary);
          border-left-color: var(--primary);
          font-weight: 600;
        }

        /* Main Content */
        .tour-content {
          max-width: 900px;
        }

        .tour-section {
          margin-bottom: 4rem;
          scroll-margin-top: 100px;
        }

        .tour-section h2 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid var(--primary);
        }

        .tour-section h4 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 2rem 0 1rem 0;
        }

        .content-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .content-card.featured {
          border: 2px solid var(--primary);
          background: linear-gradient(to bottom, rgba(13, 148, 136, 0.02), white);
        }

        .content-card p {
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        /* Teams Grid */
        .teams-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .team-card {
          border: 3px solid;
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .team-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px);
        }

        /* Linksmen - White Team */
        .team-card.linksmen {
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          border-color: #d1d5db;
        }

        .team-card.linksmen h3 {
          color: #1f2937;
        }

        .team-card.linksmen .captain-label {
          color: #6b7280;
        }

        .team-card.linksmen .captain-name {
          color: #111827;
        }

        /* Brunswick - Red Team */
        .team-card.brunswick {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          border-color: #991b1b;
          color: white;
        }

        .team-card.brunswick h3 {
          color: white;
        }

        .team-card.brunswick .captain-label {
          color: #fecaca;
        }

        .team-card.brunswick .captain-name {
          color: white;
        }

        .team-color-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          opacity: 0.3;
        }

        .team-card.linksmen .team-color-bar {
          background: linear-gradient(90deg, #9ca3af, #6b7280);
        }

        .team-card.brunswick .team-color-bar {
          background: linear-gradient(90deg, #7f1d1d, #450a0a);
        }

        .team-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .team-card h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
        }

        .team-color-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }

        .team-card.linksmen .team-color-circle {
          background: #ffffff;
          border-color: #9ca3af;
        }

        .team-card.brunswick .team-color-circle {
          background: #7f1d1d;
          border-color: #450a0a;
        }

        .captain-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .captain-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .captain-name {
          font-size: 1.125rem;
          font-weight: 600;
        }

        /* Awards Grid */
        .awards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .award-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .award-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .award-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .award-card h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .award-card p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Lists */
        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .info-list li {
          padding: 0.75rem 0;
          padding-left: 1.5rem;
          position: relative;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .info-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--primary);
          font-weight: bold;
          font-size: 1.2rem;
        }

        .checklist {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }

        .checklist li {
          padding: 0.5rem 0;
          padding-left: 2rem;
          position: relative;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .checklist li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--primary);
          font-weight: bold;
          font-size: 1.2rem;
        }

        /* Special Boxes */
        .highlight-box {
          background: rgba(13, 148, 136, 0.05);
          border-left: 4px solid var(--primary);
          padding: 1.25rem;
          border-radius: var(--radius);
          margin-bottom: 1.5rem;
        }

        .highlight-box h4 {
          margin: 0 0 0.5rem 0;
          color: var(--primary);
          font-size: 1rem;
        }

        .highlight-box p {
          margin: 0;
          color: var(--text-secondary);
        }

        .note-box {
          background: #fffbeb;
          border: 1px solid #fbbf24;
          border-radius: var(--radius);
          padding: 1.25rem;
          margin: 1.5rem 0;
        }

        .note-box p {
          margin: 0.5rem 0;
          color: #92400e;
          line-height: 1.6;
        }

        .formula-box {
          background: #f0f9ff;
          border: 2px solid #3b82f6;
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin: 1.5rem 0;
        }

        .formula {
          font-size: 1rem;
          color: #1e3a8a;
          margin: 0;
          line-height: 1.8;
        }

        .formula strong {
          color: #1e40af;
        }

        .formula-note {
          margin: 0.75rem 0 0 0;
          font-size: 0.875rem;
          color: #3b82f6;
          font-style: italic;
        }

        .trophy-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .trophy-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .trophy-subtitle {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--primary);
          font-style: italic;
        }

        .sponsor-info {
          background: rgba(13, 148, 136, 0.05);
          padding: 1rem;
          border-radius: var(--radius);
          margin: 1.5rem 0;
        }

        .sponsor-info p {
          margin: 0;
          color: var(--text-primary);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .tour-layout {
            grid-template-columns: 1fr;
          }

          .tour-sidebar {
            display: none;
          }

          .teams-grid,
          .awards-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Hero Section */
        .tour-hero {
        position: relative;
        background: #2960A1;
        padding: 5rem 2rem 3rem;
        text-align: center;
        overflow: hidden;
        }

        .tour-hero::before {
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

        .tour-title {
        font-size: 3rem;
        font-weight: 800;
        color: white;
        margin: 0 0 1rem 0;
        letter-spacing: -0.02em;
        }

        .tour-subtitle {
        font-size: 1.25rem;
        color: rgba(255, 255, 255, 0.9);
        margin: 0 0 1.5rem 0;
        }

        @media (max-width: 768px) {
          .tour-hero {
            padding: 3rem 1.5rem;
          }

          .tour-section h2 {
            font-size: 1.5rem;
          }

          .content-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}