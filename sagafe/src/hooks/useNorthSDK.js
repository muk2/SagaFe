import { useState, useEffect, useRef, useCallback } from 'react';

const NORTH_SDK_URL = 'https://sdk.paymentshub.dev/pay-now.min.js';

/**
 * Hook to load and manage the North PayNow iFrame JS SDK.
 * Dynamically loads the script and provides methods to initialize and tokenize.
 * Supports Apple Pay when available.
 */
export default function useNorthSDK() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(null);
  const [fieldsReady, setFieldsReady] = useState(false);
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const sdkInstanceRef = useRef(null);
  const applePayAmountRef = useRef(null);
  const onTokenRef = useRef(null);

  useEffect(() => {
    // Check if script is already on the page
    if (window.PayNow) {
      setSdkLoaded(true);
      return;
    }

    // Check if script tag already exists (another instance added it)
    const existing = document.querySelector(`script[src="${NORTH_SDK_URL}"]`);
    if (existing) {
      // Script tag exists but may still be loading
      if (window.PayNow) {
        setSdkLoaded(true);
      } else {
        existing.addEventListener('load', () => setSdkLoaded(true));
        existing.addEventListener('error', () => setSdkError('Failed to load payment SDK'));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = NORTH_SDK_URL;
    script.async = true;

    script.onload = () => {
      setSdkLoaded(true);
    };

    script.onerror = () => {
      setSdkError('Failed to load payment SDK');
    };

    document.head.appendChild(script);
  }, []);

  /**
   * Initialize the PayNow SDK with field containers and event handlers.
   * @param {object} options - { onReady, onValidation, onErrors, onApplePayToken, amount }
   */
  const initialize = useCallback((options = {}) => {
    if (!window.PayNow) return;

    const mid = process.env.REACT_APP_NORTH_MID;
    const gatewayPublicKey = process.env.REACT_APP_NORTH_GATEWAY_PUBLIC_KEY;

    if (!mid || !gatewayPublicKey) {
      setSdkError('North payment credentials not configured');
      return;
    }

    const PayNowSdk = window.PayNow.default;
    sdkInstanceRef.current = PayNowSdk;
    onTokenRef.current = options.onApplePayToken || null;

    const sdkOptions = {
      cardFieldId: 'north-card-number',
      cvvFieldId: 'north-card-cvv',
      addressFieldId: 'north-billing-address',
      zipFieldId: 'north-billing-zip',
      applePayButton: {
        id: 'north-apple-pay-button',
      },
    };

    PayNowSdk().on('ready', () => {
      const fieldStyle = 'border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 0.95rem; font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; color: #0f172a; height: 44px; width: 100%; box-sizing: border-box; background: #ffffff;';

      PayNowSdk().setStyle('number', fieldStyle);
      PayNowSdk().setStyle('cvv', fieldStyle);
      PayNowSdk().setStyle('address', fieldStyle);
      PayNowSdk().setStyle('zip', fieldStyle);
      PayNowSdk().setNumberFormat('prettyFormat');

      // Check if Apple Pay button rendered (indicates availability)
      const applePayEl = document.getElementById('north-apple-pay-button');
      if (applePayEl && applePayEl.children.length > 0) {
        setApplePayAvailable(true);
      }

      setFieldsReady(true);
      if (options.onReady) options.onReady();
    });

    PayNowSdk().on('validation', (inputProperties) => {
      if (options.onValidation) options.onValidation(inputProperties);
    });

    PayNowSdk().on('errors', (errors) => {
      if (options.onErrors) options.onErrors(errors);
    });

    // Apple Pay: when user clicks the Apple Pay button
    PayNowSdk().on('applePayButtonClick', () => {
      const amount = applePayAmountRef.current || 0;
      PayNowSdk().createApplePayRequest({
        label: 'SAGA Golf',
        amount: parseFloat(amount),
      });
    });

    // Apple Pay: when payment completes
    PayNowSdk().on('applePayComplete', (response) => {
      console.log('Apple Pay complete response:', JSON.stringify(response));
      if (!onTokenRef.current) return;

      // Extract the token string from the response object
      let token = null;
      if (typeof response === 'string') {
        token = response;
      } else if (response) {
        token = response.token || response.cardToken || response.paymentToken || null;
        // Some SDK versions nest under data
        if (!token && response.data) {
          token = response.data.token || response.data.cardToken || null;
        }
      }

      // Fallback: try getCardToken() after Apple Pay completes
      if (!token || typeof token !== 'string') {
        try {
          token = PayNowSdk().getCardToken();
        } catch (err) {
          console.error('Apple Pay: getCardToken fallback failed:', err);
        }
      }

      onTokenRef.current(token || null);
    });

    PayNowSdk().init(gatewayPublicKey, mid, sdkOptions);
  }, []);

  /**
   * Update the Apple Pay amount (call when price changes)
   */
  const setApplePayAmount = useCallback((amount) => {
    applePayAmountRef.current = amount;
  }, []);

  /**
   * Tokenize the card — calls addCard with expiry, then getCardToken.
   */
  const tokenize = useCallback(async (month, year) => {
    const PayNowSdk = sdkInstanceRef.current;
    if (!PayNowSdk) throw new Error('Payment SDK not initialized');

    await PayNowSdk().addCard({
      month: month,
      year: year,
    });

    const cardToken = PayNowSdk().getCardToken();
    return cardToken;
  }, []);

  return {
    sdkLoaded,
    sdkError,
    fieldsReady,
    applePayAvailable,
    initialize,
    tokenize,
    setApplePayAmount,
  };
}
