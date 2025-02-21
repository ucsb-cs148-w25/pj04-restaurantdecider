# Testing Documentation

## Testing Stack
- **Jest**: Primary testing framework
- **Supertest**: HTTP assertions library for testing Express.js endpoints
- **Jest Mock**: Built-in mocking functionality for unit testing

## Testing Approach

### Unit Testing
Tested the user registration endpoint on the server.

## Implemented Tests
### User Registration Tests (`users.test.js`)
The following test cases have been implemented for the `/register` endpoint:
- Tests that a new user can be registered successfully
- Tests the scenario when a username is already taken
    - Mocks database query to simulate existing user
- Tests password confirmation matching

### Restaurant Ranking Tests (`ranking.test.js`)
The following test cases have been implemented for the `/rankings` endpoint in `ranking.js`:
- Tests that the server returns a 200 status code
- Tests that the server returns a 400 status code when the request body is invalid

## Plans for Unit Tests in the Future
- We hope to add more test cases for the `/maps` endpoints. This is a core component of our project, because it gives us a lot of restaurant data.
  - We want to make sure that the data has a consistent format and the photos are consistently accessible.

## Plans for Higher Level Tests in the Future
We hope to use BDD (Behavior-Driven Development) for the higher-level tests. This will make it easy to communicate the intent of the test without writing too much code, and it also creates a log of our development process.