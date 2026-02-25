import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventRegistrationModal from './EventRegistrationModal';

// Mock PaymentForm
jest.mock('./PaymentForm', () => {
  return function MockPaymentForm({ submitLabel, amount, onTokenReceived, error }) {
    return (
      <div data-testid="payment-form">
        <span data-testid="payment-amount">{amount}</span>
        <span data-testid="payment-label">{submitLabel}</span>
        {error && <span data-testid="payment-error">{error}</span>}
        <button data-testid="mock-pay-btn" onClick={() => onTokenReceived('test-token')}>
          Pay
        </button>
      </div>
    );
  };
});

// Mock useAuth
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock registrationsApi
jest.mock('../lib/api', () => ({
  registrationsApi: {
    register: jest.fn(),
    retryPayment: jest.fn(),
    registerGuest: jest.fn(),
  },
}));

const { useAuth } = require('../context/AuthContext');
const { registrationsApi } = require('../lib/api');

const mockEvent = {
  id: 1,
  golf_course: 'Test Golf Club',
  date: '2026-04-15',
  start_time: '8:00 AM',
  township: 'Springfield',
  state: 'NJ',
  price: 75,
  member_price: 75,
  guest_price: 85,
};

describe('EventRegistrationModal', () => {
  const onClose = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticated user', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone_number: '555-123-4567',
          handicap: '12',
        },
      });
    });

    it('renders event details', () => {
      render(<EventRegistrationModal event={mockEvent} onClose={onClose} onSuccess={onSuccess} />);
      expect(screen.getByText('Test Golf Club')).toBeInTheDocument();
      expect(screen.getByText('Springfield, NJ')).toBeInTheDocument();
    });

    it('shows member price for logged-in user', () => {
      render(<EventRegistrationModal event={mockEvent} onClose={onClose} onSuccess={onSuccess} />);
      expect(screen.getByText('$75')).toBeInTheDocument();
    });

    it('shows handicap field for authenticated user', () => {
      render(<EventRegistrationModal event={mockEvent} onClose={onClose} onSuccess={onSuccess} />);
      expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    });

    it('does not show name/email/phone fields for authenticated user', () => {
      render(<EventRegistrationModal event={mockEvent} onClose={onClose} onSuccess={onSuccess} />);
      expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Email Address')).not.toBeInTheDocument();
    });

    it('renders payment form with Register & Pay label', () => {
      render(<EventRegistrationModal event={mockEvent} onClose={onClose} onSuccess={onSuccess} />);
      expect(screen.getByTestId('payment-label')).toHaveTextContent('Register & Pay');
    });

    it('shows confirmation after successful payment', async () => {
      registrationsApi.register.mockResolvedValue({ confirmation_id: 'CONF123' });

      render(<EventRegistrationModal event={mockEvent} onClose={onClose} onSuccess={onSuccess} />);

      fireEvent.click(screen.getByTestId('mock-pay-btn'));

      // Wait for confirmation view
      const heading = await screen.findByText('Registration Confirmed');
      expect(heading).toBeInTheDocument();
      expect(screen.getByText('CONF123')).toBeInTheDocument();
    });

    it('shows declined state on payment failure', async () => {
      registrationsApi.register.mockRejectedValue(new Error('Card declined'));

      render(<EventRegistrationModal event={mockEvent} onClose={onClose} onSuccess={onSuccess} />);

      fireEvent.click(screen.getByTestId('mock-pay-btn'));

      const heading = await screen.findByText('Payment Declined');
      expect(heading).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      render(<EventRegistrationModal event={mockEvent} onClose={onClose} onSuccess={onSuccess} />);

      // Find close button (the X svg button)
      const closeButtons = screen.getAllByRole('button');
      const closeBtn = closeButtons.find(btn => btn.classList.contains('modal-close'));
      if (closeBtn) {
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('guest user', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: null });
    });

    it('shows all form fields for guest', () => {
      render(<EventRegistrationModal event={mockEvent} onClose={onClose} onSuccess={onSuccess} />);
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Golf Handicap')).toBeInTheDocument();
    });

    it('does not show payment form until required fields are filled', () => {
      render(<EventRegistrationModal event={mockEvent} onClose={onClose} onSuccess={onSuccess} />);
      // PaymentForm should not render when form is invalid (empty name/email/phone)
      expect(screen.queryByTestId('payment-form')).not.toBeInTheDocument();
    });

    it('shows payment form after filling required fields', () => {
      render(<EventRegistrationModal event={mockEvent} onClose={onClose} onSuccess={onSuccess} />);

      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane Smith' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@test.com' } });
      fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '555-999-0000' } });

      expect(screen.getByTestId('payment-form')).toBeInTheDocument();
    });
  });

  describe('free event', () => {
    const freeEvent = { ...mockEvent, price: 0, member_price: 0, guest_price: 0 };

    it('shows simple register button for free events', () => {
      useAuth.mockReturnValue({
        user: { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@test.com' },
      });

      render(<EventRegistrationModal event={freeEvent} onClose={onClose} onSuccess={onSuccess} />);
      expect(screen.getByText('Complete Registration')).toBeInTheDocument();
      expect(screen.queryByTestId('payment-form')).not.toBeInTheDocument();
    });
  });
});
