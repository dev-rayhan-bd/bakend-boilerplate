import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { IUser, IUserDocument, ILoginResponse } from './user.interface';
import { userRepository, UserRepository } from './user.repository';
import { AppError } from '@/utils/AppError';
import { env } from '@/config/env';
import { emailQueue } from '@/jobs/queues/email.queue';

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async registerUser(userData: Partial<IUser>): Promise<IUserDocument> {
    const existingUser = await this.userRepo.findByEmail(userData.email!);
    if (existingUser) {
      throw new AppError(StatusCodes.CONFLICT, 'Email address is already registered');
    }

    const newUser = await this.userRepo.create(userData);

    // Queue welcome email via BullMQ
    await emailQueue.add('send-welcome-email', {
      to: newUser.email,
      subject: 'Welcome to K10 Football Academy Platform',
      body: `Hello ${newUser.name}, welcome to the K10 Football Academy!`,
    });

    return newUser;
  }

  async loginUser(email: string, candidatePassword: string): Promise<ILoginResponse> {
    const user = await this.userRepo.findByEmail(email, true);
    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(candidatePassword);
    if (!isMatch) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
    }

    if (user.status === 'BLOCKED' || user.status === 'INACTIVE') {
      throw new AppError(StatusCodes.FORBIDDEN, `Account is ${user.status.toLowerCase()}`);
    }

    // Generate Access Token (Short-lived)
    const accessToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    // Generate Refresh Token (Long-lived)
    const refreshToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    const userObj = user.toObject() as unknown as IUser;

    return {
      user: userObj,
      accessToken,
      refreshToken,
    };
  }

  async getUserById(id: string): Promise<IUserDocument> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
  }

  async getAllUsers(): Promise<IUserDocument[]> {
    return this.userRepo.findAll();
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUserDocument> {
    const user = await this.userRepo.updateById(id, updateData);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepo.deleteById(id);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }
  }
}

export const userService = new UserService(userRepository);
