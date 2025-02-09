# Employee Database Management System

## Description

This is a command-line application that allows users to manage an employee database using PostgreSQL. Users can view, add, and update departments, roles, and employees through an interactive menu powered by Inquirer.

## Features

- View all departments, roles, and employees
- Add a new department, role, or employee
- Update an employee's role

## Technologies Used

- Node.js
- PostgreSQL
- Inquirer.js
- dotenv

## Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd employee-database
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```env
   DB_USER=your_database_user
   DB_HOST=your_database_host
   DB_NAME=your_database_name
   DB_PASSWORD=your_database_password
   DB_PORT=your_database_port
   ```
4. Initialize the database:
   ```sh
   node initializeDatabase.js
   ```

## Usage

Run the application with:

```sh
npx run dev
```

Follow the on-screen prompts to navigate and manage the database.

## Database Schema

The application includes three main tables:

- `departments` (id, name)
- `roles` (id, title, salary, department\_id)
- `employees` (id, first\_name, last\_name, role\_id, manager\_id)

## Accessing the Video Guide

A demonstration video is included in the project directory. To watch it:

1. Navigate to the Demo folder.
2. Open the video file `2025-02-09 11-55-29.mp4` using any media player.

## License

This project is licensed under the MIT License.

## Author

Your Name

