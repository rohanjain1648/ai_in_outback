import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BusinessDirectory from '../components/BusinessDirectory';
import { businessService } from '../services/businessService';

// Mock the business service
jest.mock('../services/businessService');
const mockedBusinessService = businessService as jest.Mocked<typeof businessService>;

// Mock the child components
jest.mock('../components/BusinessCard', () => {
  return function MockBusinessCard({ business }: { business: any }) {
    return <div data-testid="business-card">{business.name}</div>;
  };
});

jest.mock('../components/BusinessFilters', () => {
  return function MockBusinessFilters({ onFilterChange, onClearFilters }: any) {
    return (
      <div data-testid="business-filters">
        <button onClick={() => onFilterChange({ category: 'Agriculture' })}>
          Filter Agriculture
        </button>
        <button onClick={onClearFilters}>Clear Filters</button>
      </div>
    );
  };
});

const mockBusinesses = [
  {
    _id: '1',
    name: 'Test Farm 1',
    description: 'A test farm',
    category: 'Agriculture',
    subcategory: 'Crop Farming',
    services: ['Organic Vegetables'],
    capabilities: ['Sustainable Farming'],
    location: {
      address: '123 Farm Road',
      suburb: 'Farmville',
      state: 'NSW',
      postcode: '2000',
      coordinates: { latitude: -33.8688, longitude: 151.2093 }
    },
    contact: {},
    businessHours: {},
    verification: { status: 'verified' as const },
    ratings: { average: 4.5, count: 10, breakdown: { 5: 5, 4: 3, 3: 2, 2: 0, 1: 0 } },
    reviews: [],
    economicData: { businessType: 'sole-trader' as const },
    tags: [],
    isActive: true,
    isPremium: false,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    owner: { _id: '1', name: 'John Doe', email: 'john@example.com' }
  },
  {
    _id: '2',
    name: 'Test Farm 2',
    description: 'Another test farm',
    category: 'Agriculture',
    subcategory: 'Livestock',
    services: ['Cattle Farming'],
    capabilities: ['Grass Fed'],
    location: {
      address: '456 Ranch Road',
      suburb: 'Ranchville',
      state: 'QLD',
      postcode: '4000',
      coordinates: { latitude: -27.4698, longitude: 153.0251 }
    },
    contact: {},
    businessHours: {},
    verification: { status: 'pending' as const },
    ratings: { average: 4.0, count: 5, breakdown: { 5: 2, 4: 2, 3: 1, 2: 0, 1: 0 } },
    reviews: [],
    economicData: { businessType: 'company' as const },
    tags: [],
    isActive: true,
    isPremium: true,
    createdAt: '2023-01-02',
    updatedAt: '2023-01-02',
    owner: { _id: '2', name: 'Jane Smith', email: 'jane@example.com' }
  }
];

describe('BusinessDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedBusinessService.searchBusinesses.mockResolvedValue({
      businesses: mockBusinesses,
      total: 2,
      page: 1,
      totalPages: 1
    });
  });

  it('renders business directory with businesses', async () => {
    render(<BusinessDirectory />);

    expect(screen.getByText('Rural Business Directory')).toBeInTheDocument();
    expect(screen.getByText('Discover and connect with local businesses in rural Australia')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Farm 1')).toBeInTheDocument();
      expect(screen.getByText('Test Farm 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Showing 1 to 2 of 2 businesses')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<BusinessDirectory />);

    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('handles search filters', async () => {
    render(<BusinessDirectory />);

    await waitFor(() => {
      expect(screen.getByText('Test Farm 1')).toBeInTheDocument();
    });

    // Click filter button
    fireEvent.click(screen.getByText('Filter Agriculture'));

    await waitFor(() => {
      expect(mockedBusinessService.searchBusinesses).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Agriculture',
          page: 1
        }),
        1,
        20
      );
    });
  });

  it('handles clear filters', async () => {
    render(<BusinessDirectory />);

    await waitFor(() => {
      expect(screen.getByText('Test Farm 1')).toBeInTheDocument();
    });

    // Click clear filters button
    fireEvent.click(screen.getByText('Clear Filters'));

    await waitFor(() => {
      expect(mockedBusinessService.searchBusinesses).toHaveBeenCalledWith(
        { page: 1, limit: 20 },
        1,
        20
      );
    });
  });

  it('shows error message when search fails', async () => {
    mockedBusinessService.searchBusinesses.mockRejectedValue(new Error('Search failed'));

    render(<BusinessDirectory />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Search failed')).toBeInTheDocument();
    });
  });

  it('shows no results message when no businesses found', async () => {
    mockedBusinessService.searchBusinesses.mockResolvedValue({
      businesses: [],
      total: 0,
      page: 1,
      totalPages: 0
    });

    render(<BusinessDirectory />);

    await waitFor(() => {
      expect(screen.getByText('No businesses found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search filters or clearing them to see more results.')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    mockedBusinessService.searchBusinesses.mockResolvedValue({
      businesses: mockBusinesses,
      total: 50,
      page: 1,
      totalPages: 3
    });

    render(<BusinessDirectory />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    // Should show pagination controls
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('renders business cards for each business', async () => {
    render(<BusinessDirectory />);

    await waitFor(() => {
      const businessCards = screen.getAllByTestId('business-card');
      expect(businessCards).toHaveLength(2);
    });
  });

  it('shows filters sidebar', async () => {
    render(<BusinessDirectory />);

    await waitFor(() => {
      expect(screen.getByTestId('business-filters')).toBeInTheDocument();
    });
  });
});