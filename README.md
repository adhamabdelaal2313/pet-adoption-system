# Pet Adoption System

A full-stack pet adoption management system built with Node.js, Express, React, and TiDB.

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

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- TiDB Cloud account (or MySQL database)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd pet-adoption
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables

Create `backend/.env`:
```
DATABASE_URL=your_tidb_connection_string
PORT=4000
JWT_SECRET=your_jwt_secret_key
```

5. Set up the database

Run the schema file:
```bash
# Execute backend/db/schema.sql in your database
```

6. Start the backend server
```bash
cd backend
npm run dev
```

7. Start the frontend development server
```bash
cd frontend
npm run dev
```

8. Open your browser
```
http://localhost:5173
```

## Project Structure

```
pet-adoption/
├── backend/
│   ├── db/
│   │   └── schema.sql          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Database connection
│   │   ├── controllers/        # Route controllers
│   │   │   ├── pet.controller.js
│   │   │   ├── application.controller.js
│   │   │   ├── report.controller.js
│   │   │   ├── medical.controller.js
│   │   │   └── auth.controller.js
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Auth middleware
│   │   │   ├── auth.middleware.js      # Required auth
│   │   │   └── optionalAuth.middleware.js  # Optional auth
│   │   └── server.js           # Express server
│   └── server.js               # Express server
│
└── frontend/
    ├── src/
    │   ├── components/         # React components
    │   │   └── FloatingNavbar.jsx
    │   ├── pages/              # Page components
    │   │   ├── Home.jsx        # Browse pets (public)
    │   │   ├── AdminCRUD.jsx   # Admin pet management
    │   │   ├── Reports.jsx     # Reports (admin only)
    │   │   ├── SubmitApplication.jsx
    │   │   ├── MyApplications.jsx
    │   │   └── ManageApplications.jsx  # Admin application management
    │   ├── context/            # React context
    │   │   └── AuthContext.jsx
    │   └── utils/              # Utilities
    │       └── axios.js        # Axios instance with auth
    └── vite.config.js          # Vite configuration
```

## Key Features Explained

### Pet Visibility
- **Admins**: Can see all pets regardless of status (Available, Pending, Adopted)
- **Regular Users**: Only see pets with status "Available" or "Pending" (Adopted pets are hidden)
- This is handled automatically by the backend based on the user's role in the JWT token

### Application Workflow
1. **Multiple Applications**: Multiple users can apply for the same pet simultaneously
2. **Application Approval**: When an admin approves an application:
   - The pet status changes to "Adopted"
   - The pet disappears from public view
   - All other pending applications for that pet are automatically rejected
3. **Rejection**: If a user's application is rejected:
   - They cannot apply again for the same pet
   - The pet remains available for other users to apply
4. **Pet Status**: Pets remain "Available" or "Pending" until an application is approved

### Admin Role Assignment
- **Important**: All new signups get the 'user' role by default
- To create an admin user, manually update the `Users` table in the database:
  ```sql
  UPDATE Users SET Role = 'admin' WHERE Email = 'admin@example.com';
  ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration (all users get 'user' role by default)
- `POST /api/auth/login` - User login (returns JWT token with user role)

### Pets
- `GET /api/pets` - Get all pets
  - **Admin**: Returns all pets including adopted ones
  - **Regular Users**: Returns only non-adopted pets
  - Optional authentication (works without token, but respects role if token provided)
- `GET /api/pets/:id` - Get pet by ID
- `POST /api/pets` - Add new pet (requires authentication)
- `PUT /api/pets/:id` - Update pet (requires authentication)
- `DELETE /api/pets/:id` - Delete pet (requires authentication)

### Applications
- `POST /api/applications` - Submit adoption application (requires authentication)
- `GET /api/applications/my` - Get current user's applications (requires authentication)
- `GET /api/applications` - Get all applications (admin only)
- `PUT /api/applications/:id/status` - Update application status (admin only)
- `POST /api/applications/:id/followup` - Add follow-up record (admin only)
- `GET /api/applications/:id/followups` - Get follow-ups for an application (admin only)

### Reports
- `GET /api/reports/*` - Various reports (admin only)
  - `/api/reports/adoption-rates` - Adoption statistics
  - `/api/reports/popular-breeds` - Most popular breeds
  - `/api/reports/shelter-statistics` - Shelter performance metrics
  - `/api/reports/average-waiting-time` - Average time to adoption
  - `/api/reports/health-status` - Health status distribution
  - `/api/reports/adoption-trends` - Adoption trends over time

### Medical Records
- `POST /api/medical` - Add medical record (admin only)
- `GET /api/medical/:animalId` - Get medical records for an animal (admin only)
- `PUT /api/medical/:recordId` - Update medical record (admin only)
- `DELETE /api/medical/:recordId` - Delete medical record (admin only)

### General
- `GET /api` - API information and endpoint list

## License

MIT

