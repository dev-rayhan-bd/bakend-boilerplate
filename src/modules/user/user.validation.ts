import { z } from 'zod';

const userRoleEnum = z.enum(['SUPER_ADMIN', 'ADMIN', 'PLAYER', 'COACH', 'GUARDIAN', 'SCOUT']);
const userStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']);

export const createUserZodSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: userRoleEnum.optional().default('PLAYER'),
    status: userStatusEnum.optional().default('ACTIVE'),
  }),
});

export const loginUserZodSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateUserZodSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    role: userRoleEnum.optional(),
    status: userStatusEnum.optional(),
  }),
});

export const UserValidation = {
  createUserZodSchema,
  loginUserZodSchema,
  updateUserZodSchema,
};
