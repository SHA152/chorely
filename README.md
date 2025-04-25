# Chorely Monorepo

This repository contains both the frontend and backend code for the Chorely application.

## Structure

- `/frontend` - React frontend application
- `/backend` - Backend API server

## Setup Instructions

1. Clone this repository
2. Install dependencies for both frontend and backend:
   ```
   npm run install:all
   ```
3. Start both applications simultaneously:
   ```
   npm start
   ```

### Alternative Setup

You can also set up and run the frontend and backend separately:

**Frontend:**
```
cd frontend
npm install
npm start
```

**Backend:**
```
cd backend
npm install
npm start
```

## Available Scripts

- `npm run install:all` - Install dependencies for both frontend and backend
- `npm start` - Start both frontend and backend simultaneously
- `npm run build` - Build both frontend and backend
- `npm test` - Run tests for both frontend and backend

## Environment Variables

- Frontend: Create a `.env` file in the `/frontend` directory with:
  ```
  REACT_APP_API_URL=http://localhost:5000
  ```

- Backend: Create a `.env` file in the `/backend` directory with your database connection details and other configuration.
