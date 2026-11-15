import jwt from 'jsonwebtoken';
import pool from './db.js';

export function auth(req, res, next) {
  const authorization = req.header('Authorization');
  if (!authorization) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'no token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid Token' });
  }
}

export async function adminOnly(req, res, next) {
  try {
    const id = req.user.id;
    const result = await pool.query(`SELECT role FROM users WHERE id = $1`, [id]);
    if (result.rows[0].length <= 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'User is not admin' });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
