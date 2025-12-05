import React, { useState, useEffect } from 'react';
import { gigService } from '../../services/gigService';
import { GigJob } from '../../types/gig';
import { useAuth } from '../../hooks/useAuth';
import {
    X,
    MapPin,
    DollarSign,
    Clock,
    Calendar,
    User,
    Star,
    Send,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface JobDetailViewProps {
    job: GigJob;
    onClose: () => void;
    onUpdate: () => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ job, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [applicationMessage, setApplicationMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [showRatingForm, setShowRatingForm] = useState(false);

    const isOwner = user?.id === job.postedBy._id;
    const hasApplied = job.applicants.some(app => app.userId._id === user?.id);
    const isSelectedWorker = job.selectedWorker?._id === user?.id;
    const canRate = job.status === 'completed' && (isOwner || isSelectedWorker);

    const handleApply = async () => {
        if (!applicationMessage.trim()) {
            setError('Please provide a message with your application');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await gigService.applyForJob(job._id, applicationMessage);
            setSuccess('Application submitted successfully!');
            setShowApplicationForm(false);
            setApplicationMessage('');
            onUpdate();
        } catch (err: any) {
            setError(err.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectWorker = async (workerId: string) => {
        try {
            setLoading(true);
            setError(null);
            await gigService.selectWorker(job._id, workerId);
            setSuccess('Worker selected successfully!');
            onUpdate();
        } catch (err: any) {
            setError(err.message || 'Failed to select worker');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteJob = async () => {
        try {
            setLoading(true);
            setError(null);
            await gigService.completeJob(job._id);
            setSuccess('Job marked as completed!');
            onUpdate();
        } catch (err: any) {
            setError(err.message || 'Failed to complete job');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRating = async () => {
        try {
            setLoading(true);
            setError(null);
            const raterRole = isOwner ? 'poster' : 'worker';
            await gigService.rateJob(job._id, rating, review, raterRole);
            setSuccess('Rating submitted successfully!');
            setShowRatingForm(false);
            onUpdate();
        } catch (err: any) {
            setError(err.message || 'Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    const formatPayment = () => {
        const { amount, type } = job.payment;
        if (type === 'negotiable') return 'Negotiable';
        return `$${amount}${type === 'hourly' ? '/hr' : ''}`;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-purple-500/30 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-purple-500/30 p-6 flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.category === 'agriculture' ? 'bg-green-500/20 text-green-300' :
                                    job.category === 'construction' ? 'bg-orange-500/20 text-orange-300' :
                                        job.category === 'services' ? 'bg-blue-500/20 text-blue-300' :
                                            job.category === 'transport' ? 'bg-purple-500/20 text-purple-300' :
                                                'bg-gray-500/20 text-gray-300'
                                }`}>
                                {job.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'open' ? 'bg-green-500/20 text-green-300' :
                                    job.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                                        job.status === 'completed' ? 'bg-purple-500/20 text-purple-300' :
                                            'bg-gray-500/20 text-gray-300'
                                }`}>
                                {job.status.replace('_', ' ')}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {job.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Alerts */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 flex items-center gap-3">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400 flex items-center gap-3">
                            <CheckCircle size={20} />
                            {success}
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Payment */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="text-green-400" size={20} />
                                <h4 className="font-semibold text-white">Payment</h4>
                            </div>
                            <p className="text-2xl font-bold text-green-400">{formatPayment()}</p>
                            {job.payment.escrowRequired && (
                                <p className="text-sm text-gray-400 mt-1">Escrow required</p>
                            )}
                        </div>

                        {/* Duration */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="text-blue-400" size={20} />
                                <h4 className="font-semibold text-white">Duration</h4>
                            </div>
                            <p className="text-2xl font-bold text-blue-400">{job.duration.estimatedHours} hours</p>
                            <div className="text-sm text-gray-400 mt-2 space-y-1">
                                {job.duration.startDate && (
                                    <p>Start: {formatDate(job.duration.startDate)}</p>
                                )}
                                {job.duration.deadline && (
                                    <p>Deadline: {formatDate(job.duration.deadline)}</p>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="text-purple-400" size={20} />
                                <h4 className="font-semibold text-white">Location</h4>
                            </div>
                            <p className="text-gray-300">{job.location.description}</p>
                            <p className="text-sm text-gray-400 mt-1">Within {job.location.radius}km radius</p>
                        </div>

                        {/* Posted By */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="text-pink-400" size={20} />
                                <h4 className="font-semibold text-white">Posted By</h4>
                            </div>
                            <div className="flex items-center gap-3">
                                {job.postedBy.profile.avatar ? (
                                    <img
                                        src={job.postedBy.profile.avatar}
                                        alt={job.postedBy.profile.displayName || job.postedBy.profile.firstName}
                                        className="w-12 h-12 rounded-full"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                                        {(job.postedBy.profile.displayName || job.postedBy.profile.firstName).charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-medium">
                                        {job.postedBy.profile.displayName || `${job.postedBy.profile.firstName} ${job.postedBy.profile.lastName}`}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Posted {new Date(job.postedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Required Skills */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
                        <div className="flex flex-wrap gap-3">
                            {job.requiredSkills.map((skill, index) => (
                                <div
                                    key={index}
                                    className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-4 py-2"
                                >
                                    <p className="text-purple-300 font-medium">{skill.skillId.name}</p>
                                    <p className="text-xs text-purple-400 mt-1">
                                        Min. level: {skill.minimumLevel}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Suggested Workers (for job owner) */}
                    {isOwner && job.aiMatchingData.suggestedWorkers.length > 0 && job.status === 'open' && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">AI Suggested Workers</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {job.aiMatchingData.suggestedWorkers.slice(0, 4).map((worker) => (
                                    <div
                                        key={worker._id}
                                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            {worker.profile.avatar ? (
                                                <img
                                                    src={worker.profile.avatar}
                                                    alt={worker.profile.displayName || worker.profile.firstName}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                    {(worker.profile.displayName || worker.profile.firstName).charAt(0)}
                                                </div>
                                            )}
                                            <span className="text-white">
                                                {worker.profile.displayName || `${worker.profile.firstName} ${worker.profile.lastName}`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Applicants (for job owner) */}
                    {isOwner && job.applicants.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">
                                Applicants ({job.applicants.length})
                            </h3>
                            <div className="space-y-3">
                                {job.applicants.map((applicant) => (
                                    <div
                                        key={applicant.userId._id}
                                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                {applicant.userId.profile.avatar ? (
                                                    <img
                                                        src={applicant.userId.profile.avatar}
                                                        alt={applicant.userId.profile.displayName || applicant.userId.profile.firstName}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                                                        {(applicant.userId.profile.displayName || applicant.userId.profile.firstName).charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {applicant.userId.profile.displayName || `${applicant.userId.profile.firstName} ${applicant.userId.profile.lastName}`}
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-purple-400 mt-1">
                                                        Match Score: {applicant.matchScore}%
                                                    </p>
                                                </div>
                                            </div>
                                            {job.status === 'open' && !job.selectedWorker && (
                                                <button
                                                    onClick={() => handleSelectWorker(applicant.userId._id)}
                                                    disabled={loading}
                                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                                                >
                                                    Select
                                                </button>
                                            )}
                                        </div>
                                        {applicant.message && (
                                            <div className="bg-gray-900/50 rounded-lg p-3">
                                                <p className="text-gray-300 text-sm">{applicant.message}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selected Worker */}
                    {job.selectedWorker && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Selected Worker</h3>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                                {job.selectedWorker.profile.avatar ? (
                                    <img
                                        src={job.selectedWorker.profile.avatar}
                                        alt={job.selectedWorker.profile.displayName || job.selectedWorker.profile.firstName}
                                        className="w-12 h-12 rounded-full"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                                        {(job.selectedWorker.profile.displayName || job.selectedWorker.profile.firstName).charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-white font-medium">
                                        {job.selectedWorker.profile.displayName || `${job.selectedWorker.profile.firstName} ${job.selectedWorker.profile.lastName}`}
                                    </p>
                                    {job.acceptedAt && (
                                        <p className="text-sm text-gray-400">
                                            Accepted {new Date(job.acceptedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <CheckCircle className="text-green-400" size={24} />
                            </div>
                        </div>
                    )}

                    {/* Ratings */}
                    {job.ratings && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Ratings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {job.ratings.posterRating > 0 && (
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="text-yellow-400 fill-yellow-400" size={20} />
                                            <span className="text-white font-medium">Poster's Rating</span>
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-400 mb-2">
                                            {job.ratings.posterRating}/5
                                        </p>
                                        {job.ratings.posterReview && (
                                            <p className="text-gray-300 text-sm">{job.ratings.posterReview}</p>
                                        )}
                                    </div>
                                )}
                                {job.ratings.workerRating > 0 && (
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="text-yellow-400 fill-yellow-400" size={20} />
                                            <span className="text-white font-medium">Worker's Rating</span>
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-400 mb-2">
                                            {job.ratings.workerRating}/5
                                        </p>
                                        {job.ratings.workerReview && (
                                            <p className="text-gray-300 text-sm">{job.ratings.workerReview}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Application Form */}
                    {!isOwner && job.status === 'open' && !hasApplied && (
                        <div>
                            {!showApplicationForm ? (
                                <button
                                    onClick={() => setShowApplicationForm(true)}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                                >
                                    Apply for this Job
                                </button>
                            ) : (
                                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
                                    <h3 className="text-lg font-semibold text-white">Submit Application</h3>
                                    <textarea
                                        value={applicationMessage}
                                        onChange={(e) => setApplicationMessage(e.target.value)}
                                        rows={4}
                                        placeholder="Tell the poster why you're a good fit for this job..."
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowApplicationForm(false)}
                                            className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleApply}
                                            disabled={loading}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <Send size={20} />
                                            {loading ? 'Submitting...' : 'Submit Application'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Complete Job Button */}
                    {job.status === 'in_progress' && (isOwner || isSelectedWorker) && (
                        <button
                            onClick={handleCompleteJob}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Mark as Completed'}
                        </button>
                    )}

                    {/* Rating Form */}
                    {canRate && !showRatingForm && (
                        <button
                            onClick={() => setShowRatingForm(true)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all"
                        >
                            Rate this Job
                        </button>
                    )}

                    {showRatingForm && (
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
                            <h3 className="text-lg font-semibold text-white">Submit Rating</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Rating (1-5 stars)
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="transition-colors"
                                        >
                                            <Star
                                                size={32}
                                                className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Review
                                </label>
                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    rows={4}
                                    placeholder="Share your experience..."
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRatingForm(false)}
                                    className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitRating}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
