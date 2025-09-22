# CPSC 362 Project

## Members

- Brite Bartnek
- Daniel Lim
- Gilbert Cervantes

## Description

A volunteer-focused website where they can log events, sign in to a profile, and view event history.

## Environment Setup

This project uses environment variables to handle sensitive information like API keys and secrets. To run the project locally, you will need to create your own `.env` files.

### 1. Server Setup

Navigate to the `server` directory and create your environment file:

```bash
cd server
cp env.txt .env
```

Now, open the newly created server/.env file and replace the placeholder values with your own secrets.

### 2. Client Setup

Navigate to the client directory and create your environment file:

```bash
cd client
cp env.txt .env
```

Now, open the newly created client/.env file and add your Google Maps API key.

Go to the [Google Cloud Console](https://console.cloud.google.com/) to get an API key.

- Create a new project
- Open the navigation menu and go to `APIs & Services`.
- Add the `JavaScript Maps API` and `Places API`. Use the old `Places API` as the `Places API (New)` is paid.

## Running the server/site

1. Clone the repository/download the .zip
2. Load the schema.sql in MySQL and run the file. Set up your server to be whatever you want. Make sure to edit /server/server.js and client/vite.config.js to point to your MySQL server setup.
   - Defaults to:
   - localhost:3001(server)|5173(client)
   - user:root <# Change this to whatever your MySQL connection is
   - password: <# Change this to whatever your MySQL password is
   - database:volunteer_site_362
3. Open an elevated command prompt in the server folder and execute `npm install` and then `npm start`.
4. Open a second elevated command prompt in the client folder and execute `npm install` and then `npm run dev`.
5. Load the main web page with either 1) ctrl + click the link in the `client` terminal, or 2) load the `http://localhost:5173/login`
