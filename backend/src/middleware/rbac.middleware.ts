import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { sendError } from '../utils/apiResponse';
import { Role } from '@prisma/client';

export const authorize = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const userRole = req.user.role as Role;
    if (!allowedRoles.includes(userRole)) {
      return sendError(res, 'Access forbidden: Insufficient privileges', 403);
    }

    next();
  };
};
