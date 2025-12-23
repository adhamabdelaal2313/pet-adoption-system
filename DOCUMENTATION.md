# Pet Adoption System - Complete Documentation

Complete documentation for the Pet Adoption System, including API reference, database schema, user guide, and developer guide.

## Table of Contents

1. [Overview](#overview)
2. [API Documentation](#api-documentation)
3. [Database Schema](#database-schema)
4. [User Guide](#user-guide)
5. [Developer Guide](#developer-guide)

---

# Overview

## Features

- 🐾 Pet listing and management
  - **Admin View**: Admins can see ALL pets including adopted ones and those with pending applications
  - **Regular User View**: Users only see available pets (adopted pets are hidden)
- 👤 User authentication (Admin/Adopter roles)
  - Role-based access control
  - JWT token authentication
- 📊 Reports and analytics
  - Adoption rates, popular breeds, shelter statistics
  - Report history tracking
- 🏥 Medical records tracking
- 📝 Adoption application management
  - Multiple users can apply for the same pet
  - Once an application is approved, the pet status changes to "Adopted" and disappears from public view
  - Rejected applicants cannot reapply for the same pet
- 🔄 Follow-up tracking

## Tech Stack

### Backend
- Node.js + Express
- MySQL2 (TiDB Cloud)
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios

---

# API Documentation

## Base URL

```
http://localhost:4000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained via `/api/auth/login` and are valid for 7 days.

---

## Authentication Endpoints

### POST /api/auth/signup

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

**Note:** All new signups get the 'user' role by default. Admin roles must be assigned manually in the database.

---

### POST /api/auth/login

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

---

## Pet Endpoints

### GET /api/pets

Get all pets. **Optional authentication** - works without token, but respects admin role if provided.

**Query Parameters:**
- `status` (optional) - Filter by status: `Available`, `Pending`, or `Adopted`

**Behavior:**
- **Admin users**: See ALL pets including adopted ones
- **Regular users**: See only non-adopted pets (Available, Pending)
- **Unauthenticated**: See only non-adopted pets

**Response (200 OK):**
```json
{
  "success": true,
  "count": 10,
  "pets": [
    {
      "AnimalID": 1,
      "Name": "Buddy",
      "Gender": "M",
      "Status": "Available",
      "HealthStatus": "Healthy",
      "DateOfBirth": "2020-05-15",
      "BreedID": 1,
      "ShelterID": 1,
      "image_data": "data:image/png;base64,iVBORw0KG...",
      "BreedName": "Golden Retriever",
      "PetType": "Dog",
      "ShelterName": "Happy Paws Shelter",
      "City": "New York"
    }
  ]
}
```

---

### GET /api/pets/:id

Get a specific pet by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "pet": {
    "AnimalID": 1,
    "Name": "Buddy",
    "Gender": "M",
    "Status": "Available",
    "HealthStatus": "Healthy",
    "DateOfBirth": "2020-05-15",
    "IntakeDate": "2023-01-10",
    "BreedID": 1,
    "ShelterID": 1,
    "image_data": "data:image/png;base64,...",
    "BreedName": "Golden Retriever",
    "PetType": "Dog",
    "ShelterName": "Happy Paws Shelter",
    "City": "New York"
  }
}
```

---

### POST /api/pets

Add a new pet. **Requires authentication.**

**Request Body:**
```json
{
  "name": "Buddy",
  "breedId": 1,
  "shelterId": 1,
  "dateOfBirth": "2020-05-15",
  "gender": "M",
  "healthStatus": "Healthy",
  "image_data": "data:image/png;base64,iVBORw0KG..."
}
```

**Alternative (Custom Breed/Shelter):**
```json
{
  "name": "Buddy",
  "breedName": "Mixed Breed",
  "breedType": "Dog",
  "shelterName": "New Shelter",
  "shelterCity": "Boston",
  "dateOfBirth": "2020-05-15",
  "gender": "M",
  "healthStatus": "Healthy",
  "image_data": "data:image/png;base64,..."
}
```

---

### PUT /api/pets/:id

Update an existing pet. **Requires authentication.**

### DELETE /api/pets/:id

Delete a pet. **Requires authentication.**

---

## Application Endpoints

All application endpoints **require authentication**.

### POST /api/applications

Submit a new adoption application.

**Request Body:**
```json
{
  "animalId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "notes": "I have experience with dogs and a fenced yard."
}
```

**Business Rules:**
- Multiple users can apply for the same pet
- If a user was previously rejected, they cannot reapply
- Pet status remains "Available" or "Pending" until an application is approved

---

### GET /api/applications

Get applications. Behavior depends on user role:
- **Admin**: Gets all applications
- **Regular User**: Gets only their own applications

**Query Parameters:**
- `status` (optional) - Filter by status: `Pending`, `Approved`, `Rejected`, `Completed`

---

### PUT /api/applications/:id

Update application status. **Admin only.**

**Request Body:**
```json
{
  "status": "Approved",
  "notes": "Application approved. Please contact the shelter."
}
```

**Valid Status Values:**
- `Pending`
- `Approved`
- `Rejected`
- `Completed`

**Business Rules:**
- When status is set to `Approved`:
  - Pet status changes to `Adopted`
  - All other pending applications for that pet are automatically rejected
- When status is set to `Rejected`:
  - Pet remains available for other applications
  - User cannot reapply for the same pet

---

### GET /api/applications/:id/follow-ups

Get follow-up records for an application. **Admin only.**

### POST /api/applications/:id/follow-ups

Add a follow-up record. **Admin only.**

**Valid FollowUpType Values:**
- `Phone Call`
- `Home Visit`
- `Email Check-in`

---

## Report Endpoints

All report endpoints **require authentication and admin role**.

### GET /api/reports/adoption-rates

Get adoption rate statistics.

### GET /api/reports/popular-breeds

Get most popular breeds by adoption count.

### GET /api/reports/waiting-times

Get average waiting times from intake to adoption.

### GET /api/reports/health-status

Get health status distribution.

### GET /api/reports/shelter-performance

Get adoption statistics by shelter.

### GET /api/reports/follow-ups

Get follow-up statistics and records.

---

## Medical Record Endpoints

All medical endpoints **require authentication and admin role**.

### GET /api/medical/:animalId

Get medical records for a specific animal.

### POST /api/medical

Add a medical record.

**Valid RecordType Values:**
- `Vaccination`
- `Checkup`
- `Treatment`
- `Surgery`

### PUT /api/medical/:id

Update a medical record.

### DELETE /api/medical/:id

Delete a medical record.

---

## Admin Endpoints

### GET /api/admin/breeds

Get all breeds with species information. **Requires authentication.**

### GET /api/admin/shelters

Get all shelters. **Requires authentication.**

### GET /api/admin/species

Get all species. **Requires authentication.**

---

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - No token provided or invalid token
- **403 Forbidden** - Admin-only action attempted by non-admin
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

# Database Schema

## Overview

The database uses MySQL/TiDB compatible syntax and includes the following tables:
- `Users` - System users (authentication)
- `Species` - Animal species (Dog, Cat, etc.)
- `Breeds` - Animal breeds linked to species
- `Shelters` - Partner shelters
- `Animals` - Pet records
- `Adopters` - Adopter information
- `Applications` - Adoption applications
- `Medical_Records` - Medical history for animals
- `Follow_Ups` - Follow-up records for applications

## Entity Relationship Diagram (ERD)

```
Users (1) ────┐
              │
              │ (Email link)
              │
              ▼
          Adopters (1) ────┐
                           │
                           │ (1:N)
                           │
                           ▼
                      Applications (N)
                           │
                           │ (1:N)
                           │
                           ▼
                      Follow_Ups (N)

Species (1) ────┐
                │
                │ (1:N)
                │
                ▼
            Breeds (1) ────┐
                           │
                           │ (1:N)
                           │
                           ▼
                      Animals (N)
                           │
                           │ (1:N)
                           │
                           ▼
                  Medical_Records (N)

Shelters (1) ────┐
                │
                │ (1:N)
                │
                ▼
            Animals (N)
```

## Tables

### Users

System users for authentication and authorization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| UserID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| Email | VARCHAR(100) | UNIQUE, NOT NULL | User email (login) |
| PasswordHash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| FirstName | VARCHAR(50) | NOT NULL | User's first name |
| LastName | VARCHAR(50) | NOT NULL | User's last name |
| Role | VARCHAR(20) | DEFAULT 'user', NOT NULL | User role: 'admin' or 'user' |
| CreatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

**Notes:**
- All new signups get 'user' role by default
- Admin roles must be manually assigned via SQL:
  ```sql
  UPDATE Users SET Role = 'admin' WHERE Email = 'admin@example.com';
  ```

---

### Animals

Pet records - the core entity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| AnimalID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique animal identifier |
| Name | VARCHAR(50) | | Pet's name |
| BreedID | INT | FOREIGN KEY → Breeds(BreedID) | Breed reference |
| ShelterID | INT | FOREIGN KEY → Shelters(ShelterID) | Shelter reference |
| DateOfBirth | DATE | | Birth date (for age calculation) |
| IntakeDate | DATE | | Date pet entered shelter |
| Gender | CHAR(1) | | 'M' (Male) or 'F' (Female) |
| Status | VARCHAR(20) | DEFAULT 'Available' | Status: 'Available', 'Pending', 'Adopted' |
| HealthStatus | VARCHAR(50) | DEFAULT 'Healthy' | Health: 'Healthy', 'Under Treatment', 'Special Needs' |
| ImageURL | LONGTEXT | | Base64-encoded image data |

**Status Values:**
- `Available` - Available for adoption
- `Pending` - Has pending applications
- `Adopted` - Successfully adopted (hidden from public view)

**HealthStatus Values:**
- `Healthy` - No health issues
- `Under Treatment` - Currently receiving medical care
- `Special Needs` - Requires special care or accommodations

---

### Applications

Adoption applications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| AppID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique application identifier |
| AdopterID | INT | FOREIGN KEY → Adopters(AdopterID) | Adopter reference |
| AnimalID | INT | FOREIGN KEY → Animals(AnimalID) | Animal reference |
| AppDate | DATE | DEFAULT CURDATE() | Application submission date |
| Status | VARCHAR(20) | DEFAULT 'Pending' | Status: 'Pending', 'Approved', 'Rejected', 'Completed' |
| Notes | TEXT | | Application notes/comments |

**Business Rules:**
- Multiple users can apply for the same pet
- When an application is approved:
  - Animal status changes to 'Adopted'
  - All other pending applications for that animal are rejected
- Rejected applicants cannot reapply for the same pet

---

## Normalization

The database is normalized to **BCNF (Boyce-Codd Normal Form)**:

1. **First Normal Form (1NF)**: All attributes are atomic
2. **Second Normal Form (2NF)**: No partial dependencies
3. **Third Normal Form (3NF)**: No transitive dependencies
4. **BCNF**: Every determinant is a candidate key

---

# User Guide

## Getting Started

### Creating an Account

1. Navigate to the home page (`/`)
2. Click **"Sign Up"** or toggle to the signup form
3. Fill in your details:
   - Email address
   - Password (minimum 8 characters recommended)
   - First Name
   - Last Name
4. Click **"Sign Up"**
5. You'll be automatically logged in and redirected to the pets page

**Note:** All new accounts are created with "user" role. Admin access must be granted by a system administrator.

### Logging In

1. Navigate to the home page (`/`)
2. Enter your email and password
3. Click **"Login"**
4. You'll be redirected to the pets browsing page

---

## For Pet Seekers

### Browsing Available Pets

1. After logging in, you'll see the **"Browse Pets"** page
2. Pets are displayed in a grid layout with:
   - Pet photo
   - Name
   - Type (Dog, Cat, etc.)
   - Breed
   - Age (calculated from date of birth)
   - Gender
   - Health status
   - Shelter location
   - Current status (Available/Pending)

3. **Note:** Adopted pets are automatically hidden from public view

### Applying to Adopt

1. Find a pet you're interested in
2. Click **"Apply to Adopt"** button on the pet card
3. Fill out the application form:
   - **First Name** (required)
   - **Last Name** (required)
   - **Email** (required) - Must match your account email
   - **Phone** (optional)
   - **Additional Notes** (optional)
4. Click **"Submit Application"**

**Important Notes:**
- Multiple users can apply for the same pet
- You can only have one pending application per pet at a time
- If your application is rejected, you cannot reapply for the same pet
- Once a pet is adopted (application approved), it disappears from public view

### Tracking Your Applications

1. Click **"My Applications"** in the navigation bar
2. View all your submitted applications with status and notes

**Application Statuses:**
- **Pending** - Your application is under review
- **Approved** - Your application was accepted!
- **Rejected** - Your application was not approved (you cannot reapply)
- **Completed** - The adoption process is complete

---

## For Administrators

### Managing Pets

#### Viewing All Pets

1. Click **"Manage Pets"** in the navigation bar
2. You'll see a table with ALL pets, including:
   - Adopted pets
   - Pets with pending applications
   - Available pets

#### Adding a New Pet

1. Click **"Manage Pets"** → **"+ Add New Pet"**
2. Fill out the pet information
3. Click **"Add Pet"**

#### Editing/Deleting Pets

- Click **"Edit"** to modify pet information
- Click **"Delete"** to remove a pet (cannot be undone)

### Managing Applications

#### Viewing All Applications

1. Click **"Manage Applications"** in the navigation bar
2. View a table of all applications

#### Updating Application Status

1. Click **"Update Status"** next to an application
2. Select the new status:
   - **Approved** - Approves the application (pet becomes adopted)
   - **Rejected** - Rejects the application
   - **Completed** - Marks adoption process as complete
   - **Pending** - Keeps application under review
3. Add optional notes
4. Click **"Update Status"**

### Generating Reports

1. Click **"Reports"** in the navigation bar
2. Select a report type
3. Click on a report card to generate it
4. View the report data in a formatted table
5. Use **"History"** button to view previously generated reports

---

## Troubleshooting

### I can't see admin features

- **Solution:** Your account may not have admin privileges. Contact your system administrator.

### I can't apply for a pet

**Possible reasons:**
1. Pet is already adopted
2. You already have a pending application
3. You were previously rejected for this pet

### Images not displaying

- Check your internet connection
- Clear browser cache
- Try refreshing the page

---

# Developer Guide

## Project Structure

```
pet-adoption/
├── backend/
│   ├── db/
│   │   └── schema.sql              # Database schema with dummy data
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Database connection configuration
│   │   ├── controllers/            # Business logic
│   │   ├── routes/                 # API route definitions
│   │   └── middleware/             # Express middleware
│   ├── server.js                   # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   ├── pages/                  # Page components
│   │   ├── context/                # React Context providers
│   │   └── utils/                  # Utility functions
│   ├── vite.config.js              # Vite configuration
│   └── package.json
│
└── DOCUMENTATION.md                 # This file
```

---

## Setup & Installation

### Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn**
- **TiDB Cloud** account (or MySQL 8.0+ database)
- **Git**

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   DATABASE_URL=mysql://user:password@host:port/database?ssl=true
   PORT=4000
   JWT_SECRET=your-secret-key-change-in-production
   ```

4. **Set up database:**
   - Execute `backend/db/schema.sql` in your database

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:4000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

---

## Development Workflow

### Starting Development

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend (new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open browser:** `http://localhost:5173`

### Code Style & Conventions

#### Backend (Node.js/Express)

- Use async/await for database operations
- Always use parameterized queries (prevents SQL injection)
- Use consistent error handling
- File naming: `*.controller.js`, `*.routes.js`, `*.middleware.js`

#### Frontend (React)

- Use functional components with hooks
- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Use `useState` for local state, `AuthContext` for auth state

---

## Testing

### Manual Testing Checklist

- [ ] Sign up new user
- [ ] Login with valid credentials
- [ ] View all pets (public)
- [ ] View all pets (admin - includes adopted)
- [ ] Add new pet
- [ ] Submit application
- [ ] View own applications
- [ ] Update application status (admin)
- [ ] Generate reports (admin)

---

## Deployment

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL=production_database_url
PORT=4000
JWT_SECRET=strong-random-secret-key
NODE_ENV=production
```

### Build Commands

**Backend:**
```bash
npm install --production
```

**Frontend:**
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Production Considerations

1. **Security:**
   - Use strong JWT_SECRET
   - Enable HTTPS
   - Set secure CORS origins
   - Validate all inputs

2. **Performance:**
   - Enable database connection pooling
   - Add rate limiting
   - Implement caching where appropriate

3. **Monitoring:**
   - Add logging
   - Set up error tracking
   - Monitor database performance

---

## Common Issues & Solutions

### Database Connection Issues

**Problem:** `ECONNREFUSED` or `Access denied`

**Solutions:**
1. Check DATABASE_URL format
2. Verify database credentials
3. Check IP whitelist (TiDB Cloud)
4. Verify SSL settings

### CORS Errors

**Problem:** Frontend can't access backend

**Solutions:**
1. Check backend CORS configuration
2. Verify proxy settings in `vite.config.js`
3. Ensure backend is running

### Authentication Issues

**Problem:** Token not working

**Solutions:**
1. Check JWT_SECRET matches
2. Verify token expiration
3. Check Authorization header format
4. Clear localStorage and re-login

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud/)

---

## License

MIT

