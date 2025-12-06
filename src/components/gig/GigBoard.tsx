import React, { useState, useEffect } from 'react';
import { gigService } from '../../services/gigService';
import { GigJob, GigSearchFilters } from '../../types/gig';
import { socketService } from '../../services/socketService';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Filter,
    Search,
    Loader
} from 'lucide-react';

interface GigBoardProps {
    onJobClick: (job: GigJob) => void;
    onCreateJob: () => void;
}

export const GigBoard: React.FC<GigBoardProps> = ({ onJobClick, onCreateJob }) => {
    const [jobs, setJobs] = useState<GigJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<GigSearchFilters>({
        status: 'open'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadJobs();

        // Listen for real-time job updates
        socketService.on('gig:job_created', handleJobCreated);
        socketService.on('gig:job_updated', handleJobUpdated);
        socketService.on('gig:job_deleted', handleJobDeleted);

        return () => {
            socketService.off('gig:job_created', handleJobCreated);
            socketService.off('gig:job_updated', handleJobUpdated);
            socketService.off('gig:job_deleted', handleJobDeleted);
        };
    }, [filters]);

    const loadJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await gigService.searchGigJobs(filters);
            setJobs(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleJobCreated = (job: GigJob) => {
        if (job.status === filters.status || !filters.status) {
            setJobs(prev => [job, ...prev]);
        }
    };

    const handleJobUpdated = (updatedJob: GigJob) => {
        setJobs(prev => prev.map(job =>
            job._id === updatedJob._id ? updatedJob : job
        ));
    };

    const handleJobDeleted = (jobId: string) => {
        setJobs(prev => prev.filter(job => job._id !== jobId));
    };

    const handleFilterChange = (key: keyof GigSearchFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredJobs = jobs.filter(job => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            job.title.toLowerCase().includes(term) ||
            job.description.toLowerCase().includes(term) ||
            job.category.toLowerCase().includes(term)
        );
    });

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            agriculture: 'bg-green-500/20 text-green-300',
            construction: 'bg-orange-500/20 text-orange-300',
            services: 'bg-blue-500/20 text-blue-300',
            transport: 'bg-purple-500/20 text-purple-300',
            other: 'bg-gray-500/20 text-gray-300'
        };
        return colors[category] || colors.other;
    };

    const formatPayment = (job: GigJob) => {
        const { amount, type } = job.payment;
        if (type === 'negotiable') return 'Negotiable';
        return `$${amount}${type === 'hourly' ? '/hr' : ''}`;
    };

    const calculateDistance = (job: GigJob) => {
        // This would use user's location if available
        // For now, just show the radius
        return `Within ${job.location.radius}km`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Gig Board
                        </h1>
                        <button
                            onClick={onCreateJob}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50"
                        >
                            Post a Job
                        </button>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${showFilters
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                                }`}
                        >
                            <Filter size={20} />
                            Filters
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={filters.category || ''}
                                        onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="agriculture">Agriculture</option>
                                        <option value="construction">Construction</option>
                                        <option value="services">Services</option>
                                        <option value="transport">Transport</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Payment Type
                                    </label>
                                    <select
                                        value={filters.paymentType || ''}
                                        onChange={(e) => handleFilterChange('paymentType', e.target.value || undefined)}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="">All Types</option>
                                        <option value="fixed">Fixed Price</option>
                                        <option value="hourly">Hourly Rate</option>
                                        <option value="negotiable">Negotiable</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Job Listings */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="animate-spin text-purple-400" size={48} />
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={loadJobs}
                            className="mt-4 px-6 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-12 text-center">
                        <Briefcase className="mx-auto mb-4 text-gray-500" size={64} />
                        <p className="text-gray-400 text-lg">No jobs found</p>
                        <p className="text-gray-500 mt-2">Try adjusting your filters or create a new job</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <div
                                key={job._id}
                                onClick={() => onJobClick(job)}
                                className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all cursor-pointer group"
                            >
                                {/* Category Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(job.category)}`}>
                                        {job.category}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'open' ? 'bg-green-500/20 text-green-300' :
                                            job.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                                                'bg-gray-500/20 text-gray-300'
                                        }`}>
                                        {job.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                    {job.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {job.description}
                                </p>

                                {/* Details */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <DollarSign size={16} className="text-green-400" />
                                        <span>{formatPayment(job)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Clock size={16} className="text-blue-400" />
                                        <span>{job.duration.estimatedHours} hours</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <MapPin size={16} className="text-purple-400" />
                                        <span>{calculateDistance(job)}</span>
                                    </div>
                                </div>

                                {/* Skills */}
                                {job.requiredSkills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {job.requiredSkills.slice(0, 3).map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                                            >
                                                {skill.skillId.name}
                                            </span>
                                        ))}
                                        {job.requiredSkills.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                                +{job.requiredSkills.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                    <div className="flex items-center gap-2">
                                        {job.postedBy.profile.avatar ? (
                                            <img
                                                src={job.postedBy.profile.avatar}
                                                alt={job.postedBy.profile.displayName || job.postedBy.profile.firstName}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                                {(job.postedBy.profile.displayName || job.postedBy.profile.firstName).charAt(0)}
                                            </div>
                                        )}
                                        <span className="text-sm text-gray-400">
                                            {job.postedBy.profile.displayName || `${job.postedBy.profile.firstName} ${job.postedBy.profile.lastName}`}
                                        </span>
                                    </div>
                                    {job.applicants.length > 0 && (
                                        <span className="text-sm text-gray-400">
                                            {job.applicants.length} applicant{job.applicants.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
