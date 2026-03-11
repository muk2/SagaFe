import React, { useState, useEffect } from 'react';
import { eventsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import EventRegistrationModal from '../components/EventRegistrationModal';
import { formatTime } from '../lib/dateUtils';


const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

export default function EventsPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(2026);
  const [viewMode, setViewMode] = useState('list');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  // Fetch events from API on mount
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getAll();
      console.log('API Events Data:', data); // ✅ Debug log
      if (data.length > 0) {
        console.log('First event date format:', data[0].date); // ✅ Check date format
      }
      setItems(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Unable to load events");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Fix date format for calendar - handles both YYYY-MM-DD and MM/DD/YYYY
  function formatDateForComparison(dateStr) {
    if (!dateStr) return new Date();
    
    // If it's already a Date object, return it
    if (dateStr instanceof Date) return dateStr;
    
    // If it's a string, parse it
    if (typeof dateStr === 'string') {
      // Check if it's YYYY-MM-DD format (from API)
      if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
  
  
      // Check if it's MM/DD/YYYY format
      if (dateStr.includes('/')) {
        const [month, day, year] = dateStr.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      console.warn('Invalid date format:', dateStr);
      return new Date();
    }
    
    return new Date();
  }

  // ✅ Separate events by event_type
  const sortedEvents = [...items].sort((a, b) => {
    const dateA = formatDateForComparison(a.date);
    const dateB = formatDateForComparison(b.date);
    return dateA - dateB;
  });
  const championshipEvent = items.find(e => e.event_type === 'championship') || null;
  const ryderCupEvent = items.find(e => e.event_type === 'ryder_cup') || null;
  const regularEvents = sortedEvents.filter(e => !e.event_type || e.event_type === 'regular');

  // ✅ Check if event is championship or ryder cup
  const isChampionship = (eventId) => championshipEvent && championshipEvent.id === eventId;
  const isRyderCup = (eventId) => ryderCupEvent && ryderCupEvent.id === eventId;

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (day) => {
    // Format: YYYY-MM-DD to match API format
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const matched = items.filter((event) => event.date === dateStr);

    // Also check if this date is day 2 of a Ryder Cup event
    if (ryderCupEvent) {
      const rcDate = formatDateForComparison(ryderCupEvent.date);
      const day2 = new Date(rcDate);
      day2.setDate(day2.getDate() + 1);
      const day2Str = `${day2.getFullYear()}-${String(day2.getMonth() + 1).padStart(2, "0")}-${String(day2.getDate()).padStart(2, "0")}`;
      if (dateStr === day2Str && !matched.find(e => e.id === ryderCupEvent.id)) {
        matched.push({ ...ryderCupEvent, _isRyderCupDay2: true });
      }
    }

    return matched;
  };
  

  const filteredEvents = items
    .filter(event => {
      const eventDate = formatDateForComparison(event.date);
      const matchesMonth = eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
      return matchesMonth;
    })
    .sort((a, b) => formatDateForComparison(a.date) - formatDateForComparison(b.date));

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const openRegistration = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const closeRegistration = () => {
    setShowRegistrationModal(false);
    setSelectedEvent(null);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = getEventsForDate(day);
      const isToday = new Date().getDate() === day &&
                      new Date().getMonth() === selectedMonth &&
                      new Date().getFullYear() === selectedYear;

      days.push(
        <div key={day} className={`calendar-day ${events.length > 0 ? 'has-events' : ''} ${isToday ? 'today' : ''}`}>
          <span className="day-number">{day}</span>
          {events.map(event => {
            const eventName = isChampionship(event.id)
              ? `SAGA Open ${formatDateForComparison(event.date).getFullYear()}`
              : isRyderCup(event.id)
                ? `SAGA Ryder Cup ${formatDateForComparison(event.date).getFullYear()}`
                : event.golf_course;
            return (
              <div
                key={event._isRyderCupDay2 ? `${event.id}-day2` : event.id}
                className={`calendar-event-dot ${isChampionship(event.id) ? 'championship-event' : ''} ${isRyderCup(event.id) ? 'ryder-cup-event' : ''} ${!event.registration_open ? 'calendar-event-closed' : ''}`}
                onClick={() => event.registration_open && openRegistration(event)}
                title={!event.registration_open ? `${eventName} (Registration Closed)` : eventName}
              >
                {isChampionship(event.id) && <span className="trophy-small">🏆 </span>}
                {isRyderCup(event.id) && <span className="ryder-cup-tag-small">RC </span>}
                {eventName}
                {event._isRyderCupDay2 && ' (Day 2)'}
                {!event.registration_open && <span className="closed-label"> · Closed</span>}
              </div>
            );
          })}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="events-page">
      <div className="contact-hero">
      <div className="hero-content-wrapper">
        <div className="hero-overlay"></div>
        <div className="hero-content-wrapper"></div>
        <h1 className="contact-title">Events & Calendar</h1>
        <p className="contact-subtitle">Browse upcoming tournaments and register for events</p>
        </div>
      </div>
      <div className="page-container">
      <div className="events-controls">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            List
          </button>
          <button
            className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Calendar
          </button>
        </div>

        <div className="month-nav">
          <button className="nav-arrow" onClick={handlePrevMonth}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="current-month">{MONTHS[selectedMonth]} {selectedYear}</span>
          <button className="nav-arrow" onClick={handleNextMonth}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="calendar-container">
          <div className="calendar-header">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>
          <div className="calendar-grid">
            {renderCalendar()}
          </div>
        </div>
      ) : (
        <div className="events-list">
          {filteredEvents.length === 0 ? (
            <div className="no-events">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="48" height="48">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p>No events scheduled for {MONTHS[selectedMonth]} {selectedYear}</p>
              <p className="hint">Try browsing other months using the navigation above</p>
            </div>
          ) : (
            // ✅ Show all events in list view (including championship & ryder cup with highlighting)
            filteredEvents.map(event => {
              const eventName = isChampionship(event.id)
                ? `SAGA Open ${formatDateForComparison(event.date).getFullYear()}`
                : isRyderCup(event.id)
                  ? `SAGA Ryder Cup ${formatDateForComparison(event.date).getFullYear()}`
                  : event.golf_course;
              const rcDate = isRyderCup(event.id) ? formatDateForComparison(event.date) : null;
              const rcDay2 = rcDate ? new Date(rcDate) : null;
              if (rcDay2) rcDay2.setDate(rcDay2.getDate() + 1);
              return (
                <div
                  key={event.id}
                  className={`event-card ${isChampionship(event.id) ? 'championship-highlight' : ''} ${isRyderCup(event.id) ? 'ryder-cup-highlight' : ''}`}
                >
                  {isChampionship(event.id) && (
                    <div className="championship-badge-small">
                      🏆 Championship Event
                    </div>
                  )}
                  {isRyderCup(event.id) && (
                    <div className="ryder-cup-badge-small">
                      SAGA Ryder Cup
                    </div>
                  )}
                  <div className="event-image" style={{
                    backgroundImage: event.image_url
                      ? `url(${getFullImageUrl(event.image_url)})`
                      : 'url(https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800)'
                  }}></div>
                  <div className="event-content">
                    <div className={`event-date-badge ${isRyderCup(event.id) ? 'ryder-cup-date-badge' : ''}`}>
                      <span className="event-month">{MONTHS[formatDateForComparison(event.date).getMonth()].slice(0, 3)}</span>
                      <span className="event-day">
                        {formatDateForComparison(event.date).getDate()}
                        {rcDay2 && `–${rcDay2.getDate()}`}
                      </span>
                    </div>
                    <div className="event-details">
                      <h3>{eventName}</h3>
                      <div className="event-meta">
                        <span className="event-time">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(event.start_time)}
                        </span>
                        <span className="event-location">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {event.township}, {event.state}
                        </span>
                      </div>
                      <div className="event-footer">
                        <div className="event-spots">
                          <div className="spots-bar">
                            <div
                              className="spots-filled"
                              style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                            ></div>
                          </div>
                          <span>{event.capacity - (event.registered || 0)} spots remaining</span>
                        </div>
                        <div className="event-actions">
                        <div className="event-price">
                            ${user
                              ? parseFloat(event.member_price).toFixed(2)
                              : parseFloat(event.guest_price).toFixed(2)
                            }

                          </div>
                          <button
                            className={`register-btn ${isChampionship(event.id) ? 'championship-btn' : ''} ${isRyderCup(event.id) ? 'ryder-cup-btn' : ''} ${event.registration_open === false ? 'register-btn-disabled' : ''}`}
                            onClick={() => event.registration_open !== false && openRegistration(event)}
                            disabled={event.registration_open === false}
                          >
                            {event.registration_open === false ? 'Registration Closed' : isChampionship(event.id) ? 'Register for Championship' : isRyderCup(event.id) ? 'Register for Ryder Cup' : 'Register Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* All Events Section */}
      <section className="all-events-section">
        <h2>All Upcoming Events</h2>
        {loading ? (
        <div className="empty-state">
          <p>Loading events...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <p>{error}</p>
        </div>
      ) : regularEvents.length > 0 ?  ( <>
          <div className="events-grid">
          {regularEvents.map(event => (
            <div key={event.id} className="event-card-compact">
              <div className="compact-date">
                <span className="compact-month">{MONTHS[formatDateForComparison(event.date).getMonth()].slice(0, 3)}</span>
                <span className="compact-day">{formatDateForComparison(event.date).getDate()}</span>
              </div>
              <div className="compact-info">
                <h4>{event.golf_course}</h4>
                <p className="card-location">
                <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      width="16"
                      height="16"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                  {event.township}, {event.state}
                  </p>
              </div>
              <button
                className={`compact-register ${event.registration_open === false ? 'register-btn-disabled' : ''}`}
                onClick={() => event.registration_open !== false && openRegistration(event)}
                disabled={event.registration_open === false}
              >
                {event.registration_open === false ? 'Closed' : 'Register'}
              </button>
            </div>
          ))}
        </div>
        </>
      ) : (
        <div className="empty-state">
          <p>No events available at the moment.</p>
        </div>
      )}
      </section>

      {/* SAGA Ryder Cup Section */}
      {ryderCupEvent && (() => {
        const rcDate = formatDateForComparison(ryderCupEvent.date);
        const rcDay2 = new Date(rcDate);
        rcDay2.setDate(rcDay2.getDate() + 1);
        return (
          <section className="all-events-section">
            <h2>SAGA Ryder Cup</h2>
            <p className="section-subtitle">A two-day team competition in the spirit of the Ryder Cup!</p>
            <div className="events-grid">
              <div className="event-card-compact ryder-cup-card-compact">
                <div className="compact-rc-date ryder-cup-date">
                  <span className="compact-rc-month">{MONTHS[rcDate.getMonth()].slice(0, 3)}</span>
                  <span className="compact-rc-day">{rcDate.getDate()}–{rcDay2.getDate()}</span>
                </div>
                <div className="compact-info">
                  <h4>SAGA Ryder Cup {rcDate.getFullYear()}</h4>
                  <p className="card-location">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {ryderCupEvent.township}, {ryderCupEvent.state}
                  </p>
                </div>
                <button
                  className={`compact-register ryder-cup-register-btn ${ryderCupEvent.registration_open === false ? 'register-btn-disabled' : ''}`}
                  onClick={() => ryderCupEvent.registration_open !== false && openRegistration(ryderCupEvent)}
                  disabled={ryderCupEvent.registration_open === false}
                >
                  {ryderCupEvent.registration_open === false ? 'Closed' : 'Register'}
                </button>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Championship Event Section */}
      {championshipEvent && (
        <section className="all-events-section">
          <h2>🏆 Championship Event</h2>
          <p className="section-subtitle">The final event of the season - compete for the championship title!</p>
          <div className="events-grid">
            <div className="event-card-compact championship-card-compact">
              <div className="compact-date championship-date">
                <span className="compact-month">{MONTHS[formatDateForComparison(championshipEvent.date).getMonth()].slice(0, 3)}</span>
                <span className="compact-day">{formatDateForComparison(championshipEvent.date).getDate()}</span>
              </div>
              <div className="compact-info">
                <h4>SAGA Open {formatDateForComparison(championshipEvent.date).getFullYear()}</h4>
                <p className="card-location">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {championshipEvent.township}, {championshipEvent.state}
                </p>
              </div>
              <button
                className={`compact-register championship-register-btn ${championshipEvent.registration_open === false ? 'register-btn-disabled' : ''}`}
                onClick={() => championshipEvent.registration_open !== false && openRegistration(championshipEvent)}
                disabled={championshipEvent.registration_open === false}
              >
                {championshipEvent.registration_open === false ? 'Closed' : 'Register'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          onClose={closeRegistration}
          displayName={
            championshipEvent && selectedEvent.id === championshipEvent.id
              ? `SAGA Open ${formatDateForComparison(selectedEvent.date).getFullYear()}`
              : ryderCupEvent && selectedEvent.id === ryderCupEvent.id
                ? `SAGA Ryder Cup ${formatDateForComparison(selectedEvent.date).getFullYear()}`
                : undefined
          }
          onSuccess={() => { closeRegistration(); fetchEvents(); }}
        />
      )}
   
<style jsx>{`
  /* Championship Highlights in List View */
  .championship-highlight {
    position: relative;
    border: 2px solid #f59e0b;
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
  }

  .championship-badge-small {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  }

  .championship-btn {
    background: linear-gradient(135deg, #f59e0b, #f97316) !important;
  }

  .championship-btn:hover {
    background: linear-gradient(135deg, #d97706, #ea580c) !important;
  }

  /* Championship Section at Bottom */
  .section-subtitle {
    color: var(--text-secondary);
    margin: -0.5rem 0 1.5rem 0;
    font-size: 1rem;
  }

  .championship-card-compact {
    border: 2px solid #f59e0b;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(249, 115, 22, 0.05));
    width: 470px;
  }

  .championship-date {
    background: linear-gradient(135deg, #f59e0b, #fffcc6);
  }

  .championship-register-btn {
    background: linear-gradient(135deg, #f59e0b, #fffcc6);
  }

  .championship-register-btn:hover {
    background: linear-gradient(135deg, #d97706, #ea580c);
  }

  .register-btn-disabled,
  .register-btn-disabled:hover {
    background: #d1d5db !important;
    color: #6b7280 !important;
    cursor: not-allowed !important;
    opacity: 0.7;
    pointer-events: none;
  }

  /* Championship in Calendar */
  .championship-event {
    background: linear-gradient(90deg, #fef3c7, #fed7aa);
    border-left-color: #f59e0b;
    color: #92400e;
    font-weight: 600;
  }

  .trophy-small {
    margin-right: 0.25rem;
    font-size: 0.85rem;
  }

  /* Ryder Cup Highlights in List View */
  .ryder-cup-highlight {
    position: relative;
    border: 2px solid;
    border-image: linear-gradient(135deg, #dc2626, #2563eb) 1;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.15);
  }

  .ryder-cup-badge-small {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: linear-gradient(135deg, #dc2626, #2563eb);
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
  }

  .ryder-cup-btn {
    background: linear-gradient(135deg, #dc2626, #2563eb) !important;
  }

  .ryder-cup-btn:hover {
    background: linear-gradient(135deg, #b91c1c, #1d4ed8) !important;
  }

  .ryder-cup-date-badge {
    background: linear-gradient(135deg, #dc2626, #2563eb) !important;
    color: white !important;
  }

  .ryder-cup-date-badge .event-month,
  .ryder-cup-date-badge .event-day {
    color: white !important;
  }

  /* Ryder Cup Section */
  .ryder-cup-card-compact {
    border: 2px solid;
    border-image: linear-gradient(135deg, #dc2626, #2563eb) 1;
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.05), rgba(37, 99, 235, 0.05));
    width: 470px;
  }

  .ryder-cup-date {
    background: linear-gradient(135deg, #dc2626, #2563eb);
  }

  .ryder-cup-register-btn {
    background: linear-gradient(135deg, #dc2626, #2563eb);
    color: white;
  }

  .ryder-cup-register-btn:hover {
    background: linear-gradient(135deg, #b91c1c, #1d4ed8);
  }

  /* Ryder Cup in Calendar */
  .ryder-cup-event {
    background: linear-gradient(90deg, #fecaca, #bfdbfe);
    border-left-color: #dc2626;
    color: #1e3a5f;
    font-weight: 600;
  }

  .ryder-cup-tag-small {
    margin-right: 0.25rem;
    font-size: 0.7rem;
    font-weight: 800;
    background: linear-gradient(135deg, #dc2626, #2563eb);
    color: white;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
  }
   
  .message-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    animation: slideIn 0.3s ease-out;
  }

  .message-banner.error {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    color: #991b1b;
  }

  .message-banner.success {
    background: #f0fdf4;
    border: 1px solid #86efac;
    color: #166534;
  }

  .message-banner svg {
    flex-shrink: 0;
  }

  .message-banner span {
    font-size: 0.875rem;
    font-weight: 500;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
    </div>
    </div>
  );
 
}