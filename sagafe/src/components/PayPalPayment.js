import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PayPalScriptProvider, PayPalButtons, FUNDING, PayPalCardFieldsProvider, PayPalCardFieldsForm, usePayPalCardFields } from '@paypal/react-paypal-js';
import { paypalApi } from '../lib/api';

/**
 * PayPal payment component — renders PayPal buttons (PayPal, Venmo, etc.)
 * and a card fields form for direct card entry.
 *
 * Props:
 * @param {number} amount - Payment amount (e.g. 75.00)
 * @param {string} description - Payment description (e.g. "SAGA Event Registration")
 * @param {function} onApprove - Called with { orderID } after successful payment approval
 * @param {function} onError - Called with error message string
 * @param {boolean} loading - External loading state (disables buttons)
 * @param {string} submitLabel - Button text for card payment
 * @param {string} error - External error message to display
 */

const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;

function SubmitPayment({ submitLabel, loading, isPaying }) {
  const { cardFieldsForm } = usePayPalCardFields();

  const handleClick = async () => {
    if (!cardFieldsForm) return;
    cardFieldsForm.submit();
  };

  return (
    <button
      type="button"
      className="payment-submit-btn"
      onClick={handleClick}
      disabled={loading || isPaying}
      style={{
        width: '100%',
        padding: '0.875rem 1.5rem',
        background: (loading || isPaying) ? '#9ca3af' : 'var(--primary, #1a472a)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '0.95rem',
        fontWeight: 600,
        cursor: (loading || isPaying) ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '0.75rem',
      }}
    >
      {(loading || isPaying) ? (
        <>
          <div style={{
            width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          Processing...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          {submitLabel || 'Pay with Card'}
        </>
      )}
    </button>
  );
}

function ApplePayButton({ amount, description, createOrder, onApprove, onError, loading, isPaying }) {
  const [eligible, setEligible] = useState(false);
  const [applePayConfig, setApplePayConfig] = useState(null);
  const applepayRef = useRef(null);

  useEffect(() => {
    // Wait for the PayPal SDK to load and check Apple Pay eligibility
    const checkEligibility = async () => {
      try {
        if (!window.paypal?.Applepay) return;
        const applepay = window.paypal.Applepay();
        applepayRef.current = applepay;
        const config = await applepay.config();
        if (config.isEligible) {
          setApplePayConfig(config);
          setEligible(true);
        }
      } catch (err) {
        console.log('Apple Pay not available:', err.message);
      }
    };

    // Poll briefly for the SDK to be ready
    const interval = setInterval(() => {
      if (window.paypal?.Applepay) {
        clearInterval(interval);
        checkEligibility();
      }
    }, 500);

    const timeout = setTimeout(() => clearInterval(interval), 10000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  const handleApplePayClick = useCallback(async () => {
    if (!applepayRef.current || !applePayConfig) return;

    const paymentRequest = {
      countryCode: applePayConfig.countryCode,
      merchantCapabilities: applePayConfig.merchantCapabilities,
      supportedNetworks: applePayConfig.supportedNetworks,
      currencyCode: 'USD',
      requiredBillingContactFields: ['postalAddress'],
      total: {
        label: description || 'SAGA Golf Payment',
        type: 'final',
        amount: amount.toFixed(2),
      },
    };

    const session = new window.ApplePaySession(4, paymentRequest);

    session.onvalidatemerchant = async (event) => {
      try {
        const result = await applepayRef.current.validateMerchant({
          validationUrl: event.validationURL,
          displayName: 'SAGA Golf',
        });
        session.completeMerchantValidation(result.merchantSession);
      } catch (err) {
        console.error('Apple Pay merchant validation failed:', err);
        session.abort();
        if (onError) onError('Apple Pay merchant validation failed');
      }
    };

    session.onpaymentauthorized = async (event) => {
      try {
        const orderId = await createOrder();
        await applepayRef.current.confirmOrder({
          orderId,
          token: event.payment.token,
          billingContact: event.payment.billingContact,
        });
        session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
        if (onApprove) await onApprove({ orderID: orderId });
      } catch (err) {
        console.error('Apple Pay payment failed:', err);
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
        if (onError) onError(err.message || 'Apple Pay payment failed');
      }
    };

    session.oncancel = () => {
      console.log('Apple Pay cancelled');
    };

    session.begin();
  }, [applePayConfig, amount, description, createOrder, onApprove, onError]);

  if (!eligible) return null;

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <button
        type="button"
        onClick={handleApplePayClick}
        disabled={loading || isPaying}
        style={{
          width: '100%',
          height: '45px',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          fontSize: '1rem',
          fontWeight: 500,
          cursor: (loading || isPaying) ? 'not-allowed' : 'pointer',
          opacity: (loading || isPaying) ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          WebkitApplePayButtonStyle: 'black',
          WebkitApplePayButtonType: 'pay',
        }}
        aria-label="Pay with Apple Pay"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
        Pay with Apple Pay
      </button>
    </div>
  );
}

function GooglePayButton({ amount, description, createOrder, onApprove, onError, loading, isPaying }) {
  const [eligible, setEligible] = useState(false);
  const googlePayConfigRef = useRef(null);
  const containerRef = useRef(null);
  const clickHandlerRef = useRef(null);

  // Keep the click handler ref up to date with latest props
  clickHandlerRef.current = async () => {
    if (!googlePayConfigRef.current || loading || isPaying) return;
    const { googlepay, config } = googlePayConfigRef.current;

    const paymentsClient = new window.google.payments.api.PaymentsClient({
      environment: 'PRODUCTION',
    });

    try {
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: config.allowedPaymentMethods,
        merchantInfo: config.merchantInfo,
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: amount.toFixed(2),
          currencyCode: 'USD',
        },
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      const orderId = await createOrder();

      const confirmResult = await googlepay.confirmOrder({
        orderId,
        paymentMethodData: paymentData.paymentMethodData,
      });

      if (confirmResult.status === 'PAYER_ACTION_REQUIRED') {
        await googlepay.initiatePayerAction({ orderId });
      }

      if (onApprove) await onApprove({ orderID: orderId });
    } catch (err) {
      if (err.statusCode === 'CANCELED') return;
      console.error('Google Pay payment failed:', err);
      if (onError) onError(err.message || 'Google Pay payment failed');
    }
  };

  useEffect(() => {
    let intervalId = null;
    let timeoutId = null;
    let cancelled = false;

    const checkEligibility = async () => {
      try {
        console.log('[GooglePay] Checking eligibility...');

        const googlepay = window.paypal.Googlepay();
        const config = await Promise.race([
          googlepay.config(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('config() timed out — Google Pay may not be enabled on your PayPal app')), 8000)),
        ]);

        if (cancelled) return;
        console.log('[GooglePay] Config:', config);
        googlePayConfigRef.current = { googlepay, config };

        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: 'PRODUCTION',
        });

        const readyToPay = await paymentsClient.isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: config.allowedPaymentMethods,
        });

        console.log('[GooglePay] isReadyToPay:', readyToPay);
        if (!cancelled && readyToPay.result) {
          console.log('[GooglePay] Eligible! Will render button on next paint...');
          setEligible(true);
        }
      } catch (err) {
        console.error('[GooglePay] Error during eligibility check:', err);
      }
    };

    intervalId = setInterval(() => {
      if (window.paypal?.Googlepay && window.google?.payments?.api?.PaymentsClient) {
        console.log('[GooglePay] Both SDKs detected, running eligibility check...');
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        checkEligibility();
      }
    }, 500);

    timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      console.log('[GooglePay] Timed out waiting for SDK. paypal.Googlepay:', !!window.paypal?.Googlepay, 'google.payments:', !!window.google?.payments?.api?.PaymentsClient);
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  // Render the Google Pay button once eligible and container is mounted
  useEffect(() => {
    if (!eligible || !googlePayConfigRef.current || !containerRef.current) return;
    if (containerRef.current.hasChildNodes()) return;

    const paymentsClient = new window.google.payments.api.PaymentsClient({
      environment: 'PRODUCTION',
    });
    const button = paymentsClient.createButton({
      onClick: () => clickHandlerRef.current?.(),
      buttonColor: 'black',
      buttonType: 'pay',
      buttonSizeMode: 'fill',
    });
    containerRef.current.appendChild(button);
    console.log('[GooglePay] Button rendered.');
  }, [eligible]);

  return (
    <div
      className="gpay-container"
      style={{ marginBottom: '0.75rem', opacity: (loading || isPaying) ? 0.6 : 1, display: eligible ? 'block' : 'none' }}
      ref={containerRef}
    />
  );
}

export default function PayPalPayment({
  amount,
  description = 'SAGA Golf Payment',
  onApprove,
  onError,
  loading = false,
  submitLabel = 'Submit Payment',
  error: externalError,
}) {
  const [isPaying, setIsPaying] = useState(false);
  const [internalError, setInternalError] = useState('');

  // Load Apple Pay JS SDK
  useEffect(() => {
    if (document.getElementById('apple-pay-sdk')) return;
    const script = document.createElement('script');
    script.id = 'apple-pay-sdk';
    script.src = 'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, []);

  // Load Google Pay JS SDK
  useEffect(() => {
    if (document.getElementById('google-pay-sdk')) return;
    const script = document.createElement('script');
    script.id = 'google-pay-sdk';
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const displayError = externalError || internalError;

  if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'YOUR_PAYPAL_SANDBOX_CLIENT_ID') {
    return (
      <div style={{
        padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b',
        borderRadius: '10px', color: '#92400e', fontSize: '0.875rem', marginTop: '1rem',
      }}>
        PayPal is not configured. Please set REACT_APP_PAYPAL_CLIENT_ID in your .env file.
      </div>
    );
  }

  const createOrder = async () => {
    try {
      setInternalError('');
      const response = await paypalApi.createOrder(amount, description);
      return response.id;
    } catch (err) {
      const msg = err.message || 'Failed to create payment order';
      setInternalError(msg);
      if (onError) onError(msg);
      throw err;
    }
  };

  const handleApprove = async (data) => {
    setIsPaying(true);
    setInternalError('');
    try {
      if (onApprove) {
        await onApprove({ orderID: data.orderID });
      }
    } catch (err) {
      const msg = err.message || 'Payment processing failed';
      setInternalError(msg);
      if (onError) onError(msg);
    } finally {
      setIsPaying(false);
    }
  };

  const handleError = (err) => {
    const msg = err?.message || 'Payment failed. Please try again.';
    setInternalError(msg);
    if (onError) onError(msg);
    setIsPaying(false);
  };

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151',
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <span>Secure Payment</span>
      </div>

      {displayError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '0.75rem',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{displayError}</span>
        </div>
      )}

      <PayPalScriptProvider options={{
        'client-id': PAYPAL_CLIENT_ID,
        components: 'buttons,card-fields,applepay,googlepay',
        'enable-funding': 'venmo',
        currency: 'USD',
        intent: 'capture',
      }}>
        {/* Apple Pay button (shown only on eligible devices) */}
        <ApplePayButton
          amount={amount}
          description={description}
          createOrder={createOrder}
          onApprove={handleApprove}
          onError={handleError}
          loading={loading}
          isPaying={isPaying}
        />

        {/* Google Pay button (shown only on eligible devices/browsers) */}
        <GooglePayButton
          amount={amount}
          description={description}
          createOrder={createOrder}
          onApprove={handleApprove}
          onError={handleError}
          loading={loading}
          isPaying={isPaying}
        />

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.75rem 0',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500 }}>or pay with card</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* Card Fields */}
        <PayPalCardFieldsProvider
          createOrder={createOrder}
          onApprove={handleApprove}
          onError={handleError}
          style={{
            input: {
              'font-size': '0.95rem',
              'font-family': 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
              color: '#0f172a',
              padding: '12px',
            },
            '.invalid': {
              color: '#dc2626',
            },
          }}
        >
          <PayPalCardFieldsForm />
          <SubmitPayment
            submitLabel={submitLabel}
            loading={loading}
            isPaying={isPaying}
          />
        </PayPalCardFieldsProvider>
      </PayPalScriptProvider>

      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
        marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af',
      }}>
        <span>Payments processed securely by PayPal</span>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .gpay-container button,
        .gpay-container .gpay-button {
          border-radius: 10px !important;
        }
      `}</style>
    </div>
  );
}
