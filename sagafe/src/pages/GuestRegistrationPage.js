import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PaymentForm from '../components/PaymentForm';
import { eventsApi, registrationsApi, adminApi } from '../lib/api';

function generateIdempotencyKey() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function GuestRegistrationPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');

  // Data state
  const [event, setEvent] = useState(null);
  const [guestRate, setGuestRate] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    handicap: '',
    referral_source: '',
  });

  // Flow state
  const [step, setStep] = useState('form'); // 'form' | 'confirmation' | 'declined'
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);

  // Load event details and guest rate
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [events, rateData] = await Promise.all([
          eventsApi.getAll(),
          adminApi.getGuestRate().catch(() => ({ rate: null })),
        ]);

        let foundEvent = null;
        if (eventId) {
          foundEvent = events.find((e) => String(e.id) === String(eventId));
          if (foundEvent) {
            setEvent(foundEvent);
          } else {
            setDataError('Event not found');
          }
        }

        setGuestRate(rateData.rate || foundEvent?.guest_price || foundEvent?.price || null);
      } catch {
        // If parallel fetch failed, try just events
        try {
          const events = await eventsApi.getAll();
          if (eventId) {
            const foundEvent = events.find((e) => String(e.id) === String(eventId));
            if (foundEvent) {
              setEvent(foundEvent);
              setGuestRate(foundEvent.guest_price || foundEvent.price || null);
            } else {
              setDataError('Event not found');
            }
          }
        } catch {
          setDataError('Unable to load event details');
        }
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [eventId]);

  const displayPrice = guestRate || (event && (event.guest_price || event.price));

  const isFormValid = () => {
    return (
      form.first_name.trim() &&
      form.last_name.trim() &&
      form.email.trim() &&
      form.phone.trim()
    );
  };

  const handlePaymentToken = useCallback(
    async (token) => {
      setLoading(true);
      setPaymentError('');

      try {
        const response = await registrationsApi.registerGuest({
          event_id: event.id,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          handicap: form.handicap || null,
          referral_source: form.referral_source || null,
          payment_token: token,
          idempotency_key: generateIdempotencyKey(),
        });

        setConfirmationData(response);
        setStep('confirmation');
      } catch (err) {
        setPaymentError(err.message || 'Payment failed');
        setStep('declined');
      } finally {
        setLoading(false);
      }
    },
    [event, form]
  );

  const handlePaymentError = useCallback((msg) => {
    setPaymentError(msg);
  }, []);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  // Loading
  if (loadingData) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error
  if (dataError || !event) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Guest Registration</h1>
        </div>
        <div className="empty-state">
          <p>{dataError || 'No event selected.'}</p>
          <Link to="/events" className="primary-btn" style={{ display: 'inline-flex', textDecoration: 'none', marginTop: '1rem' }}>
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  // Confirmation
  if (step === 'confirmation') {
    return (
      <div className="page-container">
        <div className="guest-registration-card">
          <div className="registration-confirmation">
            <div className="confirmation-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="48" height="48">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Registration Confirmed</h2>
            <div className="confirmation-details">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span>{form.first_name} {form.last_name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Event:</span>
                <span>{event.golf_course}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date:</span>
                <span>{event.date}</span>
              </div>
              {displayPrice && (
                <div className="info-row">
                  <span className="info-label">Amount:</span>
                  <span className="price-highlight">${displayPrice}</span>
                </div>
              )}
              {confirmationData?.confirmation_id && (
                <div className="info-row">
                  <span className="info-label">Confirmation:</span>
                  <span>{confirmationData.confirmation_id}</span>
                </div>
              )}
            </div>
            <p className="confirmation-message">
              A confirmation has been sent to {form.email}
            </p>
            <div className="guest-cta">
              <p>Want to become a SAGA member?</p>
              <Link to="/signup" className="primary-btn" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                Join SAGA
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Declined
  if (step === 'declined') {
    return (
      <div className="page-container">
        <div className="guest-registration-card">
          <div className="registration-declined">
            <div className="declined-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="48" height="48">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Payment Declined</h2>
            <p>Your card was declined. Please try a different card.</p>
            <PaymentForm
              amount={displayPrice ? String(displayPrice) : undefined}
              onTokenReceived={handlePaymentToken}
              onError={handlePaymentError}
              loading={loading}
              submitLabel="Retry Payment"
              error={paymentError}
            />
            <button
              className="secondary-btn"
              onClick={() => { setPaymentError(''); setStep('form'); }}
              style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Guest Registration</h1>
        <p className="page-subtitle">Register as a guest for this event</p>
      </div>

      <div className="guest-registration-card">
        {/* Event Info Header */}
        <div className="guest-event-header">
          <h2>{event.golf_course}</h2>
          <div className="guest-event-meta">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {event.township}, {event.state}
            </span>
          </div>
          {displayPrice && (
            <div className="guest-price-display">
              Registration Fee: <strong>${displayPrice}</strong>
            </div>
          )}
        </div>

        {/* Guest Form */}
        <form className="registration-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guest-first-name">First Name *</label>
              <input
                type="text"
                id="guest-first-name"
                value={form.first_name}
                onChange={(e) => handleFieldChange('first_name', e.target.value)}
                required
                placeholder="First name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="guest-last-name">Last Name *</label>
              <input
                type="text"
                id="guest-last-name"
                value={form.last_name}
                onChange={(e) => handleFieldChange('last_name', e.target.value)}
                required
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="guest-email">Email *</label>
            <input
              type="email"
              id="guest-email"
              value={form.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guest-phone">Phone *</label>
              <input
                type="tel"
                id="guest-phone"
                value={form.phone}
                onChange={(e) => handleFieldChange('phone', formatPhone(e.target.value))}
                required
                placeholder="(555) 555-5555"
              />
            </div>
            <div className="form-group">
              <label htmlFor="guest-handicap">Golf Handicap</label>
              <input
                type="text"
                id="guest-handicap"
                value={form.handicap}
                onChange={(e) => handleFieldChange('handicap', e.target.value)}
                placeholder="e.g., 12"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="guest-referral">How did you hear about SAGA?</label>
            <input
              type="text"
              id="guest-referral"
              value={form.referral_source}
              onChange={(e) => handleFieldChange('referral_source', e.target.value)}
              placeholder="Friend, social media, etc."
            />
          </div>

          {/* Payment section */}
          {displayPrice > 0 && isFormValid() && (
            <PaymentForm
              amount={String(displayPrice)}
              onTokenReceived={handlePaymentToken}
              onError={handlePaymentError}
              loading={loading}
              submitLabel="Register & Pay"
              error={paymentError}
            />
          )}

          {displayPrice > 0 && !isFormValid() && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
              Please fill in all required fields (*) to continue to payment
            </p>
          )}

          {(!displayPrice || displayPrice <= 0) && (
            <button
              type="button"
              className="submit-registration"
              onClick={() => handlePaymentToken(null)}
              disabled={loading || !isFormValid()}
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
