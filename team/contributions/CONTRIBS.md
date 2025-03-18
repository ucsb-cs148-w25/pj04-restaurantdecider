## Contributions
1. Tanay Biradar
- Initialized database structure and integration with backend server
- Restricted API requests to only come from authenticated users (Issue #77)
- Modified CORS policy for production environment compatibility (Issue #96)
- Fixed API Base URL configuration for different environments (Issue #85)
- Created restaurant search input page with location field, radius selection, and map (Issue #66)
- Implemented Google Maps integration and secured API key
- Populated detailed restaurant data into restaurant cards (Issue #88)
- Ensured correct number of restaurants are displayed when searching (Issues #89, #90)
- Added input validation to throw errors for invalid search parameters (Issue #91)
- Created API endpoints for login/signup functionality (with Chloe)
- Loaded restaurants into bracket for final ranking (Issue #74)
- Fixed restaurant bracket algorithm issues (Issue #79)
- Migrated username and authentication state to cookies for persistent sessions (Issue #71)
- Implemented unit and integration testing for key components
- Wrote test cases for backend ranking services
- Set up Docker containerization for both frontend and backend services
- Created multi-stage Docker builds for optimized production deployment
- Implemented Content Security Policy (CSP) for handling Google user content images
- Set up GitHub Actions for automated Docker builds and continuous integration
- Deployed and hosts the project on personal home server (cs148.tanaybiradar.com)
  
2. Karthik Bhattaram
- Created a Svelte store and rturned profile info on login
- Made a profile page for users to access when logged in
- Added option for users to preselect type of restaurant (with Winston)
- Added error check if there are enough restaurants in vicinity
  
3. Winston Wang
- Produced an API endpoint that gives restaurants to rank (Issue #39)
- Added option for users to preselect type of restaurant (with Karthik) (Issue #111)
- Created API endpoint to accept rankings and store in DB (Issue #67)
- Added an upper limit of 30 miles to radius input (Issue #124)
- Prevented user from faking a log in with a user/password combination that wasn't previously used to sign up. (Issue #131)
- Added user redirection from restaurant search and bracket when they haven't signed in yet. (Issue #133)
  
4. Danny You
- No major contributions

5. Chloe Weng
- Created API endpoints for the login and signup functions (with Tanay)
- Made the frontend for the restaurant search page (with Irene)
- Implemented a home page where users could return to from every page
- Improved the profile page along with the frontend for other pages (login/signup, search, home)

6. Irene Li
- Created and reformatted restaurant search page (with Chloe and Tanay)
- Implemented frontend for login and signup pages
- Ensured number of restaurants displayed when searching is accurate (with Tanay)
- Created and debugged restaurant bracket algorithm (with Edison)
- Created frontend for final scoreboard page for bracket rounds, frontend for champion rounds, and final champion scoreboard
- Created and debugged champion style ranking algorithm
- Added header, return home, and return to search buttons for both champion and bracket ranking pages
- Added error check on restaurant search page for choosing ranking style
- Fixed restaurant search button to respond to user input
- Created WEAT logo (moving and unmoving) and incorporated it into the web app
- Changed the UI design for all pages with better formatting/styling and matching logo background color
- Reformatted standup notes for consistency
- Added tooltip to champion and bracket buttons on restaurant search page for clarity
- Created separate homepage for sign-in users (separated homepage for before and after sign in)
- Improved profile page frontend

7. Edison Zhang
- Created enhanced Google Maps component to fix issues with broken embed (Issue #94)
- Improved map interactivity and implemented rounded container design (PR #109)
- Added ShadCN UI component library for consistent design system (Issue #46)
- Created restaurant bracket algorithm for comparing and ranking restaurants (with Irene)
- Debugged bracket algorithm to ensure accurate results (with Irene)
- Fixed bracket card flipping animation (Issue #79)
- Created and formatted UI design of bracket rounds tournament page
- Researched and implemented Web Sockets functionality for real-time collaboration (Issue #134)
- Dedicated significant time to developing and refining socket implementation for collaborative team restaurant picking
- Created group bracket system enabling multiple users to select restaurants together (Issue #148)
- Developed rooms feature allowing users to join shared decision groups (Issue #87)
- Migrated frontend code to Svelte Runes for improved state management
- Contributed to initial repository setup and README documentation (Issue #72)
- Co-led the initial project dockerization effort with multi-container setup (PR #81)
- Centered and improved UI in restaurant search page (Issue #130)
