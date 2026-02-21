import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentHistoryPage from './PaymentHistoryPage';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../lib/api', () => ({
  paymentsApi: {
    getHistory: jest.fn(),
  },
}));

const { useAuth } = require('../context/AuthContext');
const { paymentsApi } = require('../lib/api');

const mockPayments = [
  {
    id: 1,
    created_at: '2026-02-01',
    description: 'Spring Tournament',
    amount: 75,
    status: 'completed',
    card_last_four: '4242',
    payment_type: 'event_registration',
  },
  {
    id: 2,
    created_at: '2026-01-15',
    description: 'Individual Membership 2026',
    amount: 150,
    status: 'completed',
    card_last_four: '4242',
    payment_type: 'membership',
  },
  {
    id: 3,
    created_at: '2026-01-10',
    description: 'Winter Classic',
    amount: 75,
    status: 'refunded',
    card_last_four: '1234',
    payment_type: 'event_registration',
  },
];

describe('PaymentHistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: { id: 1, first_name: 'John' },
    });
  });

  it('shows loading state', () => {
    paymentsApi.getHistory.mockReturnValue(new Promise(() => {}));
    render(<PaymentHistoryPage />);
    expect(screen.getByText('Loading payments...')).toBeInTheDocument();
  });

  it('displays payments in a table', async () => {
    paymentsApi.getHistory.mockResolvedValue({ payments: mockPayments, total: 3 });

    render(<PaymentHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Spring Tournament')).toBeInTheDocument();
    });

    expect(screen.getByText('Individual Membership 2026')).toBeInTheDocument();
    expect(screen.getByText('Winter Classic')).toBeInTheDocument();
    expect(screen.getAllByText('$75.00').length).toBe(2);
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('shows correct status badges', async () => {
    paymentsApi.getHistory.mockResolvedValue({ payments: mockPayments, total: 3 });

    render(<PaymentHistoryPage />);

    await waitFor(() => {
      const completedBadges = screen.getAllByText('completed');
      expect(completedBadges.length).toBe(2);
    });

    expect(screen.getByText('refunded')).toBeInTheDocument();
  });

  it('shows card last four digits', async () => {
    paymentsApi.getHistory.mockResolvedValue({ payments: mockPayments, total: 3 });

    render(<PaymentHistoryPage />);

    await waitFor(() => {
      expect(screen.getAllByText('****4242').length).toBe(2);
    });

    expect(screen.getByText('****1234')).toBeInTheDocument();
  });

  it('shows empty state when no payments', async () => {
    paymentsApi.getHistory.mockResolvedValue({ payments: [], total: 0 });

    render(<PaymentHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('No payments found')).toBeInTheDocument();
    });
  });

  it('renders filter dropdowns', async () => {
    paymentsApi.getHistory.mockResolvedValue({ payments: [], total: 0 });

    render(<PaymentHistoryPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by payment type')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
  });

  it('calls API with filter params on filter change', async () => {
    paymentsApi.getHistory.mockResolvedValue({ payments: [], total: 0 });

    render(<PaymentHistoryPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by payment type')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Filter by payment type'), {
      target: { value: 'membership' },
    });

    await waitFor(() => {
      expect(paymentsApi.getHistory).toHaveBeenCalledWith(
        expect.objectContaining({ payment_type: 'membership' })
      );
    });
  });

  it('shows error state', async () => {
    paymentsApi.getHistory.mockRejectedValue(new Error('Server error'));

    render(<PaymentHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });
});
