import React from 'react';
import { motion } from 'framer-motion';
import {
    MapPin,
    Phone,
    Mail,
    Globe,
    Clock,
    Star,
    CheckCircle,
    Navigation,
    Wifi,
    WifiOff
} from 'lucide-react';
import { ServiceListing } from '@/services/serviceDirectoryService';

interface ServiceCardProps {
    service: ServiceListing;
    onClick?: () => void;
    showDistance?: boolean;
    lowDataMode?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
    service,
    onClick,
    showDistance = true,
    lowDataMode = false
}) => {
    const getCategoryColor = (category: string): string => {
        const colors: Record<string, string> = {
            health: 'bg-red-100 text-red-800 border-red-300',
            emergency: 'bg-orange-100 text-orange-800 border-orange-300',
            transport: 'bg-blue-100 text-blue-800 border-blue-300',
            government: 'bg-purple-100 text-purple-800 border-purple-300',
            education: 'bg-green-100 text-green-800 border-green-300',
            financial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            legal: 'bg-indigo-100 text-indigo-800 border-indigo-300',
            social: 'bg-pink-100 text-pink-800 border-pink-300',
            other: 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return colors[category] || colors.other;
    };

    const formatDistance = (distance?: number): string => {
        if (!distance) return '';
        if (distance < 1) return `${Math.round(distance * 1000)}m away`;
        return `${distance.toFixed(1)}km away`;
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <motion.div
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
        >
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                {service.name}
                            </h3>
                            {service.isVerified && (
                                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            )}
                        </div>

                        {/* Category badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                                    service.category
                                )}`}
                            >
                                {service.category}
                            </span>
                            {service.isEssential && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                                    Essential
                                </span>
                            )}
                            {service.offlineAvailable && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                                    <Wifi className="w-3 h-3" />
                                    Offline
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {!lowDataMode && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                    </p>
                )}

                {/* Location and Distance */}
                <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-1">
                            {service.location.address}
                        </p>
                        {service.location.city && service.location.state && (
                            <p className="text-xs text-gray-500">
                                {service.location.city}, {service.location.state}
                            </p>
                        )}
                    </div>
                    {showDistance && service.distance !== undefined && (
                        <span className="text-sm font-medium text-blue-600 flex-shrink-0">
                            {formatDistance(service.distance)}
                        </span>
                    )}
                </div>

                {/* Contact Info */}
                <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <a
                            href={`tel:${service.contact.phone}`}
                            className="text-sm text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {service.contact.phone}
                        </a>
                    </div>

                    {!lowDataMode && service.contact.hours && (
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{service.contact.hours}</span>
                        </div>
                    )}
                </div>

                {/* Rating */}
                {service.ratings.count > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                        {renderStars(service.ratings.average)}
                        <span className="text-sm text-gray-600">
                            {service.ratings.average.toFixed(1)} ({service.ratings.count} reviews)
                        </span>
                    </div>
                )}

                {/* Services offered */}
                {!lowDataMode && service.services.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {service.services.slice(0, 3).map((svc, index) => (
                            <span
                                key={index}
                                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                                {svc}
                            </span>
                        ))}
                        {service.services.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                +{service.services.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Footer with quick actions */}
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-t border-gray-200">
                <span className="text-xs text-gray-500">
                    Source: {service.source.replace(/_/g, ' ')}
                </span>
                <button
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                >
                    View Details
                    <Navigation className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    );
};
