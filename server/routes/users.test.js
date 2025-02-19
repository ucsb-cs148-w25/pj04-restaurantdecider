/* users.test.js */
import request from 'supertest';
import express from 'express';
import router from './users.js';
import { User } from '../utils/db.js';

// Mock the User model methods
jest.mock('../utils/db.js', () => ({
  User: {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/', router);

describe('POST /register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    User.findAll.mockResolvedValue([]);
    User.create.mockResolvedValue({ username: 'newUser' });

    const res = await request(app)
      .post('/register')
      .send({ username: 'newUser', password: 'password123', confirmPassword: 'password123' });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should return error if username is already taken', async () => {
    User.findAll.mockResolvedValue([{ id: 1, username: 'taken', hashedPassword: 'hashvalue' }]);

    const res = await request(app)
      .post('/register')
      .send({ username: 'taken', password: 'password123', confirmPassword: 'password123' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Username already taken');
  });

  it('should return error if passwords do not match', async () => {
    User.findAll.mockResolvedValue([]);

    const res = await request(app)
      .post('/register')
      .send({ username: 'newUser', password: 'password123', confirmPassword: 'differentPassword' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Passwords do not match');
  });
});