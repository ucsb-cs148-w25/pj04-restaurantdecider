# Sprint 01 Planning

1. Set of deliverables
2. Identifies tasks to complete

## Goals and Deliverables: Build a MVP
> Due January 31, 2025.

- Characteristics of MVP
    - Minimal CSS styling, just has to be functional
- Elements of our MVP:
    - CRUD functionality:
        - Username/password for login
        - Each user has a profile
            - Liked/favorited restaurants
            - Dietary restrictions
    - Individual restaurant recommendations
        - User specifies location + radius + number of restaurants to consider (short/med/long: N = 8/16/32)
        - Pull data from Google Maps or Yelp (TODO - figure out where to get data)
        - Pick the top N restaurants based on Yelp/Google reviews
        - Display those restaurants
            - Randomly create bracket by pairing restaurants together
            - Display menu, description, select reviews of TWO restaurants at a time in the bracket
                - Have user swipe left/right Tinder-style to create a ranking of the candidate restaurants
                - Add "Do Not Show" button
                - This creates a ranking of restaurants

## Backlog
- Figure out recommendation algorithm
    - Reviews
    - Some similarity to user liked restaurants (TODO: figure out how to compute this)
- Tag dietary restrictions


## Tasks to Complete
1. Create user stories (within each one, create actionable issues + assign them)
2. Everyone completes an issue by next Wednesday
