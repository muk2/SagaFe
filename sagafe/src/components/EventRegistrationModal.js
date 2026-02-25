import React, { useState, useCallback } from 'react';
import PaymentForm from './PaymentForm';
import { registrationsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * Generates a UUID v4 for idempotency keys
 */
function generateIdempotencyKey() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Event Registration Modal — handles both member and non-member registration
 * with integrated payment via PaymentForm.
 *
 * Props:
 * @param {object} event - The event to register for
 * @param {function} onClose - Called to close the modal
 * @param {function} onSuccess - Called after successful registration
 */
export default function EventRegistrationModal({ event, onClose, onSuccess }) {
  const { user } = useAuth();

  // Form state
  const [registrationForm, setRegistrationForm] = useState({
    name: user ? `${user.first_name} ${user.last_name}` : '',
    email: user ? user.email : '',
    phone: user ? user.phone_number || '' : '',
    handicap: user ? user.handicap || '' : '',
  });

  // Flow state
  const [step, setStep] = useState('form'); // 'form' | 'confirmation' | 'declined'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);
  const [failedRegistrationId, setFailedRegistrationId] = useState(null);

  const memberPrice = event.price || event.member_price;
  const guestPrice = event.guest_price || event.price;
  const displayPrice = user ? memberPrice : guestPrice;

  const handlePaymentToken = useCallback(
    async (token) => {
      setLoading(true);
      setError('');
      setPaymentError('');

      try {
        const idempotencyKey = generateIdempotencyKey();

        let response;
        if (failedRegistrationId) {
          // Retry a previously failed payment
          response = await registrationsApi.retryPayment(failedRegistrationId, {
            payment_token: token,
            idempotency_key: idempotencyKey,
          });
        } else if (user) {
          // Authenticated member registration
          response = await registrationsApi.register({
            event_id: event.id,
            handicap: registrationForm.handicap,
            payment_token: token,
            idempotency_key: idempotencyKey,
          });
        } else {
          // Guest registration
          response = await registrationsApi.registerGuest({
            event_id: event.id,
            first_name: registrationForm.name.split(' ')[0] || registrationForm.name,
            last_name: registrationForm.name.split(' ').slice(1).join(' ') || '',
            email: registrationForm.email,
            phone: registrationForm.phone,
            handicap: registrationForm.handicap,
            payment_token: token,
            idempotency_key: idempotencyKey,
          });
        }

        setConfirmationData(response);
        setStep('confirmation');
        if (onSuccess) onSuccess(response);
      } catch (err) {
        const message = err.message || 'Payment failed';
        // Check if the registration was created but payment declined
        if (err.registration_id) {
          setFailedRegistrationId(err.registration_id);
        }
        setPaymentError(message);
        setStep('declined');
      } finally {
        setLoading(false);
      }
    },
    [user, event.id, registrationForm, failedRegistrationId, onSuccess]
  );

  const handlePaymentError = useCallback((errorMsg) => {
    setPaymentError(errorMsg);
  }, []);

  const handleRetry = useCallback(() => {
    setPaymentError('');
    setStep('form');
  }, []);

  const handleFormFieldChange = (field, value) => {
    setRegistrationForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validate that non-auth users have filled required fields
  const isFormValid = () => {
    if (user) return true; // Auth users auto-fill
    return (
      registrationForm.name.trim() &&
      registrationForm.email.trim() &&
      registrationForm.phone.trim()
    );
  };

  // --- CONFIRMATION VIEW ---
  if (step === 'confirmation') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="registration-confirmation">
            <div className="confirmation-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="48" height="48">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Registration Confirmed</h2>
            <div className="confirmation-details">
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
              A confirmation has been sent to your email.
            </p>
            <button className="primary-btn" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- DECLINED VIEW ---
  if (step === 'declined') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
              onClick={handleRetry}
              style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FORM VIEW (default) ---
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="modal-header">
          <h2>Register for Event</h2>
          <p>{event.golf_course}</p>
        </div>
        <div className="modal-event-info">
          <div className="info-row">
            <span className="info-label">Date:</span>
            <span>
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          {event.start_time && (
            <div className="info-row">
              <span className="info-label">Time:</span>
              <span>{event.start_time}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Location:</span>
            <span>
              {event.township}, {event.state}
            </span>
          </div>
          {displayPrice && (
            <div className="info-row">
              <span className="info-label">Price:</span>
              <span className="price-highlight">
                ${displayPrice}
                {user && guestPrice && memberPrice !== guestPrice && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    (Member price)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="registration-form">
          {error && (
            <div className="message error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Registration fields — auto-filled for logged-in users */}
          {!user && (
            <>
              <div className="form-group">
                <label htmlFor="reg-name">Full Name</label>
                <input
                  type="text"
                  id="reg-name"
                  value={registrationForm.name}
                  onChange={(e) => handleFormFieldChange('name', e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <input
                  type="email"
                  id="reg-email"
                  value={registrationForm.email}
                  onChange={(e) => handleFormFieldChange('email', e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reg-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="reg-phone"
                    value={registrationForm.phone}
                    onChange={(e) => handleFormFieldChange('phone', e.target.value)}
                    required
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-handicap">Golf Handicap</label>
                  <input
                    type="text"
                    id="reg-handicap"
                    value={registrationForm.handicap}
                    onChange={(e) => handleFormFieldChange('handicap', e.target.value)}
                    placeholder="e.g., 12"
                  />
                </div>
              </div>
            </>
          )}

          {user && (
            <div className="form-group">
              <label htmlFor="reg-handicap-member">Golf Handicap</label>
              <input
                type="text"
                id="reg-handicap-member"
                value={registrationForm.handicap}
                onChange={(e) => handleFormFieldChange('handicap', e.target.value)}
                placeholder="e.g., 12"
              />
            </div>
          )}

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

          {/* If no price (free event), show simple register button */}
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
        </div>
      </div>
    </div>
  );
}
