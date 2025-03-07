## Contributions
1. Tanay Biradar
- Initialized DB to backend
- Added data to back of restaurant cards
- Ensured number of restaurants displayed when searching is accurate (with Irene)
- Restricted API requests to only come from authenticated users
- Added check to throw error if any search input is invalid
- Created map and location field on restaurant search page (and Google Maps API key)
- Created API endpoints for login/signup (with Chloe)
- Loaded restaurants into bracket for final ranking
- Migrated username and authentication state to cookies
- Modified CORS policy (implemented part of this through Irene's account)
- Implemented testing features for components
  
2. Karthik Bhattaram
- Created a Svelte store and rturned profile info on login
- Made a profile page for users to access when logged in
- Added option for users to preselect type of restaurant (with Winston)
- Added error check if there are enough restaurants in vicinity
  
3. Winston Wang
- Produced an API endpoint that gives restaurants to rank
- Added option for users to preselect type of restaurant (with Karthik)
- Created API endpoint to accept rankings and store in DB
- Added an upper limit of 30 miles to radius input
  
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
- Created WEAT logo and incorporated it into the web app, changed the UI design for all pages
- Reformatted standup notes for consistency

7. Edison Zhang
- Created a Google Maps component to fix issues with broken embed
- Added ShadCN UI component library
- Created restaurant bracket algorithm (with Irene)
- Debugged bracket algorithm (with Irene)
- Created and formatted UI design of bracket rounds tournament page
- Created grouping feature with sockets
