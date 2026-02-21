import React, { useEffect, useRef, useState, useCallback } from 'react';
import useNorthSDK from '../hooks/useNorthSDK';
import './PaymentForm.css';

/**
 * Reusable PaymentForm component that renders North iFrame hosted card fields.
 * Used across event registration, guest registration, and membership payment flows.
 *
 * Props:
 * @param {string} amount - Display amount (e.g. "75.00")
 * @param {function} onTokenReceived - Called with the payment token string
 * @param {function} onError - Called with error message string
 * @param {boolean} loading - When true, disables form interaction
 * @param {string} submitLabel - Button text (e.g. "Register & Pay")
 * @param {string} error - External error message to display (e.g. from parent API call)
 */
export default function PaymentForm({
  amount,
  onTokenReceived,
  onError,
  loading = false,
  submitLabel = 'Submit Payment',
  error: externalError,
}) {
  const { sdkLoaded, sdkError, configure, getToken } = useNorthSDK();
  const [fieldsReady, setFieldsReady] = useState(false);
  const [tokenizing, setTokenizing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const configuredRef = useRef(false);
  const containerRef = useRef(null);

  // Configure CollectJS once SDK is loaded and fields are mounted
  useEffect(() => {
    if (!sdkLoaded || configuredRef.current) return;

    // Small delay to ensure DOM containers are available
    const timer = setTimeout(() => {
      configure({
        onFieldsAvailable: () => {
          setFieldsReady(true);
          configuredRef.current = true;
        },
        onToken: (token) => {
          setTokenizing(false);
          if (onTokenReceived) {
            onTokenReceived(token);
          }
        },
        onValidation: (field, status, message) => {
          setValidationErrors((prev) => ({
            ...prev,
            [field]: status ? null : message,
          }));
        },
        onTimeout: () => {
          setTokenizing(false);
          if (onError) {
            onError('Payment request timed out. Please try again.');
          }
        },
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [sdkLoaded, configure, onTokenReceived, onError]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (loading || tokenizing || !fieldsReady) return;

      setTokenizing(true);
      try {
        getToken();
      } catch (err) {
        setTokenizing(false);
        if (onError) {
          onError(err.message || 'Failed to process payment');
        }
      }
    },
    [loading, tokenizing, fieldsReady, getToken, onError]
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
  const hasValidationErrors = Object.values(validationErrors).some(Boolean);
  const displayError = externalError;

  return (
    <div className="payment-form" ref={containerRef}>
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
        <div className="payment-field-group">
          <label htmlFor="north-card-number">Card Number</label>
          <div
            id="north-card-number"
            className={`payment-field-container ${validationErrors.ccnumber ? 'invalid' : ''}`}
          ></div>
          {validationErrors.ccnumber && (
            <span className="payment-field-error">{validationErrors.ccnumber}</span>
          )}
        </div>

        <div className="payment-field-row">
          <div className="payment-field-group">
            <label htmlFor="north-card-expiry">Expiration Date</label>
            <div
              id="north-card-expiry"
              className={`payment-field-container ${validationErrors.ccexp ? 'invalid' : ''}`}
            ></div>
            {validationErrors.ccexp && (
              <span className="payment-field-error">{validationErrors.ccexp}</span>
            )}
          </div>

          <div className="payment-field-group">
            <label htmlFor="north-card-cvv">CVV</label>
            <div
              id="north-card-cvv"
              className={`payment-field-container ${validationErrors.cvv ? 'invalid' : ''}`}
            ></div>
            {validationErrors.cvv && (
              <span className="payment-field-error">{validationErrors.cvv}</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="payment-submit-btn"
          disabled={isProcessing || !fieldsReady || hasValidationErrors}
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
              {submitLabel}{amount ? ` $${amount}` : ''}
            </>
          )}
        </button>
      </form>

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
