# CPSC 362 Project - Event Manager

## Members
- Brite Bartnek
- Daniel Lim
- Gilbert Cervantes

## Description
A volunteer-focused platform for logging events, managing profiles, and tracking event history. This project utilizes a **unified monorepo** architecture, allowing the React frontend to be served directly via the Express backend.

---

## 🛠 Environment Setup

The project requires specific environment variables to bridge the connection between the client, server, and external APIs.

### 1. Root Directory (.env)

Create a `.env` file in the **root** folder (the top level of the project) to handle backend security and database access:

```env
# Security
MANAGER_SECRET_KEY=your_manager_password
JWT_SECRET=your_jwt_signing_key
PASSWORD_RESET_EXPIRES_MS=3600000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=volunteer_site_362
```

### 2. Client Directory (.env)

Navigate to the `client` folder and create a second `.env` file for frontend-specific keys:

```bash
cd client
# Add your Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

*Note: Ensure the **Maps JavaScript API** and **Places API** are enabled in your [Google Cloud Console](https://console.cloud.google.com/).*

---

## 🚀 Running the Project Locally

### 1. Database Setup

Execute the `schema.sql` file in your MySQL environment. Ensure the credentials in your root `.env` match your local MySQL configuration.

### 2. Install All Dependencies

From the **root** folder, run this command to install packages for the root, client, and server simultaneously:

```bash
npm run install-all
```

### 3. Execution Commands

| Mode            | Command        | Description                                                        |
| :-------------- | :------------- | :----------------------------------------------------------------- |
| **Development** | `npm run dev`  | Runs Vite (5173) and Node (3001) concurrently with hot-reload.     |
| **Production**  | `npm run prod` | Builds React and serves it via Express (3001) as a single process. |

---

## 🌐 Deployment (Render / Railway)

This project is optimized for modern cloud platforms. By serving the frontend via the backend, you only need to deploy **one** web service.

### Configuration Settings

- **Build Command:** ```npm run install-all && npm run build```
- **Start Command:** ```npm run start```
- **Environment Variables:*3001* Ensure all variables from your root `.env` are added to the platform's dashboard. Update `DB_HOST` to your production database URL.

---

## 📂 Project Structure

- **/client**: React + Vite frontend.
- **/server**: Express API, database logic, and middleware.
- **/server/server.js**: The single entry point that manages API requests and serves the built frontend.
- **/eslint.config.js**: Unified linting rules for the entire workspace.
- 