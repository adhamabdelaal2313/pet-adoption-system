-- Active: 1766094170288@@gateway01.eu-central-1.prod.aws.tidbcloud.com@4000@pet_adoption
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables (order doesn't matter when FK checks are disabled)
DROP TABLE IF EXISTS Follow_Ups;
DROP TABLE IF EXISTS Applications;
DROP TABLE IF EXISTS adoptions; -- In case it exists with different naming
DROP TABLE IF EXISTS Medical_Records;
DROP TABLE IF EXISTS Animals;
DROP TABLE IF EXISTS Adopters;
DROP TABLE IF EXISTS Breeds;
DROP TABLE IF EXISTS Species;
DROP TABLE IF EXISTS Shelters;
DROP TABLE IF EXISTS Users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- 2. CREATE TABLES (The Structure)

CREATE TABLE Species (
    SpeciesID INT AUTO_INCREMENT PRIMARY KEY,
    SpeciesName VARCHAR(50) NOT NULL
);

CREATE TABLE Breeds (
    BreedID INT AUTO_INCREMENT PRIMARY KEY,
    SpeciesID INT,
    BreedName VARCHAR(100) NOT NULL,
    FOREIGN KEY (SpeciesID) REFERENCES Species(SpeciesID)
);

CREATE TABLE Shelters (
    ShelterID INT AUTO_INCREMENT PRIMARY KEY,
    ShelterName VARCHAR(100),
    City VARCHAR(50),
    Capacity INT,
    Phone VARCHAR(20)
);

CREATE TABLE Animals (
    AnimalID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50),
    BreedID INT,
    ShelterID INT,
    DateOfBirth DATE,
    IntakeDate DATE,
    Gender CHAR(1), -- 'M' or 'F'
    Status VARCHAR(20) DEFAULT 'Available', -- Available, Pending, Adopted
    HealthStatus VARCHAR(50) DEFAULT 'Healthy', -- Healthy, Under Treatment, Special Needs
    ImageURL LONGTEXT, -- Base64 encoded image string
    FOREIGN KEY (BreedID) REFERENCES Breeds(BreedID),
    FOREIGN KEY (ShelterID) REFERENCES Shelters(ShelterID)
);

CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Adopters (
    AdopterID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(100) UNIQUE, -- Crucial for preventing duplicates
    Phone VARCHAR(20)
);

CREATE TABLE Medical_Records (
    RecordID INT AUTO_INCREMENT PRIMARY KEY,
    AnimalID INT,
    RecordDate DATE NOT NULL,
    RecordType VARCHAR(50) NOT NULL, -- Vaccination, Treatment, Checkup, Surgery
    Description TEXT,
    Veterinarian VARCHAR(100),
    Notes TEXT,
    FOREIGN KEY (AnimalID) REFERENCES Animals(AnimalID) ON DELETE CASCADE
);

CREATE TABLE Applications (
    AppID INT AUTO_INCREMENT PRIMARY KEY,
    AdopterID INT,
    AnimalID INT,
    AppDate DATE DEFAULT (CURDATE()),
    Status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Rejected, Completed
    Notes TEXT,
    FOREIGN KEY (AdopterID) REFERENCES Adopters(AdopterID),
    FOREIGN KEY (AnimalID) REFERENCES Animals(AnimalID)
);

CREATE TABLE Follow_Ups (
    FollowUpID INT AUTO_INCREMENT PRIMARY KEY,
    ApplicationID INT,
    FollowUpDate DATE NOT NULL,
    FollowUpType VARCHAR(50) NOT NULL, -- Phone Call, Home Visit, Email Check-in
    Notes TEXT,
    Status VARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled
    FOREIGN KEY (ApplicationID) REFERENCES Applications(AppID) ON DELETE CASCADE
);

-- 3. DUMMY DATA (5 rows per table)

-- Species (5 rows)
INSERT INTO Species (SpeciesName) VALUES 
('Dog'), 
('Cat'), 
('Rabbit'), 
('Bird'), 
('Hamster');

-- Breeds (5 rows)
INSERT INTO Breeds (SpeciesID, BreedName) VALUES 
(1, 'Golden Retriever'), 
(1, 'German Shepherd'), 
(2, 'Siamese'), 
(2, 'Persian'),
(3, 'Dutch Rabbit');

-- Shelters (5 rows)
INSERT INTO Shelters (ShelterName, City, Capacity, Phone) VALUES 
('Downtown Rescue', 'Cairo', 50, '02-1234-5678'),
('Nile Valley Shelter', 'Giza', 30, '02-2345-6789'),
('Happy Paws Shelter', 'Alexandria', 40, '03-3456-7890'),
('Pet Haven', 'Luxor', 25, '095-4567-8901'),
('Furry Friends', 'Aswan', 20, '097-5678-9012');

-- Animals (5 rows with Base64 image placeholders and health status)
INSERT INTO Animals (Name, BreedID, ShelterID, DateOfBirth, IntakeDate, Gender, Status, HealthStatus, ImageURL) VALUES 
('Buddy', 1, 1, '2023-01-01', '2024-10-10', 'M', 'Available', 'Healthy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
('Luna', 3, 1, '2022-05-15', '2024-11-01', 'F', 'Available', 'Healthy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
('Max', 2, 2, '2021-08-20', '2024-09-15', 'M', 'Adopted', 'Healthy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
('Bella', 1, 2, '2024-02-01', '2024-12-01', 'F', 'Available', 'Under Treatment', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
('Charlie', 2, 3, '2023-06-10', '2024-11-20', 'M', 'Available', 'Special Needs', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');

-- Adopters (5 rows)
INSERT INTO Adopters (FirstName, LastName, Email, Phone) VALUES 
('Ahmed', 'Mohamed', 'ahmed.mohamed@email.com', '010-1234-5678'),
('Fatima', 'Ali', 'fatima.ali@email.com', '011-2345-6789'),
('Omar', 'Hassan', 'omar.hassan@email.com', '012-3456-7890'),
('Sara', 'Ibrahim', 'sara.ibrahim@email.com', '015-4567-8901'),
('Youssef', 'Khalil', 'youssef.khalil@email.com', '010-5678-9012');

-- Applications (5 rows)
INSERT INTO Applications (AdopterID, AnimalID, AppDate, Status, Notes) VALUES 
(1, 1, '2024-12-15', 'Pending', 'Looking for a friendly dog'),
(2, 2, '2024-12-10', 'Pending', 'First-time adopter'),
(3, 3, '2024-11-20', 'Approved', 'Approved after home visit'),
(4, 4, '2024-12-18', 'Pending', 'Interested in special needs pets'),
(5, 5, '2024-12-20', 'Pending', 'Family with children');

-- Medical_Records (5 rows)
INSERT INTO Medical_Records (AnimalID, RecordDate, RecordType, Description, Veterinarian, Notes) VALUES 
(1, '2024-10-15', 'Vaccination', 'Annual rabies vaccination', 'Dr. Ahmed', 'Up to date'),
(1, '2024-11-01', 'Checkup', 'Routine health check', 'Dr. Ahmed', 'All clear'),
(2, '2024-11-05', 'Vaccination', 'FVRCP vaccination', 'Dr. Fatima', 'Completed'),
(3, '2024-09-20', 'Treatment', 'Spay surgery', 'Dr. Omar', 'Recovery complete'),
(4, '2024-12-05', 'Treatment', 'Deworming treatment', 'Dr. Sara', 'Follow-up needed');

-- Follow_Ups (5 rows)
INSERT INTO Follow_Ups (ApplicationID, FollowUpDate, FollowUpType, Notes, Status) VALUES 
(3, '2024-12-01', 'Home Visit', 'Home visit completed successfully', 'Completed'),
(3, '2025-01-15', 'Phone Call', 'Scheduled follow-up call', 'Scheduled'),
(1, '2024-12-20', 'Email Check-in', 'Application review in progress', 'Scheduled'),
(2, '2024-12-25', 'Phone Call', 'Initial contact call', 'Scheduled'),
(4, '2025-01-01', 'Home Visit', 'Home visit scheduled', 'Scheduled');