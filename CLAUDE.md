# Weat Project Guide for AI Assistants

## Commands
### Frontend (client/)
- Build: `cd client && yarn build`
- Dev: `cd client && yarn dev`
- Lint: `cd client && yarn lint`
- Format: `cd client && yarn format`

### Backend (server/)
- Start: `cd server && yarn start`
- Dev: `cd server && yarn dev`
- Test all: `cd server && yarn test`
- Test single file: `cd server && npx jest tests/filename.test.js`
- Test single test: `cd server && npx jest -t "test description"`

## Code Style
- Use tabs for indentation (not spaces)
- Use single quotes for strings
- No trailing commas
- 100 character line length limit
- Default to ES modules (import/export)
- Frontend uses Svelte with TailwindCSS
- Backend uses Express.js with SQLite/Sequelize
- Use async/await for asynchronous operations
- Proper error handling with try/catch blocks
- Follow existing naming conventions in files