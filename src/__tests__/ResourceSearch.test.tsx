import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResourceSearch from '../components/ResourceSearch';
import { resourceService } from '../services/resourceService';
import { useGeolocation } from '../hooks/useGeolocation';

// Mock dependencies
jest.mock('../services/resourceService');
jest.mock('../hooks/useGeolocation');

const mockResourceService = resourceService as jest.Mocked<typeof resourceService>;
const mockUseGeolocation = useGeolocation as jest.MockedFunction<typeof useGeolocation>;

describe('ResourceSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseGeolocation.mockReturnValue({
      location: { latitude: -33.8688, longitude: 151.2093 },
      loading: false,
      error: null
    });

    mockResourceService.searchResources.mockResolvedValue({
      resources: [],
      total: 0,
      suggestions: [],
      aggregations: {
        categories: [],
        states: [],
        pricing_types: [],
        availability_status: [],
        popular_tags: []
      }
    });
  });

  it('renders search form correctly', () => {
    render(<ResourceSearch />);
    
    expect(screen.getByText('Find Community Resources')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search for equipment, services/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  it('performs search when form is submitted', async () => {
    const mockSearchResult = {
      resources: [
        {
          _id: 'resource1',
          title: 'Test Tractor',
          description: 'A reliable tractor',
          category: 'equipment' as const,
          availability: { status: 'available' as const },
          location: {
            coordinates: [151.2093, -33.8688] as [number, number],
            address: '123 Farm Road',
            postcode: '2000',
            state: 'NSW',
            region: 'Sydney'
          },
          contact: {
            name: 'John Farmer',
            preferredMethod: 'email' as const
          },
          owner: { _id: 'user1', name: 'John Farmer' },
          tags: ['tractor', 'farming'],
          rating: { average: 4.5, count: 10 },
          reviews: [],
          searchKeywords: ['tractor', 'farming'],
          isActive: true,
          isVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          viewCount: 50,
          bookingCount: 5
        }
      ],
      total: 1,
      suggestions: ['farm equipment', 'agricultural tools'],
      aggregations: {
        categories: [{ key: 'equipment', doc_count: 1 }],
        states: [{ key: 'NSW', doc_count: 1 }],
        pricing_types: [{ key: 'free', doc_count: 1 }],
        availability_status: [{ key: 'available', doc_count: 1 }],
        popular_tags: [{ key: 'tractor', doc_count: 1 }]
      }
    };

    mockResourceService.searchResources.mockResolvedValue(mockSearchResult);

    render(<ResourceSearch />);
    
    const searchInput = screen.getByPlaceholderText(/Search for equipment, services/);
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(searchInput, { target: { value: 'tractor' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockResourceService.searchResources).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'tractor',
          lat: -33.8688,
          lon: 151.2093,
          radius: '50km'
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('1 resource found for "tractor"')).toBeInTheDocument();
      expect(screen.getByText('Test Tractor')).toBeInTheDocument();
    });
  });

  it('displays search suggestions when available', async () => {
    const mockSearchResult = {
      resources: [],
      total: 0,
      suggestions: ['farm equipment', 'agricultural tools', 'tractor rental'],
      aggregations: {
        categories: [],
        states: [],
        pricing_types: [],
        availability_status: [],
        popular_tags: []
      }
    };

    mockResourceService.searchResources.mockResolvedValue(mockSearchResult);

    render(<ResourceSearch />);
    
    const searchInput = screen.getByPlaceholderText(/Search for equipment, services/);
    fireEvent.change(searchInput, { target: { value: 'farming' } });
    fireEvent.submit(searchInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Try these search suggestions:')).toBeInTheDocument();
      expect(screen.getByText('farm equipment')).toBeInTheDocument();
      expect(screen.getByText('agricultural tools')).toBeInTheDocument();
      expect(screen.getByText('tractor rental')).toBeInTheDocument();
    });
  });

  it('handles AI search toggle', async () => {
    render(<ResourceSearch />);
    
    const aiToggle = screen.getByLabelText(/Use AI-powered search/);
    expect(aiToggle).not.toBeChecked();

    fireEvent.click(aiToggle);
    expect(aiToggle).toBeChecked();

    const searchInput = screen.getByPlaceholderText(/Search for equipment, services/);
    fireEvent.change(searchInput, { target: { value: 'I need help with harvesting' } });
    fireEvent.submit(searchInput.closest('form')!);

    await waitFor(() => {
      expect(mockResourceService.searchResources).toHaveBeenCalledWith(
        expect.objectContaining({
          useAI: true,
          query: 'I need help with harvesting'
        })
      );
    });
  });

  it('displays AI insights when available', async () => {
    const mockSearchResult = {
      resources: [],
      total: 0,
      suggestions: [],
      aggregations: {
        categories: [],
        states: [],
        pricing_types: [],
        availability_status: [],
        popular_tags: []
      },
      aiInsights: {
        category: 'equipment',
        urgency: 'high' as const,
        tags: ['harvesting', 'machinery'],
        refinedQuery: 'harvesting equipment'
      }
    };

    mockResourceService.searchResources.mockResolvedValue(mockSearchResult);

    render(<ResourceSearch />);
    
    const searchInput = screen.getByPlaceholderText(/Search for equipment, services/);
    fireEvent.change(searchInput, { target: { value: 'urgent harvesting help' } });
    fireEvent.submit(searchInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('AI Search Insights')).toBeInTheDocument();
      expect(screen.getByText('Urgency: high')).toBeInTheDocument();
      expect(screen.getByText('Category: Equipment & Tools')).toBeInTheDocument();
      expect(screen.getByText('harvesting')).toBeInTheDocument();
      expect(screen.getByText('machinery')).toBeInTheDocument();
    });
  });

  it('handles location loading state', () => {
    mockUseGeolocation.mockReturnValue({
      location: null,
      loading: true,
      error: null
    });

    render(<ResourceSearch />);
    
    expect(screen.getByText('Getting your location for better results...')).toBeInTheDocument();
  });

  it('handles location error', () => {
    mockUseGeolocation.mockReturnValue({
      location: null,
      loading: false,
      error: 'Location access denied'
    });

    render(<ResourceSearch />);
    
    // Should still render without location
    expect(screen.getByText('Find Community Resources')).toBeInTheDocument();
  });

  it('displays no results message when search returns empty', async () => {
    const mockSearchResult = {
      resources: [],
      total: 0,
      suggestions: ['try different keywords'],
      aggregations: {
        categories: [],
        states: [],
        pricing_types: [],
        availability_status: [],
        popular_tags: []
      }
    };

    mockResourceService.searchResources.mockResolvedValue(mockSearchResult);

    render(<ResourceSearch />);
    
    const searchInput = screen.getByPlaceholderText(/Search for equipment, services/);
    fireEvent.change(searchInput, { target: { value: 'nonexistent resource' } });
    fireEvent.submit(searchInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('No resources found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms or filters to find what you\'re looking for.')).toBeInTheDocument();
      expect(screen.getByText('try different keywords')).toBeInTheDocument();
    });
  });

  it('handles search errors gracefully', async () => {
    mockResourceService.searchResources.mockRejectedValue(new Error('Search service unavailable'));

    render(<ResourceSearch />);
    
    const searchInput = screen.getByPlaceholderText(/Search for equipment, services/);
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    fireEvent.submit(searchInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Search service unavailable')).toBeInTheDocument();
    });
  });

  it('allows sorting of search results', async () => {
    const mockSearchResult = {
      resources: [
        {
          _id: 'resource1',
          title: 'Test Resource',
          description: 'Test description',
          category: 'equipment' as const,
          availability: { status: 'available' as const },
          location: {
            coordinates: [151.2093, -33.8688] as [number, number],
            address: '123 Test Road',
            postcode: '2000',
            state: 'NSW',
            region: 'Sydney'
          },
          contact: {
            name: 'Test User',
            preferredMethod: 'email' as const
          },
          owner: { _id: 'user1', name: 'Test User' },
          tags: [],
          rating: { average: 4.0, count: 5 },
          reviews: [],
          searchKeywords: [],
          isActive: true,
          isVerified: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          viewCount: 10,
          bookingCount: 2
        }
      ],
      total: 1,
      suggestions: [],
      aggregations: {
        categories: [],
        states: [],
        pricing_types: [],
        availability_status: [],
        popular_tags: []
      }
    };

    mockResourceService.searchResources.mockResolvedValue(mockSearchResult);

    render(<ResourceSearch />);
    
    // Trigger initial search
    const searchInput = screen.getByPlaceholderText(/Search for equipment, services/);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.submit(searchInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Test Resource')).toBeInTheDocument();
    });

    // Change sorting
    const sortSelect = screen.getByDisplayValue('Most Relevant');
    fireEvent.change(sortSelect, { target: { value: 'rating' } });

    await waitFor(() => {
      expect(mockResourceService.searchResources).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sortBy: 'rating'
        })
      );
    });
  });
});