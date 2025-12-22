# Pet Adoption System

A full-stack pet adoption management system built with Node.js, Express, React, and TiDB.

## Features

- 🐾 Pet listing and management
- 👤 User authentication (Admin/Adopter roles)
- 📊 Reports and analytics
- 🏥 Medical records tracking
- 📝 Adoption application management
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
│   │   ├── routes/             # API routes
│   │   └── middleware/         # Auth middleware
│   └── server.js               # Express server
│
└── frontend/
    ├── src/
    │   ├── components/         # React components
    │   ├── pages/              # Page components
    │   ├── context/            # React context
    │   └── utils/              # Utilities
    └── vite.config.js          # Vite configuration
```

## API Endpoints

- `GET /api` - API information
- `GET /api/pets` - Get all pets
- `POST /api/pets` - Add new pet
- `GET /api/pets/:id` - Get pet by ID
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/reports/*` - Various reports

## License

MIT

