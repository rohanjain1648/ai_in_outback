import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    updateProfile: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockUser = {
  _id: 'user123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  location: {
    postcode: '2000',
    state: 'NSW',
    region: 'Sydney'
  },
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01'
};

const mockToken = 'mock-jwt-token';

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('initializes with no user when no token in localStorage', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('initializes with user when valid token exists in localStorage', async () => {
    localStorageMock.getItem.mockReturnValue(mockToken);
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith(mockToken);
  });

  it('handles login successfully', async () => {
    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      token: mockToken
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', mockToken);
  });

  it('handles login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockAuthService.login.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'wrongpassword');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('handles registration successfully', async () => {
    const registrationData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    mockAuthService.register.mockResolvedValue({
      user: mockUser,
      token: mockToken
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register(registrationData);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', mockToken);
  });

  it('handles registration failure', async () => {
    const errorMessage = 'Email already exists';
    const registrationData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    mockAuthService.register.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register(registrationData);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('handles logout', async () => {
    // Start with authenticated user
    localStorageMock.getItem.mockReturnValue(mockToken);
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('updates user profile successfully', async () => {
    // Start with authenticated user
    localStorageMock.getItem.mockReturnValue(mockToken);
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const updatedUser = {
      ...mockUser,
      firstName: 'Jane',
      bio: 'Updated bio'
    };

    mockAuthService.updateProfile.mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    const updateData = {
      firstName: 'Jane',
      bio: 'Updated bio'
    };

    await act(async () => {
      await result.current.updateProfile(updateData);
    });

    expect(result.current.user).toEqual(updatedUser);
    expect(mockAuthService.updateProfile).toHaveBeenCalledWith(updateData, mockToken);
  });

  it('handles profile update failure', async () => {
    // Start with authenticated user
    localStorageMock.getItem.mockReturnValue(mockToken);
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const errorMessage = 'Update failed';
    mockAuthService.updateProfile.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    const updateData = { firstName: 'Jane' };

    await act(async () => {
      await result.current.updateProfile(updateData);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.user).toEqual(mockUser); // User should remain unchanged
  });

  it('handles token refresh', async () => {
    localStorageMock.getItem.mockReturnValue(mockToken);
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const newToken = 'new-jwt-token';
    mockAuthService.refreshToken.mockResolvedValue({
      user: mockUser,
      token: newToken
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', newToken);
    expect(mockAuthService.refreshToken).toHaveBeenCalledWith(mockToken);
  });

  it('handles expired token during initialization', async () => {
    localStorageMock.getItem.mockReturnValue(mockToken);
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Token expired'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
  });

  it('clears error when new action is performed', async () => {
    // Start with an error state
    mockAuthService.login.mockRejectedValue(new Error('Login failed'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'wrongpassword');
    });

    expect(result.current.error).toBe('Login failed');

    // Perform successful login
    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      token: mockToken
    });

    await act(async () => {
      await result.current.login('test@example.com', 'correctpassword');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.user).toEqual(mockUser);
  });

  it('handles network errors gracefully', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.isAuthenticated).toBe(false);
  });
});