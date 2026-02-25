import { renderHook, act } from '@testing-library/react';
import useNorthSDK from './useNorthSDK';

describe('useNorthSDK', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete window.CollectJS;
    // Remove any injected scripts
    document.querySelectorAll('script[data-tokenization-key]').forEach((s) => s.remove());
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('sets error when tokenization key is not configured', () => {
    delete process.env.REACT_APP_NORTH_TOKENIZATION_KEY;
    const { result } = renderHook(() => useNorthSDK());

    expect(result.current.sdkLoaded).toBe(false);
    expect(result.current.sdkError).toBe('North tokenization key not configured');
  });

  it('detects already loaded CollectJS', () => {
    window.CollectJS = { configure: jest.fn(), startPaymentRequest: jest.fn() };

    const { result } = renderHook(() => useNorthSDK());
    expect(result.current.sdkLoaded).toBe(true);
    expect(result.current.sdkError).toBeNull();
  });

  it('provides configure and getToken functions', () => {
    window.CollectJS = { configure: jest.fn(), startPaymentRequest: jest.fn() };

    const { result } = renderHook(() => useNorthSDK());
    expect(typeof result.current.configure).toBe('function');
    expect(typeof result.current.getToken).toBe('function');
  });

  it('getToken calls CollectJS.startPaymentRequest', () => {
    const mockStart = jest.fn();
    window.CollectJS = { configure: jest.fn(), startPaymentRequest: mockStart };

    const { result } = renderHook(() => useNorthSDK());

    act(() => {
      result.current.getToken();
    });

    expect(mockStart).toHaveBeenCalled();
  });

  it('getToken throws if CollectJS is not loaded', () => {
    window.CollectJS = undefined;

    const { result } = renderHook(() => useNorthSDK());

    expect(() => {
      result.current.getToken();
    }).toThrow('Payment SDK not loaded');
  });

  it('configure calls CollectJS.configure with field selectors', () => {
    const mockConfigure = jest.fn();
    window.CollectJS = { configure: mockConfigure, startPaymentRequest: jest.fn() };

    const { result } = renderHook(() => useNorthSDK());

    act(() => {
      result.current.configure({ onToken: jest.fn() });
    });

    expect(mockConfigure).toHaveBeenCalledTimes(1);
    const config = mockConfigure.mock.calls[0][0];
    expect(config.variant).toBe('inline');
    expect(config.fields.ccnumber.selector).toBe('#north-card-number');
    expect(config.fields.ccexp.selector).toBe('#north-card-expiry');
    expect(config.fields.cvv.selector).toBe('#north-card-cvv');
  });
});
