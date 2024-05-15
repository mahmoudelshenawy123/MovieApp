# MovieApp

## Overview

MovieApp is a Node.js application built with Express.js for managing movies, users, and admin users. It provides functionalities such as adding, updating, deleting movies and users, authentication, authorization, and more.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (Recommended version 16) installed on your local machine.
- MongoDB installed and running on your local machine with connection string `mongodb://localhost:27017`.

## Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Install dependencies using `npm install`.

## Usage

1. Set up environment variables by creating a `.env` file based on the provided `.env.example`.
2. Start the server using `npm start`.
3. The server will be running locally on port specified in the environment variable `PORT` or default port 8080.

## Scripts

- `npm start`: Start the server using nodemon.
- `npm run lint`: Lint source files using ESLint.
- `npm run seed`: Seed data into the database.
- `npm run lint:fix`: Fix linting errors automatically.

## Project Structure

```shell
.
├── .dockerignore
├── .env
├── .eslintrc.json
├── .gitignore
├── .prettierrc.json
├── app.js
├── docker-compose.yml
├── Dockerfile
├── package-lock.json
├── package.json
├── README.md
└── src
├── components
│ ├── AdminUsers
│ │ ├── AdminUsersController.js
│ │ ├── AdminUsersModel.js
│ │ ├── AdminUsersRoutes.js
│ │ └── AdminUsersService.js
│ ├── Movies
│ │ ├── MoviesController.js
│ │ ├── MoviesModel.js
│ │ ├── MoviesRoutes.js
│ │ └── MoviesService.js
│ └── Users
│ ├── UsersController.js
│ ├── UsersModel.js
│ ├── UsersRoutes.js
│ └── UsersService.js
├── config
│ ├── DBConfig.js
│ ├── logger.js
│ ├── ModuleAliases.js
│ └── Routes.js
├── documents
│ └── 1000GreatestFilms.csv
├── helper
│ ├── Cache.js
│ ├── ErrorHandler.js
│ ├── HelperFunctions.js
│ └── Keys.js
├── middleware
│ ├── auth.js
│ └── authMiddlewares.js
└── seed
└── index.js
```

## Endpoints

1. **Movies**
   - `/movies/all-movies`: Get all movies.
   - `/movies/all-movies-with-pagination`: Get all movies with pagination.
   - `/movies/single-movie/:id`: Get a single movie by ID.
   - `/movies/add-movie`: Add a new movie (Admin only).
   - `/movies/add-movies-from-file`: Add movies from file (Admin only).
   - `/movies/update-movie/:id`: Update a movie (Admin only).
   - `/movies/delete-movie/:id`: Delete a movie (Admin only).
2. **Users**

   - `/users/all-users`: Get all users (Admin only).
   - `/users/all-users-with-pagination`: Get all users with pagination (Admin only).
   - `/users/single-user/:id`: Get a single user by ID.
   - `/users/add-user`: Add a new user.
   - `/users/login`: User login.
   - `/users/update-user/:id`: Update a user.
   - `/users/delete-user/:id`: Delete a user (Admin only).
   - `/users/toggle-movie-from-favorite`: Toggle movie from user's favorites.
   - `/users/all-favorited-movie`: Get all user favorited movies.

3. **Admin Users**
   - `/admin-users/all-admin-users`: Get all admin users (Admin only).
   - `/admin-users/all-admin-users-with-pagination`: Get all admin users with pagination (Admin only).
   - `/admin-users/single-admin-user/:id`: Get a single admin user by ID (Admin only).
   - `/admin-users/add-admin-user`: Add a new admin user (Admin only).
   - `/admin-users/login`: Admin user login.
   - `/admin-users/update-admin-user/:id`: Update an admin user (Admin only).
   - `/admin-users/delete-admin-user/:id`: Delete an admin user (Admin only).
