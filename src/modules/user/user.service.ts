import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { IUser, IUserDocument, ILoginResponse } from './user.interface';
import { userRepository, UserRepository } from './user.repository';
import { AppError } from '@/utils/AppError';
import { env } from '@/config/env';
import { emailQueue } from '@/jobs/queues/email.queue';
import { redisClient } from '@/config/redis';
import { otpGenerator } from '@/utils/otpGenerator';

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async registerUser(userData: Partial<IUser>): Promise<IUserDocument> {
    const existingUser = await this.userRepo.findByEmail(userData.email!);
    if (existingUser) {
      throw new AppError(StatusCodes.CONFLICT, 'Email address is already registered');
    }

    const newUser = await this.userRepo.create(userData);

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6);

    // Save OTP to Redis with a 5-minute expiration (300 seconds)
    await redisClient.set(`OTP_${newUser.email}`, otp, 'EX', 300);

    // Queue OTP email via BullMQ
    await emailQueue.add('send-otp-email', {
      to: newUser.email,
      subject: 'Verify your K10 Football Academy Account',
      body: `Hello ${newUser.name},<br><br>Your verification code is: <b>${otp}</b>.<br>This code will expire in 5 minutes.`,
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
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
    );

    // Generate Refresh Token (Long-lived)
    const refreshToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
    );

    const userObj = user.toObject() as unknown as IUser;

    return {
      user: userObj,
      accessToken,
      refreshToken,
    };
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    // 1. Find user
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (user.isEmailVerified) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Email is already verified');
    }

    // 2. Get OTP from Redis
    const cachedOtp = await redisClient.get(`OTP_${email}`);
    if (!cachedOtp) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'OTP has expired or does not exist');
    }

    // 3. Compare OTP
    if (cachedOtp !== otp) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid OTP code');
    }

    // 4. Update user status in DB
    await this.userRepo.updateById(user._id.toString(), { isEmailVerified: true });

    // 5. Delete OTP from Redis
    await redisClient.del(`OTP_${email}`);

    return true;
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
