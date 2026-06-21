const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const asyncHandler = require('../../utils/asyncHandler');

router.post('/login', asyncHandler(authController.login.bind(authController)));
router.post('/logout', asyncHandler(authController.logout.bind(authController)));

module.exports = router;
