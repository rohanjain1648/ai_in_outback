/**
 * User Feedback System Component
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackData {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  userEmail?: string;
  attachments?: File[];
}

interface FeedbackSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'type' | 'details' | 'submit'>('type');
  const [feedback, setFeedback] = useState<FeedbackData>({
    type: 'general',
    category: '',
    title: '',
    description: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    {
      id: 'bug',
      title: 'Bug Report',
      description: 'Report a problem or error',
      icon: '🐛',
      color: 'red'
    },
    {
      id: 'feature',
      title: 'Feature Request',
      description: 'Suggest a new feature',
      icon: '💡',
      color: 'blue'
    },
    {
      id: 'improvement',
      title: 'Improvement',
      description: 'Suggest an enhancement',
      icon: '⚡',
      color: 'yellow'
    },
    {
      id: 'general',
      title: 'General Feedback',
      description: 'Share your thoughts',
      icon: '💬',
      color: 'green'
    }
  ];

  const categories = {
    bug: ['UI/UX Issue', 'Performance', 'Data Loss', 'Login/Auth', 'Mobile Issue', 'Other'],
    feature: ['Dashboard', 'Communication', 'Analytics', 'Mobile App', 'Integration', 'Other'],
    improvement: ['User Experience', 'Performance', 'Accessibility', 'Documentation', 'Other'],
    general: ['Overall Experience', 'Support', 'Content', 'Community', 'Other']
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In real implementation, submit to feedback API
      console.log('Submitting feedback:', feedback);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('type');
    setFeedback({
      type: 'general',
      category: '',
      title: '',
      description: '',
      priority: 'medium'
    });
    setSubmitted(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {submitted ? 'Thank You!' : 'Share Your Feedback'}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Feedback Submitted Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Thank you for helping us improve Rural Connect AI. We'll review your feedback and get back to you if needed.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-4">
                      {['type', 'details', 'submit'].map((stepName, index) => (
                        <div key={stepName} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step === stepName ? 'bg-blue-600 text-white' :
                            ['type', 'details', 'submit'].indexOf(step) > index ? 'bg-green-600 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {['type', 'details', 'submit'].indexOf(step) > index ? '✓' : index + 1}
                          </div>
                          {index < 2 && (
                            <div className={`w-12 h-1 mx-2 ${
                              ['type', 'details', 'submit'].indexOf(step) > index ? 'bg-green-600' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step Content */}
                  <AnimatePresence mode="wait">
                    {step === 'type' && (
                      <motion.div
                        key="type"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          What type of feedback do you have?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {feedbackTypes.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => {
                                setFeedback(prev => ({ ...prev, type: type.id as any }));
                                setStep('details');
                              }}
                              className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                                feedback.type === type.id
                                  ? `border-${type.color}-500 bg-${type.color}-50`
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-2xl">{type.icon}</span>
                                <span className="font-medium text-gray-900">{type.title}</span>
                              </div>
                              <p className="text-sm text-gray-600">{type.description}</p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {step === 'details' && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Tell us more about your {feedback.type}
                          </h3>
                          <button
                            onClick={() => setStep('type')}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            ← Change type
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            value={feedback.category}
                            onChange={(e) => setFeedback(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select a category</option>
                            {categories[feedback.type].map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={feedback.title}
                            onChange={(e) => setFeedback(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Brief summary of your feedback"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={feedback.description}
                            onChange={(e) => setFeedback(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Please provide detailed information about your feedback"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                          </label>
                          <div className="flex space-x-4">
                            {['low', 'medium', 'high'].map((priority) => (
                              <label key={priority} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="priority"
                                  value={priority}
                                  checked={feedback.priority === priority}
                                  onChange={(e) => setFeedback(prev => ({ ...prev, priority: e.target.value as any }))}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 capitalize">{priority}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email (optional)
                          </label>
                          <input
                            type="email"
                            value={feedback.userEmail || ''}
                            onChange={(e) => setFeedback(prev => ({ ...prev, userEmail: e.target.value }))}
                            placeholder="your.email@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            We'll only use this to follow up on your feedback if needed
                          </p>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => setStep('type')}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => setStep('submit')}
                            disabled={!feedback.category || !feedback.title || !feedback.description}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Review & Submit
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 'submit' && (
                      <motion.div
                        key="submit"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Review Your Feedback
                          </h3>
                          <button
                            onClick={() => setStep('details')}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            ← Edit details
                          </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Type:</span>
                            <span className="ml-2 text-sm text-gray-900 capitalize">{feedback.type}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Category:</span>
                            <span className="ml-2 text-sm text-gray-900">{feedback.category}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Title:</span>
                            <span className="ml-2 text-sm text-gray-900">{feedback.title}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Priority:</span>
                            <span className="ml-2 text-sm text-gray-900 capitalize">{feedback.priority}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Description:</span>
                            <p className="text-sm text-gray-900 mt-1">{feedback.description}</p>
                          </div>
                          {feedback.userEmail && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Email:</span>
                              <span className="ml-2 text-sm text-gray-900">{feedback.userEmail}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => setStep('details')}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                          >
                            {isSubmitting && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};