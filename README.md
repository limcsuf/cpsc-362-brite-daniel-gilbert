## CPSC 362 Project
[TOC]

## Members
- Brite Bartnek
- Daniel Lim
- Gilbert Cervantes

## Description
A volunteer-focused website where they can log events, sign in to a profile, and view event history.

## Setup
1. Clone the repository/download the .zip
1. Load the schema.sql in MySQL and run the file. Set up your server to be whatever you want. Make sure to edit /server/server.js and client/vite.config.js to point to your MySQL server setup.
   - Defaults to:
   - localhost:3001(server)|5173(client
   - user:root <# Change this to whatever your MySQL connection is
   - password: <# Change this to whatever your MySQL password is
   - database:volunteer_site_362
1. Open an elevated command prompt in the server folder and execute `npm start`.
1. Open a second elevated command prompt in the client folder and execute `npm run dev`.
1. Load the main web page with either 1) ctrl + click the link in the `client` terminal, or 2) load the `http://localhost:5173/login`
