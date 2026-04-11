/**
 * Maps payment gateway response codes to user-friendly error messages.
 * Used for SDK-level errors (from North Collect.js) that arrive before
 * hitting the backend, as well as for classifying error severity.
 *
 * Based on EPX response codes for Visa, MasterCard, Discover, and Amex.
 */

// Response codes grouped by the type of action the user should take
const RESPONSE_CODE_MESSAGES = {
  // ── Card declined / Do not honor ────────────────────────────────────
  '5':   'Your card was declined. Please try a different card.',
  'DCL': 'Your card was declined. Please try a different card.',
  'N0':  'Your card was declined. Please try a different card.',
  'N6':  'Your card was declined. Please try a different card.',
  '93':  'This transaction could not be completed. Please try a different card.',
  '100': 'Your card was declined. Please try a different card.',

  // ── Insufficient funds ──────────────────────────────────────────────
  '51':  'Insufficient funds. Please try a different card or contact your bank.',
  '116': 'Insufficient funds. Please try a different card or contact your bank.',

  // ── Card number / account issues ────────────────────────────────────
  '14':  'Invalid card number. Please check and re-enter your card details.',
  '56':  'Card not recognized. Please check your card number.',
  '78':  'Invalid account. Please try a different card.',
  '111': 'Invalid account. Please try a different card.',
  '119': 'Card not recognized. Please check your card number.',
  '187': 'A new card has been issued for this account. Please use your new card.',
  'EA':  'Account number error. Please check your card details.',
  'EB':  'Card number error. Please check your card details.',

  // ── Expired card ────────────────────────────────────────────────────
  '33':  'Your card has expired. Please use a different card.',
  '54':  'Your card has expired. Please use a different card.',
  '101': 'Your card has expired. Please use a different card.',
  '125': 'Invalid expiration date. Please check your card details.',

  // ── CVV / Security code errors ──────────────────────────────────────
  '82':  'Incorrect security code (CVV). Please check the 3-digit code on the back of your card.',
  'N7':  'Security code verification failed. Please check your CVV and try again.',
  'EO':  'Security code mismatch. Please re-enter the CVV from your card.',
  'E3':  'Security code (CVV) is required. Please enter it and try again.',
  'EC':  'Invalid security code format. Please check your CVV.',

  // ── Address verification ────────────────────────────────────────────
  'E2':  'Billing address verification required. Please check your address and zip code.',
  '6P':  'Address verification failed. Please check your billing address.',

  // ── Exceeds limits ──────────────────────────────────────────────────
  '61':  'This transaction exceeds your card\'s spending limit. Please try a smaller amount or a different card.',
  '65':  'Your card has reached its transaction limit. Please try again later or use a different card.',
  '121': 'Transaction limit exceeded. Please try a different card.',

  // ── Restricted / blocked card ───────────────────────────────────────
  '46':  'This account is closed. Please use a different card.',
  '62':  'Your card is restricted and cannot be used for this transaction.',
  'EE':  'This card type is not accepted. Please try a different card.',

  // ── Contact card issuer ─────────────────────────────────────────────
  '1':   'Please contact your card issuer for authorization.',
  '2':   'Please contact your card issuer for authorization.',
  '4':   'Your card has been restricted. Please contact your card issuer.',
  '7':   'Your card has been restricted. Please contact your card issuer.',
  '34':  'Please contact your card issuer.',
  '41':  'This card has been reported lost. Please contact your card issuer.',
  '43':  'This card has been reported. Please contact your card issuer.',
  '59':  'Please contact your card issuer for assistance.',
  '70':  'Please contact your card issuer.',
  '107': 'Please contact your card issuer.',
  '200': 'Your card has been restricted. Please contact your card issuer.',

  // ── PIN errors ──────────────────────────────────────────────────────
  '55':  'Incorrect PIN. Please try again.',
  '75':  'Too many PIN attempts. Please try again later or use a different card.',
  '83':  'Unable to verify PIN. Please try again.',
  '86':  'Unable to verify PIN. Please try again.',
  '106': 'Too many PIN attempts. Please try again later.',
  '117': 'Incorrect PIN. Please try again.',

  // ── Transaction not permitted ───────────────────────────────────────
  '57':  'This transaction type is not permitted on your card. Please try a different card.',
  '58':  'This transaction could not be processed. Please try a different card.',
  'E4':  'This service is not available. Please try a different card.',
  'E5':  'This service is not available. Please try a different card.',
  'E6':  'This service is not available. Please try a different card.',
  'EK':  'This service is not available. Please try a different card.',
  '115': 'This transaction type is not permitted. Please try a different card.',

  // ── Invalid transaction / amount ────────────────────────────────────
  '12':  'Invalid transaction. Please try again.',
  '13':  'Invalid amount. Please try again.',
  '110': 'Invalid amount. Please try again.',

  // ── Issuer / network unavailable (retry later) ─────────────────────
  '15':  'Card issuer not recognized. Please check your card number.',
  '28':  'Your card issuer is temporarily unavailable. Please try again in a few minutes.',
  '87':  'Network unavailable. Please try again in a few minutes.',
  '91':  'Your card issuer is temporarily unavailable. Please try again in a few minutes.',
  '96':  'A system error occurred. Please try again in a few minutes.',
  '912': 'Card issuer is not available. Please try again in a few minutes.',
  'E9':  'Network unavailable. Please try again in a few minutes.',
  'EQ':  'Payment system temporarily unavailable. Please try again in a few minutes.',
  '900': 'A system error occurred. Please try again.',
  '909': 'A system error occurred. Please try again.',

  // ── Processing / format errors ──────────────────────────────────────
  '6':   'A processing error occurred. Please try again.',
  '19':  'Please re-enter your card details and try again.',
  '30':  'A processing error occurred. Please try again.',
  '94':  'This transaction was already processed.',
  'RR':  'A processing error occurred. Please try again.',
  'EW':  'A processing error occurred. Please try again.',

  // ── Security / fraud ────────────────────────────────────────────────
  '63':  'Transaction could not be verified. Please try a different card.',
  'Q1':  'Card verification failed. Please try a different card.',
  '1A':  'Additional verification is required. Please contact your card issuer.',
  'ST':  'Payment verification failed. Please try again or use a different card.',

  // ── Fraud / lifecycle (MasterCard Sx codes) ─────────────────────────
  'SA':  'Your card issuer has updated your account. Please contact them for details.',
  'SB':  'This transaction cannot be approved right now. Please try again later.',
  'SC':  'This card cannot be used for this transaction. Please try a different card.',
  'SM':  'Your card issuer flagged this transaction. Please contact them for assistance.',
  'SN':  'This transaction cannot be approved right now. Please try again later.',
  'SO':  'This card cannot be used for this transaction. Please try a different card.',

  // ── Other ───────────────────────────────────────────────────────────
  '3':   'A merchant configuration error occurred. Please try again later.',
  'E7':  'A configuration error occurred. Please try again later.',
  '39':  'No credit account linked to this card. Please try a different card.',
  '52':  'No checking account found. Please try a different card.',
  '53':  'No savings account found. Please try a different card.',
  'ES':  'This transaction is not allowed. Please try a different card.',
  'ED':  'This authorization has expired. Please try again.',
  'EV':  'This transaction was already processed.',
  '92':  'Unable to route this transaction. Please try a different card.',
  'NR':  'Unable to process this card type. Please try a different card.',
};

/**
 * Codes where the user should try again later (temporary issue)
 */
const RETRY_LATER_CODES = new Set([
  '28', '87', '91', '96', 'E9', 'EQ', '912', '900', '909', 'SB', 'SN',
]);

/**
 * Codes where the user should try a different card (permanent issue with this card)
 */
const TRY_DIFFERENT_CARD_CODES = new Set([
  '5', 'DCL', '33', '41', '43', '46', '51', '54', '57', '62', '93',
  'N0', 'N6', 'EE', 'SC', 'SO', '100', '101', '116',
]);

/**
 * Codes where the user should check/fix their input
 */
const CHECK_INPUT_CODES = new Set([
  '14', '82', 'N7', 'EO', 'E3', 'E2', '55', '125', 'EA', 'EB', '13',
]);

/**
 * Get a user-friendly error message for a payment response code.
 *
 * @param {string} code - The response code from the payment gateway
 * @param {string} [fallbackMessage] - Optional fallback if code is not recognized
 * @returns {string} User-friendly error message
 */
export function getPaymentErrorMessage(code, fallbackMessage) {
  if (!code) return fallbackMessage || 'Payment failed. Please try again.';

  const normalized = String(code).trim().toUpperCase();
  return RESPONSE_CODE_MESSAGES[normalized]
    || fallbackMessage
    || 'Your payment could not be processed. Please try again or use a different card.';
}

/**
 * Classify the type of payment error for UI treatment.
 *
 * @param {string} code - The response code
 * @returns {'retry_later' | 'try_different_card' | 'check_input' | 'contact_issuer' | 'general'}
 */
export function classifyPaymentError(code) {
  if (!code) return 'general';
  const normalized = String(code).trim().toUpperCase();

  if (RETRY_LATER_CODES.has(normalized)) return 'retry_later';
  if (TRY_DIFFERENT_CARD_CODES.has(normalized)) return 'try_different_card';
  if (CHECK_INPUT_CODES.has(normalized)) return 'check_input';

  // Contact issuer codes
  if (['1', '2', '4', '7', '34', '59', '70', '107', '200', '1A', 'SA', 'SM'].includes(normalized)) {
    return 'contact_issuer';
  }

  return 'general';
}

/**
 * Parse a North SDK error object/string and return a user-friendly message.
 * Handles the various formats the SDK may return errors in.
 *
 * @param {*} error - Error from North SDK (string, object, or array)
 * @returns {string} User-friendly error message
 */
export function parseSDKError(error) {
  if (!error) return 'Payment failed. Please try again.';

  // If it's a string, try parsing as JSON first
  if (typeof error === 'string') {
    if (error.startsWith('{')) {
      try {
        const parsed = JSON.parse(error);
        return parseSDKErrorObject(parsed);
      } catch {
        // Not valid JSON, use as-is
      }
    }
    // Check if the string itself is a known response code
    const msg = RESPONSE_CODE_MESSAGES[error.trim().toUpperCase()];
    if (msg) return msg;
    return error;
  }

  // If it's an array, process each element
  if (Array.isArray(error)) {
    const messages = error.map(e => parseSDKError(e)).filter(Boolean);
    return messages.length > 0 ? messages[0] : 'Payment failed. Please try again.';
  }

  // It's an object
  return parseSDKErrorObject(error);
}

/**
 * Parse a single SDK error object.
 */
function parseSDKErrorObject(obj) {
  if (!obj || typeof obj !== 'object') return 'Payment failed. Please try again.';

  // Check for nested reason structure
  const reason = obj.reason || obj;
  const responseCode = reason.response_code || reason.responseCode || obj.response_code || obj.responseCode || '';
  const statusMessage = reason.status_message || reason.statusMessage || '';

  // Try to get a message from the response code
  if (responseCode) {
    const msg = RESPONSE_CODE_MESSAGES[String(responseCode).trim().toUpperCase()];
    if (msg) return msg;
  }

  // Try status_message
  if (statusMessage) return statusMessage;

  // Try common error message fields
  const raw = obj.message || obj.error || obj.detail || '';
  if (raw) {
    // If it's a JSON string, recurse
    if (typeof raw === 'string' && raw.startsWith('{')) {
      try {
        return parseSDKErrorObject(JSON.parse(raw));
      } catch { /* fall through */ }
    }
    return raw;
  }

  return 'Payment failed. Please try again.';
}

export default {
  getPaymentErrorMessage,
  classifyPaymentError,
  parseSDKError,
};
