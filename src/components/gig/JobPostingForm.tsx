import React, { useState, useEffect } from 'react';
import { gigService } from '../../services/gigService';
import { skillsService } from '../../services/skillsService';
import { CreateGigJobData } from '../../types/gig';
import { Skill } from '../../types/skills';
import { X, Plus, MapPin, DollarSign, Clock, Briefcase } from 'lucide-react';

interface JobPostingFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<CreateGigJobData>({
        title: '',
        description: '',
        category: 'other',
        requiredSkills: [],
        location: {
            coordinates: [0, 0],
            description: '',
            radius: 50
        },
        payment: {
            amount: 0,
            type: 'fixed',
            escrowRequired: false
        },
        duration: {
            estimatedHours: 1,
            startDate: '',
            deadline: ''
        }
    });

    const [skills, setSkills] = useState<Skill[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<{ skillId: string; minimumLevel: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);

    useEffect(() => {
        loadSkills();
        if (useCurrentLocation) {
            getCurrentLocation();
        }
    }, [useCurrentLocation]);

    const loadSkills = async () => {
        try {
            const data = await skillsService.getSkills();
            setSkills(data);
        } catch (err) {
            console.error('Failed to load skills:', err);
        }
    };

    const getCurrentLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        location: {
                            ...prev.location,
                            coordinates: [position.coords.longitude, position.coords.latitude]
                        }
                    }));
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setError('Failed to get current location');
                }
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedSkills.length === 0) {
            setError('Please select at least one required skill');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const jobData: CreateGigJobData = {
                ...formData,
                requiredSkills: selectedSkills.map(skill => ({
                    skillId: skill.skillId,
                    minimumLevel: skill.minimumLevel as any
                }))
            };

            await gigService.createGigJob(jobData);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    const addSkill = (skillId: string) => {
        if (!selectedSkills.find(s => s.skillId === skillId)) {
            setSelectedSkills([...selectedSkills, { skillId, minimumLevel: 'intermediate' }]);
        }
    };

    const removeSkill = (skillId: string) => {
        setSelectedSkills(selectedSkills.filter(s => s.skillId !== skillId));
    };

    const updateSkillLevel = (skillId: string, level: string) => {
        setSelectedSkills(selectedSkills.map(s =>
            s.skillId === skillId ? { ...s, minimumLevel: level } : s
        ));
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-purple-500/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-purple-500/30 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Post a New Job
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Job Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                placeholder="e.g., Help with fence repair"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Description *
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                placeholder="Describe the job in detail..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Category *
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="agriculture">Agriculture</option>
                                <option value="construction">Construction</option>
                                <option value="services">Services</option>
                                <option value="transport">Transport</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Required Skills */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Required Skills *
                        </label>
                        <div className="space-y-3">
                            {selectedSkills.map((selectedSkill) => {
                                const skill = skills.find(s => s._id === selectedSkill.skillId);
                                return (
                                    <div key={selectedSkill.skillId} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
                                        <span className="flex-1 text-white">{skill?.name}</span>
                                        <select
                                            value={selectedSkill.minimumLevel}
                                            onChange={(e) => updateSkillLevel(selectedSkill.skillId, e.target.value)}
                                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(selectedSkill.skillId)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                );
                            })}

                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        addSkill(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="">+ Add a skill</option>
                                {skills
                                    .filter(skill => !selectedSkills.find(s => s.skillId === skill._id))
                                    .map(skill => (
                                        <option key={skill._id} value={skill._id}>
                                            {skill.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <MapPin className="text-purple-400" size={20} />
                            <h3 className="text-lg font-semibold text-white">Location</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Location Description *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.location.description}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    location: { ...formData.location, description: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                placeholder="e.g., Near Wagga Wagga, NSW"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="useLocation"
                                checked={useCurrentLocation}
                                onChange={(e) => setUseCurrentLocation(e.target.checked)}
                                className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                            />
                            <label htmlFor="useLocation" className="text-sm text-gray-300">
                                Use my current location
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Search Radius (km) *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="500"
                                value={formData.location.radius}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    location: { ...formData.location, radius: parseInt(e.target.value) }
                                })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <DollarSign className="text-green-400" size={20} />
                            <h3 className="text-lg font-semibold text-white">Payment</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Payment Type *
                                </label>
                                <select
                                    required
                                    value={formData.payment.type}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        payment: { ...formData.payment, type: e.target.value as any }
                                    })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="fixed">Fixed Price</option>
                                    <option value="hourly">Hourly Rate</option>
                                    <option value="negotiable">Negotiable</option>
                                </select>
                            </div>

                            {formData.payment.type !== 'negotiable' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Amount (AUD) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.payment.amount}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            payment: { ...formData.payment, amount: parseFloat(e.target.value) }
                                        })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="escrow"
                                checked={formData.payment.escrowRequired}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    payment: { ...formData.payment, escrowRequired: e.target.checked }
                                })}
                                className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                            />
                            <label htmlFor="escrow" className="text-sm text-gray-300">
                                Require escrow for payment security
                            </label>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Clock className="text-blue-400" size={20} />
                            <h3 className="text-lg font-semibold text-white">Duration</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Estimated Hours *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0.5"
                                    step="0.5"
                                    value={formData.duration.estimatedHours}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        duration: { ...formData.duration, estimatedHours: parseFloat(e.target.value) }
                                    })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.duration.startDate}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        duration: { ...formData.duration, startDate: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={formData.duration.deadline}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        duration: { ...formData.duration, deadline: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
