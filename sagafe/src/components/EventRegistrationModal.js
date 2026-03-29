import React, { useState, useCallback, useEffect, useRef } from 'react';
import PayPalPayment from './PayPalPayment';
import { registrationsApi, membersApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatTime } from '../lib/dateUtils';


function formatPhoneNumber(value) {
  const phoneNumber = value.replace(/\D/g, '');
  if (phoneNumber.length <= 3) return phoneNumber;
  else if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  else return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
}

// Safe date parser that avoids UTC timezone issues with YYYY-MM-DD strings
function parseEventDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'string') {
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
  }
  return new Date(dateStr);
}

const EMPTY_GOLFER = { isMember: false, userId: null, name: '', email: '', phone: '', handicap: '', memberSearch: '', searchResults: [], searching: false };


/**
 * Member search input with dropdown results
 */
function MemberSearchInput({ golfer, index, onSelect, onChange }) {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value) => {
    onChange(index, 'memberSearch', value);
    clearTimeout(timerRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await membersApi.search(value);
        setResults(data);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <label htmlFor={`golfer-search-${index}`}>Search Member Name *</label>
      <input
        type="text"
        id={`golfer-search-${index}`}
        value={golfer.memberSearch}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        placeholder="Type member name..."
        autoComplete="off"
      />
      {searching && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Searching...</span>}
      {showDropdown && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '200px', overflowY: 'auto',
        }}>
          {results.map((m) => (
            <div
              key={m.user_id}
              onClick={() => { onSelect(index, m); setShowDropdown(false); }}
              style={{
                padding: '0.6rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6',
                fontSize: '0.875rem',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <strong>{m.first_name} {m.last_name}</strong>
              <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>{m.email}</span>
            </div>
          ))}
        </div>
      )}
      {showDropdown && results.length === 0 && !searching && golfer.memberSearch.length >= 2 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '0.75rem',
          fontSize: '0.85rem', color: '#6b7280', textAlign: 'center',
        }}>
          No members found
        </div>
      )}
    </div>
  );
}


/**
 * Event Registration Modal — handles both member and non-member registration
 * with integrated payment via PaymentForm and support for additional golfers.
 */
export default function EventRegistrationModal({ event, onClose, onSuccess, displayName }) {
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

  // Additional golfers
  const [additionalGolfers, setAdditionalGolfers] = useState([]);

  // Flow state
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);
  const [failedRegistrationId, setFailedRegistrationId] = useState(null);

  const memberPrice  = parseFloat(event.price || event.member_price) || 0;
  const guestPrice   = parseFloat(event.guest_price || event.price) || 0;
  const isMemberActive = user && !user.membership_expired;
  const basePrice    = isMemberActive ? memberPrice : guestPrice;
  const sponsorAdd   = registrationForm.sponsor === 'yes' ? (parseFloat(registrationForm.sponsorAmount) || 0) : 0;

  // Calculate total price including additional golfers
  const additionalGolfersPrice = additionalGolfers.reduce((sum, g) => {
    if (isMemberActive && g.isMember) {
      return sum + memberPrice;
    }
    return sum + guestPrice;
  }, 0);

  const displayPrice = basePrice + sponsorAdd + additionalGolfersPrice;

  const handleFormFieldChange = (field, value) => {
    setRegistrationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setRegistrationForm((prev) => ({ ...prev, phone: formatted }));
  };

  const handleHandicapChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setRegistrationForm((prev) => ({ ...prev, handicap: value }));
      return;
    }
    const regex = /^-?\d*\.?\d{0,1}$/;
    if (regex.test(value)) {
      const numValue = parseFloat(value);
      if (value === '-' || value === '.' || value.endsWith('.') ||
          (!isNaN(numValue) && numValue >= -10 && numValue <= 30)) {
        setRegistrationForm((prev) => ({ ...prev, handicap: value }));
      }
    }
  };

  const handleHandicapBlur = (e) => {
    const value = e.target.value;
    if (value.endsWith('.')) {
      setRegistrationForm(prev => ({ ...prev, handicap: value.slice(0, -1) }));
    }
  };

  // --- Additional Golfer handlers ---
  const addGolfer = () => {
    setAdditionalGolfers(prev => [...prev, { ...EMPTY_GOLFER }]);
  };

  const removeGolfer = (index) => {
    setAdditionalGolfers(prev => prev.filter((_, i) => i !== index));
  };

  const updateGolfer = (index, field, value) => {
    setAdditionalGolfers(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
  };

  const handleGolferMemberToggle = (index, checked) => {
    setAdditionalGolfers(prev => prev.map((g, i) => {
      if (i !== index) return g;
      if (checked) {
        return { ...EMPTY_GOLFER, isMember: true };
      }
      return { ...EMPTY_GOLFER, isMember: false };
    }));
  };

  const handleMemberSelect = (index, member) => {
    setAdditionalGolfers(prev => prev.map((g, i) => {
      if (i !== index) return g;
      return {
        ...g,
        userId: member.user_id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email || '',
        phone: member.phone || '',
        handicap: member.handicap || '',
        memberSearch: `${member.first_name} ${member.last_name}`,
      };
    }));
  };

  const handleGolferPhoneChange = (index, value) => {
    updateGolfer(index, 'phone', formatPhoneNumber(value));
  };

  const handleGolferHandicapChange = (index, value) => {
    if (value === '') {
      updateGolfer(index, 'handicap', value);
      return;
    }
    const regex = /^-?\d*\.?\d{0,1}$/;
    if (regex.test(value)) {
      const numValue = parseFloat(value);
      if (value === '-' || value === '.' || value.endsWith('.') ||
          (!isNaN(numValue) && numValue >= -10 && numValue <= 30)) {
        updateGolfer(index, 'handicap', value);
      }
    }
  };

  // --- PayPal payment handler ---
  const handlePayPalApprove = useCallback(
    async ({ orderID }) => {
      setLoading(true);
      setError('');
      setPaymentError('');

      const isSponsor    = registrationForm.sponsor === 'yes';
      const sponsorData  = {
        is_sponsor:     isSponsor,
        sponsor_amount: isSponsor ? parseFloat(registrationForm.sponsorAmount) : null,
        company_name:   isSponsor ? registrationForm.companyName : null,
      };

      const cleanHandicap = registrationForm.handicap.endsWith('.')
        ? registrationForm.handicap.slice(0, -1)
        : registrationForm.handicap || null;

      // Build additional_golfers payload
      const golferPayload = additionalGolfers.map(g => {
        if (g.isMember && g.userId) {
          return {
            is_member: true,
            user_id: g.userId,
            handicap: g.handicap || null,
          };
        }
        const nameParts = (g.name || '').trim().split(' ');
        return {
          is_member: false,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email: g.email || null,
          phone: g.phone || null,
          handicap: g.handicap || null,
        };
      });

      try {
        let response;
        if (failedRegistrationId) {
          response = await registrationsApi.retryPayment(failedRegistrationId, {
            paypal_order_id: orderID,
          });
        } else if (user) {
          response = await registrationsApi.register({
            event_id:        event.id,
            handicap:        cleanHandicap,
            paypal_order_id: orderID,
            additional_golfers: golferPayload,
            ...sponsorData,
          });
        } else {
          response = await registrationsApi.registerGuest({
            event_id:        event.id,
            first_name:      registrationForm.name.split(' ')[0] || registrationForm.name,
            last_name:       registrationForm.name.split(' ').slice(1).join(' ') || '',
            email:           registrationForm.email,
            phone:           registrationForm.phone,
            handicap:        cleanHandicap,
            paypal_order_id: orderID,
            additional_golfers: golferPayload,
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
    [user, event.id, registrationForm, additionalGolfers, failedRegistrationId, onSuccess]
  );

  const handlePaymentError = useCallback((errorMsg) => {
    setPaymentError(errorMsg);
  }, []);

  // Handler for free events (no payment needed)
  const handleFreeRegistration = useCallback(async () => {
    setLoading(true);
    setError('');

    const isSponsor = registrationForm.sponsor === 'yes';
    const sponsorData = {
      is_sponsor: isSponsor,
      sponsor_amount: isSponsor ? parseFloat(registrationForm.sponsorAmount) : null,
      company_name: isSponsor ? registrationForm.companyName : null,
    };

    const cleanHandicap = registrationForm.handicap.endsWith('.')
      ? registrationForm.handicap.slice(0, -1)
      : registrationForm.handicap || null;

    const golferPayload = additionalGolfers.map(g => {
      if (g.isMember && g.userId) {
        return { is_member: true, user_id: g.userId, handicap: g.handicap || null };
      }
      const nameParts = (g.name || '').trim().split(' ');
      return {
        is_member: false,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: g.email || null,
        phone: g.phone || null,
        handicap: g.handicap || null,
      };
    });

    try {
      let response;
      if (user) {
        response = await registrationsApi.register({
          event_id: event.id,
          handicap: cleanHandicap,
          paypal_order_id: '',
          additional_golfers: golferPayload,
          ...sponsorData,
        });
      } else {
        response = await registrationsApi.registerGuest({
          event_id: event.id,
          first_name: registrationForm.name.split(' ')[0] || registrationForm.name,
          last_name: registrationForm.name.split(' ').slice(1).join(' ') || '',
          email: registrationForm.email,
          phone: registrationForm.phone,
          handicap: cleanHandicap,
          paypal_order_id: '',
          additional_golfers: golferPayload,
          ...sponsorData,
        });
      }
      setConfirmationData(response);
      setStep('confirmation');
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [user, event.id, registrationForm, additionalGolfers, onSuccess]);

  const handleRetry = useCallback(() => {
    setPaymentError('');
    setStep('form');
  }, []);

  // Validate all required fields are filled
  const isFormValid = () => {
    if (!registrationForm.name.trim() || !registrationForm.email.trim() || !registrationForm.phone.trim()) {
      return false;
    }
    if (registrationForm.sponsor === 'yes' && !registrationForm.companyName.trim()) {
      return false;
    }
    // Validate additional golfers
    for (const g of additionalGolfers) {
      if (g.isMember) {
        if (!g.userId) return false;
      } else {
        if (!g.name.trim()) return false;
      }
    }
    return true;
  };

  const totalGolfers = 1 + additionalGolfers.length;

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
                <span>{displayName || event.golf_course}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date:</span>
                <span>
                  {(() => {
                    const d = parseEventDate(event.date);
                    const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    if (event.event_type === 'ryder_cup') {
                      const day2 = new Date(d);
                      day2.setDate(day2.getDate() + 1);
                      return `${formatted} – ${day2.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                    }
                    return formatted;
                  })()}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Golfers:</span>
                <span>{totalGolfers}</span>
              </div>
              {displayPrice > 0 && (
                <div className="info-row">
                  <span className="info-label">Total Amount:</span>
                  <span className="price-highlight">${parseFloat(confirmationData?.amount_charged || displayPrice).toFixed(2)}</span>
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

            <PayPalPayment
              amount={displayPrice || 0}
              description={`SAGA Event Registration — ${displayName || event.golf_course}`}
              onApprove={handlePayPalApprove}
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
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="modal-header">
          <h2>Register for Event</h2>
          <p>{displayName || event.golf_course}</p>
        </div>

        <div className="modal-event-info">
          {displayName && (
            <div className="info-row">
              <span className="info-label">Golf Course:</span>
              <span>{event.golf_course}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Date:</span>
            <span>
              {(() => {
                const d = parseEventDate(event.date);
                const formatted = d.toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                });
                if (event.event_type === 'ryder_cup') {
                  const day2 = new Date(d);
                  day2.setDate(day2.getDate() + 1);
                  const formatted2 = day2.toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  });
                  return `${formatted} – ${formatted2}`;
                }
                return formatted;
              })()}
            </span>
          </div>
          {event.start_time && (
            <div className="info-row">
              <span className="info-label">Time:</span>
              <span>{formatTime(event.start_time)}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Location:</span>
            <span>{event.township}, {event.state}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Total Price:</span>
            <span className="price-highlight">
              ${displayPrice ? parseFloat(displayPrice).toFixed(2) : '0.00'}
              {totalGolfers > 1 && (
                <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                  ({totalGolfers} golfers)
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="registration-form">
          {!user && guestPrice > 0 && (
            <div style={{
              background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '10px',
              padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex',
              alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#1e40af',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <span>
                SAGA members pay <strong>${memberPrice.toFixed(2)}</strong> instead of ${guestPrice.toFixed(2)}.{' '}
                <a href="/login" style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline' }}>Sign in</a> to unlock the member price.
              </span>
            </div>
          )}

          {error && (
            <div className="message error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Primary registrant fields */}
          <div className="form-group">
            <label htmlFor="reg-name">Full Name *</label>
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
            <label htmlFor="reg-email">Email Address *</label>
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
              <label htmlFor="reg-phone">Phone Number *</label>
              <input
                type="tel"
                id="reg-phone"
                value={registrationForm.phone}
                onChange={handlePhoneChange}
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
                onChange={handleHandicapChange}
                onBlur={handleHandicapBlur}
                placeholder="e.g., 12"
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Sponsorship section */}
          <div className="form-group sponsor-dropdown-group">
            <label htmlFor="reg-sponsor">
              Would you like to sponsor this event?{' '}
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
                        min="100"
                        step="1"
                        onBlur={(e) => handleFormFieldChange('sponsorAmount', 350)}
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

          {/* Additional Golfers Section */}
          {additionalGolfers.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              {additionalGolfers.map((golfer, index) => (
                <div key={index} style={{
                  border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem',
                  marginBottom: '0.75rem', background: '#fafafa', position: 'relative',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>
                      Additional Golfer {index + 1}
                      <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                        (${(user && golfer.isMember ? memberPrice : guestPrice).toFixed(2)}
                        {user && golfer.isMember ? ' member' : ' guest'} rate)
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeGolfer(index)}
                      style={{
                        background: '#fee2e2', border: 'none', borderRadius: '6px',
                        padding: '0.3rem 0.5rem', cursor: 'pointer', color: '#dc2626',
                        display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600,
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                      </svg>
                      Remove
                    </button>
                  </div>

                  {/* Member toggle — only show for logged-in members */}
                  {user && (
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem',
                      fontSize: '0.875rem', cursor: 'pointer', color: '#374151',
                    }}>
                      <input
                        type="checkbox"
                        checked={golfer.isMember}
                        onChange={(e) => handleGolferMemberToggle(index, e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#059669' }}
                      />
                      This golfer is a SAGA member
                    </label>
                  )}

                  {/* Member search or guest fields */}
                  {golfer.isMember ? (
                    <div className="form-group">
                      <MemberSearchInput
                        golfer={golfer}
                        index={index}
                        onSelect={handleMemberSelect}
                        onChange={updateGolfer}
                      />
                      {golfer.userId && (
                        <div style={{
                          marginTop: '0.5rem', padding: '0.5rem 0.75rem',
                          background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0',
                          fontSize: '0.85rem', color: '#065f46',
                        }}>
                          Selected: <strong>{golfer.name}</strong>
                          {golfer.handicap && <span> (HCP: {golfer.handicap})</span>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label htmlFor={`golfer-name-${index}`}>Full Name *</label>
                        <input
                          type="text"
                          id={`golfer-name-${index}`}
                          value={golfer.name}
                          onChange={(e) => updateGolfer(index, 'name', e.target.value)}
                          placeholder="Enter golfer's full name"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor={`golfer-email-${index}`}>Email</label>
                          <input
                            type="email"
                            id={`golfer-email-${index}`}
                            value={golfer.email}
                            onChange={(e) => updateGolfer(index, 'email', e.target.value)}
                            placeholder="Enter email"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`golfer-phone-${index}`}>Phone</label>
                          <input
                            type="tel"
                            id={`golfer-phone-${index}`}
                            value={golfer.phone}
                            onChange={(e) => handleGolferPhoneChange(index, e.target.value)}
                            placeholder="(555) 555-5555"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor={`golfer-handicap-${index}`}>Golf Handicap</label>
                        <input
                          type="text"
                          id={`golfer-handicap-${index}`}
                          value={golfer.handicap}
                          onChange={(e) => handleGolferHandicapChange(index, e.target.value)}
                          placeholder="e.g., 12"
                          inputMode="decimal"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Golfer Button */}
          <button
            type="button"
            onClick={addGolfer}
            style={{
              width: '100%', padding: '0.65rem', marginTop: '0.75rem',
              background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: '10px',
              color: '#059669', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#4ade80'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#86efac'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Additional Golfer
          </button>

          {/* Price breakdown for multiple golfers */}
          {additionalGolfers.length > 0 && (
            <div style={{
              marginTop: '1rem', padding: '0.75rem', background: '#f9fafb',
              borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '0.85rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Your registration ({user ? 'member' : 'guest'})</span>
                <span>${basePrice.toFixed(2)}</span>
              </div>
              {additionalGolfers.map((g, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Golfer {i + 1}: {g.name || 'TBD'} ({user && g.isMember ? 'member' : 'guest'})</span>
                  <span>${(user && g.isMember ? memberPrice : guestPrice).toFixed(2)}</span>
                </div>
              ))}
              {sponsorAdd > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Sponsorship</span>
                  <span>${sponsorAdd.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                <span>Total</span>
                <span>${displayPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Payment section */}
          {displayPrice > 0 && isFormValid() && (
            <PayPalPayment
              amount={displayPrice}
              description={`SAGA Event Registration — ${displayName || event.golf_course}`}
              onApprove={handlePayPalApprove}
              onError={handlePaymentError}
              loading={loading}
              submitLabel={`Register & Pay — $${parseFloat(displayPrice).toFixed(2)}`}
              error={paymentError}
            />
          )}

          {/* Prompt user to fill in details before payment appears */}
          {displayPrice > 0 && !isFormValid() && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              Fill in your details above to continue to payment.
            </p>
          )}

          {/* Free event button */}
          {(!displayPrice || displayPrice <= 0) && (
            <button
              type="button"
              className="submit-registration"
              onClick={handleFreeRegistration}
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
