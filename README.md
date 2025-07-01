# UC-FMO (University of the Cordilleras Facility Management Office)

A web-based system for managing campus facilities and reservations.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- XAMPP (for local development)

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd UC-FMO
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Start MySQL server through XAMPP
   - Create a new database named 'uc_fmo_db'
   - Import the database schema:
     ```bash
     mysql -u root -p uc_fmo_db < database.sql
     ```

4. **Environment Configuration**
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and update the following variables with your local settings:
     ```
     DB_HOST=localhost
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=uc_fmo_db
     JWT_SECRET=your_jwt_secret_key
     PORT=3000
     NODE_ENV=development
     ```

5. **Start the Server**
   ```bash
   npm start
   ```

   The server will start on http://localhost:3000 (or whatever PORT you specified in .env)

## Project Structure

```
UC-FMO/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Custom middleware
├── models/          # Database models
├── public/          # Static files
│   ├── admin/       # Admin interface
│   ├── user/        # User interface
│   └── images/      # Image assets
├── routes/          # API routes
├── database.sql     # Database schema
└── server.js        # Entry point
```

## Available Scripts

- `npm start`: Start the server
- `npm run dev`: Start the server with nodemon (auto-reload on changes)

## Default User Credentials

For testing purposes, you can use these credentials:
- Email: admin@example.com
- Password: admin
- Role: admin

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## Important Notes

- Never commit the `.env` file
- Always update `.env.example` if you add new environment variables
- Keep the database schema (`database.sql`) up to date