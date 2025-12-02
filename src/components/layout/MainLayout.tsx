import React from 'react';
import NotificationCenter from '../notifications/NotificationCenter';
import CallWindow from '../webrtc/CallWindow';
import MobileOfflineManager from '../mobile/MobileOfflineManager';
import ResponsiveContainer from '../mobile/ResponsiveContainer';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useDeviceDetection } from '../../utils/mobileDetection';

interface MainLayoutProps {
  children: React.ReactNode;
  showMobileOffline?: boolean;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showMobileOffline = true,
  currentView,
  onViewChange 
}) => {
  const { isInCall, incomingCall } = useWebRTC();
  const deviceInfo = useDeviceDetection();

  return (
    <div className="min-h-screen bg-gradient-to-br from-eucalyptus-50 to-outback-50">
      {/* Header with notifications */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <ResponsiveContainer padding="none" maxWidth="full">
          <div className="flex justify-between items-center h-14 sm:h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <h1 className={`font-semibold text-gray-900 ${
                deviceInfo.isMobile ? 'text-lg' : 'text-xl'
              }`}>
                Rural Connect AI
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NotificationCenter />
            </div>
          </div>
        </ResponsiveContainer>
      </header>

      {/* Main content */}
      <main className={`flex-1 ${deviceInfo.isMobile ? 'pb-20' : ''}`}>
        <ResponsiveContainer 
          padding={deviceInfo.isMobile ? 'sm' : 'md'}
          maxWidth="full"
        >
          {children}
        </ResponsiveContainer>
      </main>

      {/* Mobile offline manager */}
      {showMobileOffline && deviceInfo.isMobile && (
        <MobileOfflineManager
          maxStorageSize={100}
          autoSync={true}
          priorityTypes={['emergency', 'agricultural', 'community']}
        />
      )}

      {/* Call window overlay */}
      {(isInCall || incomingCall) && <CallWindow />}

      {/* Mobile-specific optimizations */}
      {deviceInfo.isMobile && (
        <>
          {/* Prevent zoom on input focus */}
          <style jsx global>{`
            input, select, textarea {
              font-size: 16px !important;
            }
            
            /* Improve touch targets */
            button, a, input, select, textarea {
              min-height: 44px;
            }
            
            /* Optimize scrolling */
            * {
              -webkit-overflow-scrolling: touch;
            }
            
            /* Prevent text selection on touch */
            .select-none {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            
            /* Improve tap highlighting */
            * {
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default MainLayout;