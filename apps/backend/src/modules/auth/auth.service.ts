import jwt from 'jsonwebtoken';
const { prisma } = require('../../prisma');

const JWT_SECRET = process.env.JWT_SECRET;

class AuthService {
  async login(email, password) {
    // Admin bypass using environment variables
    if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({
        id: 'admin',
        email,
        role: 'ADMIN',
        name: 'Jan Saida Shaik'
      }, JWT_SECRET, {
        expiresIn: '1d'
      });
      
      return {
        token,
        user: { name: 'Jan Saida Shaik', email, role: 'ADMIN' }
      };
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({
      id: user.id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    }, JWT_SECRET, {
      expiresIn: '1d'
    });

    return {
      token,
      user: { name: user.name, email: user.email, role: user.role }
    };
  }
}

export default new AuthService();
