import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useDeviceDetection } from '../../utils/mobileDetection';

interface TouchInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  clearable?: boolean;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  maxLength?: number;
  pattern?: string;
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
}

const TouchInput: React.FC<TouchInputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  autoComplete,
  autoFocus = false,
  clearable = false,
  icon,
  className = '',
  inputClassName = '',
  maxLength,
  pattern,
  inputMode
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const deviceInfo = useDeviceDetection();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Delay autofocus on mobile to prevent keyboard issues
      const delay = deviceInfo.isMobile ? 300 : 0;
      setTimeout(() => {
        inputRef.current?.focus();
      }, delay);
    }
  }, [autoFocus, deviceInfo.isMobile]);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine input type
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Base classes - larger touch targets for mobile
  const containerClasses = [
    'relative',
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
    deviceInfo.isTouchDevice 
      ? 'px-4 py-4 text-base min-h-[48px]' // Larger for touch
      : 'px-3 py-2 text-sm',
    icon ? (deviceInfo.isTouchDevice ? 'pl-12' : 'pl-10') : '',
    (clearable && value) || type === 'password' 
      ? (deviceInfo.isTouchDevice ? 'pr-12' : 'pr-10') 
      : '',
    error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : isFocused
      ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    disabled
      ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
      : 'bg-white text-gray-900',
    inputClassName
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'block text-sm font-medium mb-2',
    error ? 'text-red-700' : 'text-gray-700',
    required ? "after:content-['*'] after:text-red-500 after:ml-1" : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={`input-${label}`} className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className={`absolute left-0 top-0 h-full flex items-center ${
            deviceInfo.isTouchDevice ? 'pl-4' : 'pl-3'
          } pointer-events-none`}>
            <div className="text-gray-400">
              {icon}
            </div>
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          id={`input-${label}`}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          pattern={pattern}
          inputMode={inputMode}
          className={inputClasses}
          // Mobile-specific attributes
          autoCapitalize={type === 'email' ? 'none' : undefined}
          autoCorrect={type === 'email' || type === 'password' ? 'off' : undefined}
          spellCheck={type === 'email' || type === 'password' ? false : undefined}
        />

        {/* Clear button */}
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-0 top-0 h-full flex items-center ${
              deviceInfo.isTouchDevice ? 'pr-4' : 'pr-3'
            } text-gray-400 hover:text-gray-600`}
            tabIndex={-1}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Password visibility toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={`absolute right-0 top-0 h-full flex items-center ${
              deviceInfo.isTouchDevice ? 'pr-4' : 'pr-3'
            } text-gray-400 hover:text-gray-600`}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Character count for mobile */}
      {maxLength && deviceInfo.isMobile && (
        <p className="mt-1 text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
};

export default TouchInput;