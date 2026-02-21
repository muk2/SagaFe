import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GuestRegistrationPage from './GuestRegistrationPage';

// Mock react-router-dom hooks used by the component
const mockSearchParams = new URLSearchParams('event=1');
jest.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams],
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Mock PaymentForm
jest.mock('../components/PaymentForm', () => {
  return function MockPaymentForm({ submitLabel, amount, onTokenReceived }) {
    return (
      <div data-testid="payment-form">
        <span data-testid="payment-amount">{amount}</span>
        <span data-testid="payment-label">{submitLabel}</span>
        <button data-testid="mock-pay-btn" onClick={() => onTokenReceived('test-token')}>
          Pay
        </button>
      </div>
    );
  };
});

// Mock API
jest.mock('../lib/api', () => ({
  eventsApi: {
    getAll: jest.fn(),
  },
  registrationsApi: {
    registerGuest: jest.fn(),
  },
  adminApi: {
    getGuestRate: jest.fn(),
  },
}));

const { eventsApi, registrationsApi, adminApi } = require('../lib/api');

const mockEvent = {
  id: 1,
  golf_course: 'Test Golf Club',
  date: '2026-04-15',
  start_time: '8:00 AM',
  township: 'Springfield',
  state: 'NJ',
  price: 85,
  guest_price: 85,
};

function renderPage() {
  return render(<GuestRegistrationPage />);
}

describe('GuestRegistrationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    eventsApi.getAll.mockResolvedValue([mockEvent]);
    adminApi.getGuestRate.mockResolvedValue({ rate: 85 });
  });

  it('loads and displays event details', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Test Golf Club')).toBeInTheDocument();
    });

    expect(screen.getByText(/Springfield, NJ/)).toBeInTheDocument();
  });

  it('shows all guest form fields', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone *')).toBeInTheDocument();
    expect(screen.getByLabelText('Golf Handicap')).toBeInTheDocument();
    expect(screen.getByLabelText('How did you hear about SAGA?')).toBeInTheDocument();
  });

  it('does not show payment form until required fields are filled', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('payment-form')).not.toBeInTheDocument();
  });

  it('shows payment form after filling required fields', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Last Name *'), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '5551234567' } });

    expect(screen.getByTestId('payment-form')).toBeInTheDocument();
    expect(screen.getByTestId('payment-label')).toHaveTextContent('Register & Pay');
  });

  it('shows confirmation after successful registration', async () => {
    registrationsApi.registerGuest.mockResolvedValue({ confirmation_id: 'GUEST-123' });

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Last Name *'), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '5551234567' } });

    fireEvent.click(screen.getByTestId('mock-pay-btn'));

    await waitFor(() => {
      expect(screen.getByText('Registration Confirmed')).toBeInTheDocument();
    });

    expect(screen.getByText('GUEST-123')).toBeInTheDocument();
    expect(screen.getByText(/jane@test.com/)).toBeInTheDocument();
  });

  it('shows membership CTA on confirmation', async () => {
    registrationsApi.registerGuest.mockResolvedValue({ confirmation_id: 'GUEST-123' });

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Last Name *'), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '5551234567' } });

    fireEvent.click(screen.getByTestId('mock-pay-btn'));

    await waitFor(() => {
      expect(screen.getByText('Want to become a SAGA member?')).toBeInTheDocument();
    });
  });

  it('shows error when event is not found', async () => {
    eventsApi.getAll.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Event not found')).toBeInTheDocument();
    });
  });

  it('formats phone number as user types', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText('Phone *')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '5551234567' } });
    expect(screen.getByLabelText('Phone *').value).toBe('(555) 123-4567');
  });
});
