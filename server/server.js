import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const app = express();
const port = 3001;

dotenv.config();

const MANAGER_SECRET_KEY = process.env.MANAGER_SECRET_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const PASSWORD_RESET_EXPIRES_MS =
  process.env.PASSWORD_RESET_EXPIRES_MS || 3600000;
const JWT_EXPIRES_IN = "2h";

// --- Database Connection ---
const db = mysql
  .createPool({
    host: "localhost",
    user: "root",
    password: "11374932", // Your MySQL password
    database: "volunteer_site_362",
    timezone: "Z",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// Root endpoint to confirm the API server is running.
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Event Manager API. Server is running." });
});

// --- Authentication and User Management ---

// 1. User Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }
    const [[user]] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        is_manager: !!user.is_manager,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return token + user data (without password hash)
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "An error occurred during login." });
  }
});

// 2. Create New User (Register)
app.post("/api/users", async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { name, email, username, password, managerSecret } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const [[existingUser]] = await connection.query(
      "SELECT user_id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (existingUser) {
      connection.release();
      return res
        .status(409)
        .json({ message: "Username or email already in use." });
    }

    let isManager = 0;
    if (managerSecret && managerSecret === MANAGER_SECRET_KEY) {
      isManager = 1;
    }

    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await connection.query(
      "INSERT INTO users (name, email, username, password_hash, is_manager) VALUES (?, ?, ?, ?, ?)",
      [name, email, username, passwordHash, isManager]
    );

    if (isManager) {
      const newUserId = result.insertId;
      await connection.query("INSERT INTO managers (user_id) VALUES (?)", [
        newUserId,
      ]);
    }

    await connection.commit();

    const message =
      isManager ?
        "Manager account created successfully. Please log in."
      : "User created successfully. Please log in.";

    res.status(201).json({ message });
  } catch (err) {
    await connection.rollback();
    console.error("Registration error:", err);
    res.status(500).json({ message: "An error occurred during registration." });
  } finally {
    if (connection) connection.release();
  }
});

// Setup Nodemailer transporter globally
// Create a test account and transporter for sending emails
console.log("Generating Ethereal test account...");
const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: testAccount.user, // generated ethereal user
    pass: testAccount.pass, // generated ethereal password
  },
});
console.log(`Ethereal Account created: ${testAccount.user}`);

// 3. Forgot Password
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const [[user]] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    const genericMessage =
      "If a user with that email exists, a password reset link has been sent.";

    if (!user) {
      return res.json({ message: genericMessage });
    }

    // ... Token generation and DB update logic ...
    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + parseInt(PASSWORD_RESET_EXPIRES_MS));
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    await db.query(
      "UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE user_id = ?",
      [token, expires, user.user_id]
    );

    // Define the email content
    const mailOptions = {
      from: `"Support Team" <no-reply@test.com>`,
      to: email,
      subject: "Password Reset Instructions",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    // Send the email using the global 'transporter' variable
    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    // Send success response to client
    return res.json({ message: genericMessage });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "An error occurred." });
  }
});

// 4. Reset Password
app.post("/api/reset-password/:token", async (req, res) => {
  try {
    const now = new Date();
    const { token } = req.params;
    const { password } = req.body;

    const [[user]] = await db.query(
      "SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > ?",
      [token, now]
    );

    console.log("--- PASSWORD TOKEN CHECK ---");
    console.log(`Checking token at: ${now.toLocaleString()}`);
    if (user) {
      console.log(
        `Found user. Token expires at: ${new Date(
          user.password_reset_expires
        ).toLocaleString()}`
      );
    } else {
      console.log(
        "No valid user found for this token. It may be invalid or expired."
      );
    }
    console.log("--------------------------");

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.query(
      "UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE user_id = ?",
      [passwordHash, user.user_id]
    );

    res.json({ message: "Password has been updated successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "An error occurred." });
  }
});

// --- Core Application Data Endpoints ---

// Get all users (for manager's attendee selection)
app.get("/api/users", async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT user_id, name, is_manager FROM users ORDER BY name"
    );
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users from database." });
  }
});

// Get ALL events for the main dashboard view
app.get("/api/events", async (req, res) => {
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
    res.status(500).json({ message: "Error fetching events." });
  }
});

app.get("/api/events/categories", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DISTINCT category FROM events WHERE category IS NOT NULL AND category <> '' ORDER BY category ASC"
    );
    // Map the array of objects ({ category: 'Name' }) to an array of strings ['Name']
    const categories = rows.map((row) => row.category);
    res.json(categories);
  } catch (err) {
    console.error("Error fetching event categories:", err);
    res.status(500).json({ message: "Error fetching event categories." });
  }
});

// Get event IDs a specific user is attending
app.get("/api/users/:userId/attending", async (req, res) => {
  try {
    const { userId } = req.params;
    const [attendingEvents] = await db.query(
      "SELECT event_id FROM event_attendees WHERE user_id = ?",
      [userId]
    );
    res.json(attendingEvents.map((e) => e.event_id));
  } catch (err) {
    console.error(
      `Error fetching attending events for user ${req.params.userId}:`,
      err
    );
    res.status(500).json({ message: "Error fetching user data." });
  }
});

// Get attendees for a specific event
app.get("/api/events/:eventId/attendees", async (req, res) => {
  try {
    const { eventId } = req.params;
    const [attendees] = await db.query(
      `SELECT u.user_id, u.name, u.email, u.is_manager FROM event_attendees ea JOIN users u ON ea.user_id = u.user_id WHERE ea.event_id = ? ORDER BY u.name`,
      [eventId]
    );
    res.json(attendees);
  } catch (err) {
    console.error(
      `Error fetching attendees for event ${req.params.eventId}:`,
      err
    );
    res.status(500).json({ message: "Error fetching event attendees." });
  }
});

// Add a specific user to an event
app.post("/api/events/:eventId/attendees", requireManager, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body; // User ID comes from the request body

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Check if the user is already attending
    const [[existing]] = await db.query(
      "SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?",
      [eventId, userId]
    );
    if (existing) {
      return res
        .status(409)
        .json({ message: "User is already attending this event." });
    }

    await db.query(
      "INSERT INTO event_attendees (event_id, user_id) VALUES (?, ?)",
      [eventId, userId]
    );
    res.status(201).json({ message: "User successfully added to the event." });
  } catch (err) {
    console.error("Error adding user to event:", err);
    res.status(500).json({ message: "Error adding user to event." });
  }
});

// Remove a specific user from an event
app.delete(
  "/api/events/:eventId/attendees/:userId",
  requireManager,
  async (req, res) => {
    try {
      const { eventId, userId } = req.params;
      await db.query(
        "DELETE FROM event_attendees WHERE event_id = ? AND user_id = ?",
        [eventId, userId]
      );
      res.json({ message: "User has been removed from the event." });
    } catch (err) {
      console.error("Error removing user from event:", err);
      res.status(500).json({ message: "Error removing user from event." });
    }
  }
);

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
app.post("/api/events", requireManager, async (req, res) => {
  try {
    const { title, date, address, category } = req.body;
    const managerId = req.user.user_id;

    const formattedDate = new Date(date)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await db.query(
      "INSERT INTO events (title, date, address, category, event_manager_id) VALUES (?, ?, ?, ?, ?)",
      [title, formattedDate, address, category, managerId]
    );
    res.status(201).json({ message: "Event created successfully." });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Error creating event." });
  }
});

// Update an event
app.put("/api/events/:eventId", requireManager, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, date, address, category } = req.body;
    const formattedDate = new Date(date)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await db.query(
      "UPDATE events SET title = ?, date = ?, address = ?, category = ? WHERE event_id = ?",
      [title, formattedDate, address, category, eventId]
    );
    res.json({ message: "Event updated successfully." });
  } catch (err) {
    console.error(`Error updating event ${req.params.eventId}:`, err);
    res.status(500).json({ message: "Error updating event." });
  }
});

// Delete an event
app.delete("/api/events/:eventId", requireManager, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { eventId } = req.params;

    await connection.beginTransaction();
    await connection.query("DELETE FROM event_attendees WHERE event_id = ?", [
      eventId,
    ]);
    await connection.query("DELETE FROM events WHERE event_id = ?", [eventId]);
    await connection.commit();

    res.json({ message: "Event deleted successfully." });
  } catch (err) {
    await connection.rollback();
    console.error(`Error deleting event ${req.params.eventId}:`, err);
    res.status(500).json({ message: "Error deleting event." });
  } finally {
    if (connection) connection.release();
  }
});

// --- Regular User Endpoints ---

// Attend an event
app.post("/api/events/:eventId/attend", requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.user_id; // secure from JWT

    const [[existing]] = await db.query(
      "SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?",
      [eventId, userId]
    );
    if (existing) {
      return res
        .status(409)
        .json({ message: "You are already attending this event." });
    }

    await db.query(
      "INSERT INTO event_attendees (event_id, user_id) VALUES (?, ?)",
      [eventId, userId]
    );
    res.status(201).json({ message: "Successfully registered for the event." });
  } catch (err) {
    console.error("Error attending event:", err);
    res.status(500).json({ message: "Error registering for event." });
  }
});

// Unattend an event
app.delete("/api/events/:eventId/unattend", requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.user_id; // secure from JWT

    await db.query(
      "DELETE FROM event_attendees WHERE event_id = ? AND user_id = ?",
      [eventId, userId]
    );
    res.json({ message: "You have been removed from the event." });
  } catch (err) {
    console.error("Error unattending event:", err);
    res.status(500).json({ message: "Error removing from event." });
  }
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found." });
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
