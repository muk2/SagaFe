import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPaymentsPage from './AdminPaymentsPage';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../lib/api', () => ({
  adminApi: {
    getGuestRate: jest.fn(),
    updateGuestRate: jest.fn(),
    refundPayment: jest.fn(),
    markRegistrationPaid: jest.fn(),
    markMembershipPaid: jest.fn(),
    getMembershipTiers: jest.fn(),
  },
}));

const { useAuth } = require('../context/AuthContext');
const { adminApi } = require('../lib/api');

describe('AdminPaymentsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: { id: 1, first_name: 'Admin', role: 'admin' },
    });
    adminApi.getGuestRate.mockResolvedValue({ rate: 85 });
    adminApi.getMembershipTiers.mockResolvedValue([
      { id: 1, name: 'Individual', amount: 150, is_active: true },
      { id: 2, name: 'Young Adult', amount: 75, is_active: true },
    ]);
  });

  it('shows section tabs', async () => {
    render(<AdminPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Guest Rate')).toBeInTheDocument();
    });

    expect(screen.getByText('Refunds')).toBeInTheDocument();
    expect(screen.getByText('Mark Registration Paid')).toBeInTheDocument();
    expect(screen.getByText('Mark Membership Paid')).toBeInTheDocument();
  });

  it('displays current guest rate', async () => {
    render(<AdminPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('$85.00')).toBeInTheDocument();
    });

    expect(screen.getByText('Guest Event Rate')).toBeInTheDocument();
  });

  it('calls updateGuestRate API with new rate value', async () => {
    adminApi.updateGuestRate.mockResolvedValue({});
    render(<AdminPaymentsPage />);

    // Wait for loading to complete by finding the form elements
    const rateInput = await screen.findByLabelText('New Rate ($)');
    const updateBtn = screen.getByText('Update Rate');

    // Use Object.getOwnPropertyDescriptor to properly set value on controlled input
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set;
    nativeInputValueSetter.call(rateInput, '95');
    rateInput.dispatchEvent(new Event('input', { bubbles: true }));

    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(adminApi.updateGuestRate).toHaveBeenCalledWith(95);
    });
  });

  it('shows refund section with payment ID input', async () => {
    render(<AdminPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Guest Rate')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Refunds'));

    expect(screen.getByText('Process Refund')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment ID')).toBeInTheDocument();
    expect(screen.getByText('Refund')).toBeInTheDocument();
  });

  it('shows refund confirmation before processing', async () => {
    render(<AdminPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Guest Rate')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Refunds'));
    fireEvent.change(screen.getByLabelText('Payment ID'), { target: { value: '42' } });
    fireEvent.click(screen.getByText('Refund'));

    expect(screen.getByText(/Confirm refund for payment #42/)).toBeInTheDocument();
    expect(screen.getByText('Yes, Refund')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('processes refund on confirmation', async () => {
    adminApi.refundPayment.mockResolvedValue({});
    render(<AdminPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Guest Rate')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Refunds'));
    fireEvent.change(screen.getByLabelText('Payment ID'), { target: { value: '42' } });
    fireEvent.click(screen.getByText('Refund'));
    fireEvent.click(screen.getByText('Yes, Refund'));

    await waitFor(() => {
      expect(adminApi.refundPayment).toHaveBeenCalledWith('42');
    });
  });

  it('shows mark registration paid form', async () => {
    render(<AdminPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Guest Rate')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Mark Registration Paid'));

    expect(screen.getByText('Mark Registration as Paid')).toBeInTheDocument();
    expect(screen.getByLabelText('Registration ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount ($)')).toBeInTheDocument();
    expect(screen.getByLabelText('Note (optional)')).toBeInTheDocument();
  });

  it('marks registration as paid', async () => {
    adminApi.markRegistrationPaid.mockResolvedValue({});
    render(<AdminPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Guest Rate')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Mark Registration Paid'));
    fireEvent.change(screen.getByLabelText('Registration ID'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '75' } });
    fireEvent.change(screen.getByLabelText('Note (optional)'), { target: { value: 'Cash' } });
    fireEvent.click(screen.getByText('Mark as Paid'));

    await waitFor(() => {
      expect(adminApi.markRegistrationPaid).toHaveBeenCalledWith('10', {
        amount: 75,
        note: 'Cash',
      });
    });
  });

  it('shows mark membership paid form with tier dropdown', async () => {
    render(<AdminPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Guest Rate')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Mark Membership Paid'));

    expect(screen.getByText('Mark Membership as Paid')).toBeInTheDocument();
    expect(screen.getByLabelText('User ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Membership Tier')).toBeInTheDocument();
  });

  it('marks membership as paid', async () => {
    adminApi.markMembershipPaid.mockResolvedValue({});
    render(<AdminPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Guest Rate')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Mark Membership Paid'));

    await waitFor(() => {
      expect(screen.getByLabelText('Membership Tier')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('User ID'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Membership Tier'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Save Membership Payment'));

    await waitFor(() => {
      expect(adminApi.markMembershipPaid).toHaveBeenCalledWith('5', {
        tier_id: 1,
        note: undefined,
      });
    });
  });

  it('shows error when guest rate fails to load', async () => {
    adminApi.getGuestRate.mockRejectedValue(new Error('Network error'));
    render(<AdminPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
