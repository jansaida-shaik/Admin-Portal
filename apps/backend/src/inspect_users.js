require('dotenv').config();
const jwt = require('jsonwebtoken');
// Node 18+ has fetch built-in, so we can use global fetch directly.

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

async function testMe() {
  const token = jwt.sign({ id: '100000000000000061', email: 'with.praneeth@codegnan.com', role: 'STAFF', name: 'With Praneeth' }, JWT_SECRET, { expiresIn: '1d' });
  console.log('SIGNED JWT TOKEN:', token);
  
  try {
    const res = await fetch('http://localhost:5001/api/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('STATUS CODE:', res.status);
    const data = await res.json();
    console.log('RESPONSE:', data);
  } catch (err) {
    console.error('FETCH ERROR:', err);
  }
}

testMe();
