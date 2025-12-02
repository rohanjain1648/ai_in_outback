import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResourceSearch } from '../components/ResourceSearch';
import { resourceService } from '../services/resourceService';

// Mock the resource service
jest.mock('../services/resourceService', () => ({
  resourceService: {
    searchResources: jest.fn(),
    getResourceCategories: jest.fn(),
    getResourcesByLocation: jest.fn(),
  },
}));

const mockResourceService = resourceService as jest.Mocked<typeof resourceService>;

const mockResources = [
  {
    _id: '1',
    title: 'Tractor Rental',
    description: 'Heavy duty tractor for farming',
    category: 'equipment',
    subcategory: 'agricultural',
    location: {
      postcode: '2000',
      state: 'NSW',
      region: 'Sydney',
    },
    availability: {
      status: 'available',
      schedule: {
        monday: { available: true, startTime: '08:00', endTime: '18:00' }
      }
    },
    contactInfo: {
      phone: '0412345678',
      email: 'contact@example.com'
    },
    ownerId: 'user1',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    _id: '2',
    title: 'Veterinary Services',
    description: 'Mobile veterinary services for livestock',
    category: 'services',
    subcategory: 'veterinary',
    location: {
      postcode: '2001',
      state: 'NSW',
      region: 'Sydney',
    },
    availability: {
      status: 'available'
    },
    contactInfo: {
      phone: '0487654321',
      email: 'vet@example.com'
    },
    ownerId: 'user2',
    createdAt: '2023-01-02',
    updatedAt: '2023-01-02'
  }
];

const mockCategories = [
  { name: 'equipment', count: 15 },
  { name: 'services', count: 23 },
  { name: 'knowledge', count: 8 },
  { name: 'materials', count: 12 }
];

describe('ResourceSearch', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockResourceService.searchResources.mockResolvedValue({
      resources: mockResources,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10
      }
    });
    mockResourceService.getResourceCategories.mockResolvedValue(mockCategories);
  });

  it('renders search interface correctly', async () => {
    render(<ResourceSearch />);

    expect(screen.getByPlaceholderText('Search resources...')).toBeInTheDocument();
    expect(screen.getByText('Search Resources')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });
  });

  it('performs search when user types in search box', async () => {
    render(<ResourceSearch />);

    const searchInput = screen.getByPlaceholderText('Search resources...');
    
    await act(async () => {
      await user.type(searchInput, 'tractor');
    });

    await waitFor(() => {
      expect(mockResourceService.searchResources).toHaveBeenCalledWith({
        query: 'tractor',
        page: 1,
        limit: 10
      });
    });
  });

  it('displays search results', async () => {
    render(<ResourceSearch />);

    await waitFor(() => {
      expect(screen.getByText('Tractor Rental')).toBeInTheDocument();
      expect(screen.getByText('Veterinary Services')).toBeInTheDocument();
      expect(screen.getByText('Heavy duty tractor for farming')).toBeInTheDocument();
      expect(screen.getByText('Mobile veterinary services for livestock')).toBeInTheDocument();
    });
  });

  it('filters by category', async () => {
    render(<ResourceSearch />);

    await waitFor(() => {
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    // Click on equipment category
    const equipmentFilter = screen.getByText('equipment');
    await act(async () => {
      fireEvent.click(equipmentFilter);
    });

    await waitFor(() => {
      expect(mockResourceService.searchResources).toHaveBeenCalledWith({
        query: '',
        category: 'equipment',
        page: 1,
        limit: 10
      });
    });
  });

  it('filters by location', async () => {
    render(<ResourceSearch />);

    const locationInput = screen.getByPlaceholderText('Enter postcode or suburb');
    
    await act(async () => {
      await user.type(locationInput, '2000');
      fireEvent.blur(locationInput);
    });

    await waitFor(() => {
      expect(mockResourceService.searchResources).toHaveBeenCalledWith({
        query: '',
        location: '2000',
        page: 1,
        limit: 10
      });
    });
  });

  it('shows availability filter', async () => {
    render(<ResourceSearch />);

    const availabilityFilter = screen.getByLabelText('Available only');
    
    await act(async () => {
      fireEvent.click(availabilityFilter);
    });

    await waitFor(() => {
      expect(mockResourceService.searchResources).toHaveBeenCalledWith({
        query: '',
        availability: 'available',
        page: 1,
        limit: 10
      });
    });
  });

  it('handles pagination', async () => {
    // Mock response with multiple pages
    mockResourceService.searchResources.mockResolvedValue({
      resources: mockResources,
      pagination: {
        currentPage: 1,
        totalPages: 3,
        totalItems: 25,
        itemsPerPage: 10
      }
    });

    render(<ResourceSearch />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    await act(async () => {
      fireEvent.click(nextButton);
    });

    await waitFor(() => {
      expect(mockResourceService.searchResources).toHaveBeenCalledWith({
        query: '',
        page: 2,
        limit: 10
      });
    });
  });

  it('displays loading state during search', async () => {
    // Mock delayed response
    mockResourceService.searchResources.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        resources: mockResources,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10
        }
      }), 100))
    );

    render(<ResourceSearch />);

    const searchInput = screen.getByPlaceholderText('Search resources...');
    
    await act(async () => {
      await user.type(searchInput, 'test');
    });

    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner

    await waitFor(() => {
      expect(screen.getByText('Tractor Rental')).toBeInTheDocument();
    });
  });

  it('displays no results message when search returns empty', async () => {
    mockResourceService.searchResources.mockResolvedValue({
      resources: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10
      }
    });

    render(<ResourceSearch />);

    await waitFor(() => {
      expect(screen.getByText('No resources found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria or filters')).toBeInTheDocument();
    });
  });

  it('handles search error gracefully', async () => {
    mockResourceService.searchResources.mockRejectedValue(new Error('Search failed'));

    render(<ResourceSearch />);

    const searchInput = screen.getByPlaceholderText('Search resources...');
    
    await act(async () => {
      await user.type(searchInput, 'test');
    });

    await waitFor(() => {
      expect(screen.getByText('Error loading resources')).toBeInTheDocument();
      expect(screen.getByText('Please try again later')).toBeInTheDocument();
    });
  });

  it('clears filters when clear button is clicked', async () => {
    render(<ResourceSearch />);

    // Apply some filters first
    const equipmentFilter = screen.getByText('equipment');
    await act(async () => {
      fireEvent.click(equipmentFilter);
    });

    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear Filters');
    await act(async () => {
      fireEvent.click(clearButton);
    });

    await waitFor(() => {
      expect(mockResourceService.searchResources).toHaveBeenCalledWith({
        query: '',
        page: 1,
        limit: 10
      });
    });
  });

  it('shows resource contact information', async () => {
    render(<ResourceSearch />);

    await waitFor(() => {
      expect(screen.getByText('0412345678')).toBeInTheDocument();
      expect(screen.getByText('contact@example.com')).toBeInTheDocument();
      expect(screen.getByText('0487654321')).toBeInTheDocument();
      expect(screen.getByText('vet@example.com')).toBeInTheDocument();
    });
  });

  it('displays resource availability status', async () => {
    render(<ResourceSearch />);

    await waitFor(() => {
      const availableElements = screen.getAllByText('Available');
      expect(availableElements.length).toBeGreaterThan(0);
    });
  });

  it('sorts results by relevance, date, or distance', async () => {
    render(<ResourceSearch />);

    const sortSelect = screen.getByLabelText('Sort by');
    
    await act(async () => {
      fireEvent.change(sortSelect, { target: { value: 'date' } });
    });

    await waitFor(() => {
      expect(mockResourceService.searchResources).toHaveBeenCalledWith({
        query: '',
        sortBy: 'date',
        page: 1,
        limit: 10
      });
    });
  });
});