import React from 'react';
import { useDeviceDetection } from '../../utils/mobileDetection';

interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  hapticFeedback?: boolean;
}

const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  icon,
  iconPosition = 'left',
  hapticFeedback = true
}) => {
  const deviceInfo = useDeviceDetection();

  const handleClick = () => {
    if (disabled || loading) return;

    // Haptic feedback for mobile devices
    if (hapticFeedback && deviceInfo.isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate(10); // Very short vibration
    }

    onClick?.();
  };

  // Base classes - larger touch targets for mobile
  const baseClasses = deviceInfo.isTouchDevice
    ? 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 select-none'
    : 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 select-none';

  // Size classes - larger for touch devices
  const sizeClasses = {
    sm: deviceInfo.isTouchDevice ? 'px-4 py-3 text-sm min-h-[44px]' : 'px-3 py-2 text-sm',
    md: deviceInfo.isTouchDevice ? 'px-6 py-4 text-base min-h-[48px]' : 'px-4 py-2 text-sm',
    lg: deviceInfo.isTouchDevice ? 'px-8 py-5 text-lg min-h-[52px]' : 'px-6 py-3 text-base',
    xl: deviceInfo.isTouchDevice ? 'px-10 py-6 text-xl min-h-[56px]' : 'px-8 py-4 text-lg'
  };

  // Variant classes
  const variantClasses = {
    primary: disabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
    secondary: disabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800',
    outline: disabled
      ? 'border border-gray-300 text-gray-400 cursor-not-allowed'
      : 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100',
    ghost: disabled
      ? 'text-gray-400 cursor-not-allowed'
      : 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200',
    danger: disabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800'
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Loading spinner
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const finalClassName = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    widthClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={finalClassName}
      onClick={handleClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading && <LoadingSpinner />}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default TouchButton;