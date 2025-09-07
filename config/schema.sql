-- This script creates the database and tables for the Helply application.
-- It is based on the ER diagram provided in the project documentation.
-- This version removes the explicit 'role' column from the user table.

-- Create the database if it doesn't already exist.
CREATE DATABASE IF NOT EXISTS helply_db;

-- Switch to the newly created database.
USE helply_db;

--
-- Table structure for table `user`
--
CREATE TABLE `user` (
  `User_ID` INT PRIMARY KEY AUTO_INCREMENT,
  `Name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(20),
  `password` VARCHAR(255) NOT NULL
);

--
-- Table structure for table `service_category`
--
CREATE TABLE `service_category` (
  `Service_ID` INT PRIMARY KEY AUTO_INCREMENT,
  `Name` VARCHAR(255) NOT NULL,
  `Description` TEXT
);

--
-- Table structure for table `job`
--
CREATE TABLE `job` (
  `Job_ID` INT PRIMARY KEY AUTO_INCREMENT,
  `Title` VARCHAR(255) NOT NULL,
  `Description` TEXT NOT NULL,
  `Location` VARCHAR(255),
  `Salary` DECIMAL(10, 2),
  `Type` VARCHAR(100) COMMENT 'e.g., One-time, Part-time',
  `Requirements` TEXT,
  `User_id_FK` INT,
  `Service_id_FK` INT,
  FOREIGN KEY (`User_id_FK`) REFERENCES `user`(`User_ID`) ON DELETE CASCADE,
  FOREIGN KEY (`Service_id_FK`) REFERENCES `service_category`(`Service_ID`) ON DELETE SET NULL
);

--
-- Table structure for table `application`
--
CREATE TABLE `application` (
  `Application_ID` INT PRIMARY KEY AUTO_INCREMENT,
  `applied_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `resume_letter` TEXT,
  `Cover_letter` TEXT,
  `user_id_FK` INT,
  `job_id_FK` INT,
  FOREIGN KEY (`user_id_FK`) REFERENCES `user`(`User_ID`) ON DELETE CASCADE,
  FOREIGN KEY (`job_id_FK`) REFERENCES `job`(`Job_ID`) ON DELETE CASCADE
);

--
-- Table structure for table `review`
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


-- --- Sample Data Insertion ---
-- You can use this section to insert some initial data for testing.

INSERT INTO `user` (`Name`, `email`, `phone`, `password`) VALUES
('John Doe', 'john.doe@example.com', '+1 (555) 123-4567', 'password123'),
('Jane Smith', 'jane.smith@example.com', '+1 (555) 987-6543', 'password456');

INSERT INTO `service_category` (`Name`, `Description`) VALUES
('Babysitting', 'Child care services'),
('Tuition', 'Educational tutoring services'),
('Cleaning', 'Home and office cleaning services'),
('Electrical', 'Electrical repair and installation services');

