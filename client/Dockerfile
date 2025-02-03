# Build stage
FROM node:20-alpine AS builder

# Install yarn
RUN apk add --no-cache yarn

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code and environment variables
COPY . .

# Build the application for production
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/.env .
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

# Set port environment variable
ENV PORT=5173
ENV HOST=0.0.0.0

# Expose port 5173
EXPOSE 5173

# Start the application
CMD ["node", "build"]
