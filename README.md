# Project Name: Weat

## Description

Weat (a contraction of "We eat") is a tool designed to help groups of indecisive people find restaurants that meet their collective needs, considering dietary restrictions, preferences, and proximity.

## Our Group: Names and GitHub IDs

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

## Installation

### Prerequisites

- Node.js (v20 for frontend, v18 for backend)
- Yarn package manager
- Docker and Docker Compose (v3.8 or higher)
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

## Development Pipeline

The project uses a containerized development and deployment pipeline:

1. **Local Development**:
   - Frontend and backend can be developed independently using their respective dev servers
   - Docker Compose enables running the full stack locally in a production-like environment

2. **Build Process**:
   - Frontend: Multi-stage Docker build optimizes the SvelteKit application for production
   - Backend: Docker image with Node.js 18 contains all necessary dependencies

3. **Deployment**:
   - The application is deployed as Docker containers in a production environment
   - Environment variables control configuration differences between environments
   - Content Security Policy includes support for Google user content images

## Functionality

Weat is designed to make the process of finding and deciding on a restaurant easy.

An average user experience might look like:

- Log in
- Search for a restaurant by placing a pin / selecting radius
- Vote on each pair of restaurants
- View the final scoreboard

## Known Bugs

- Authentication does not set cookies (Issue(s) #71)
- Restaurant Bracket logic is bugged (Issue(s) #78 #79)

## Deployment

A live testable version of Weat is available at: https://cs148.tanaybiradar.com/
