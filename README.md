# Project Name: Weat

## Description

Our project, which is a contraction of the words _We eat_, is a tool designed to help a group of indecisive people find a restaurant that meets their needs, which entails considering dietary restrictions preferences, and proximity.

## Our Group: Names and GitHub IDs

- Tanay Biradar (TanayB11)
- Karthik Bhattaram (KarthikB-dev)
- Winston Wang (winstonwangUCSB)
- Danny You (Danny-You)
- Chloe Weng (chloecweng)
- Irene Li (the-irene-li)
- Edison Zhang (edis0n-zhang)

## Tech Stack

- Frontend will be written in Svelte.
- Backend will be a combination of Node.js (likely using the Express framework) and some relational database (Postgres or MySQL or DuckDB)

## Project Details

Weat is a webapp designed to help make group (and individual) dining decisions. When a group is ready to decide on a restaurant, each member inputs their location, preferred distance, and dietary restrictions, and the app generates a curated list of suitable restaurants within the specified parameters. The decision-making process follows a simple yes/no voting system (possible complex algorithm to come), where restaurants are presented sequentially to all group members until unanimous agreement is reached. The app displays menu samples and previous user ratings. For registered users, the app maintains a history of favorite restaurants and personal ratings, which are visible to other group members when making a decision on where to eat.

## User Roles

1. Individual
2. Group member

A user can have both these roles. The individual role is held by each user and
keeps track of each user's restaurant preferences, etc. The group member
role associates the individual with the group; this allows them to do things
like voting with relationship to a particular group.

## Roles and Permissions

We'll leave this application open to the public. There is no publicly posted data.

## Installation

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- Docker and Docker Compose (v3.8 or higher)
- Git

### Dependencies

#### Frontend (Client)

- SvelteKit (v2.0.0) - Frontend framework
- Vite - Build tool and development server
- TailwindCSS - Utility-first CSS framework
- Bits-UI - UI component library
- ESLint & Prettier - Code formatting and linting

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
   git clone <repository-url>
   cd <repository-name>
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
   Add JWT_SECRET=<name> in .env

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
