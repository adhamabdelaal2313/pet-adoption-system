-- =====================================================
-- RELATIONAL DATABASE MODEL
-- Pet Adoption System - Tails of Hope
-- =====================================================

-- Database: pet_adoption
-- Engine: MySQL/TiDB Cloud

-- =====================================================
-- 1. DROP EXISTING TABLES (if any)
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Follow_Ups;
DROP TABLE IF EXISTS Applications;
DROP TABLE IF EXISTS Medical_Records;
DROP TABLE IF EXISTS Animals;
DROP TABLE IF EXISTS Adopters;
DROP TABLE IF EXISTS Breeds;
DROP TABLE IF EXISTS Species;
DROP TABLE IF EXISTS Shelters;
DROP TABLE IF EXISTS Users;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 2. CREATE TABLES (Relational Model)
-- =====================================================

-- Table 1: Species
-- Purpose: Categorize animals by species (Dog, Cat, Rabbit, etc.)
CREATE TABLE Species (
    SpeciesID INT AUTO_INCREMENT PRIMARY KEY,
    SpeciesName VARCHAR(50) NOT NULL,
    CONSTRAINT UK_Species_SpeciesName UNIQUE (SpeciesName)
);

-- Table 2: Breeds
-- Purpose: Categorize animals by breed within species
-- Relationship: Many Breeds belong to one Species (N:1)
CREATE TABLE Breeds (
    BreedID INT AUTO_INCREMENT PRIMARY KEY,
    SpeciesID INT NOT NULL,
    BreedName VARCHAR(100) NOT NULL,
    CONSTRAINT FK_Breeds_Species FOREIGN KEY (SpeciesID) 
        REFERENCES Species(SpeciesID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT UK_Breeds_Species_Breed UNIQUE (SpeciesID, BreedName)
);

-- Table 3: Shelters
-- Purpose: Store partner shelter information
CREATE TABLE Shelters (
    ShelterID INT AUTO_INCREMENT PRIMARY KEY,
    ShelterName VARCHAR(100) NOT NULL,
    City VARCHAR(50),
    Capacity INT DEFAULT 50,
    Phone VARCHAR(20),
    CONSTRAINT UK_Shelters_Name_City UNIQUE (ShelterName, City)
);

-- Table 4: Animals
-- Purpose: Core entity storing pet information
-- Relationships: 
--   - Many Animals belong to one Breed (N:1)
--   - Many Animals belong to one Shelter (N:1)
CREATE TABLE Animals (
    AnimalID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    BreedID INT NOT NULL,
    ShelterID INT NOT NULL,
    DateOfBirth DATE,
    IntakeDate DATE DEFAULT (CURDATE()),
    Gender CHAR(1) NOT NULL CHECK (Gender IN ('M', 'F')),
    Status VARCHAR(20) DEFAULT 'Available' 
        CHECK (Status IN ('Available', 'Pending', 'Adopted')),
    HealthStatus VARCHAR(50) DEFAULT 'Healthy'
        CHECK (HealthStatus IN ('Healthy', 'Under Treatment', 'Special Needs')),
    ImageURL LONGTEXT,
    CONSTRAINT FK_Animals_Breeds FOREIGN KEY (BreedID) 
        REFERENCES Breeds(BreedID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT FK_Animals_Shelters FOREIGN KEY (ShelterID) 
        REFERENCES Shelters(ShelterID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- Table 5: Users
-- Purpose: System authentication and authorization
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Role VARCHAR(20) DEFAULT 'user' NOT NULL 
        CHECK (Role IN ('admin', 'user')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UK_Users_Email UNIQUE (Email)
);

-- Table 6: Adopters
-- Purpose: Store adopter information for applications
-- Note: Linked to Users via Email (logical relationship, not FK)
CREATE TABLE Adopters (
    AdopterID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(20),
    CONSTRAINT UK_Adopters_Email UNIQUE (Email)
);

-- Table 7: Applications
-- Purpose: Track adoption applications
-- Relationships:
--   - Many Applications belong to one Adopter (N:1)
--   - Many Applications belong to one Animal (N:1)
CREATE TABLE Applications (
    AppID INT AUTO_INCREMENT PRIMARY KEY,
    AdopterID INT NOT NULL,
    AnimalID INT NOT NULL,
    AppDate DATE DEFAULT (CURDATE()),
    Status VARCHAR(20) DEFAULT 'Pending'
        CHECK (Status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
    Notes TEXT,
    CONSTRAINT FK_Applications_Adopters FOREIGN KEY (AdopterID) 
        REFERENCES Adopters(AdopterID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT FK_Applications_Animals FOREIGN KEY (AnimalID) 
        REFERENCES Animals(AnimalID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- Table 8: Medical_Records
-- Purpose: Track medical history for animals
-- Relationship: Many Medical Records belong to one Animal (N:1)
CREATE TABLE Medical_Records (
    RecordID INT AUTO_INCREMENT PRIMARY KEY,
    AnimalID INT NOT NULL,
    RecordDate DATE NOT NULL,
    RecordType VARCHAR(50) NOT NULL
        CHECK (RecordType IN ('Vaccination', 'Checkup', 'Treatment', 'Surgery')),
    Description TEXT,
    Veterinarian VARCHAR(100),
    Notes TEXT,
    CONSTRAINT FK_Medical_Animals FOREIGN KEY (AnimalID) 
        REFERENCES Animals(AnimalID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Table 9: Follow_Ups
-- Purpose: Track post-adoption follow-up visits
-- Relationship: Many Follow-Ups belong to one Application (N:1)
CREATE TABLE Follow_Ups (
    FollowUpID INT AUTO_INCREMENT PRIMARY KEY,
    ApplicationID INT NOT NULL,
    FollowUpDate DATE NOT NULL,
    FollowUpType VARCHAR(50) NOT NULL
        CHECK (FollowUpType IN ('Phone Call', 'Home Visit', 'Email Check-in')),
    Notes TEXT,
    Status VARCHAR(50) DEFAULT 'Scheduled'
        CHECK (Status IN ('Scheduled', 'Completed', 'Cancelled')),
    CONSTRAINT FK_FollowUps_Applications FOREIGN KEY (ApplicationID) 
        REFERENCES Applications(AppID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on foreign keys for faster joins
CREATE INDEX IDX_Animals_BreedID ON Animals(BreedID);
CREATE INDEX IDX_Animals_ShelterID ON Animals(ShelterID);
CREATE INDEX IDX_Animals_Status ON Animals(Status);
CREATE INDEX IDX_Breeds_SpeciesID ON Breeds(SpeciesID);
CREATE INDEX IDX_Applications_AdopterID ON Applications(AdopterID);
CREATE INDEX IDX_Applications_AnimalID ON Applications(AnimalID);
CREATE INDEX IDX_Applications_Status ON Applications(Status);
CREATE INDEX IDX_Medical_AnimalID ON Medical_Records(AnimalID);
CREATE INDEX IDX_FollowUps_ApplicationID ON Follow_Ups(ApplicationID);

-- Index on frequently queried columns
CREATE INDEX IDX_Adopters_Email ON Adopters(Email);
CREATE INDEX IDX_Users_Email ON Users(Email);
CREATE INDEX IDX_Users_Role ON Users(Role);

-- =====================================================
-- 4. RELATIONAL MODEL SUMMARY
-- =====================================================

/*
RELATIONAL MODEL STRUCTURE:

1. Species (1) ──< (N) Breeds ──< (N) Animals
2. Shelters (1) ──< (N) Animals
3. Animals (1) ──< (N) Applications
4. Animals (1) ──< (N) Medical_Records
5. Adopters (1) ──< (N) Applications
6. Applications (1) ──< (N) Follow_Ups
7. Users ── (logical link via Email) ── Adopters

FOREIGN KEY CONSTRAINTS:
- Breeds.SpeciesID → Species.SpeciesID (RESTRICT)
- Animals.BreedID → Breeds.BreedID (RESTRICT)
- Animals.ShelterID → Shelters.ShelterID (RESTRICT)
- Applications.AdopterID → Adopters.AdopterID (RESTRICT)
- Applications.AnimalID → Animals.AnimalID (RESTRICT)
- Medical_Records.AnimalID → Animals.AnimalID (CASCADE)
- Follow_Ups.ApplicationID → Applications.AppID (CASCADE)

NORMALIZATION: BCNF (Boyce-Codd Normal Form)
- All tables are normalized to eliminate redundancy
- No partial dependencies
- No transitive dependencies
- All determinants are candidate keys
*/

