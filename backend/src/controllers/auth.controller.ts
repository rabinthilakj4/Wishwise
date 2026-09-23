import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required.', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'User with this email already exists.', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === Role.ADMIN || role === Role.MANAGER ? role : Role.CUSTOMER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: assignedRole,
        avatar: null,
        preference: {
          create: {
            emailAlerts: true,
            inAppAlerts: true,
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      }
    });

    const tokens = generateTokens({ userId: user.id, role: user.role, email: user.email });

    return sendSuccess(res, { user, tokens }, 'Registration successful', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required.', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid credentials.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials.', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const tokens = generateTokens({ userId: user.id, role: user.role, email: user.email });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    return sendSuccess(res, { user: userResponse, tokens }, 'Login successful');
  } catch (error: any) {
    return sendError(res, error.message || 'Login failed', 500);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        status: true,
        createdAt: true,
        preference: true,
      }
    });

    if (!user) return sendError(res, 'User not found', 404);

    return sendSuccess(res, user, 'User profile fetched');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch user', 500);
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, 'Refresh token required', 400);

    const payload = verifyRefreshToken(refreshToken);
    const tokens = generateTokens({ userId: payload.userId, role: payload.role, email: payload.email });

    return sendSuccess(res, tokens, 'Tokens refreshed');
  } catch {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }
};

export const uploadProfilePhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const userId = req.user.userId;
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return sendError(res, 'Image payload required', 400);
    }

    // Validate format (base64 data URL expected: data:image/png;base64,...)
    const matches = imageBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
    if (!matches) {
      return sendError(res, 'Please upload a JPG, JPEG, PNG, or WEBP image.', 400);
    }

    const ext = matches[1].toLowerCase() === 'jpeg' ? 'jpg' : matches[1].toLowerCase();
    const dataBuffer = Buffer.from(matches[2], 'base64');

    // Validate size (max 5 MB)
    if (dataBuffer.length > 5 * 1024 * 1024) {
      return sendError(res, 'Profile photo must be smaller than 5 MB.', 400);
    }

    const uploadsDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `avatar-${userId}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, dataBuffer);

    const avatarUrl = `/uploads/avatars/${fileName}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      }
    });

    return sendSuccess(res, updatedUser, 'Profile photo updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to upload profile photo', 500);
  }
};

export const removeProfilePhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const userId = req.user.userId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      }
    });

    return sendSuccess(res, updatedUser, 'Profile photo removed');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to remove profile photo', 500);
  }
};
