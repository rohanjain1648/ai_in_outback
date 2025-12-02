import React from 'react';
import { useDeviceDetection } from '../../utils/mobileDetection';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  padding = 'md',
  maxWidth = 'full'
}) => {
  const deviceInfo = useDeviceDetection();

  // Base classes
  let baseClasses = 'w-full mx-auto';

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-12'
  };

  // Max width classes
  const maxWidthClasses = {
    none: '',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  // Device-specific classes
  let deviceClasses = '';
  if (deviceInfo.isMobile && mobileClassName) {
    deviceClasses = mobileClassName;
  } else if (deviceInfo.isTablet && tabletClassName) {
    deviceClasses = tabletClassName;
  } else if (deviceInfo.isDesktop && desktopClassName) {
    deviceClasses = desktopClassName;
  }

  const finalClassName = [
    baseClasses,
    paddingClasses[padding],
    maxWidthClasses[maxWidth],
    className,
    deviceClasses
  ].filter(Boolean).join(' ');

  return (
    <div className={finalClassName}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;