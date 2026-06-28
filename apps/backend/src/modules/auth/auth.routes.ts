import express from 'express';
const router = express.Router();
import authController from './auth.controller';
import asyncHandler from '../../utils/asyncHandler';

router.post('/login', asyncHandler(authController.login.bind(authController)));
router.post('/logout', asyncHandler(authController.logout.bind(authController)));

export default router;
