# Use Node.js LTS (Long Term Support) as the base image
FROM node:18-alpine

# Install system dependencies required for SQLite and node-gyp
RUN apk add --no-cache python3 make g++ sqlite

# Create and set working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy .env file
COPY .env .env

# Copy the rest of the application
COPY . .

# Create data directory for SQLite
RUN mkdir -p data && chmod 777 data

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["yarn", "start"]
