# Team Task Manager

A web application for managing team projects and tasks with role-based access control.

## Features

- **Project Management**: Create and manage multiple projects
- **Task Assignment**: Assign tasks to team members with priorities and deadlines
- **Progress Tracking**: Track task status from start to completion
- **Review System**: Admin can approve tasks or request rework
- **Role-Based Access**: Team Lead (Admin) and Team Member roles
- **Activity Tracking**: Monitor all team activities
- **Notifications**: Get notified about task assignments and reviews

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth

## Task Status Flow

```
Not Started → In Progress → Pending Review → Verified Completed
                    ↓                              ↑
              Needs Rework ←──────────────────────┘
```

## Demo Accounts

### Team Lead (Admin)
- Email: `teamlead1@test.com` / Password: `admin123`
- Email: `teamlead2@test.com` / Password: `admin123`

### Team Member
- Email: `member1@test.com` / Password: `member123`
- Email: `member2@test.com` / Password: `member123`

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Run the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000` in your browser

## Project Structure

```
team-task-manager/
├── frontend/
│   ├── html/           # HTML pages
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── assets/         # Images and other assets
├── backend/
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   ├── config/         # Database config
│   └── server.js       # Main server file
├── db/
│   └── schema.sql      # Database schema
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/submit` - Submit for review
- `DELETE /api/tasks/:id` - Delete task

### Reviews
- `POST /api/reviews/approve/:taskId` - Approve task
- `POST /api/reviews/rework/:taskId` - Request rework

## Author

College Assessment Project
