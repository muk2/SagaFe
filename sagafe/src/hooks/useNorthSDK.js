import { useState, useEffect, useRef, useCallback } from 'react';

// Sandbox: https://sdk.paymentshub.dev/pay-now.min.js
// Production: https://sdk.paymentshub.com/pay-now.min.js
const NORTH_SDK_URL = process.env.REACT_APP_NORTH_SDK_URL || 'https://sdk.paymentshub.com/pay-now.min.js';

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

      setFieldsReady(true);
      if (options.onReady) options.onReady();

      // Check if Apple Pay button was rendered by the SDK.
      // The SDK may inject it slightly after ready, so observe for changes.
      const applePayEl = document.getElementById('north-apple-pay-button');
      if (applePayEl) {
        if (applePayEl.children.length > 0) {
          setApplePayAvailable(true);
        } else {
          const observer = new MutationObserver(() => {
            if (applePayEl.children.length > 0) {
              setApplePayAvailable(true);
              observer.disconnect();
            }
          });
          observer.observe(applePayEl, { childList: true });
          // Stop observing after 5s if nothing appears
          setTimeout(() => observer.disconnect(), 5000);
        }
      }
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

    // Apple Pay: when payment completes, the SDK stores the token internally.
    // We need to retrieve it via getCardToken(), sometimes with a short delay.
    PayNowSdk().on('applePayComplete', (response) => {
      console.log('Apple Pay complete — raw response:', response);
      console.log('Apple Pay complete — JSON:', JSON.stringify(response, null, 2));
      console.log('Apple Pay complete — type:', typeof response);
      if (response && typeof response === 'object') {
        console.log('Apple Pay complete — keys:', Object.keys(response));
      }
      if (!onTokenRef.current) return;

      // 1. Try direct string response
      if (typeof response === 'string' && response.length > 0) {
        console.log('Apple Pay: using response as token directly');
        onTokenRef.current(response);
        return;
      }

      // 2. Try known token fields on the response object
      if (response && typeof response === 'object') {
        const directToken = response.token || response.cardToken || response.paymentToken
          || response.card_token || response.payment_token || null;
        if (directToken) {
          console.log('Apple Pay: found token in response field');
          onTokenRef.current(directToken);
          return;
        }
        // Check nested data/result objects
        const nested = response.data || response.result || response.response || null;
        if (nested) {
          const nestedToken = typeof nested === 'string' ? nested
            : (nested.token || nested.cardToken || nested.card_token || null);
          if (nestedToken) {
            console.log('Apple Pay: found token in nested response');
            onTokenRef.current(nestedToken);
            return;
          }
        }
      }

      // 3. Fallback: poll getCardToken() — the SDK may need a moment to store it
      let attempts = 0;
      const pollToken = () => {
        attempts++;
        try {
          const cardToken = PayNowSdk().getCardToken();
          console.log(`Apple Pay: getCardToken() attempt ${attempts} =`, cardToken);
          if (cardToken && typeof cardToken === 'string' && cardToken.length > 0) {
            onTokenRef.current(cardToken);
            return;
          }
        } catch (err) {
          console.error(`Apple Pay: getCardToken() attempt ${attempts} error:`, err);
        }
        if (attempts < 10) {
          setTimeout(pollToken, 200);
        } else {
          console.error('Apple Pay: could not retrieve token after all attempts');
          onTokenRef.current(null);
        }
      };
      pollToken();
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
