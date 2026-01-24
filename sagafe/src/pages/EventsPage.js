import React, { useState } from 'react';

// Mock events data - will be replaced with API calls later
const MOCK_EVENTS = [
  {
    id: 1,
    title: "Spring Championship",
    date: "2026-03-15",
    time: "8:00 AM",
    course: "Royce Brook Golf Club",
    location: "Hillsborough, NJ",
    description: "Kick off the season with our annual Spring Championship. 18-hole stroke play with flights for all handicap levels.",
    spots: 72,
    registered: 45,
    price: 125,
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800"
  },
  {
    id: 2,
    title: "Monthly Mixer - April",
    date: "2026-04-12",
    time: "7:30 AM",
    course: "Knob Hill Golf Club",
    location: "Manalapan, NJ",
    description: "Casual scramble format perfect for meeting new members and enjoying a relaxed round of golf.",
    spots: 48,
    registered: 32,
    price: 85,
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800"
  },
  {
    id: 3,
    title: "Charity Classic",
    date: "2026-05-24",
    time: "8:30 AM",
    course: "Neshanic Valley Golf Course",
    location: "Neshanic Station, NJ",
    description: "Annual charity event benefiting local youth golf programs. Includes lunch, prizes, and silent auction.",
    spots: 120,
    registered: 89,
    price: 150,
    image: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800"
  },
  {
    id: 4,
    title: "Summer Invitational",
    date: "2026-06-21",
    time: "7:00 AM",
    course: "Fiddler's Elbow Country Club",
    location: "Bedminster, NJ",
    description: "Premier summer event featuring best ball format. Post-round dinner and awards ceremony included.",
    spots: 80,
    registered: 56,
    price: 175,
    image: "https://images.unsplash.com/photo-1600569436985-b50f3882e8ed?w=800"
  },
  {
    id: 5,
    title: "Monthly Mixer - July",
    date: "2026-07-19",
    time: "6:30 AM",
    course: "Jumping Brook Country Club",
    location: "Neptune, NJ",
    description: "Beat the summer heat with an early tee time. Individual stroke play with net scoring.",
    spots: 48,
    registered: 18,
    price: 95,
    image: "https://images.unsplash.com/photo-1592919505780-303950717480?w=800"
  },
  {
    id: 6,
    title: "Fall Championship",
    date: "2026-09-27",
    time: "8:00 AM",
    course: "Gambler Ridge Golf Club",
    location: "Cream Ridge, NJ",
    description: "Season finale championship. Points leaders compete for the annual SAGA Cup trophy.",
    spots: 72,
    registered: 12,
    price: 135,
    image: "https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800"
  }
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function EventsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(2026);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    handicap: ''
  });
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return MOCK_EVENTS.filter(event => event.date === dateStr);
  };

  const filteredEvents = MOCK_EVENTS.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
  });

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

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    // This will be connected to backend later
    alert(`Registration submitted for ${selectedEvent.title}! You will receive a confirmation email shortly.`);
    setShowRegistrationModal(false);
    setRegistrationForm({ name: '', email: '', phone: '', handicap: '' });
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
          {events.map(event => (
            <div
              key={event.id}
              className="calendar-event-dot"
              onClick={() => openRegistration(event)}
              title={event.title}
            >
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Events & Calendar</h1>
        <p className="page-subtitle">Browse upcoming tournaments and register for events</p>
      </div>

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
            filteredEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-image" style={{ backgroundImage: `url(${event.image})` }}></div>
                <div className="event-content">
                  <div className="event-date-badge">
                    <span className="event-month">{MONTHS[new Date(event.date).getMonth()].slice(0, 3)}</span>
                    <span className="event-day">{new Date(event.date).getDate()}</span>
                  </div>
                  <div className="event-details">
                    <h3>{event.title}</h3>
                    <div className="event-meta">
                      <span className="event-time">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {event.time}
                      </span>
                      <span className="event-location">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {event.course}
                      </span>
                    </div>
                    <p className="event-description">{event.description}</p>
                    <div className="event-footer">
                      <div className="event-spots">
                        <div className="spots-bar">
                          <div
                            className="spots-filled"
                            style={{ width: `${(event.registered / event.spots) * 100}%` }}
                          ></div>
                        </div>
                        <span>{event.spots - event.registered} spots remaining</span>
                      </div>
                      <div className="event-actions">
                        <span className="event-price">${event.price}</span>
                        <button
                          className="register-btn"
                          onClick={() => openRegistration(event)}
                        >
                          Register Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Events Section */}
      <section className="all-events-section">
        <h2>All Upcoming Events</h2>
        <div className="events-grid">
          {MOCK_EVENTS.map(event => (
            <div key={event.id} className="event-card-compact">
              <div className="compact-date">
                <span className="compact-month">{MONTHS[new Date(event.date).getMonth()].slice(0, 3)}</span>
                <span className="compact-day">{new Date(event.date).getDate()}</span>
              </div>
              <div className="compact-info">
                <h4>{event.title}</h4>
                <p>{event.course}</p>
              </div>
              <button
                className="compact-register"
                onClick={() => openRegistration(event)}
              >
                Register
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowRegistrationModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRegistrationModal(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="modal-header">
              <h2>Register for Event</h2>
              <p>{selectedEvent.title}</p>
            </div>
            <div className="modal-event-info">
              <div className="info-row">
                <span className="info-label">Date:</span>
                <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Time:</span>
                <span>{selectedEvent.time}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Location:</span>
                <span>{selectedEvent.course}, {selectedEvent.location}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Price:</span>
                <span className="price-highlight">${selectedEvent.price}</span>
              </div>
            </div>
            <form onSubmit={handleRegistrationSubmit} className="registration-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={registrationForm.name}
                  onChange={(e) => setRegistrationForm({...registrationForm, name: e.target.value})}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={registrationForm.email}
                  onChange={(e) => setRegistrationForm({...registrationForm, email: e.target.value})}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={registrationForm.phone}
                    onChange={(e) => setRegistrationForm({...registrationForm, phone: e.target.value})}
                    required
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="handicap">Golf Handicap</label>
                  <input
                    type="text"
                    id="handicap"
                    value={registrationForm.handicap}
                    onChange={(e) => setRegistrationForm({...registrationForm, handicap: e.target.value})}
                    placeholder="e.g., 12"
                  />
                </div>
              </div>
              <button type="submit" className="submit-registration">
                Complete Registration - ${selectedEvent.price}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
