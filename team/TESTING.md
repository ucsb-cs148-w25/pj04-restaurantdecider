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