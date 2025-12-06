import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    MapPin,
    Phone,
    Mail,
    Globe,
    Clock,
    Star,
    CheckCircle,
    Navigation,
    MessageSquare,
    Accessibility,
    Info,
    ExternalLink
} from 'lucide-react';
import { ServiceListing, serviceDirectoryService } from '@/services/serviceDirectoryService';

interface ServiceDetailViewProps {
    service: ServiceListing;
    onClose: () => void;
    onAddReview?: (rating: number, comment: string) => void;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({
    service,
    onClose,
    onAddReview
}) => {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCall = () => {
        serviceDirectoryService.recordServiceContact(service._id);
        window.location.href = `tel:${service.contact.phone}`;
    };

    const handleEmail = () => {
        if (service.contact.email) {
            serviceDirectoryService.recordServiceContact(service._id);
            window.location.href = `mailto:${service.contact.email}`;
        }
    };

    const handleWebsite = () => {
        if (service.contact.website) {
            serviceDirectoryService.recordServiceContact(service._id);
            window.open(service.contact.website, '_blank');
        }
    };

    const handleGetDirections = () => {
        const [lon, lat] = service.location.coordinates;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        window.open(url, '_blank');
    };

    const handleSubmitReview = async () => {
        if (!comment.trim()) {
            alert('Please enter a comment');
            return;
        }

        setIsSubmitting(true);
        try {
            await serviceDirectoryService.addServiceReview(service._id, rating, comment);
            onAddReview?.(rating, comment);
            setShowReviewForm(false);
            setComment('');
            setRating(5);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (currentRating: number, interactive: boolean = false) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 ${interactive ? 'cursor-pointer' : ''} ${star <= currentRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                        onClick={() => interactive && setRating(star)}
                    />
                ))}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
                            {service.isVerified && (
                                <CheckCircle className="w-6 h-6 text-blue-500" />
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {service.category}
                            </span>
                            {service.isEssential && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    Essential Service
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                        <p className="text-gray-700">{service.description}</p>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <button
                                    onClick={handleCall}
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    {service.contact.phone}
                                </button>
                            </div>

                            {service.contact.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <button
                                        onClick={handleEmail}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {service.contact.email}
                                    </button>
                                </div>
                            )}

                            {service.contact.website && (
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-gray-500" />
                                    <button
                                        onClick={handleWebsite}
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        Visit Website
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">{service.contact.hours}</span>
                            </div>

                            {service.contact.emergencyContact && (
                                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <Info className="w-5 h-5 text-red-600" />
                                    <div>
                                        <p className="text-sm font-medium text-red-900">Emergency Contact</p>
                                        <p className="text-sm text-red-700">{service.contact.emergencyContact}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                        <div className="space-y-2">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-gray-700">{service.location.address}</p>
                                    {service.location.city && service.location.state && (
                                        <p className="text-gray-600">
                                            {service.location.city}, {service.location.state}{' '}
                                            {service.location.postcode}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-1">Region: {service.location.region}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleGetDirections}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Navigation className="w-4 h-4" />
                                Get Directions
                            </button>
                        </div>
                    </div>

                    {/* Services Offered */}
                    {service.services.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h3>
                            <div className="flex flex-wrap gap-2">
                                {service.services.map((svc, index) => (
                                    <span
                                        key={index}
                                        className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                                    >
                                        {svc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Accessibility */}
                    {service.accessibility && Object.keys(service.accessibility).length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Accessibility className="w-5 h-5" />
                                Accessibility
                            </h3>
                            <div className="space-y-2">
                                {service.accessibility.wheelchairAccessible && (
                                    <p className="text-gray-700">✓ Wheelchair accessible</p>
                                )}
                                {service.accessibility.parkingAvailable && (
                                    <p className="text-gray-700">✓ Parking available</p>
                                )}
                                {service.accessibility.publicTransportNearby && (
                                    <p className="text-gray-700">✓ Public transport nearby</p>
                                )}
                                {service.accessibility.interpreterServices && (
                                    <p className="text-gray-700">✓ Interpreter services available</p>
                                )}
                                {service.accessibility.notes && (
                                    <p className="text-sm text-gray-600 mt-2">{service.accessibility.notes}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ratings and Reviews */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">Ratings & Reviews</h3>
                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Write a Review
                            </button>
                        </div>

                        {service.ratings.count > 0 ? (
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    {renderStars(service.ratings.average)}
                                    <span className="text-lg font-semibold text-gray-900">
                                        {service.ratings.average.toFixed(1)}
                                    </span>
                                    <span className="text-gray-600">({service.ratings.count} reviews)</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600 mb-4">No reviews yet. Be the first to review!</p>
                        )}

                        {/* Review Form */}
                        <AnimatePresence>
                            {showReviewForm && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Rating
                                            </label>
                                            {renderStars(rating, true)}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Review
                                            </label>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows={4}
                                                placeholder="Share your experience with this service..."
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSubmitReview}
                                                disabled={isSubmitting}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                            <button
                                                onClick={() => setShowReviewForm(false)}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Reviews List */}
                        {service.reviews && service.reviews.length > 0 && (
                            <div className="space-y-4">
                                {service.reviews.map((review, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {renderStars(review.rating)}
                                                <span className="text-sm text-gray-600">
                                                    {review.user.profile?.firstName} {review.user.profile?.lastName}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(review.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
