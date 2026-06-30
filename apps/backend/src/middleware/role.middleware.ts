import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: any, res: any, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Requires ADMIN role' });
  }
};
