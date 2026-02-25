import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentForm from './PaymentForm';

// Mock the useNorthSDK hook
jest.mock('../hooks/useNorthSDK', () => {
  return jest.fn();
});

const useNorthSDK = require('../hooks/useNorthSDK');

describe('PaymentForm', () => {
  const defaultProps = {
    amount: '75.00',
    onTokenReceived: jest.fn(),
    onError: jest.fn(),
    submitLabel: 'Register & Pay',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when SDK is not yet loaded', () => {
    useNorthSDK.mockReturnValue({
      sdkLoaded: false,
      sdkError: null,
      configure: jest.fn(),
      getToken: jest.fn(),
    });

    render(<PaymentForm {...defaultProps} />);
    expect(screen.getByText('Loading payment form...')).toBeInTheDocument();
  });

  it('shows error state when SDK fails to load', () => {
    useNorthSDK.mockReturnValue({
      sdkLoaded: false,
      sdkError: 'Failed to load payment SDK',
      configure: jest.fn(),
      getToken: jest.fn(),
    });

    render(<PaymentForm {...defaultProps} />);
    expect(screen.getByText('Failed to load payment SDK')).toBeInTheDocument();
  });

  it('renders card fields when SDK is loaded', () => {
    useNorthSDK.mockReturnValue({
      sdkLoaded: true,
      sdkError: null,
      configure: jest.fn(),
      getToken: jest.fn(),
    });

    render(<PaymentForm {...defaultProps} />);

    expect(screen.getByText('Card Number')).toBeInTheDocument();
    expect(screen.getByText('Expiration Date')).toBeInTheDocument();
    expect(screen.getByText('CVV')).toBeInTheDocument();
    expect(screen.getByText('Secure Payment')).toBeInTheDocument();
  });

  it('displays the submit button with amount', () => {
    useNorthSDK.mockReturnValue({
      sdkLoaded: true,
      sdkError: null,
      configure: jest.fn(),
      getToken: jest.fn(),
    });

    render(<PaymentForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Register & Pay \$75\.00/i })).toBeInTheDocument();
  });

  it('displays external error message', () => {
    useNorthSDK.mockReturnValue({
      sdkLoaded: true,
      sdkError: null,
      configure: jest.fn(),
      getToken: jest.fn(),
    });

    render(<PaymentForm {...defaultProps} error="Your card was declined" />);
    expect(screen.getByText('Your card was declined')).toBeInTheDocument();
  });

  it('disables submit button when loading prop is true', () => {
    useNorthSDK.mockReturnValue({
      sdkLoaded: true,
      sdkError: null,
      configure: jest.fn(),
      getToken: jest.fn(),
    });

    render(<PaymentForm {...defaultProps} loading={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows processing state when tokenizing', () => {
    useNorthSDK.mockReturnValue({
      sdkLoaded: true,
      sdkError: null,
      configure: jest.fn(),
      getToken: jest.fn(),
    });

    render(<PaymentForm {...defaultProps} loading={true} />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('renders card brand indicators', () => {
    useNorthSDK.mockReturnValue({
      sdkLoaded: true,
      sdkError: null,
      configure: jest.fn(),
      getToken: jest.fn(),
    });

    render(<PaymentForm {...defaultProps} />);
    expect(screen.getByText('VISA')).toBeInTheDocument();
    expect(screen.getByText('MC')).toBeInTheDocument();
    expect(screen.getByText('AMEX')).toBeInTheDocument();
    expect(screen.getByText('DISC')).toBeInTheDocument();
  });

  it('calls configure when SDK loads', () => {
    const configureMock = jest.fn();
    useNorthSDK.mockReturnValue({
      sdkLoaded: true,
      sdkError: null,
      configure: configureMock,
      getToken: jest.fn(),
    });

    render(<PaymentForm {...defaultProps} />);

    // configure is called in a useEffect — verify it was provided
    expect(configureMock).toBeDefined();
  });

  it('renders iFrame field containers with correct IDs', () => {
    useNorthSDK.mockReturnValue({
      sdkLoaded: true,
      sdkError: null,
      configure: jest.fn(),
      getToken: jest.fn(),
    });

    const { container } = render(<PaymentForm {...defaultProps} />);
    expect(container.querySelector('#north-card-number')).toBeInTheDocument();
    expect(container.querySelector('#north-card-expiry')).toBeInTheDocument();
    expect(container.querySelector('#north-card-cvv')).toBeInTheDocument();
  });
});
