# Weat - Restaurant Decider

## Description

Weat (a contraction of "We eat") is a tool designed to help groups of indecisive people find restaurants that meet their collective needs, considering dietary restrictions, preferences, and proximity.

## Table of Contents
- [Weat - Restaurant Decider](#weat---restaurant-decider)
  - [Description](#description)
  - [Table of Contents](#table-of-contents)
  - [Team Members](#team-members)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [DevOps](#devops)
  - [Project Details](#project-details)
  - [User Roles](#user-roles)
  - [Roles and Permissions](#roles-and-permissions)
  - [Repository Structure](#repository-structure)
  - [Installation and Setup](#installation-and-setup)
    - [Prerequisites](#prerequisites)
    - [Dependencies](#dependencies)
      - [Frontend (Client)](#frontend-client)
      - [Backend (Server)](#backend-server)
    - [Installation Steps](#installation-steps)
    - [Deployment](#deployment)
  - [Functionality](#functionality)
  - [Live Demo](#live-demo)

## Team Members

- Tanay Biradar (TanayB11)
- Karthik Bhattaram (KarthikB-dev)
- Winston Wang (winstonwangUCSB)
- Danny You (Danny-You)
- Chloe Weng (chloecweng)
- Irene Li (the-irene-li)
- Edison Zhang (edis0n-zhang)

## Tech Stack

### Frontend
- Svelte 5 with SvelteKit 2.0
- Vite as the build tool and development server
- TailwindCSS for styling
- Bits-UI for UI components

### Backend
- Node.js with Express framework
- DuckDB and SQLite for data storage
- Sequelize as the ORM
- JWT authentication

### DevOps
- Docker and Docker Compose for containerization
- Multi-stage build process for efficient deployments

## Project Details

Weat simplifies group dining decisions. When a group is ready to choose a restaurant, each member inputs their location, preferred distance, and dietary restrictions. The app generates a curated list of suitable restaurants based on these parameters.

The decision-making process follows a simple voting system where restaurants are presented to all group members until unanimous agreement is reached. The app displays menu samples and previous user ratings. For registered users, Weat maintains a history of favorite restaurants and personal ratings, visible to other group members during the decision-making process.

## User Roles

1. **Individual** - Each user has their own profile, preferences, and restaurant history
2. **Group Member** - Users can join groups for collaborative restaurant selection

A user can have both roles simultaneously. The individual role tracks personal preferences, while the group member role enables voting and interaction within specific groups.

## Roles and Permissions

The application is open to the public with no publicly posted data. User data is only visible to other users within the same group during the decision-making process.

## Repository Structure

```
/project-pj04-restaurantdecider
├── client/                  # Frontend SvelteKit application
│   ├── src/                 # Source code for the frontend
│   │   ├── app.html         # Main HTML template with CSP configuration
│   │   ├── lib/             # Reusable components and utilities
│   │   ├── routes/          # SvelteKit routes and page components
│   │   └── ...
│   ├── static/              # Static assets
│   ├── Dockerfile           # Frontend container configuration
│   └── ...
├── server/                  # Backend Express application
│   ├── bin/                 # Server startup scripts
│   ├── models/              # Database models
│   ├── routes/              # API route handlers
│   ├── socket/              # WebSocket handlers
│   ├── utils/               # Utility functions
│   ├── app.js               # Main server application file
│   ├── Dockerfile           # Backend container configuration
│   └── ...
├── docs/                    # Project documentation
│   ├── MANUAL.md            # User manual
│   └── ...
├── docker-compose.yml       # Docker Compose configuration
└── README.md                # This file
```

## Installation and Setup

### Prerequisites

- Node.js (v20 for frontend, v18 for backend)
- Yarn package manager
- Docker and Docker Compose (v3.8 or higher) for containerized setup
- Git

### Dependencies

#### Frontend (Client)

- Svelte (v5.0.0) with SvelteKit (v2.0.0)
- Vite (v5.4.11) - Build tool and development server
- TailwindCSS (v3.4.9) - Styling framework
- Bits-UI (v1.0.0-next.82) - UI component library
- ESLint (v9.7.0) & Prettier (v3.3.2) - Code quality tools

#### Backend (Server)

- Express (v4.16.1) - Web application framework
- DuckDB (v1.1.3-alpha.10) - Database system
- Sequelize (v6.37.5) - ORM for database interactions
- SQLite3 (v5.1.7) - Database engine
- JWT (v9.0.2) - Authentication
- bcryptjs (v2.4.3) - Password hashing
- Other utilities: cors, morgan, dotenv

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/ucsb-cs148-w24/project-pj04-restaurantdecider.git
   cd project-pj04-restaurantdecider
   ```

2. Start the application using Docker (recommended):

   ```bash
   docker-compose up --build
   ```

   This will start both the frontend and backend services. The frontend will be available at http://localhost:2500 and the backend at http://localhost:2530.

3. Alternative: Manual Setup

   Frontend Setup:

   ```bash
   cd client
   yarn install
   yarn dev
   ```

   The frontend development server will start at http://localhost:5173

   Backend Setup:

   ```bash
   cd server
   yarn install
   yarn dev
   ```

   The backend server will start at http://localhost:3000

   Note: Create a .env file in the server directory and add a JWT_SECRET token

### Deployment

To deploy the application to a production environment:

1. Set up environment variables for production:
   - Set `NODE_ENV=production` in both client and server environments
   - Ensure `JWT_SECRET` and `MAPS_API_KEY` are configured securely
   - Configure any domain-specific settings in the server's CORS options

2. Build and deploy using Docker:

```bash
docker-compose up -d --build
```

3. Content Security Policy (CSP):
   - The application has a CSP configured in `client/src/app.html`
   - Ensure the CSP includes 'https://lh3.googleusercontent.com' and 'https://*.googleusercontent.com' in the img-src directive to allow Google user content images

4. SSL/TLS:
   - For production deployment, configure SSL/TLS certificates using a reverse proxy like Nginx or a cloud provider's load balancer

## Functionality

Weat is designed to make the process of finding and deciding on a restaurant easy.

An average user experience might look like:

- Log in
- Search for a restaurant by placing a pin / selecting radius
- Vote on each pair of restaurants
- View the final scoreboard

## Live Demo
A live testable version of Weat is available at: https://cs148.tanaybiradar.com/
