import React, { useEffect, useRef, useState, useCallback } from 'react';
import useNorthSDK from '../hooks/useNorthSDK';
import { parseSDKError } from '../lib/paymentErrors';
import './PaymentForm.css';

/**
 * Reusable PaymentForm component that renders North PayNow iFrame hosted card fields.
 * Supports Apple Pay when available on the user's device.
 *
 * Props:
 * @param {string} amount - Payment amount (e.g. "75.00")
 * @param {function} onTokenReceived - Called with the payment token string
 * @param {function} onError - Called with error message string
 * @param {boolean} loading - When true, disables form interaction
 * @param {string} submitLabel - Button text (e.g. "Register & Pay")
 * @param {string} error - External error message to display
 */
export default function PaymentForm({
  amount,
  onTokenReceived,
  onError,
  loading = false,
  submitLabel = 'Submit Payment',
  error: externalError,
}) {
  const { sdkLoaded, sdkError, fieldsReady, applePayAvailable, initialize, tokenize, setApplePayAmount } = useNorthSDK();
  const [tokenizing, setTokenizing] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const initializedRef = useRef(false);
  const onErrorRef = useRef(onError);
  const onTokenRef = useRef(onTokenReceived);

  // Keep callback refs current without triggering re-init
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onTokenRef.current = onTokenReceived; }, [onTokenReceived]);

  // Reset init flag on unmount so re-mount triggers re-initialization
  useEffect(() => {
    return () => { initializedRef.current = false; };
  }, []);

  // Keep Apple Pay amount in sync
  useEffect(() => {
    if (amount) {
      setApplePayAmount(amount);
    }
  }, [amount, setApplePayAmount]);

  // Initialize PayNow SDK once loaded and DOM containers are ready
  useEffect(() => {
    if (!sdkLoaded || initializedRef.current) return;

    // Wait until all container elements are in the DOM before initializing
    const waitForContainers = () => {
      const containers = ['north-card-number', 'north-card-cvv', 'north-billing-address', 'north-billing-zip'];
      return containers.every(id => document.getElementById(id));
    };

    let attempts = 0;
    let cancelled = false;
    const tryInit = () => {
      if (cancelled) return;
      attempts++;
      if (!waitForContainers() && attempts < 20) {
        setTimeout(tryInit, 100);
        return;
      }
      if (!waitForContainers()) {
        console.error('North SDK: payment field containers not found after retries');
        return;
      }
      initializedRef.current = true;
      initialize({
        onReady: () => {},
        onValidation: () => {},
        onErrors: (errors) => {
          console.log('North SDK onErrors:', JSON.stringify(errors));
          setTokenizing(false);
          const msg = parseSDKError(errors);
          setValidationError(msg);
          if (onErrorRef.current) onErrorRef.current(msg);
        },
        onApplePayToken: (token) => {
          if (token && onTokenRef.current) {
            onTokenRef.current(token);
          } else {
            const msg = 'Apple Pay completed but no payment token was received. Please try again or use a card.';
            setValidationError(msg);
            if (onErrorRef.current) onErrorRef.current(msg);
          }
        },
      });
    };

    const timer = setTimeout(tryInit, 100);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [sdkLoaded, initialize]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading || tokenizing || !fieldsReady) return;

      if (!expiryMonth || !expiryYear) {
        setValidationError('Please enter the expiration date.');
        return;
      }

      setValidationError('');
      setTokenizing(true);

      try {
        const token = await tokenize(expiryMonth, expiryYear);
        if (token) {
          setTokenizing(false);
          if (onTokenReceived) onTokenReceived(token);
        } else {
          setTokenizing(false);
          const msg = 'Unable to process card. Please verify the card information or use a different card.';
          setValidationError(msg);
          if (onError) onError(msg);
        }
      } catch (err) {
        setTokenizing(false);
        const msg = err.message || 'Failed to process payment';
        setValidationError(msg);
        if (onError) onError(msg);
      }
    },
    [loading, tokenizing, fieldsReady, expiryMonth, expiryYear, tokenize, onTokenReceived, onError]
  );

  // SDK failed to load
  if (sdkError) {
    return (
      <div className="payment-form-error">
        <p>{sdkError}</p>
      </div>
    );
  }

  // SDK still loading
  if (!sdkLoaded) {
    return (
      <div className="payment-form-loading">
        <div className="payment-spinner"></div>
        <p>Loading payment form...</p>
      </div>
    );
  }

  const isProcessing = loading || tokenizing;
  const displayError = externalError || validationError;

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y <= currentYear + 10; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="payment-form">
      <div className="payment-form-header">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <span>Secure Payment</span>
      </div>

      {displayError && (
        <div className="payment-error-message">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{displayError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Card Number - North PayNow iframe */}
        <div className="payment-field-group">
          <label>Card Number</label>
          <div id="north-card-number" className="payment-field-container"></div>
        </div>

        <div className="payment-field-row">
          {/* Expiry Month */}
          <div className="payment-field-group">
            <label htmlFor="north-expiry-month">Expiry Month</label>
            <select
              id="north-expiry-month"
              value={expiryMonth}
              onChange={(e) => setExpiryMonth(e.target.value)}
              className="payment-select"
            >
              <option value="">MM</option>
              {Array.from({ length: 12 }, (_, i) => {
                const m = String(i + 1).padStart(2, '0');
                return <option key={m} value={m}>{m}</option>;
              })}
            </select>
          </div>

          {/* Expiry Year */}
          <div className="payment-field-group">
            <label htmlFor="north-expiry-year">Expiry Year</label>
            <select
              id="north-expiry-year"
              value={expiryYear}
              onChange={(e) => setExpiryYear(e.target.value)}
              className="payment-select"
            >
              <option value="">YYYY</option>
              {yearOptions.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CVV */}
        <div className="payment-field-group">
          <label>CVV</label>
          <div id="north-card-cvv" className="payment-field-container"></div>
        </div>

        {/* Billing Address */}
        <div className="payment-field-group">
          <label>Billing Address</label>
          <div id="north-billing-address" className="payment-field-container"></div>
        </div>

        {/* Billing Zip */}
        <div className="payment-field-group">
          <label>Billing Zip Code</label>
          <div id="north-billing-zip" className="payment-field-container"></div>
        </div>

        <button
          type="submit"
          className="payment-submit-btn"
          disabled={isProcessing || !fieldsReady}
        >
          {isProcessing ? (
            <>
              <div className="payment-btn-spinner"></div>
              Processing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              {submitLabel}
            </>
          )}
        </button>
      </form>

      {/* Apple Pay button — rendered by North SDK when available */}
      {applePayAvailable && (
        <div className="payment-divider">or</div>
      )}
      <div
        id="north-apple-pay-button"
        className={applePayAvailable ? 'apple-pay-container' : 'apple-pay-hidden'}
      ></div>

      <div className="payment-form-footer">
        <span>Payments processed securely</span>
        <div className="card-brands">
          <span className="card-brand">VISA</span>
          <span className="card-brand">MC</span>
          <span className="card-brand">AMEX</span>
          <span className="card-brand">DISC</span>
        </div>
      </div>
    </div>
  );
}
