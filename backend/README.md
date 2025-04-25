Chorely Backend API
Chorely is a task management system designed to gamify household and workplace chores, focusing on fairness, accountability, and competition.
Features

User authentication and profile management
Home/group creation and management
Task creation, assignment, and completion tracking
Points system based on task difficulty
Leaderboards for tracking user performance
Notifications for task assignments and updates

Tech Stack

Backend: Node.js with Express
Database: MySQL
Authentication: JWT with bcrypt password hashing
Image Uploads: Multer

Getting Started
Prerequisites

Node.js (v14+ recommended)
MySQL database
npm or yarn

Installation

Clone the repository

Copygit clone https://github.com/your-username/chorely-backend.git
cd chorely-backend

Install dependencies

Copynpm install

Create a .env file based on .env.example with your database credentials and JWT secret
Create the database and tables

Copy# Use the SQL scripts provided to create your database tables

Start the development server

Copynpm run dev
API Endpoints
Authentication

POST /auth/register - Register a new user
POST /auth/login - Login and receive JWT token
POST /auth/forgot-password - Request password reset

Users

GET /users/profile - Get current user profile
PUT /users/profile - Update user profile

Homes

POST /homes - Create a new home
GET /homes - Get homes for the current user
GET /homes/:home_id - Get a specific home by ID
POST /homes/:home_id/users - Add a user to a home
GET /homes/:home_id/users - Get all users in a home

Tasks

POST /tasks - Create a new task
GET /tasks/home/:home_id - Get all tasks for a home
GET /tasks/assigned - Get tasks assigned to the current user
POST /tasks/assign - Assign a task to a user
PUT /tasks/complete - Mark a task as complete
GET /tasks/:task_id - Get detailed task information

Leaderboard

GET /leaderboard/homes/:home_id - Get leaderboard for a home
GET /leaderboard/user/stats - Get user stats across all homes
GET /leaderboard/homes/:home_id/lowest-scorers - Get lowest scoring users in a home

Notifications

GET /notifications - Get notifications for the current user
PUT /notifications/read - Mark notifications as read
PUT /notifications/read-all - Mark all notifications as read
GET /notifications/count - Get unread notification count

License
This project is licensed under the ISC License.