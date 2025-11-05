CREATE DATABASE volunteer_site_362;
USE volunteer_site_362;

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
    user_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
);

-- Create the events table.
CREATE TABLE IF NOT EXISTS events (
    event_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    address TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    event_manager_id INT NOT NULL,
    FOREIGN KEY (event_manager_id)
        REFERENCES users (user_id)
);

-- Create the event_attendees join table.
CREATE TABLE IF NOT EXISTS event_attendees (
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (event_id , user_id),
    FOREIGN KEY (event_id)
        REFERENCES events (event_id),
    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
);

-- --- DUMMY DATA ---
-- Hash for 'password123': $2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty

-- Insert original users
INSERT INTO users (user_id, name, email, username, password_hash, is_manager) VALUES
(1, 'Alice Johnson', 'alice.j@example.com', 'alicej', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 1),
(2, 'Bob Williams', 'bob.w@example.com', 'bobw', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 1),
(3, 'Charlie Brown', 'charlie.b@example.com', 'charlieb', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(4, 'Diana Prince', 'diana.p@example.com', 'dianap', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(5, 'Eve Adams', 'eve.a@example.com', 'evea', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(6, 'Frank Miller', 'frank.m@example.com', 'frankm', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(7, 'Grace Lee', 'grace.l@example.com', 'gracel', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(8, 'Henry Green', 'henry.g@example.com', 'henryg', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(9, 'Ivy Taylor', 'ivy.t@example.com', 'ivyt', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(10, 'Jack White', 'jack.w@example.com', 'jackw', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(11, 'Karen Black', 'karen.b@example.com', 'karenb', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(12, 'Leo King', 'leo.k@example.com', 'leok', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(13, 'Mona Scott', 'mona.s@example.com', 'monas', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(14, 'Nate Young', 'nate.y@example.com', 'natey', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(15, 'Olivia Hall', 'olivia.h@example.com', 'oliviah', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(16, 'Paul Allen', 'paul.a@example.com', 'paula', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(17, 'Quinn Clark', 'quinn.c@example.com', 'quinnc', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(18, 'Rachel Lewis', 'rachel.l@example.com', 'rachell', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(19, 'Sam Turner', 'sam.t@example.com', 'samt', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(20, 'Tina Baker', 'tina.b@example.com', 'tinab', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(21, 'Uma Patel', 'uma.p@example.com', 'umap', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(22, 'Vince Carter', 'vince.c@example.com', 'vincec', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(23, 'Wendy Harris', 'wendy.h@example.com', 'wendyh', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(24, 'Xavier Rodriguez', 'xavier.r@example.com', 'xavierr', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(25, 'Yara Martinez', 'yara.m@example.com', 'yaram', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(26, 'Zane Garcia', 'zane.g@example.com', 'zaneg', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(27, 'Aaron Hill', 'aaron.h@example.com', 'aaronh', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(28, 'Betty Cooper', 'betty.c@example.com', 'bettyc', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(29, 'Carl Long', 'carl.l@example.com', 'carll', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(30, 'Donna Moore', 'donna.m@example.com', 'donnam', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0),
(31, 'Test Admin', 'admin@example.com', 'admin', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 1),
(32, 'Test User', 'user@example.com', 'user', '$2a$12$dYTPyk7npBOFUuXkyq4I9.Z2QxeDxF4qdw.I9ZEGBHC/aeLfC1mty', 0);


-- Populate the managers table with the user_ids of the managers
INSERT INTO managers (user_id) VALUES
(1), -- Alice Johnson
(2); -- Bob Williams

-- Insert original events
INSERT INTO events (event_id, title, date, address, category, event_manager_id) VALUES
(1, 'Annual Tech Conference 2025', '2025-10-20 09:00:00', '123 Tech Park, Silicon Valley, CA', 'Conference', 1),
(2, 'Marketing Summit 2025', '2025-11-15 10:00:00', '456 Market St, San Francisco, CA', 'Community Service', 2),
(3, 'Local Charity Gala', '2025-12-05 18:30:00', '789 Community Hall, Fullerton, CA', 'Workshop', 1);

INSERT INTO events (event_id, title, date, address, event_manager_id) VALUES
(4, 'Fullerton Park Cleanup', '2025-09-15 09:00:00', '101 Fullerton Creek Rd, Fullerton, CA', 1),
(5, 'Web Development Workshop', '2025-09-22 11:00:00', '202 Chapman Ave, Fullerton, CA', 2),
(6, 'Annual Food Drive', '2025-10-05 08:00:00', '303 N State College Blvd, Fullerton, CA', 1),
(7, 'Community Bake Sale for Charity', '2025-10-18 10:00:00', '404 E Commonwealth Ave, Fullerton, CA', 2),
(8, 'Senior Center Tech Support Day', '2025-11-02 13:00:00', '505 W Bastanchury Rd, Fullerton, CA', 1),
(9, 'Holiday Toy Drive Kickoff', '2025-11-23 12:00:00', '606 N Euclid St, Fullerton, CA', 2),
(10, 'New Year Planning Meeting', '2026-01-10 18:00:00', '707 S Placentia Ave, Fullerton, CA', 1),
(11, 'Spring Gardening Event', '2026-03-21 09:30:00', '808 E Union Ave, Fullerton, CA', 2),
(12, 'Summer Festival Volunteer Booth', '2026-06-15 10:00:00', '909 W Orangethorpe Ave, Fullerton, CA', 1),
(13, 'Youth Mentorship Program Launch', '2026-02-12 16:00:00', '111 W Williamson Ave, Fullerton, CA', 2),
(14, 'Animal Shelter Adoption Day', '2026-04-18 11:00:00', '222 N Gilbert St, Fullerton, CA', 1),
(15, 'Resume Building Workshop', '2026-05-09 14:00:00', '333 E Imperial Hwy, Fullerton, CA', 2),
(16, 'Habitat for Humanity Build Day', '2026-07-25 07:30:00', '444 S Harbor Blvd, Fullerton, CA', 1),
(17, 'Quarterly Volunteer Mixer', '2026-09-30 19:00:00', '555 N Brea Blvd, Brea, CA', 2);


-- Insert original event attendees
INSERT INTO event_attendees (event_id, user_id) VALUES
(1, 1), (1, 3), (1, 4), (1, 6),
(2, 2), (2, 5), (2, 7),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5);

-- --- ADDITIONAL DUMMY EVENT ATTENDEES ---
INSERT INTO event_attendees (event_id, user_id) VALUES
-- Fullerton Park Cleanup (Event 4)
(4, 1), (4, 8), (4, 9), (4, 10), (4, 15), (4, 20), (4, 25),
-- Web Development Workshop (Event 5)
(5, 2), (5, 6), (5, 7), (5, 11), (5, 12), (5, 18), (5, 22), (5, 28), (5, 30),
-- Annual Food Drive (Event 6)
(6, 1), (6, 3), (6, 5), (6, 7), (6, 9), (6, 11), (6, 13), (6, 15), (6, 17), (6, 19), (6, 21), (6, 23), (6, 25), (6, 27), (6, 29),
-- Community Bake Sale (Event 7)
(7, 2), (7, 4), (7, 8), (7, 12), (7, 16), (7, 20), (7, 24),
-- Senior Center Tech Support (Event 8)
(8, 1), (8, 14), (8, 18), (8, 22), (8, 26), (8, 30),
-- Holiday Toy Drive (Event 9)
(9, 2), (9, 3), (9, 6), (9, 9), (9, 12), (9, 15), (9, 18), (9, 21), (9, 24), (9, 27), (9, 30),
-- New Year Planning (Event 10)
(10, 1), (10, 2), (10, 5), (10, 10), (10, 15), (10, 20),
-- Spring Gardening (Event 11)
(11, 2), (11, 8), (11, 13), (11, 19), (11, 23),
-- Summer Festival (Event 12)
(12, 1), (12, 4), (12, 5), (12, 9), (12, 14), (12, 19), (12, 24), (12, 29),
-- Youth Mentorship (Event 13)
(13, 2), (13, 7), (13, 11), (13, 17), (13, 21), (13, 28),
-- Animal Shelter (Event 14)
(14, 1), (14, 9), (14, 10), (14, 16), (14, 25), (14, 26),
-- Resume Workshop (Event 15)
(15, 2), (15, 12), (15, 20), (15, 22), (15, 29),
-- Habitat for Humanity (Event 16)
(16, 1), (16, 3), (16, 8), (16, 11), (16, 14), (16, 17), (16, 20), (16, 23), (16, 26), (16, 29),
-- Volunteer Mixer (Event 17)
(17, 1), (17, 2), (17, 3), (17, 4), (17, 5), (17, 6), (17, 7), (17, 8), (17, 9), (17, 10), (17, 11), (17, 12), (17, 13), (17, 14), (17, 15), (17, 16), (17, 17), (17, 18), (17, 19), (17, 20), (17, 21), (17, 22), (17, 23), (17, 24), (17, 25), (17, 26), (17, 27), (17, 28), (17, 29), (17, 30);