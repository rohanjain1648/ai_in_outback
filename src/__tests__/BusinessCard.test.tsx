import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BusinessCard from '../components/BusinessCard';
import { Business } from '../types/business';

const mockBusiness: Business = {
  _id: '1',
  name: 'Test Farm',
  description: 'A sustainable organic farm specializing in fresh vegetables and herbs for the local community.',
  category: 'Agriculture',
  subcategory: 'Organic Farming',
  services: ['Organic Vegetables', 'Fresh Herbs', 'Farm Tours'],
  capabilities: ['Sustainable Farming', 'Organic Certification'],
  location: {
    address: '123 Farm Road',
    suburb: 'Farmville',
    state: 'NSW',
    postcode: '2000',
    coordinates: { latitude: -33.8688, longitude: 151.2093 }
  },
  contact: {
    phone: '0412345678',
    email: 'info@testfarm.com',
    website: 'https://testfarm.com'
  },
  businessHours: {
    monday: { open: '08:00', close: '17:00', closed: false },
    tuesday: { open: '08:00', close: '17:00', closed: false },
    wednesday: { open: '08:00', close: '17:00', closed: false },
    thursday: { open: '08:00', close: '17:00', closed: false },
    friday: { open: '08:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '15:00', closed: false },
    sunday: { closed: true }
  },
  verification: { status: 'verified' },
  ratings: { 
    average: 4.5, 
    count: 12, 
    breakdown: { 5: 6, 4: 4, 3: 2, 2: 0, 1: 0 } 
  },
  reviews: [],
  economicData: { businessType: 'sole-trader' },
  tags: ['organic', 'sustainable', 'local'],
  isActive: true,
  isPremium: false,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01',
  owner: { _id: '1', name: 'John Doe', email: 'john@example.com' }
};

describe('BusinessCard', () => {
  it('renders business information correctly', () => {
    render(<BusinessCard business={mockBusiness} />);

    expect(screen.getByText('Test Farm')).toBeInTheDocument();
    expect(screen.getByText('Agriculture • Organic Farming')).toBeInTheDocument();
    expect(screen.getByText(/A sustainable organic farm/)).toBeInTheDocument();
    expect(screen.getByText('Farmville, NSW')).toBeInTheDocument();
  });

  it('displays verification status with correct icon', () => {
    render(<BusinessCard business={mockBusiness} />);

    // Should show verified icon (green checkmark)
    const verificationIcon = document.querySelector('.text-green-500');
    expect(verificationIcon).toBeInTheDocument();
  });

  it('shows premium badge for premium businesses', () => {
    const premiumBusiness = { ...mockBusiness, isPremium: true };
    render(<BusinessCard business={premiumBusiness} />);

    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('displays rating with stars', () => {
    render(<BusinessCard business={mockBusiness} />);

    expect(screen.getByText('4.5 (12 reviews)')).toBeInTheDocument();
    
    // Should show star rating
    const stars = document.querySelectorAll('.text-yellow-400');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('shows services as tags', () => {
    render(<BusinessCard business={mockBusiness} />);

    expect(screen.getByText('Organic Vegetables')).toBeInTheDocument();
    expect(screen.getByText('Fresh Herbs')).toBeInTheDocument();
    expect(screen.getByText('Farm Tours')).toBeInTheDocument();
  });

  it('limits services display and shows more indicator', () => {
    const businessWithManyServices = {
      ...mockBusiness,
      services: ['Service 1', 'Service 2', 'Service 3', 'Service 4', 'Service 5']
    };
    
    render(<BusinessCard business={businessWithManyServices} />);

    expect(screen.getByText('Service 1')).toBeInTheDocument();
    expect(screen.getByText('Service 2')).toBeInTheDocument();
    expect(screen.getByText('Service 3')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('shows contact information when available', () => {
    render(<BusinessCard business={mockBusiness} />);

    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('displays business hours', () => {
    render(<BusinessCard business={mockBusiness} />);

    // Should show formatted business hours
    const hoursText = screen.getByText(/Mon: 08:00-17:00/);
    expect(hoursText).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockOnClick = jest.fn();
    render(<BusinessCard business={mockBusiness} onClick={mockOnClick} />);

    const card = screen.getByText('Test Farm').closest('div');
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalledWith(mockBusiness);
  });

  it('shows pending verification status', () => {
    const pendingBusiness = {
      ...mockBusiness,
      verification: { status: 'pending' as const }
    };
    
    render(<BusinessCard business={pendingBusiness} />);

    // Should show pending icon (yellow clock)
    const pendingIcon = document.querySelector('.text-yellow-500');
    expect(pendingIcon).toBeInTheDocument();
  });

  it('handles business with no ratings', () => {
    const noRatingsBusiness = {
      ...mockBusiness,
      ratings: { average: 0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
    };
    
    render(<BusinessCard business={noRatingsBusiness} />);

    // Should not show rating section
    expect(screen.queryByText(/reviews/)).not.toBeInTheDocument();
  });

  it('handles business with no services', () => {
    const noServicesBusiness = {
      ...mockBusiness,
      services: []
    };
    
    render(<BusinessCard business={noServicesBusiness} />);

    // Should not show services section
    expect(screen.queryByText('Organic Vegetables')).not.toBeInTheDocument();
  });

  it('handles business with no phone contact', () => {
    const noPhoneBusiness = {
      ...mockBusiness,
      contact: { email: 'test@example.com' }
    };
    
    render(<BusinessCard business={noPhoneBusiness} />);

    // Should not show contact section
    expect(screen.queryByText('Contact')).not.toBeInTheDocument();
  });

  it('applies correct cursor style when clickable', () => {
    const { container } = render(<BusinessCard business={mockBusiness} onClick={() => {}} />);
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('does not apply cursor style when not clickable', () => {
    const { container } = render(<BusinessCard business={mockBusiness} />);
    
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('cursor-pointer');
  });
});