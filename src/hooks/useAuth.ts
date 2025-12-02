/**
 * Mock Authentication Hook
 * In a real implementation, this would connect to your authentication service
 */

import { useState, useEffect } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock authentication check
    const mockUser: User = {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      role: 'user',
      onboardingCompleted: false
    };
    
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Mock login logic
    const mockUser: User = {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email,
      role: 'user'
    };
    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('onboarding_completed');
  };

  const updateProfile = async (data: any) => {
    setIsLoading(true);
    try {
      // Mock profile update
      if (user) {
        setUser({
          ...user,
          ...data
        });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateProfile
  };
};