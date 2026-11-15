import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';

describe('tests', () => {
  // test('register test', async () => {
  //   const response = await request(app).post('/auth/register').send({
  //     name: 'Hadi',
  //     email: 'nnn4@gmail.com',
  //     password: '123454321',
  //   });
  //   expect(response.body).toHaveProperty('name');
  //   expect(response.body).toHaveProperty('email');
  //   expect(response.body).not.toHaveProperty('password');
  //   expect(response.status).toBe(200);
  // });

  test('register with invalid password', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Hadi',
      email: 'invalid@example.com',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('login test', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'nnn4@gmail.com',
      password: '123454321',
    });
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('token');
    expect(response.body).not.toHaveProperty('password');
    expect(response.status).toBe(200);
  });

  test('login with invalid password', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'nnn4@gmail.com',
      password: '12345432',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('invalid email', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'n@gmail.com',
      password: '12345432',
    });
    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty('token');
  });
});
