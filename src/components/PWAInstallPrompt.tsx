import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../hooks/usePWA';

interface PWAInstallPromptProps {
  position?: 'top' | 'bottom';
  autoShow?: boolean;
  showDelay?: number;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  position = 'bottom',
  autoShow = true,
  showDelay = 3000
}) => {
  const {
    canInstall,
    isInstalled,
    isStandalone,
    installPWA,
    dismissInstallPrompt,
    shouldShowInstallPrompt,
    getInstallInstructions
  } = usePWA();

  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (autoShow && shouldShowInstallPrompt()) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, showDelay);

      return () => clearTimeout(timer);
    }
  }, [autoShow, shouldShowInstallPrompt, showDelay]);

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const success = await installPWA();
      if (success) {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    dismissInstallPrompt();
  };

  // Don't show if already installed or not installable
  if (isInstalled || isStandalone || !canInstall) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: position === 'bottom' ? 100 : -100 
          }}
          animate={{ 
            opacity: 1, 
            y: 0 
          }}
          exit={{ 
            opacity: 0, 
            y: position === 'bottom' ? 100 : -100 
          }}
          className={`fixed left-4 right-4 z-50 ${
            position === 'bottom' ? 'bottom-4' : 'top-4'
          }`}
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Install Rural Connect AI
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get quick access to emergency resources, community support, and agricultural tools - even when offline!
                </p>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Works offline
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                    Fast access
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                    No app store
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss install prompt"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isInstalling ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Installing...
                  </span>
                ) : (
                  'Install App'
                )}
              </button>
              
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Manual install instructions component for iOS and other browsers
export const PWAInstallInstructions: React.FC<{
  isVisible: boolean;
  onClose: () => void;
}> = ({ isVisible, onClose }) => {
  const { getInstallInstructions } = usePWA();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Install Rural Connect AI
              </h3>
              
              <p className="text-gray-600 mb-4">
                {getInstallInstructions()}
              </p>
              
              {isIOS && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                    <span>1. Tap</span>
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </div>
                    <span>2. Select "Add to Home Screen"</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Compact install button for header/navigation
export const PWAInstallButton: React.FC<{
  className?: string;
  variant?: 'button' | 'icon';
}> = ({ className = '', variant = 'button' }) => {
  const { canInstall, isInstalled, installPWA } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (isInstalled || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const success = await installPWA();
      if (!success) {
        // Show manual instructions if automatic install failed
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Installation failed:', error);
      setShowInstructions(true);
    } finally {
      setIsInstalling(false);
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className={`p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors ${className}`}
          title="Install App"
        >
          {isInstalling ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </button>
        
        <PWAInstallInstructions
          isVisible={showInstructions}
          onClose={() => setShowInstructions(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstall}
        disabled={isInstalling}
        className={`bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors ${className}`}
      >
        {isInstalling ? 'Installing...' : 'Install App'}
      </button>
      
      <PWAInstallInstructions
        isVisible={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </>
  );
};