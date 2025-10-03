-- This database schema is designed to work with the provided app.js backend logic.
-- It includes all necessary tables and columns for user authentication, job postings, and applications.

-- Create the database if it doesn't already exist.
CREATE DATABASE IF NOT EXISTS helply_db;

-- Switch to the newly created database.
USE helply_db;

--
-- Table structure for table `user`
-- Corresponds to the data collected in the `/signup` route and used in `/signin` and `/profile`.
--
CREATE TABLE `user` (
  `User_ID` INT PRIMARY KEY AUTO_INCREMENT,
  `Name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20),
  `location` VARCHAR(255),
  `password` VARCHAR(255) NOT NULL COMMENT 'Password is hashed by bcrypt in app.js'
  `Skills` TEXT COMMENT 'User-defined skills, comma-separated'
);

--
-- Table structure for table `service_category`
-- Used to categorize jobs. Can be used to dynamically populate the 'Category' dropdown on hire.ejs.
--
CREATE TABLE `service_category` (
  `Service_ID` INT PRIMARY KEY AUTO_INCREMENT,
  `Name` VARCHAR(255) NOT NULL,
  `Description` TEXT
);

--
-- Table structure for table `job`
-- Corresponds to the data handled by the `/api/jobs` GET and POST endpoints.
--
CREATE TABLE `job` (
  `Job_ID` INT PRIMARY KEY AUTO_INCREMENT,
  `Title` VARCHAR(255) NOT NULL,
  `Description` TEXT NOT NULL,
  `Location` VARCHAR(255),
  `Salary` DECIMAL(10, 2),
  `Type` VARCHAR(100) COMMENT 'This is used as the "category" in app.js',
  `Requirements` TEXT,
  `ContactInfo` VARCHAR(255) NOT NULL COMMENT 'Collected from the hire.ejs form',
  `JobStatus` VARCHAR(50) NOT NULL DEFAULT 'Open' COMMENT 'Used to filter jobs in the GET /api/jobs route',
  `User_id_FK` INT COMMENT 'The ID of the user who posted the job, from session data',
  `Service_id_FK` INT,
  FOREIGN KEY (`User_id_FK`) REFERENCES `user`(`User_ID`) ON DELETE CASCADE,
  FOREIGN KEY (`Service_id_FK`) REFERENCES `service_category`(`Service_ID`) ON DELETE SET NULL
);

--
-- Table structure for table `application`
-- Corresponds to the data handled by the POST /api/applications endpoint.
--
CREATE TABLE `application` (
  `Application_ID` INT PRIMARY KEY AUTO_INCREMENT,
  `applied_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `resume_letter` TEXT,
  `Cover_letter` TEXT COMMENT 'Collected from the job-request form',
  `Status` VARCHAR(50) NOT NULL DEFAULT 'Pending' COMMENT 'e.g., Pending, Accepted, Rejected',
  `user_id_FK` INT COMMENT 'The ID of the applicant, from session data',
  `job_id_FK` INT COMMENT 'The ID of the job being applied for',
  FOREIGN KEY (`user_id_FK`) REFERENCES `user`(`User_ID`) ON DELETE CASCADE,
  FOREIGN KEY (`job_id_FK`) REFERENCES `job`(`Job_ID`) ON DELETE CASCADE
);

--
-- Table structure for table `review`
-- (For future use, not directly implemented in the current app.js)
--
CREATE TABLE `review` (
  `Review_ID` INT PRIMARY KEY AUTO_INCREMENT,
  `Rating` INT CHECK (Rating >= 1 AND Rating <= 5),
  `Review_message` TEXT,
  `Created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `Reviewer_id` INT,
  `Job_id_FK` INT,
  FOREIGN KEY (`Reviewer_id`) REFERENCES `user`(`User_ID`) ON DELETE CASCADE,
  FOREIGN KEY (`Job_id_FK`) REFERENCES `job`(`Job_ID`) ON DELETE CASCADE
);

--
-- Table structure for table `payment`
-- (For future use, not directly implemented in the current app.js)
--
CREATE TABLE `payment` (
  `Payment_ID` INT PRIMARY KEY AUTO_INCREMENT,
  `Amount` DECIMAL(10, 2) NOT NULL,
  `Status` VARCHAR(50),
  `Timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `Payer_id` INT,
  `Receiver_id` INT,
  `Job_id_FK` INT,
  FOREIGN KEY (`Payer_id`) REFERENCES `user`(`User_ID`) ON DELETE SET NULL,
  FOREIGN KEY (`Receiver_id`) REFERENCES `user`(`User_ID`) ON DELETE SET NULL,
  FOREIGN KEY (`Job_id_FK`) REFERENCES `job`(`Job_ID`) ON DELETE SET NULL
);

