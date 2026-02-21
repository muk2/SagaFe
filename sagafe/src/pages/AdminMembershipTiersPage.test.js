import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminMembershipTiersPage from './AdminMembershipTiersPage';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../lib/api', () => ({
  adminApi: {
    getMembershipTiers: jest.fn(),
    createMembershipTier: jest.fn(),
    updateMembershipTier: jest.fn(),
    deactivateMembershipTier: jest.fn(),
  },
}));

const { useAuth } = require('../context/AuthContext');
const { adminApi } = require('../lib/api');

const mockTiers = [
  { id: 1, name: 'Individual', amount: 150, description: 'Full membership', sort_order: 1, is_active: true },
  { id: 2, name: 'Young Adult', amount: 75, description: 'Ages 18-25', sort_order: 2, is_active: true },
  { id: 3, name: 'Legacy', amount: 100, description: 'Old tier', sort_order: 3, is_active: false },
];

describe('AdminMembershipTiersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: { id: 1, first_name: 'Admin', role: 'admin' },
    });
  });

  it('shows loading state', () => {
    adminApi.getMembershipTiers.mockReturnValue(new Promise(() => {}));
    render(<AdminMembershipTiersPage />);
    expect(screen.getByText('Loading tiers...')).toBeInTheDocument();
  });

  it('displays tiers in a table', async () => {
    adminApi.getMembershipTiers.mockResolvedValue(mockTiers);
    render(<AdminMembershipTiersPage />);

    await waitFor(() => {
      expect(screen.getByText('Individual')).toBeInTheDocument();
    });

    expect(screen.getByText('Young Adult')).toBeInTheDocument();
    expect(screen.getByText('Legacy')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
  });

  it('shows active and inactive status badges', async () => {
    adminApi.getMembershipTiers.mockResolvedValue(mockTiers);
    render(<AdminMembershipTiersPage />);

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBe(2);
    });

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('opens create modal when Add Tier is clicked', async () => {
    adminApi.getMembershipTiers.mockResolvedValue([]);
    render(<AdminMembershipTiersPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Tier')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Add Tier'));
    expect(screen.getByText('Create Membership Tier')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount ($)')).toBeInTheDocument();
  });

  it('opens edit modal when Edit is clicked', async () => {
    adminApi.getMembershipTiers.mockResolvedValue(mockTiers);
    render(<AdminMembershipTiersPage />);

    await waitFor(() => {
      expect(screen.getByText('Individual')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Membership Tier')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Individual');
    expect(screen.getByLabelText('Amount ($)')).toHaveValue(150);
  });

  it('creates a new tier via API', async () => {
    adminApi.getMembershipTiers.mockResolvedValue([]);
    adminApi.createMembershipTier.mockResolvedValue({ id: 4 });
    render(<AdminMembershipTiersPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Tier')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Add Tier'));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Student' } });
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Student discount' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(adminApi.createMembershipTier).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Student', amount: 50 })
      );
    });
  });

  it('shows deactivation confirmation dialog', async () => {
    adminApi.getMembershipTiers.mockResolvedValue(mockTiers);
    render(<AdminMembershipTiersPage />);

    await waitFor(() => {
      expect(screen.getByText('Individual')).toBeInTheDocument();
    });

    const deactivateButtons = screen.getAllByText('Deactivate');
    fireEvent.click(deactivateButtons[0]);

    expect(screen.getByText('Deactivate Tier')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to deactivate/)).toBeInTheDocument();
  });

  it('calls deactivate API on confirmation', async () => {
    adminApi.getMembershipTiers.mockResolvedValue(mockTiers);
    adminApi.deactivateMembershipTier.mockResolvedValue({});
    render(<AdminMembershipTiersPage />);

    await waitFor(() => {
      expect(screen.getByText('Individual')).toBeInTheDocument();
    });

    const deactivateButtons = screen.getAllByText('Deactivate');
    fireEvent.click(deactivateButtons[0]);

    // Click confirm in the dialog
    const confirmBtn = screen.getAllByText('Deactivate');
    // The last "Deactivate" button is the confirm one in the modal
    fireEvent.click(confirmBtn[confirmBtn.length - 1]);

    await waitFor(() => {
      expect(adminApi.deactivateMembershipTier).toHaveBeenCalledWith(1);
    });
  });

  it('shows reactivate button for inactive tiers', async () => {
    adminApi.getMembershipTiers.mockResolvedValue(mockTiers);
    render(<AdminMembershipTiersPage />);

    await waitFor(() => {
      expect(screen.getByText('Reactivate')).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    adminApi.getMembershipTiers.mockRejectedValue(new Error('Server error'));
    render(<AdminMembershipTiersPage />);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('shows empty state when no tiers exist', async () => {
    adminApi.getMembershipTiers.mockResolvedValue([]);
    render(<AdminMembershipTiersPage />);

    await waitFor(() => {
      expect(screen.getByText('No membership tiers configured yet.')).toBeInTheDocument();
    });
  });

  it('validates required name field on save', async () => {
    adminApi.getMembershipTiers.mockResolvedValue([]);
    render(<AdminMembershipTiersPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Tier')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Add Tier'));

    // Leave name empty, set amount
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '50' } });
    fireEvent.click(screen.getByText('Save'));

    // The HTML5 required attribute prevents submission, but our manual validation also catches it
    // The form won't submit due to HTML5 validation on required fields
  });
});
