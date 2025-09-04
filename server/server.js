import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from "jsonwebtoken";

const app = express();
const port = 3001;

// In a production environment, this should be stored as an environment variable, not in the code.
const MANAGER_SECRET_KEY = 'secretkey123';

const JWT_SECRET = "openphrase123"; // ⚠️ move to .env in production
const JWT_EXPIRES_IN = "2h"; // or whatever you prefer

// --- Database Connection ---
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '11374932', // Your MySQL password
    database: 'react_mysql_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// Root endpoint to confirm the API server is running.
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Event Manager API. Server is running.' });
});

// --- Authentication and User Management ---

// 1. User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }
        const [[user]] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { user_id: user.user_id, is_manager: !!user.is_manager },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Return token + user data (without password hash)
        const { password_hash, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
});

// 2. Create New User (Register)
app.post('/api/users', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { name, email, username, password, managerSecret } = req.body;
        if (!name || !email || !username || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        
        const [[existingUser]] = await connection.query('SELECT user_id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser) {
            connection.release();
            return res.status(409).json({ message: 'Username or email already in use.' });
        }

        let isManager = 0;
        if (managerSecret && managerSecret === MANAGER_SECRET_KEY) {
            isManager = 1;
        }

        await connection.beginTransaction();

        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await connection.query('INSERT INTO users (name, email, username, password_hash, is_manager) VALUES (?, ?, ?, ?, ?)', [name, email, username, passwordHash, isManager]);
        
        if (isManager) {
            const newUserId = result.insertId;
            await connection.query('INSERT INTO managers (user_id) VALUES (?)', [newUserId]);
        }
        
        await connection.commit();
        
        const message = isManager 
            ? 'Manager account created successfully. Please log in.' 
            : 'User created successfully. Please log in.';

        res.status(201).json({ message });

    } catch (err) {
        await connection.rollback();
        console.error("Registration error:", err);
        res.status(500).json({ message: 'An error occurred during registration.' });
    } finally {
        if (connection) connection.release();
    }
});

// 3. Forgot Password
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const [[user]] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            // Always return a generic message to prevent email enumeration attacks
            return res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
        }
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // Token expires in 1 hour
        await db.query('UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE user_id = ?', [token, expires, user.user_id]);

        // In a real application, you would use a service like SendGrid or Nodemailer to send an email.
        console.log('--- PASSWORD RESET ---');
        console.log(`User: ${user.email}`);
        console.log(`Reset Link: http://localhost:5173/reset-password/${token}`); // Assuming frontend runs on 5173
        console.log('--------------------');

        res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

// 4. Reset Password
app.post('/api/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const [[user]] = await db.query('SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()', [token]);

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE user_id = ?', [passwordHash, user.user_id]);

        res.json({ message: 'Password has been updated successfully.' });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

// --- Core Application Data Endpoints ---

// Get all users (for manager's attendee selection)
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT user_id, name, is_manager FROM users ORDER BY name');
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: 'Error fetching users from database.' });
    }
});

// Get ALL events for the main dashboard view
app.get('/api/events', async (req, res) => {
    try {
        const [events] = await db.query(`
            SELECT 
                e.*, 
                m.name as manager_name,
                (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.event_id) as attendee_count
            FROM events e
            LEFT JOIN users m ON e.event_manager_id = m.user_id
            ORDER BY e.date
        `);
        res.json(events);
    } catch (err) {
        console.error("Error fetching all events:", err);
        res.status(500).json({ message: 'Error fetching events.' });
    }
});

// Get event IDs a specific user is attending
app.get('/api/users/:userId/attending', async (req, res) => {
    try {
        const { userId } = req.params;
        const [attendingEvents] = await db.query(`
            SELECT e.event_id 
            FROM event_attendees ea 
            JOIN events e ON ea.event_id = e.event_id 
            WHERE ea.user_id = ?`, [userId]);
        res.json(attendingEvents.map(e => e.event_id)); // Return just an array of event IDs
    } catch (err) {
        console.error(`Error fetching attending events for user ${req.params.userId}:`, err);
        res.status(500).json({ message: 'Error fetching user data.' });
    }
});

// Get attendees for a specific event
app.get('/api/events/:eventId/attendees', async (req, res) => {
    try {
        const { eventId } = req.params;
        const [attendees] = await db.query(`SELECT u.user_id, u.name, u.email FROM event_attendees ea JOIN users u ON ea.user_id = u.user_id WHERE ea.event_id = ? ORDER BY u.name`, [eventId]);
        res.json(attendees);
    } catch (err) {
        console.error(`Error fetching attendees for event ${req.params.eventId}:`, err);
        res.status(500).json({ message: 'Error fetching event attendees.' });
    }
});

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing." });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { user_id, is_manager }
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
}

function requireManager(req, res, next) {
    requireAuth(req, res, () => {
        if (!req.user.is_manager) {
            return res.status(403).json({ message: "Managers only." });
        }
        next();
    });
}

// --- Manager-Only Endpoints ---

// Create a new event
app.post('/api/events', requireManager, async (req, res) => {
    try {
        const { title, date, address } = req.body;
        const managerId = req.user.user_id; // from JWT

        await db.query('INSERT INTO events (title, date, address, event_manager_id) VALUES (?, ?, ?, ?)', 
            [title, date, address, managerId]);
        res.status(201).json({ message: 'Event created successfully.' });
    } catch (err) {
        console.error("Error creating event:", err);
        res.status(500).json({ message: 'Error creating event.' });
    }
});

// Update an event
app.put('/api/events/:eventId', requireManager, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { title, date, address } = req.body;

        await db.query('UPDATE events SET title = ?, date = ?, address = ? WHERE event_id = ?', 
            [title, date, address, eventId]);
        res.json({ message: 'Event updated successfully.' });
    } catch (err) {
        console.error(`Error updating event ${req.params.eventId}:`, err);
        res.status(500).json({ message: 'Error updating event.' });
    }
});

// Delete an event
app.delete('/api/events/:eventId', requireManager, async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { eventId } = req.params;

        await connection.beginTransaction();
        await connection.query('DELETE FROM event_attendees WHERE event_id = ?', [eventId]);
        await connection.query('DELETE FROM events WHERE event_id = ?', [eventId]);
        await connection.commit();

        res.json({ message: 'Event deleted successfully.' });
    } catch (err) {
        await connection.rollback();
        console.error(`Error deleting event ${req.params.eventId}:`, err);
        res.status(500).json({ message: 'Error deleting event.' });
    } finally {
        if(connection) connection.release();
    }
});

// --- Regular User Endpoints ---

// Attend an event
app.post('/api/events/:eventId/attend', requireAuth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.user_id; // secure from JWT

        const [[existing]] = await db.query(
            'SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?', 
            [eventId, userId]
        );
        if (existing) {
            return res.status(409).json({ message: 'You are already attending this event.' });
        }

        await db.query('INSERT INTO event_attendees (event_id, user_id) VALUES (?, ?)', [eventId, userId]);
        res.status(201).json({ message: 'Successfully registered for the event.' });
    } catch (err) {
        console.error('Error attending event:', err);
        res.status(500).json({ message: 'Error registering for event.' });
    }
});

// Unattend an event
app.delete('/api/events/:eventId/unattend', requireAuth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.user_id; // secure from JWT

        await db.query('DELETE FROM event_attendees WHERE event_id = ? AND user_id = ?', [eventId, userId]);
        res.json({ message: 'You have been removed from the event.' });
    } catch (err) {
        console.error('Error unattending event:', err);
        res.status(500).json({ message: 'Error removing from event.' });
    }
});



// Catch-all 404
app.use((req, res) => {
    res.status(404).json({ message: 'API endpoint not found.' });
});

// --- Server Start ---
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});