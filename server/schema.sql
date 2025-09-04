-- Drop tables in reverse order of creation to avoid foreign key constraints
DROP TABLE IF EXISTS event_attendees;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS managers;
DROP TABLE IF EXISTS users;

-- Create the users table.
-- This table stores information for all users, including managers.
-- The is_manager flag is kept for easier querying by the frontend.
CREATE TABLE IF NOT EXISTS users (
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    mobile VARCHAR(15),
    address TEXT,
    is_manager TINYINT NOT NULL DEFAULT 0,
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME
);

-- Create the managers table.
-- This table explicitly defines which users have manager roles.
CREATE TABLE IF NOT EXISTS managers (
	manager_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE, -- Each user can only be a manager once
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create the events table.
CREATE TABLE IF NOT EXISTS events (
    event_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    address TEXT NOT NULL,
    event_manager_id INT NOT NULL,
    FOREIGN KEY (event_manager_id) REFERENCES users(user_id)
);

-- Create the event_attendees join table.
CREATE TABLE IF NOT EXISTS event_attendees (
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- --- DUMMY DATA ---
-- Use a correct hash for 'password123'. In a real app, never store plain text passwords.
-- Hash generated using: console.log(bcrypt.hashSync('password123', 10));
-- The hash is: $2a$10$kbc4T.e5V6ecPrwHwIE.Uu9S222955jjp3y4.iB.PfYg02I7oVn4S

-- Insert users
INSERT INTO users (user_id, name, email, username, password_hash, is_manager) VALUES
(1, 'Alice Johnson', 'alice.j@example.com', 'alicej', '$2a$10$kbc4T.e5V6ecPrwHwIE.Uu9S222955jjp3y4.iB.PfYg02I7oVn4S', 1),
(2, 'Bob Williams', 'bob.w@example.com', 'bobw', '$2a$10$kbc4T.e5V6ecPrwHwIE.Uu9S222955jjp3y4.iB.PfYg02I7oVn4S', 1),
(3, 'Charlie Brown', 'charlie.b@example.com', 'charlieb', '$2a$10$kbc4T.e5V6ecPrwHwIE.Uu9S222955jjp3y4.iB.PfYg02I7oVn4S', 0),
(4, 'Diana Prince', 'diana.p@example.com', 'dianap', '$2a$10$kbc4T.e5V6ecPrwHwIE.Uu9S222955jjp3y4.iB.PfYg02I7oVn4S', 0),
(5, 'Eve Adams', 'eve.a@example.com', 'evea', '$2a$10$kbc4T.e5V6ecPrwHwIE.Uu9S222955jjp3y4.iB.PfYg02I7oVn4S', 0),
(6, 'Frank Miller', 'frank.m@example.com', 'frankm', '$2a$10$kbc4T.e5V6ecPrwHwIE.Uu9S222955jjp3y4.iB.PfYg02I7oVn4S', 0),
(7, 'Grace Lee', 'grace.l@example.com', 'gracel', '$2a$10$kbc4T.e5V6ecPrwHwIE.Uu9S222955jjp3y4.iB.PfYg02I7oVn4S', 0);


-- Populate the managers table with the user_ids of the managers
INSERT INTO managers (user_id) VALUES
(1), -- Alice Johnson
(2); -- Bob Williams

-- Insert events
INSERT INTO events (event_id, title, date, address, event_manager_id) VALUES
(1, 'Annual Tech Conference 2025', '2025-10-20 09:00:00', '123 Tech Park, Silicon Valley, CA', 1),
(2, 'Marketing Summit 2025', '2025-11-15 10:00:00', '456 Market St, San Francisco, CA', 2),
(3, 'Local Charity Gala', '2025-12-05 18:30:00', '789 Community Hall, Fullerton, CA', 1);

-- Insert event attendees
INSERT INTO event_attendees (event_id, user_id) VALUES
(1, 1), (1, 3), (1, 4), (1, 6), -- Tech Conference attendees
(2, 2), (2, 5), (2, 7),       -- Marketing Summit attendees
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5); -- Charity Gala attendees

