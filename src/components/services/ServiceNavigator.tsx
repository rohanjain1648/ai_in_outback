import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    MapPin,
    Wifi,
    WifiOff,
    Loader,
    AlertCircle,
    X,
    ChevronDown
} from 'lucide-react';
import { VoiceInterface } from '@/components/voice/VoiceInterface';
import { ServiceCard } from './ServiceCard';
import { ServiceDetailView } from './ServiceDetailView';
import {
    ServiceListing,
    ServiceSearchFilters,
    ServiceSearchOptions,
    ServiceCategory,
    serviceDirectoryService
} from '@/services/serviceDirectoryService';
import { CommandResult } from '@/types/voice';

interface ServiceNavigatorProps {
    initialLocation?: { lat: number; lon: number };
    enableVoiceSearch?: boolean;
    className?: string;
}

export const ServiceNavigator: React.FC<ServiceNavigatorProps> = ({
    initialLocation,
    enableVoiceSearch = true,
    className = ''
}) => {
    const [services, setServices] = useState<ServiceListing[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lowDataMode, setLowDataMode] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(
        initialLocation || null
    );

    // Filter state
    const [filters, setFilters] = useState<ServiceSearchFilters>({});

    // Load categories on mount
    useEffect(() => {
        loadCategories();
        loadEssentialServices();
        getUserLocation();
    }, []);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const loadCategories = async () => {
        try {
            const cats = await serviceDirectoryService.getServiceCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadEssentialServices = async () => {
        try {
            const essential = await serviceDirectoryService.getEssentialServices(userLocation || undefined);
            if (!isOnline) {
                setServices(essential);
            }
        } catch (error) {
            console.error('Error loading essential services:', error);
        }
    };

    const getUserLocation = () => {
        if (initialLocation) {
            setUserLocation(initialLocation);
            return;
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    const handleSearch = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const searchFilters: ServiceSearchFilters = {
                ...filters
            };

            if (searchQuery) searchFilters.query = searchQuery;
            if (selectedCategory) searchFilters.category = selectedCategory;
            if (userLocation) searchFilters.location = userLocation;

            const searchOptions: ServiceSearchOptions = {
                limit: 20,
                offset: 0,
                sortBy: userLocation ? 'distance' : 'relevance',
                lowDataMode
            };

            const result = await serviceDirectoryService.searchServices(searchFilters, searchOptions);
            setServices(result.services);
        } catch (error) {
            console.error('Error searching services:', error);
            setError('Failed to search services. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, selectedCategory, filters, userLocation, lowDataMode]);

    // Auto-search when filters change
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery || selectedCategory || Object.values(filters).some(v => v)) {
                handleSearch();
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, selectedCategory, filters]);

    const handleVoiceCommand = (result: CommandResult) => {
        if (result.command === 'search' && result.parameters?.['query']) {
            const query = result.parameters['query'] as string;
            setSearchQuery(query);
            handleSearch();
        }
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setFilters({});
        setServices([]);
    };

    const handleServiceClick = (service: ServiceListing) => {
        setSelectedService(service);
    };

    const handleCloseDetail = () => {
        setSelectedService(null);
    };

    const handleAddReview = () => {
        // Refresh the service details
        if (selectedService) {
            serviceDirectoryService.getServiceById(selectedService._id).then(updated => {
                setSelectedService(updated);
            });
        }
        // Refresh search results
        handleSearch();
    };

    return (
        <div className={`service-navigator ${className}`}>
            {/* Header */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Service Navigator</h1>
                    <div className="flex items-center gap-3">
                        {/* Online/Offline indicator */}
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                            <span className="text-sm font-medium">
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>

                        {/* Low data mode toggle */}
                        <button
                            onClick={() => setLowDataMode(!lowDataMode)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${lowDataMode
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {lowDataMode ? 'Low Data: ON' : 'Low Data: OFF'}
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for services (e.g., health, transport, emergency)..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    {/* Voice Search */}
                    {enableVoiceSearch && (
                        <div className="flex-shrink-0">
                            <VoiceInterface
                                onCommand={handleVoiceCommand}
                                showVisualIndicator={false}
                                className="flex items-center"
                            />
                        </div>
                    )}

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                        <Filter className="w-5 h-5" />
                        <span className="font-medium">Filters</span>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''
                                }`}
                        />
                    </button>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.category}
                            onClick={() => setSelectedCategory(cat.category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.category
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {cat.category} ({cat.count})
                        </button>
                    ))}
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-200 pt-4 mt-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Verified Only */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.verified || false}
                                        onChange={(e) => {
                                            const newFilters = { ...filters };
                                            if (e.target.checked) {
                                                newFilters.verified = true;
                                            } else {
                                                delete newFilters.verified;
                                            }
                                            setFilters(newFilters);
                                        }}
                                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Verified Only</span>
                                </label>

                                {/* Essential Only */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.essentialOnly || false}
                                        onChange={(e) =>
                                            setFilters({ ...filters, essentialOnly: e.target.checked })
                                        }
                                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Essential Services</span>
                                </label>

                                {/* Offline Available */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.offlineAvailable || false}
                                        onChange={(e) =>
                                            setFilters({ ...filters, offlineAvailable: e.target.checked })
                                        }
                                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Offline Available</span>
                                </label>

                                {/* Minimum Rating */}
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Min Rating</label>
                                    <select
                                        value={filters.minRating || ''}
                                        onChange={(e) => {
                                            const newFilters = { ...filters };
                                            if (e.target.value) {
                                                newFilters.minRating = parseFloat(e.target.value);
                                            } else {
                                                delete newFilters.minRating;
                                            }
                                            setFilters(newFilters);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Any</option>
                                        <option value="3">3+ Stars</option>
                                        <option value="4">4+ Stars</option>
                                        <option value="4.5">4.5+ Stars</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={handleClearFilters}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                                >
                                    <X className="w-4 h-4" />
                                    Clear All Filters
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Location Info */}
                {userLocation && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                        <MapPin className="w-4 h-4" />
                        <span>Showing services near your location</span>
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="space-y-4">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                        <span className="ml-3 text-gray-600">Searching services...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-800 font-medium">Error</p>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!isLoading && !error && services.length === 0 && (searchQuery || selectedCategory) && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg mb-2">No services found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                )}

                {/* Services Grid */}
                {!isLoading && services.length > 0 && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-600">
                                Found {services.length} service{services.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {services.map((service) => (
                                <ServiceCard
                                    key={service._id}
                                    service={service}
                                    onClick={() => handleServiceClick(service)}
                                    showDistance={!!userLocation}
                                    lowDataMode={lowDataMode}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Offline Message */}
                {!isOnline && services.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3 mt-4">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-yellow-800 font-medium">Offline Mode</p>
                            <p className="text-yellow-700 text-sm">
                                Showing cached essential services. Connect to internet for full search.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Service Detail Modal */}
            <AnimatePresence>
                {selectedService && (
                    <ServiceDetailView
                        service={selectedService}
                        onClose={handleCloseDetail}
                        onAddReview={handleAddReview}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
