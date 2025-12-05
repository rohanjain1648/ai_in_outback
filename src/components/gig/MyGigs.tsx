import React, { useState, useEffect } from 'react';
import { gigService } from '../../services/gigService';
import { GigJob } from '../../types/gig';
import { socketService } from '../../services/socketService';
import {
    Briefcase,
    FileText,
    CheckCircle,
    Clock,
    DollarSign,
    Users,
    Loader
} from 'lucide-react';

interface MyGigsProps {
    onJobClick: (job: GigJob) => void;
}

export const MyGigs: React.FC<MyGigsProps> = ({ onJobClick }) => {
    const [activeTab, setActiveTab] = useState<'posted' | 'applications' | 'assigned'>('posted');
    const [postedJobs, setPostedJobs] = useState<GigJob[]>([]);
    const [applications, setApplications] = useState<GigJob[]>([]);
    const [assignedJobs, setAssignedJobs] = useState<GigJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAllJobs();

        // Listen for real-time updates
        socketService.on('gig:job_updated', handleJobUpdate);

        return () => {
            socketService.off('gig:job_updated', handleJobUpdate);
        };
    }, []);

    const loadAllJobs = async () => {
        try {
            setLoading(true);
            setError(null);

            const [posted, apps, assigned] = await Promise.all([
                gigService.getUserPostedJobs(),
                gigService.getUserApplications(),
                gigService.getUserAssignedJobs()
            ]);

            setPostedJobs(posted);
            setApplications(apps);
            setAssignedJobs(assigned);
        } catch (err: any) {
            setError(err.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleJobUpdate = (updatedJob: GigJob) => {
        setPostedJobs(prev => prev.map(job =>
            job._id === updatedJob._id ? updatedJob : job
        ));
        setApplications(prev => prev.map(job =>
            job._id === updatedJob._id ? updatedJob : job
        ));
        setAssignedJobs(prev => prev.map(job =>
            job._id === updatedJob._id ? updatedJob : job
        ));
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            open: 'bg-green-500/20 text-green-300',
            in_progress: 'bg-blue-500/20 text-blue-300',
            completed: 'bg-purple-500/20 text-purple-300',
            cancelled: 'bg-red-500/20 text-red-300',
            disputed: 'bg-yellow-500/20 text-yellow-300'
        };
        return colors[status] || colors.open;
    };

    const formatPayment = (job: GigJob) => {
        const { amount, type } = job.payment;
        if (type === 'negotiable') return 'Negotiable';
        return `$${amount}${type === 'hourly' ? '/hr' : ''}`;
    };

    const renderJobCard = (job: GigJob, showApplicants: boolean = false) => (
        <div
            key={job._id}
            onClick={() => onJobClick(job)}
            className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all cursor-pointer"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-400">
                    {new Date(job.postedAt).toLocaleDateString()}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2">
                {job.title}
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {job.description}
            </p>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <DollarSign size={16} className="text-green-400" />
                    <span>{formatPayment(job)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock size={16} className="text-blue-400" />
                    <span>{job.duration.estimatedHours} hours</span>
                </div>
            </div>

            {/* Footer */}
            {showApplicants && job.applicants.length > 0 && (
                <div className="pt-4 border-t border-gray-700 flex items-center gap-2 text-sm text-gray-400">
                    <Users size={16} />
                    <span>{job.applicants.length} applicant{job.applicants.length !== 1 ? 's' : ''}</span>
                </div>
            )}

            {job.selectedWorker && (
                <div className="pt-4 border-t border-gray-700 flex items-center gap-2">
                    {job.selectedWorker.profile.avatar ? (
                        <img
                            src={job.selectedWorker.profile.avatar}
                            alt={job.selectedWorker.profile.displayName || job.selectedWorker.profile.firstName}
                            className="w-8 h-8 rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                            {(job.selectedWorker.profile.displayName || job.selectedWorker.profile.firstName).charAt(0)}
                        </div>
                    )}
                    <span className="text-sm text-gray-400">
                        Worker: {job.selectedWorker.profile.displayName || `${job.selectedWorker.profile.firstName} ${job.selectedWorker.profile.lastName}`}
                    </span>
                </div>
            )}
        </div>
    );

    const renderStats = () => {
        const stats = [
            {
                label: 'Posted Jobs',
                value: postedJobs.length,
                icon: Briefcase,
                color: 'text-purple-400'
            },
            {
                label: 'Applications',
                value: applications.length,
                icon: FileText,
                color: 'text-blue-400'
            },
            {
                label: 'Active Jobs',
                value: assignedJobs.filter(j => j.status === 'in_progress').length,
                icon: Clock,
                color: 'text-yellow-400'
            },
            {
                label: 'Completed',
                value: [...postedJobs, ...assignedJobs].filter(j => j.status === 'completed').length,
                icon: CheckCircle,
                color: 'text-green-400'
            }
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={stat.color} size={24} />
                            <span className="text-3xl font-bold text-white">{stat.value}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                        My Gigs
                    </h1>
                    <p className="text-gray-400">Manage your posted jobs, applications, and assignments</p>
                </div>

                {/* Stats */}
                {!loading && renderStats()}

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('posted')}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === 'posted'
                                ? 'text-purple-400 border-b-2 border-purple-400'
                                : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Posted Jobs ({postedJobs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === 'applications'
                                ? 'text-purple-400 border-b-2 border-purple-400'
                                : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        My Applications ({applications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === 'assigned'
                                ? 'text-purple-400 border-b-2 border-purple-400'
                                : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Assigned to Me ({assignedJobs.length})
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="animate-spin text-purple-400" size={48} />
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={loadAllJobs}
                            className="mt-4 px-6 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === 'posted' && (
                            <>
                                {postedJobs.length === 0 ? (
                                    <div className="col-span-full bg-gray-800/30 border border-gray-700 rounded-lg p-12 text-center">
                                        <Briefcase className="mx-auto mb-4 text-gray-500" size={64} />
                                        <p className="text-gray-400 text-lg">No posted jobs yet</p>
                                        <p className="text-gray-500 mt-2">Create your first job posting to get started</p>
                                    </div>
                                ) : (
                                    postedJobs.map(job => renderJobCard(job, true))
                                )}
                            </>
                        )}

                        {activeTab === 'applications' && (
                            <>
                                {applications.length === 0 ? (
                                    <div className="col-span-full bg-gray-800/30 border border-gray-700 rounded-lg p-12 text-center">
                                        <FileText className="mx-auto mb-4 text-gray-500" size={64} />
                                        <p className="text-gray-400 text-lg">No applications yet</p>
                                        <p className="text-gray-500 mt-2">Browse available jobs and apply to get started</p>
                                    </div>
                                ) : (
                                    applications.map(job => renderJobCard(job, false))
                                )}
                            </>
                        )}

                        {activeTab === 'assigned' && (
                            <>
                                {assignedJobs.length === 0 ? (
                                    <div className="col-span-full bg-gray-800/30 border border-gray-700 rounded-lg p-12 text-center">
                                        <CheckCircle className="mx-auto mb-4 text-gray-500" size={64} />
                                        <p className="text-gray-400 text-lg">No assigned jobs yet</p>
                                        <p className="text-gray-500 mt-2">Apply to jobs and wait to be selected</p>
                                    </div>
                                ) : (
                                    assignedJobs.map(job => renderJobCard(job, false))
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
