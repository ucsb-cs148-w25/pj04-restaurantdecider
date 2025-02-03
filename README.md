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

## Local Development Instructions

**Frontend**

- cd into `client` and run the following
- `yarn install`
- `yarn dev`

Backend

- cd into `server` and run the following
- `yarn install`
- `yarn dev`

## Prod Build Instructions

Requires Docker and Docker Compose (tested on Docker Compose version v2.31.0-desktop.2).

To run `docker-compose up --build`.
