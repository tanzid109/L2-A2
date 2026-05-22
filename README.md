# ResolveHQ

An issue tracking and management system built with Express.js and PostgreSQL. Track, manage, and resolve issues efficiently with role-based access control.

## 📋 Project Information

- **Project Name:** ResolveHQ
- **Live URL:** _(To be deployed)_
- **Version:** 1.0.0
- **Status:** In Development

## ✨ Features

- **Issue Management**
  - Create, read, update, and delete issues
  - Track issue status (open, in_progress, resolved)
  - Categorize issues by type (bug, feature_request)
- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (contributor, maintainer)
  - Secure token validation on protected endpoints
- **Advanced Filtering & Sorting**
  - Filter issues by type and status
  - Sort by creation date (newest/oldest)
  - Query parameter support for flexible searches
- **Access Control**
  - Contributors can create and update their own open issues
  - Maintainers can update any issue and delete issues
  - Reporter details included with each issue

## 🛠 Tech Stack

- **Backend Framework:** Express.js (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **Development:** npm scripts, Git version control

## 📦 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Setup Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ResolveHQ
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```
PORT=5000
CONNECTION_STRING=postgres from neonDB
JWT_SECRET=your_secret_key
```

### 4. Database Setup

The database schema is automatically created when the server starts. Ensure PostgreSQL is running:

```bash
# Create the database manually if needed
createdb resolvehq
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run build
npm start
```

The server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

All protected endpoints require a valid JWT token in the Authorization header.

### Issues Endpoints

| Method | Endpoint          | Auth                   | Description                 |
| ------ | ----------------- | ---------------------- | --------------------------- |
| POST   | `/api/auth/signup`| Public                 | Create a new account        |
| POST   | `/api/auth/login` | Public                 | Login to your account       |
| POST   | `/api/issues`     | Contributor            | Create a new issue          |
| GET    | `/api/issues`     | Public                 | Get all issues with filters |
| GET    | `/api/issues/:id` | Public                 | Get a single issue by ID    |
| PATCH  | `/api/issues/:id` | Contributor/Maintainer | Update an issue             |
| DELETE | `/api/issues/:id` | Maintainer             | Delete an issue             |

### Query Parameters (GET /api/issues)

- `sort` - Sort order: `newest` (default) or `oldest`
- `type` - Filter by type: `bug` or `feature_request`
- `status` - Filter by status: `open`, `in_progress`, or `resolved`

### Example Requests

**Create an Issue:**

```bash
POST /api/issues
Authorization: <token>
Content-Type: application/json

{
  "title": "Database connection timeout",
  "description": "Pool exhausts after 50+ concurrent queries",
  "type": "bug"
}
```

**Get All Issues with Filters:**

```bash
GET /api/issues?sort=newest&type=bug&status=open
```

**Update an Issue:**

```bash
PATCH /api/issues/1
Authorization: <token>
Content-Type: application/json

{
  "status": "in_progress",
  "description": "Started working on this"
}
```

**Delete an Issue:**

```bash
DELETE /api/issues/1
Authorization: <token>
```

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'contributor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Issues Table

```sql
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('bug', 'feature_request')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Key Relationships

- **Issues.reporter_id** → Users.id (Foreign Key)
- Issues are associated with the user who reported them
- Reporter details are included when fetching issues

## 🔐 Authorization Rules

### Create Issue

- **Required Role:** Contributor or higher
- **Permission:** Any authenticated contributor can create an issue

### Read Issues

- **Required Role:** None (public)
- **Permission:** Anyone can view all issues or a specific issue

### Update Issue

- **Required Role:** Contributor or Maintainer
- **Permission:**
  - Contributor: Can only update their own issues if status is `open`
  - Maintainer: Can update any issue regardless of status

### Delete Issue

- **Required Role:** Maintainer
- **Permission:** Only maintainers can delete issues

## 🗂 Project Structure

```
src/
├── app.ts                 # Express app initialization
├── server.ts              # Server entry point
├── db/
│   └── index.ts          # Database connection and schema
├── middleware/
│   ├── auth.middleware.ts # JWT authentication
│   └── index.d.ts         # Type definitions
├── modules/
│   ├── auth/             # Authentication module
│   ├── issues/           # Issues module (CRUD operations)
├── types/
│   └── index.ts          # Global type definitions
└── utils/
    ├── config.ts         # Configuration loader
    └── sendResponse.ts   # Response formatter
```

## 🧪 Testing

Use Postman or cURL to test the API endpoints. Example:

```bash
# Get all issues
curl http://localhost:5000/api/issues

# Create an issue (with authentication)
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Issue","type":"bug"}'
```

**Last Updated:** May 22, 2026
