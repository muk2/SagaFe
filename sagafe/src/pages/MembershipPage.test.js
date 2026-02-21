import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MembershipPage from './MembershipPage';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

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

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../lib/api', () => ({
  membershipsApi: {
    getTiers: jest.fn(),
    getStatus: jest.fn(),
    pay: jest.fn(),
  },
}));

const { useAuth } = require('../context/AuthContext');
const { membershipsApi } = require('../lib/api');

const mockTiers = [
  { id: 1, name: 'Individual', amount: 150, description: 'Full membership', sort_order: 1 },
  { id: 2, name: 'Young Adult', amount: 75, description: 'Ages 18-25', sort_order: 2 },
];

describe('MembershipPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@test.com' },
    });
  });

  it('shows loading state initially', () => {
    membershipsApi.getTiers.mockReturnValue(new Promise(() => {}));
    membershipsApi.getStatus.mockReturnValue(new Promise(() => {}));

    render(<MembershipPage />);
    expect(screen.getByText('Loading membership information...')).toBeInTheDocument();
  });

  it('shows tier selection and payment form', async () => {
    membershipsApi.getTiers.mockResolvedValue(mockTiers);
    membershipsApi.getStatus.mockResolvedValue({ has_active_membership: false });

    render(<MembershipPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Select your membership tier')).toBeInTheDocument();
    });

    expect(screen.getByText('Individual — $150')).toBeInTheDocument();
    expect(screen.getByText('Young Adult — $75')).toBeInTheDocument();
    expect(screen.getByTestId('payment-form')).toBeInTheDocument();
    expect(screen.getByTestId('payment-label')).toHaveTextContent('Pay Membership');
  });

  it('shows active membership when user has one', async () => {
    membershipsApi.getTiers.mockResolvedValue(mockTiers);
    membershipsApi.getStatus.mockResolvedValue({
      has_active_membership: true,
      tier_name: 'Individual',
      season: 2026,
      paid_date: '2026-01-15',
    });

    render(<MembershipPage />);

    await waitFor(() => {
      expect(screen.getByText('Your membership is active')).toBeInTheDocument();
    });

    expect(screen.getByText('Individual')).toBeInTheDocument();
    expect(screen.getByText('Thank you for being a member!')).toBeInTheDocument();
  });

  it('shows confirmation after successful payment', async () => {
    membershipsApi.getTiers.mockResolvedValue(mockTiers);
    membershipsApi.getStatus.mockResolvedValue({ has_active_membership: false });
    membershipsApi.pay.mockResolvedValue({ confirmation_id: 'MEM-456' });

    render(<MembershipPage />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-pay-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('mock-pay-btn'));

    await waitFor(() => {
      expect(screen.getByText('Membership Activated!')).toBeInTheDocument();
    });

    expect(screen.getByText('MEM-456')).toBeInTheDocument();
  });

  it('shows error state on data load failure', async () => {
    membershipsApi.getTiers.mockRejectedValue(new Error('Network error'));
    membershipsApi.getStatus.mockRejectedValue(new Error('Network error'));

    render(<MembershipPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
