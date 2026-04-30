# Team Task Manager - Production-Ready Full-Stack Web App

A modern, production-ready Team Task Manager built with React, Node.js, Express, PostgreSQL, and Prisma. Features role-based access control (RBAC), JWT authentication, and a beautiful UI with Tailwind CSS.

## 🎯 Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Role-Based Access Control (RBAC)**: 
  - **ADMIN**: Can create projects, invite members, and assign tasks
  - **MEMBER**: Can only view assigned projects and update status of their own tasks
- **Projects**: Create and manage projects (ADMIN only)
- **Tasks**: Create tasks with priority levels, due dates, and status tracking
- **Dashboard**: Visual summary of task counts by status and upcoming deadlines
- **Responsive UI**: Built with Tailwind CSS and Lucide Icons

## 📦 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide Icons (UI icons)
- React Router (navigation)
- Axios (HTTP client)

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL (database)
- Prisma ORM
- JWT (authentication)
- Bcrypt (password hashing)
- Zod (validation)

## 📁 Project Structure

```
/team-task-manager
├── /client                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main app
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── /server                 # Express backend
│   ├── src/
│   │   ├── middleware/     # Auth & RBAC middleware
│   │   ├── routes/         # API routes
│   │   ├── validators/     # Zod validators
│   │   └── index.ts        # Server entry
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json
│   └── tsconfig.json
├── package.json            # Root package (scripts)
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or remote)

### 1. Installation

```bash
# Clone repository
git clone <repo-url>
cd team-task-manager

# Install dependencies
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb team_task_manager

# Configure environment
cp server/.env.example server/.env

# Edit server/.env with your database URL:
# DATABASE_URL="postgresql://user:password@localhost:5432/team_task_manager?schema=public"
# JWT_SECRET="your_super_secret_key"

# Run migrations
npm run prisma:migrate --prefix server
```

### 3. Development

```bash
# Run both frontend and backend in parallel
npm run dev

# Or run separately:
npm run server   # Backend on http://localhost:5000
npm run client   # Frontend on http://localhost:5173
```

### 4. Demo Data (Optional)

```bash
# Create demo users and projects
npm run prisma:seed --prefix server
```

## 📝 API Documentation

### Authentication Endpoints

```
POST /api/auth/signup
POST /api/auth/login
```

### Project Endpoints (All require auth)

```
GET    /api/projects              # Get all accessible projects
GET    /api/projects/:id          # Get single project
POST   /api/projects              # Create project (ADMIN only)
PUT    /api/projects/:id          # Update project (ADMIN only)
DELETE /api/projects/:id          # Delete project (ADMIN only)
```

### Task Endpoints (All require auth)

```
GET    /api/tasks                 # Get all accessible tasks
GET    /api/tasks/:id             # Get single task
POST   /api/tasks                 # Create task (ADMIN only)
PUT    /api/tasks/:id             # Update task
DELETE /api/tasks/:id             # Delete task (ADMIN only)
```

## 🔐 RBAC Permissions

### ADMIN
- ✅ Create and delete projects
- ✅ Create, update, and delete tasks
- ✅ Assign tasks to team members
- ✅ View all projects and tasks

### MEMBER
- ✅ View assigned projects
- ✅ View assigned tasks
- ✅ Update status of own tasks only
- ❌ Cannot create projects/tasks
- ❌ Cannot assign tasks to others

## 🎨 UI Components

### AuthForm
- Login and signup forms
- Email validation
- Password hashing
- Error handling

### Dashboard
- Task count summary (TODO, IN_PROGRESS, DONE)
- Projects list
- Upcoming deadlines table
- Role indicator

### ProjectView
- Task kanban-style board
- Create new tasks (ADMIN)
- Update task status (drag or click)
- Delete tasks (ADMIN)
- Delete project (ADMIN)

## 🚀 Deployment on Railway

### Step 1: Prepare GitHub Repository

```
/team-task-manager
├── /client         # Frontend
├── /server         # Backend
├── package.json    # Root scripts
└── .gitignore
```

### Step 2: Create Railway Project

1. Sign up at [railway.app](https://railway.app/)
2. Create new project
3. Add PostgreSQL service
4. Connect GitHub repository

### Step 3: Configure Environment Variables

In Railway dashboard, add:
```
DATABASE_URL=<PostgreSQL connection string from Railway>
JWT_SECRET=<your-secure-secret-key>
PORT=8080
NODE_ENV=production
```

### Step 4: Deploy

Railway automatically detects Node.js and deploys:
1. Builds server and client
2. Runs database migrations
3. Serves frontend from Express static middleware
4. Go live!

## 📊 Database Schema

### User
```
- id (String, primary key)
- email (String, unique)
- name (String)
- password (String, hashed)
- role (ADMIN | MEMBER)
- createdAt, updatedAt
```

### Project
```
- id (String, primary key)
- name (String)
- description (String)
- ownerId (FK to User)
- createdAt, updatedAt
```

### Task
```
- id (String, primary key)
- title (String)
- description (String)
- status (TODO | IN_PROGRESS | DONE)
- priority (LOW | MEDIUM | HIGH)
- dueDate (DateTime)
- assignedToId (FK to User)
- projectId (FK to Project)
- createdAt, updatedAt
```

## 🛠️ Build for Production

```bash
# Build backend
npm run build --prefix server

# Build frontend
npm run build --prefix client

# Start production server
npm start
```

The production server will:
1. Serve compiled backend code
2. Serve frontend static files from `/client/dist`
3. Handle all routing through Express

## 🧪 Testing

### Test Login/Signup Flow
1. Sign up as new user (defaults to MEMBER)
2. Try creating a project (should be forbidden)

### Test RBAC
1. Create admin user in database
2. Log in as admin, create project
3. Create tasks and assign to members
4. Log out, log in as member
5. Verify member can only update task status

## 📚 Input Validation

All inputs validated with Zod:
- Email format validation
- Password minimum 8 characters
- Project name required
- Task title required
- Status enum validation
- Priority enum validation

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ CORS enabled
- ✅ HTTP-only token storage (localStorage)
- ✅ Input validation with Zod
- ✅ Role-based access control
- ✅ HTTPS recommended for production

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS responsiveness
- Works on all screen sizes
- Touch-friendly buttons and inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Database connection error
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify user credentials

### CORS errors
- Check backend CORS configuration
- Ensure frontend and backend URLs match

### Token errors
- Clear localStorage and re-login
- Check JWT_SECRET in both frontend and backend

### Build errors
- Delete node_modules and reinstall
- Clear build caches (dist/ folder)
- Check Node.js version (18+)

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for modern web applications
