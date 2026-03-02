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
    sponsor: '',
    sponsorAmount: 350,
    companyName: '',
  });

  // Flow state
  const [step, setStep] = useState('form'); // 'form' | 'confirmation' | 'declined'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);
  const [failedRegistrationId, setFailedRegistrationId] = useState(null);

  const memberPrice  = event.price || event.member_price;
  const guestPrice   = event.guest_price || event.price;
  const basePrice    = user ? memberPrice : guestPrice;
  const sponsorAdd   = registrationForm.sponsor === 'yes' ? (parseFloat(registrationForm.sponsorAmount) || 0) : 0;
  const displayPrice = basePrice ? (parseFloat(basePrice) + sponsorAdd) : sponsorAdd || null;

  const handleFormFieldChange = (field, value) => {
    setRegistrationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentToken = useCallback(
    async (token) => {
      setLoading(true);
      setError('');
      setPaymentError('');

      const isSponsor    = registrationForm.sponsor === 'yes';
      const sponsorData  = {
        is_sponsor:     isSponsor,
        sponsor_amount: isSponsor ? parseFloat(registrationForm.sponsorAmount) : null,
        company_name:   isSponsor ? registrationForm.companyName : null,
      };

      try {
        const idempotencyKey = generateIdempotencyKey();

        let response;
        if (failedRegistrationId) {
          response = await registrationsApi.retryPayment(failedRegistrationId, {
            payment_token: token,
            idempotency_key: idempotencyKey,
          });
        } else if (user) {
          response = await registrationsApi.register({
            event_id:        event.id,
            handicap:        registrationForm.handicap,
            payment_token:   token,
            idempotency_key: idempotencyKey,
            ...sponsorData,
          });
        } else {
          response = await registrationsApi.registerGuest({
            event_id:        event.id,
            first_name:      registrationForm.name.split(' ')[0] || registrationForm.name,
            last_name:       registrationForm.name.split(' ').slice(1).join(' ') || '',
            email:           registrationForm.email,
            phone:           registrationForm.phone,
            handicap:        registrationForm.handicap,
            payment_token:   token,
            idempotency_key: idempotencyKey,
            ...sponsorData,
          });
        }

        setConfirmationData(response);
        setStep('confirmation');
        if (onSuccess) onSuccess(response);
      } catch (err) {
        const message = err.message || 'Payment failed';
        if (err.registration_id) setFailedRegistrationId(err.registration_id);
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

  // Validate required fields for guests; also require company name if sponsoring
  const isFormValid = () => {
    if (!user && (!registrationForm.name.trim() || !registrationForm.email.trim() || !registrationForm.phone.trim())) {
      return false;
    }
    if (registrationForm.sponsor === 'yes' && !registrationForm.companyName.trim()) {
      return false;
    }
    return true;
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
              {displayPrice > 0 && (
                <div className="info-row">
                  <span className="info-label">Amount:</span>
                  <span className="price-highlight">${parseFloat(displayPrice).toFixed(2)}</span>
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
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
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
            <span>{event.township}, {event.state}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Price:</span>
            <span className="price-highlight">
              ${displayPrice ? parseFloat(displayPrice).toFixed(2) : '0.00'}
              {user && guestPrice && memberPrice !== guestPrice && registrationForm.sponsor !== 'yes' && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  (Member price)
                </span>
              )}
              {registrationForm.sponsor === 'yes' && (
                <span style={{ fontSize: '0.8rem', color: '#7c3aed', marginLeft: '0.5rem' }}>
                  (Base + ${parseFloat(registrationForm.sponsorAmount) || 0} sponsorship)
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="registration-form">
          {error && (
            <div className="message error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* All fields always shown — pre-filled for logged-in users */}
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

          {/* Sponsorship section */}
          <div className="form-group sponsor-dropdown-group">
            <label htmlFor="reg-sponsor">
              Would you like to sponsor this event?{' '}
              <span className="optional-label">(Optional)</span>
            </label>
            <select
              id="reg-sponsor"
              value={registrationForm.sponsor}
              onChange={(e) => handleFormFieldChange('sponsor', e.target.value)}
              className="sponsor-select"
            >
              <option value=""></option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {registrationForm.sponsor === 'yes' && (
            <div className="sponsor-fields">
              <div className="sponsor-fields-inner">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="reg-sponsorAmount">Sponsorship Amount</label>
                    <div className="input-prefix-wrap">
                      <span className="input-prefix">$</span>
                      <input
                        type="number"
                        id="reg-sponsorAmount"
                        value={registrationForm.sponsorAmount}
                        onChange={(e) => handleFormFieldChange('sponsorAmount', e.target.value)}
                        min="1"
                        step="1"
                        required
                        className="prefix-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-companyName">Company Name</label>
                    <input
                      type="text"
                      id="reg-companyName"
                      value={registrationForm.companyName}
                      onChange={(e) => handleFormFieldChange('companyName', e.target.value)}
                      required
                      placeholder="Enter company name"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment section */}
          {displayPrice > 0 && isFormValid() && (
            <PaymentForm
              amount={String(parseFloat(displayPrice).toFixed(2))}
              onTokenReceived={handlePaymentToken}
              onError={handlePaymentError}
              loading={loading}
              submitLabel={`Register & Pay — $${parseFloat(displayPrice).toFixed(2)}`}
              error={paymentError}
            />
          )}

          {/* Free event button */}
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