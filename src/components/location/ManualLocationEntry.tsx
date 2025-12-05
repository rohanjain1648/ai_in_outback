import React, { useState } from 'react';
import { Coordinates } from '../../types/location';
import { GeolocationUtils } from '../../utils/geolocation';

interface ManualLocationEntryProps {
    onLocationSet: (coordinates: Coordinates, locationName?: string) => void;
    onCancel?: () => void;
    initialCoordinates?: Coordinates;
}

interface LocationOption {
    name: string;
    coordinates: Coordinates;
    region: string;
}

// Major Australian locations for quick selection
const AUSTRALIAN_LOCATIONS: LocationOption[] = [
    { name: 'Sydney', coordinates: { latitude: -33.8688, longitude: 151.2093 }, region: 'NSW' },
    { name: 'Melbourne', coordinates: { latitude: -37.8136, longitude: 144.9631 }, region: 'VIC' },
    { name: 'Brisbane', coordinates: { latitude: -27.4698, longitude: 153.0251 }, region: 'QLD' },
    { name: 'Perth', coordinates: { latitude: -31.9505, longitude: 115.8605 }, region: 'WA' },
    { name: 'Adelaide', coordinates: { latitude: -34.9285, longitude: 138.6007 }, region: 'SA' },
    { name: 'Canberra', coordinates: { latitude: -35.2809, longitude: 149.1300 }, region: 'ACT' },
    { name: 'Darwin', coordinates: { latitude: -12.4634, longitude: 130.8456 }, region: 'NT' },
    { name: 'Hobart', coordinates: { latitude: -42.8821, longitude: 147.3272 }, region: 'TAS' },
    { name: 'Alice Springs', coordinates: { latitude: -23.6980, longitude: 133.8807 }, region: 'NT' },
    { name: 'Cairns', coordinates: { latitude: -16.9186, longitude: 145.7781 }, region: 'QLD' },
    { name: 'Townsville', coordinates: { latitude: -19.2590, longitude: 146.8169 }, region: 'QLD' },
    { name: 'Toowoomba', coordinates: { latitude: -27.5598, longitude: 151.9507 }, region: 'QLD' },
    { name: 'Ballarat', coordinates: { latitude: -37.5622, longitude: 143.8503 }, region: 'VIC' },
    { name: 'Bendigo', coordinates: { latitude: -36.7570, longitude: 144.2794 }, region: 'VIC' },
    { name: 'Albury', coordinates: { latitude: -36.0737, longitude: 146.9135 }, region: 'NSW' },
    { name: 'Wagga Wagga', coordinates: { latitude: -35.1082, longitude: 147.3598 }, region: 'NSW' },
    { name: 'Dubbo', coordinates: { latitude: -32.2569, longitude: 148.6011 }, region: 'NSW' },
    { name: 'Tamworth', coordinates: { latitude: -31.0927, longitude: 150.9279 }, region: 'NSW' },
];

export const ManualLocationEntry: React.FC<ManualLocationEntryProps> = ({
    onLocationSet,
    onCancel,
    initialCoordinates
}) => {
    const [entryMode, setEntryMode] = useState<'preset' | 'coordinates'>('preset');
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [latitude, setLatitude] = useState<string>(
        initialCoordinates?.latitude.toString() || ''
    );
    const [longitude, setLongitude] = useState<string>(
        initialCoordinates?.longitude.toString() || ''
    );
    const [error, setError] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredLocations = AUSTRALIAN_LOCATIONS.filter(
        (loc) =>
            loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loc.region.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const validateCoordinates = (lat: number, lng: number): boolean => {
        const coords: Coordinates = { latitude: lat, longitude: lng };

        if (lat < -90 || lat > 90) {
            setError('Latitude must be between -90 and 90');
            return false;
        }

        if (lng < -180 || lng > 180) {
            setError('Longitude must be between -180 and 180');
            return false;
        }

        if (!GeolocationUtils.isWithinAustralia(coords)) {
            setError('Coordinates must be within Australia');
            return false;
        }

        return true;
    };

    const handlePresetSubmit = () => {
        if (!selectedLocation) {
            setError('Please select a location');
            return;
        }

        const location = AUSTRALIAN_LOCATIONS.find((loc) => loc.name === selectedLocation);
        if (location) {
            onLocationSet(location.coordinates, location.name);
        }
    };

    const handleCoordinatesSubmit = () => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            setError('Please enter valid numbers for coordinates');
            return;
        }

        if (!validateCoordinates(lat, lng)) {
            return;
        }

        setError('');
        onLocationSet({ latitude: lat, longitude: lng });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (entryMode === 'preset') {
            handlePresetSubmit();
        } else {
            handleCoordinatesSubmit();
        }
    };

    return (
        <div className="manual-location-entry bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Set Your Location
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                GPS unavailable? No worries! You can manually set your location.
            </p>

            <div className="mb-4">
                <div className="flex gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => setEntryMode('preset')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${entryMode === 'preset'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Choose Location
                    </button>
                    <button
                        type="button"
                        onClick={() => setEntryMode('coordinates')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${entryMode === 'coordinates'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Enter Coordinates
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {entryMode === 'preset' ? (
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="location-search"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Search Location
                            </label>
                            <input
                                id="location-search"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by city or region..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="location-select"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Select Location
                            </label>
                            <select
                                id="location-select"
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                size={8}
                            >
                                <option value="">-- Select a location --</option>
                                {filteredLocations.map((loc) => (
                                    <option key={loc.name} value={loc.name}>
                                        {loc.name}, {loc.region}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="latitude"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Latitude
                            </label>
                            <input
                                id="latitude"
                                type="text"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                placeholder="-33.8688"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Australian latitudes range from -10° to -44°
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="longitude"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Longitude
                            </label>
                            <input
                                id="longitude"
                                type="text"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                placeholder="151.2093"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Australian longitudes range from 113° to 154°
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Set Location
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManualLocationEntry;
