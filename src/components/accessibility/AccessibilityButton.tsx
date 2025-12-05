import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { AccessibilityPanel } from './AccessibilityPanel';

export const AccessibilityButton: React.FC = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Keyboard shortcut: Alt + A
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                setIsPanelOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsPanelOpen(true)}
                className="fixed bottom-6 right-6 z-30 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
                aria-label="Open accessibility settings (Alt + A)"
                title="Accessibility Settings"
                style={{ color: 'white' }}
            >
                <Settings className="w-6 h-6 text-white" aria-hidden="true" />
            </motion.button>

            <AccessibilityPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
        </>
    );
};
