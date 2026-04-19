import React, { useState, useEffect } from 'react';
import { membershipOptionsApi, pastChampionsApi } from '../lib/api';

export default function SagaTourPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [membershipOptions, setMembershipOptions] = useState([]);
  const [feesLoading, setFeesLoading] = useState(true);
  const [feesError, setFeesError] = useState(null);
  const [pastChampions, setPastChampions] = useState([]);
  const [championsLoading, setChampionsLoading] = useState(true);

  // Fetch membership options from backend
  useEffect(() => {
    const fetchMembershipOptions = async () => {
      try {
        setFeesLoading(true);
        const data = await membershipOptionsApi.getAll();
        setMembershipOptions(data);
        setFeesError(null);
      } catch (err) {
        console.error('Failed to fetch membership options:', err);
        setFeesError('Unable to load membership fees');
      } finally {
        setFeesLoading(false);
      }
    };

    const fetchPastChampions = async () => {
      try {
        setChampionsLoading(true);
        const data = await pastChampionsApi.getAll();
        setPastChampions(data);
      } catch (err) {
        console.error('Failed to fetch past champions:', err);
      } finally {
        setChampionsLoading(false);
      }
    };

    fetchMembershipOptions();
    fetchPastChampions();
  }, []);

  // Track which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'overview',
        'eligibility',
        'scoring',
        'reset-points',
        'handicaps',
        'season-play',
        'makeup-rounds',
        'saga-rules',
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
    { id: 'eligibility', label: 'Signing Up & Eligibility' },
    { id: 'scoring', label: 'Scoring - Regular Season' },
    { id: 'reset-points', label: 'Reset Points' },
    { id: 'handicaps', label: 'Handicaps' },
    { id: 'season-play', label: 'Season Play & Rounds' },
    { id: 'makeup-rounds', label: 'Makeup Rounds' },
    { id: 'saga-rules', label: 'SAGA Rules' },
    { id: 'awards', label: 'Awards Overview' },
    { id: 'anish-joshi', label: 'Anish Joshi Trophy' },
    { id: 'saga-champions', label: 'SAGA Champions' },
    { id: 'saga-open', label: 'SAGA Open' },
    { id: 'uhc-cup', label: 'United Healthcare Cup' },
  ];

  /**
   * Format the price from the API for display.
   * If price is 0 or "0.00", show "FREE". Otherwise show "$X/year".
   */
  const formatFeeAmount = (price) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) return 'FREE';
    return `$${numPrice.toFixed(0)}/year`;
  };

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

            {/* Signing Up & Eligibility */}
            <section id="eligibility" className="tour-section">
              <h2>Signing Up & Eligibility</h2>
              
              <div className="content-card">
                <h4>How to Sign Up</h4>
                <ul className="info-list">
                  <li>If golfers are not affiliated with any of the member clubs, they should sign up as part of the <strong>Linksmen Chapter</strong></li>
                  <li>If golfers are members of one of the member clubs, they should sign up for that chapter</li>
                  <li>Sign up with your team captain (see United Healthcare Cup section below)</li>
                </ul>
              </div>

              <div className="content-card">
                <h4>Membership Fees</h4>
                {feesLoading ? (
                  <div className="fees-loading">
                    <p>Loading membership fees...</p>
                  </div>
                ) : feesError ? (
                  <div className="fees-error">
                    <p>{feesError}</p>
                  </div>
                ) : membershipOptions.length > 0 ? (
                  <div className="fees-grid">
                    {membershipOptions.map((option) => {
                      const isFree = parseFloat(option.price) === 0;
                      return (
                        <div className={`fee-item ${isFree ? 'special' : ''}`} key={option.id}>
                          <div className="fee-details">
                            <span className="fee-label">{option.name}</span>
                            {option.description && (
                              <span className="fee-description">{option.description}</span>
                            )}
                          </div>
                          <span className="fee-amount">{formatFeeAmount(option.price)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="fees-empty">
                    <p>No membership fee information available at this time.</p>
                  </div>
                )}
              </div>

              <div className="content-card">
                <h4>Eligibility Requirements</h4>
                <ul className="checklist">
                  <li>Must have a valid USGA handicap</li>
                  <li>Must be sponsored by an existing SAGA member or one of the Captains</li>
                </ul>
                
                <div className="note-box">
                  <p><strong>Note:</strong> The Chairman does have the ability to veto anyone's membership</p>
                  <p><strong>SAGA Ryder Cup</strong> is only for active SAGA Members</p>
                </div>
              </div>
            </section>

            {/* Scoring - Regular Season */}
            <section id="scoring" className="tour-section">
              <h2>Scoring - Regular Season</h2>
              
              <div className="content-card">
                <ul className="info-list">
                  <li>There will be <strong>7 Regular Season Rounds</strong> held at host club or regular round locations determined by SAGA for Linksmen chapter</li>
                  <li><strong>1 COMMON Leaderboard</strong> will be maintained</li>
                  <li>Score of <strong>Best 5 rounds out of 7</strong> Regular Season will determine Regular Season leaderboards</li>
                  <li>At the end of Regular Season, depending on number of signups – a set number of golfers will advance to the Playoffs / Finals</li>
                  <li>Flights will be determined, based on player's handicaps, from the common leaderboard and RESET points will be awarded for players advancing (FedEx Cup style)</li>
                  <li>Each round yardage will be approximately <strong>6,200 yards</strong>. The regular season will be played from one common tee</li>
                  <li><strong>No minimum rounds are required to qualify</strong></li>
                </ul>
              </div>
            </section>

            {/* Reset Points */}
            <section id="reset-points" className="tour-section">
              <h2>Reset Points</h2>
              
              <div className="content-card">
                <p>Upon the conclusion of the Regular Season:</p>
                <ul className="info-list">
                  <li>Players will be divided into <strong>3 flights</strong></li>
                  <li>Reset points (FedEx Cup Style) will be awarded to each player in their flight depending on how they did in their <strong>BEST 5 GAMES</strong> of the regular season</li>
                </ul>
                
                <div className="formula-box">
                  <p className="formula">
                    <strong>Points System:</strong> Similar to the FedEx Cup, higher regular season performance earns more reset points entering the playoffs
                  </p>
                </div>

                <h4>Reset Points Table</h4>
                <div className="reset-points-table-wrapper">
                  <table className="reset-points-table">
                    <thead>
                      <tr><th>Rank</th><th>Reset Pts</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>1</td><td>18</td></tr>
                      <tr><td>2</td><td>15</td></tr>
                      <tr><td>3</td><td>12</td></tr>
                      <tr><td>4</td><td>11</td></tr>
                      <tr><td>5</td><td>10</td></tr>
                      <tr><td>6</td><td>9</td></tr>
                      <tr><td>7</td><td>8</td></tr>
                      <tr><td>8</td><td>7</td></tr>
                      <tr><td>9</td><td>6</td></tr>
                      <tr><td>10</td><td>5</td></tr>
                      <tr><td>11</td><td>4</td></tr>
                      <tr><td>12</td><td>3</td></tr>
                      <tr><td>13</td><td>2</td></tr>
                      <tr><td>14</td><td>1</td></tr>
                      <tr><td>REST</td><td>1</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Handicaps */}
            <section id="handicaps" className="tour-section">
              <h2>Handicaps</h2>
              
              <div className="content-card">
                <h4>GHIN Handicap System</h4>
                <ul className="info-list">
                  <li>All SAGA Tour participants will get a <strong>valid GHIN handicap in 2025</strong> as part of the registration fees, ensuring transparency</li>
                  <li>A <strong>maximum handicap of 26</strong> at the beginning of the tournament is required for all participants</li>
                  <li>For tournament purposes, Handicaps will be calculated at <strong>90% of the GHIN handicap</strong></li>
                </ul>
              </div>

              <div className="content-card">
                <h4>Posting Requirements</h4>
                <ul className="info-list">
                  <li>All scores should be posted <strong>regardless of where and when you played</strong> (not only SAGA Scores)</li>
                  <li><strong>'NET' double bogey</strong> is the max score per hole under the new WHS (World Handicap System)</li>
                </ul>
              </div>

              <div className="highlight-box important">
                <p><strong>⚠️ Important:</strong> THE EXECUTIVE COMMITTEE WILL REVIEW AND DETERMINE EACH PLAYER'S FINAL HANDICAP FOR TOURNAMENT PLAY</p>
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
                  </li>
                  <li>
                    <strong>Example:</strong> If a player cannot attend the first round, they may 
                    select a future round from the other team's schedule to count as their first round
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

                <h4>Makeup Round Dates — Forsgate Country Club</h4>
                <p><strong>Brunswick Cup Dates</strong></p>
                <div className="makeup-dates-grid">
                  <div className="date-item">April 26th</div>
                  <div className="date-item">May 16th</div>
                  <div className="date-item">May 30th</div>
                  <div className="date-item">June 14th</div>
                  <div className="date-item">June 27th</div>
                  <div className="date-item">July 19th</div>
                  <div className="date-item">Aug 2nd</div>
                  <div className="date-item">Aug 22nd</div>
                  <div className="date-item">Sept 20th</div>
                </div>
              </div>
            </section>

            {/* SAGA Rules */}
            <section id="saga-rules" className="tour-section">
              <h2>SAGA Rules</h2>

              <div className="content-card">
                <h4>SAGA Specific Rules</h4>
                <ol className="info-list numbered">
                  <li>The tournament directors and/or executive members who are present will arbitrate any disputes after the round. Do not enter a score for the hole(s) on which the dispute occurred, but each participant must still complete the hole.</li>
                  <li>Flights will play from the tees decided by the committee.</li>
                  <li><strong>Count every stroke:</strong> A stroke is the forward movement of the club made with the intention of striking the ball. Every stroke counts, including whiffs. (A whiff is when you attempt to hit the ball but miss it entirely.) It is your responsibility to keep track of your own strokes on each hole. We will follow USGA rules.</li>
                  <li>All players must agree (sign card) on the scores being turned in at the end of the round. It is mandatory to add the total for each round for each player in the foursome.</li>
                  <li><strong>Gimmie:</strong> Pick up the ball while putting if the ball is inside the leather of your putter (standard length).</li>
                </ol>
              </div>

              <div className="content-card">
                <h4>Pace of Play</h4>
                <ol className="info-list numbered">
                  <li>For the speed of play, once your attempt for net bogey is unsuccessful <strong>AND</strong> you have reached your maximum equitable score control (ESC) score, pick up your ball.</li>
                  <li>If your group or any player is unusually slow, please speak up and ask them to pick up the pace. Groups need to maintain an average pace of <strong>15 minutes per hole</strong> and not fall behind more than 1 hole from the group in front of them.</li>
                  <li>Always be ready to play when it is your turn and play ready golf.</li>
                  <li>Hit your ball before helping to look for someone else's ball.</li>
                  <li>Putt out rather than mark your ball and encourage others to putt out as well.</li>
                  <li>Stand behind your ball and align your putt while others are putting.</li>
                  <li>Always have your club and an extra ball readily available to speed up play.</li>
                  <li>Use common sense to speed up play — Think! Think! Think!</li>
                </ol>
              </div>

              <div className="content-card">
                <h4>Tie-Breaking Rules (Finals)</h4>
                <p>
                  Overall winner for each flight will be determined by adding the scores assigned based on rankings
                  at the end of the regular season and adding scores from the Playoff + Finals.
                </p>
                <ul className="info-list">
                  <li>Top point-getter from each flight will win that flight</li>
                  <li>In case of a tie to determine the flight winners, the following method will be employed:
                    <ol className="tiebreak-list">
                      <li>The highest Stableford score at SAGA Open</li>
                      <li>The highest Stableford in the first playoff event, and if still a tie</li>
                      <li>The highest Stableford score on the back 9 of SAGA Open, and if still a tie</li>
                      <li>The highest Stableford score on the last 6 holes of SAGA Open, and if still a tie</li>
                      <li>The highest Stableford score on the last 3 holes of SAGA Open, and if still a tie</li>
                      <li>The highest Stableford score on the last hole of SAGA Open, and if still a tie</li>
                      <li>Coin toss</li>
                    </ol>
                  </li>
                  <li>The back 9 as described above relates to holes 10–18, irrelevant of the starting hole</li>
                </ul>
                <div className="note-box">
                  <p>
                    <strong>Anish Joshi Trophy:</strong> The winner will be determined by adding the points at the end of
                    the playoff round plus the SAGA Open score. If there is a tie, the flight winner method will be employed.
                  </p>
                </div>
              </div>

              <div className="content-card">
                <h4>Common Rules to Be Aware Of</h4>
                <ol className="info-list numbered">
                  <li>
                    <strong>Maximum Clubs in Bag:</strong> A player is allowed to carry a maximum of 14 clubs.
                    Failing to do so will lead to a 2-stroke penalty for each hole. Maximum penalty is 4 strokes
                    for the round. Penalty will be applied to the first two holes played.
                  </li>
                  <li>
                    <strong>Ball Falling Off Tee:</strong> If a ball falls off the tee or is knocked off by a player
                    addressing it, the ball may be re-teed without penalty.
                  </li>
                  <li>
                    <strong>Ball Moving Accidentally After Address:</strong> No penalty if the ball moves after it
                    has been addressed, either off the tee or on the green.
                  </li>
                  <li>
                    <strong>Artificial Obstruction:</strong> (such as a bench, water fountain, shelter, house, or
                    protective screen) If your ball lies on or touches an artificial obstruction, or when an
                    immovable obstruction within two club lengths of the ball interferes with your stance or stroke,
                    you may without penalty pick up the ball and drop it within two club lengths of the original lie,
                    but not nearer the hole.
                    <br/><em>Note: Out of bounds stakes are not considered artificial obstructions.</em>
                  </li>
                  <li>
                    <strong>Casual Water, Ground Under Repair:</strong> If your ball lies in or touches casual water,
                    ground under repair, or a hole made by a burrowing animal, you may obtain relief without penalty.
                    Your ball may be lifted and dropped as near as possible to the original lie, but not nearer the hole.
                    If your ball requires such relief in a bunker, it must be dropped within the bunker. If you elect
                    to drop behind the bunker, you must count one penalty stroke. (Casual water is a puddle of rain
                    water or hose water — not a creek or pond.)
                  </li>
                  <li>
                    <strong>Wrong Ball:</strong> If a competitor makes a stroke or strokes at a wrong ball that is not
                    in a hazard, they incur a penalty of two strokes. The competitor must correct their mistake before
                    the next hole by playing the correct ball. Strokes made with a wrong ball do not count in their
                    score. If a player plays any strokes in a hazard with a wrong ball, there is no penalty provided
                    that player then plays the correct ball. If the wrong ball belongs to another player in the group,
                    its owner shall place a ball on the spot from which the wrong ball was played.
                  </li>
                </ol>
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
                  <img
                    src="/trophies/anish-joshi-trophy.jpg"
                    alt="SAGA Anish Joshi Memorial Trophy"
                    className="trophy-image"
                  />
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

              {/* Past Champions */}
              <div className="content-card">
                <h4>Past SAGA Champions</h4>
                {championsLoading ? (
                  <div className="champions-loading">
                    <p>Loading past champions...</p>
                  </div>
                ) : pastChampions.length > 0 ? (
                  <div className="past-champions-grid">
                    {pastChampions.map((champ) => (
                      <div className="champion-card" key={champ.id}>
                        <span className="champion-year">{champ.year}</span>
                        <span className="champion-name">{champ.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="champions-empty">
                    <p>Past champions will be listed here once the season concludes.</p>
                  </div>
                )}
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
                    are not in the hunt on the day of the finals.
                  </p>
                </div>

                <h4>Eligibility Requirements</h4>
                <ul className="checklist">
                  <li>Anyone can play that day if they have a registered handicap</li>
                  <li>Must be vouched for by a member of the SAGA executive committee or a captain</li>
                </ul>
              </div>
            </section>

            {/* United Healthcare Cup — now includes Teams & Captain Responsibilities */}
            <section id="uhc-cup" className="tour-section">
              <h2>United Healthcare Cup</h2>


              {/* Teams sub-section */}
              <div className="content-card">
              <img
                  src="/trophies/uhc-trophy.jpg"
                  alt="United Health Care Champions Trophy"
                  className="trophy-image"
                />
                <h4>Teams</h4>
                <div className="teams-grid">
                  <div className="team-card linksmen">
                    <div className="team-color-bar"></div>
                    <div className="team-header">
                      <h3>Linksmen</h3>
                      <div className="team-color-circle"></div>
                    </div>
                    <p className="captain-name"><strong>Captain:</strong> Niraj Desai</p>
                  </div>

                  <div className="team-card brunswick">
                    <div className="team-color-bar"></div>
                    <div className="team-header">
                      <h3>Brunswick</h3>
                      <div className="team-color-circle"></div>
                    </div>
                    <p className="captain-name"><strong>Captain:</strong> Amit Parekh</p>
                  </div>
                </div>
              </div>

              {/* Captain Responsibilities sub-section */}
              <div className="content-card">
                <h4>Captain Responsibilities</h4>

                <h5 className="sub-heading">Player Signups & Responsibilities</h5>
                <ul className="info-list">
                  <li>Promote SAGA within your club and encourage eligible members to sign up</li>
                  <li>Be able to vouch for all players registering from your club and confirm eligibility</li>
                  <li>Ensure all players join the SAGA WhatsApp group</li>
                  <li>Make sure all players understand and agree to abide by SAGA's four cornerstones</li>
                </ul>

                <h5 className="sub-heading">Working with the SAGA Board & Executive Committee</h5>
                <ul className="info-list">
                  <li>Conduct regular round matches in alignment with the SAGA calendar, rules, and formats</li>
                  <li>Serve as the primary rules official onsite during SAGA rounds</li>
                  <li>Send regular SAGA communications to your chapter members</li>
                  <li>Submit scores for all regular round matches that are held</li>
                  <li>Maintain a chapter-level leaderboard</li>
                  <li>Select an 8-player team to compete in the UHC Cup</li>
                </ul>

                <h5 className="sub-heading">Club Eligibility Requirements</h5>
                <ul className="info-list">
                  <li>The club must have a minimum of 10 members interested in signing up for SAGA</li>
                  <li>All players must have an active USGA handicap and meet USGA eligibility requirements, including having played golf for several years</li>
                  <li>All members must agree to abide by the four cornerstones of SAGA</li>
                </ul>
              </div>

              {/* Competition Format */}
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

        .tour-section h4:first-child {
          margin-top: 0;
        }

        .sub-heading {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 1.75rem 0 0.75rem 0;
          padding-bottom: 0.35rem;
          border-bottom: 1px solid var(--border);
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
          margin: 1rem 0 0.5rem;
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

        .info-list.numbered {
          counter-reset: list-counter;
        }

        .info-list.numbered li::before {
          counter-increment: list-counter;
          content: counter(list-counter) ".";
          font-size: 1rem;
        }

        .tiebreak-list {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0 0 1rem;
          counter-reset: tiebreak-counter;
        }

        .tiebreak-list li {
          padding: 0.4rem 0 0.4rem 1.5rem;
          position: relative;
          line-height: 1.5;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .tiebreak-list li::before {
          counter-increment: tiebreak-counter;
          content: counter(tiebreak-counter, lower-alpha) ")";
          position: absolute;
          left: 0;
          color: var(--primary);
          font-weight: 600;
        }

        .makeup-dates-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-top: 0.75rem;
        }

        .date-item {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: var(--radius);
          padding: 0.625rem 1rem;
          text-align: center;
          font-weight: 500;
          color: #1e3a8a;
          font-size: 0.95rem;
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

        .trophy-image {
          display: block;
          max-height: 160px;
          width: auto;
          margin: 0 auto 1rem;
          border-radius: var(--radius-lg);
          object-fit: contain;
        }

        .trophy-subtitle {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--primary);
          font-style: italic;
        }

        .uhc-trophy-showcase {
          text-align: center;
          padding: 2rem;
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

        /* Fees Grid — dynamic from API */
        .fees-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .fee-item {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }

        .fee-item:hover {
          border-color: var(--primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .fee-item.special {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-color: #86efac;
        }

        .fee-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .fee-label {
          font-weight: 500;
          color: var(--text-primary);
        }

        .fee-description {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .fee-amount {
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--primary);
          white-space: nowrap;
          margin-left: 1rem;
        }

        .fee-item.special .fee-amount {
          color: #059669;
        }

        .fees-loading,
        .fees-error,
        .fees-empty {
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary);
          background: var(--border-light);
          border-radius: var(--radius);
          margin: 1rem 0;
        }

        .fees-error {
          background: #fef2f2;
          color: #991b1b;
        }

        /* Past Champions */
        .past-champions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          margin-top: 1.25rem;
        }

        .champion-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem 1rem;
          text-align: center;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .champion-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
          transform: translateY(-2px);
        }

        .champion-year {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .champion-name {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .champions-loading,
        .champions-empty {
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary);
          background: var(--border-light);
          border-radius: var(--radius);
          margin-top: 1rem;
        }

        /* Reset Points Table */
        .reset-points-table-wrapper {
          overflow-x: auto;
          margin-top: 1rem;
        }

        .reset-points-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }

        .reset-points-table thead th {
          background: #f1f5f9;
          color: var(--text-primary);
          font-weight: 700;
          padding: 0.75rem 1rem;
          text-align: center;
          border-bottom: 2px solid #e2e8f0;
        }

        .reset-points-table tbody td {
          padding: 0.625rem 1rem;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
          color: var(--text-secondary);
        }

        .reset-points-table tbody tr:hover {
          background: rgba(13, 148, 136, 0.04);
        }

        .reset-points-table {
          max-width: 300px;
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

          .fees-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}