import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';

describe('tests', () => {
  test('GET /users', async () => {
    const response = await request(app).get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    response.body.forEach((user) => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).not.toHaveProperty('password');
    });
  });

  test('without token', async () => {
    const response = await request(app).get('/users/profile');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No token provided');
  });

  test('with token but incorrect', async () => {
    const response = await request(app).get('/users/profile').set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid Token');
  });

  test('with token', async () => {
    const loginResponse = await request(app).post('/auth/login').send({
      email: 'nnn4@gmail.com',
      password: '123454321',
    });
    const token = loginResponse.body.token;
    const response = await request(app).get('/users/profile').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email');
    expect(response.body).not.toHaveProperty('password');
  });
});
