import { User, IUser } from '../models/User';
import { AuthService } from '../middleware/auth';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';

export interface CreateUserData {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    displayName?: string;
    bio?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    occupation?: string;
    farmType?: string;
    businessType?: string;
    yearsInArea?: number;
    familySize?: number;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  location?: {
    coordinates: [number, number];
    address?: string;
    city?: string;
    state?: string;
    postcode?: string;
    region?: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateUserData {
  profile?: Partial<IUser['profile']>;
  location?: IUser['location'];
  preferences?: Partial<IUser['preferences']>;
}

export class UserService {
  /**
   * Create a new user account
   */
  static async createUser(userData: CreateUserData): Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create new user
    const user = new User(userData);
    
    // Generate email verification token
    user.generateEmailVerificationToken();
    
    await user.save();

    // Generate JWT tokens
    const tokens = AuthService.generateTokens({
      id: (user._id as mongoose.Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    });

    return { user, tokens };
  }

  /**
   * Authenticate user login
   */
  static async loginUser(loginData: LoginData): Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }> {
    // Find user by email
    const user = await User.findOne({ email: loginData.email, isActive: true });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(loginData.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT tokens
    const tokens = AuthService.generateTokens({
      id: (user._id as mongoose.Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    });

    return { user, tokens };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email, isActive: true });
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updateData: UpdateUserData): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update profile fields
    if (updateData.profile) {
      Object.assign(user.profile, updateData.profile);
    }

    // Update location
    if (updateData.location) {
      user.location = updateData.location;
    }

    // Update preferences
    if (updateData.preferences) {
      Object.assign(user.preferences, updateData.preferences);
    }

    await user.save();
    return user;
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<string> {
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      // Don't reveal if email exists or not
      return 'If an account with that email exists, a password reset link has been sent.';
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send email with reset token
    // This would typically integrate with an email service
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return 'If an account with that email exists, a password reset link has been sent.';
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      emailVerificationToken: token,
      isActive: true,
    });

    if (!user) {
      throw new AppError('Invalid verification token', 400);
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = false;
    await user.save();
  }

  /**
   * Get users with pagination and filtering
   */
  static async getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  } = {}): Promise<{ users: IUser[]; total: number; page: number; totalPages: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive = true,
    } = options;

    const query: any = { isActive };

    // Add role filter
    if (role) {
      query.role = role;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { 'profile.displayName': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Find users near a location
   */
  static async findUsersNearLocation(
    coordinates: [number, number],
    maxDistance: number = 50000, // 50km in meters
    limit: number = 20
  ): Promise<IUser[]> {
    return User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates,
          },
          $maxDistance: maxDistance,
        },
      },
      isActive: true,
      'preferences.privacy.showLocation': true,
    }).limit(limit);
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = AuthService.verifyRefreshToken(refreshToken);
      
      // Verify user still exists and is active
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      // Generate new tokens
      return AuthService.generateTokens({
        id: (user._id as mongoose.Types.ObjectId).toString(),
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }
}