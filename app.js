import express from 'express';
import bcrypt from 'bcrypt';
import pool from './db.js';
import jwt from 'jsonwebtoken';
import { auth, adminOnly } from './auth.js';
import { registerSchema, loginSchema } from './schemas.js';
import { validate } from './validate.js';
import { errorHandler } from './errorHandler.js';

export const app = express();

app.use(express.json());

app.post('/auth/register', validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;

  const result = await pool.query(
    `INSERT INTO users (name, email, password)
    VALUES($1, $2, $3) RETURNING id, name, email
    `,
    [name, email, await bcrypt.hash(password, 8)],
  );
  res.json(result.rows[0]);
});

app.post('/auth/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (user.rows.length > 0) {
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      token,
    });
  } else {
    res.status(401).json({
      error: 'Invalid email or password',
    });
  }
});

app.get('/users', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const role = req.query.role;
  const allowedSort = ['id', 'name'];
  const allowedOrder = ['ASC', 'DESC'];

  const sort = allowedSort.includes(req.query.sort) ? req.query.sort : 'id';

  const order = allowedOrder.includes(req.query.order?.toUpperCase()) ? req.query.order.toUpperCase() : 'ASC';

  if (role) {
    const result = await pool.query(`SELECT id, name, email FROM users WHERE role = $1 ORDER BY ${sort} ${order} limit $2 OFFSET $3`, [
      role,
      limit,
      (page - 1) * limit,
    ]);
    res.json(result.rows);
  } else {
    const result = await pool.query(`SELECT id, name, email FROM users ORDER BY ${sort} ${order} limit $1 OFFSET $2`, [
      limit,
      (page - 1) * limit,
    ]);
    res.json(result.rows);
  }
});

app.get('/users/profile', auth, async (req, res, next) => {
  const id = req.user.id;
  try {
    const result = await pool.query(`SELECT id, name, email FROM users WHERE id = $1 `, [id]);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
});

app.delete('/users/:id', auth, adminOnly, async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email ', [id]);

    if (user.rows.length > 0) {
      res.status(200).json(user.rows[0]);
    } else {
      res.status(404).json({
        error: 'No user with this id has been found',
      });
    }
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

export default app;
