import React, { useState } from 'react';
import { GigBoard } from './GigBoard';
import { JobPostingForm } from './JobPostingForm';
import { JobDetailView } from './JobDetailView';
import { MyGigs } from './MyGigs';
import { GigJob } from '../../types/gig';
import { Briefcase, List } from 'lucide-react';

export const GigDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<'board' | 'my-gigs'>('board');
    const [showPostingForm, setShowPostingForm] = useState(false);
    const [selectedJob, setSelectedJob] = useState<GigJob | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleJobClick = (job: GigJob) => {
        setSelectedJob(job);
    };

    const handleCloseDetail = () => {
        setSelectedJob(null);
    };

    const handleJobUpdate = () => {
        setRefreshKey(prev => prev + 1);
        // Reload the selected job if it's open
        if (selectedJob) {
            // In a real app, you'd fetch the updated job here
            setSelectedJob(null);
        }
    };

    const handlePostSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
            {/* Navigation */}
            <div className="bg-gray-900/50 border-b border-purple-500/30 sticky top-0 z-40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Gig Economy
                            </h1>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveView('board')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${activeView === 'board'
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                                        }`}
                                >
                                    <Briefcase size={20} />
                                    Job Board
                                </button>
                                <button
                                    onClick={() => setActiveView('my-gigs')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${activeView === 'my-gigs'
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                                        }`}
                                >
                                    <List size={20} />
                                    My Gigs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div key={refreshKey}>
                {activeView === 'board' ? (
                    <GigBoard
                        onJobClick={handleJobClick}
                        onCreateJob={() => setShowPostingForm(true)}
                    />
                ) : (
                    <MyGigs onJobClick={handleJobClick} />
                )}
            </div>

            {/* Modals */}
            {showPostingForm && (
                <JobPostingForm
                    onClose={() => setShowPostingForm(false)}
                    onSuccess={handlePostSuccess}
                />
            )}

            {selectedJob && (
                <JobDetailView
                    job={selectedJob}
                    onClose={handleCloseDetail}
                    onUpdate={handleJobUpdate}
                />
            )}
        </div>
    );
};
