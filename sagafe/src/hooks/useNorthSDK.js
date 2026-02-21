import { useState, useEffect, useRef, useCallback } from 'react';

const NORTH_SDK_URL = 'https://secure.networkmerchants.com/token/Collect.js';

/**
 * Hook to load and manage the North iFrame JS SDK (Collect.js)
 * Dynamically loads the script and provides methods to configure and tokenize.
 */
export default function useNorthSDK() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || window.CollectJS) {
      setSdkLoaded(true);
      loadedRef.current = true;
      return;
    }

    const tokenizationKey = process.env.REACT_APP_NORTH_TOKENIZATION_KEY;
    if (!tokenizationKey) {
      setSdkError('North tokenization key not configured');
      return;
    }

    const script = document.createElement('script');
    script.src = NORTH_SDK_URL;
    script.setAttribute('data-tokenization-key', tokenizationKey);
    script.setAttribute('data-variant', 'inline');
    script.async = true;

    script.onload = () => {
      loadedRef.current = true;
      setSdkLoaded(true);
    };

    script.onerror = () => {
      setSdkError('Failed to load payment SDK');
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove the script on unmount — it should persist
    };
  }, []);

  /**
   * Configure CollectJS with inline fields and callbacks
   * @param {object} options - { onToken, onValidationError, fieldsAvailableCallback }
   */
  const configure = useCallback((options = {}) => {
    if (!window.CollectJS) return;

    const fieldStyles = {
      'background-color': '#ffffff',
      'border': '1px solid #e2e8f0',
      'border-radius': '8px',
      'padding': '0.75rem',
      'font-size': '0.95rem',
      'font-family': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      'color': '#0f172a',
      'height': '44px',
    };

    const focusStyles = {
      'border-color': '#0d9488',
      'box-shadow': '0 0 0 3px rgba(13, 148, 136, 0.1)',
      'outline': 'none',
    };

    const invalidStyles = {
      'border-color': '#ef4444',
      'box-shadow': '0 0 0 3px rgba(239, 68, 68, 0.1)',
    };

    const placeholderStyles = {
      'color': '#94a3b8',
    };

    window.CollectJS.configure({
      variant: 'inline',
      styleSniffer: false,
      fields: {
        ccnumber: {
          selector: '#north-card-number',
          title: 'Card Number',
          placeholder: '0000 0000 0000 0000',
        },
        ccexp: {
          selector: '#north-card-expiry',
          title: 'Expiration Date',
          placeholder: 'MM / YY',
        },
        cvv: {
          selector: '#north-card-cvv',
          title: 'CVV',
          placeholder: 'CVV',
        },
      },
      customCss: {
        '': fieldStyles,
        ':focus': focusStyles,
        '.invalid': invalidStyles,
        '::placeholder': placeholderStyles,
      },
      fieldsAvailableCallback: () => {
        if (options.onFieldsAvailable) {
          options.onFieldsAvailable();
        }
      },
      validationCallback: (field, status, message) => {
        if (options.onValidation) {
          options.onValidation(field, status, message);
        }
      },
      timeoutCallback: () => {
        if (options.onTimeout) {
          options.onTimeout();
        }
      },
      callback: (response) => {
        if (options.onToken) {
          options.onToken(response.token);
        }
      },
    });
  }, []);

  /**
   * Trigger tokenization — calls CollectJS.startPaymentRequest()
   */
  const getToken = useCallback(() => {
    if (!window.CollectJS) {
      throw new Error('Payment SDK not loaded');
    }
    window.CollectJS.startPaymentRequest();
  }, []);

  return {
    sdkLoaded,
    sdkError,
    configure,
    getToken,
  };
}
