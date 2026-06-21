const authService = require('./auth.service');

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    try {
      const { token, user } = await authService.login(email, password);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // In production, this should be true with HTTPS
        maxAge: 86400000
      });

      return res.json({ success: true, token, user });
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      throw error; // Let asyncHandler catch it
    }
  }

  async logout(req, res) {
    res.clearCookie('token');
    res.json({ success: true });
  }
}

module.exports = new AuthController();
