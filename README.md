# Portfolio Platform

Portfolio Platform is a web application designed for creating and managing portfolios.
Users can create, view, edit, and delete their portfolios. The platform also supports two-factor authentication (2FA) for enhanced security.

## Features

- **User Features**:

  - User registration and login with 2FA (Two-Factor Authentication).
  - Create portfolio with image uploads powered by Cloudinary.
  - View other users’ portfolios.
  - Real-time financial data and graph visualization using the Alpha Vantage API.

- **Admin Features**:

  - Promote or downgrade users between Admin and Editor roles.
  - Edit or delete portfolios created by users.
  - Notify portfolio owners via email for portfolio updates or deletions.

- **Additional Features**:
  - Role-based access control.
  - Email notifications using Nodemailer.
  - Responsive portfolio image galleries.

## Tools and Technologies

- **Backend**
  
  - Node.js with Express.js: Server and API.
  - Mongoose: MongoDB object modeling.
  - Passport.js: Authentication, including 2FA.
 
- **Frontend**
  
  - EJS: Template engine for dynamic HTML rendering.
  - Chart.js: Financial data visualization.
    
- **APIs**
  
  - Cloudinary: Image hosting and management.
  - Alpha Vantage: Financial data API.
  - SendGrid: Email notifications.

- **Other Tools**
  
  - Axios: HTTP requests.
  - Multer: File uploads.
  - Dotenv: Environment variable management.
    
## Project Structure

```
portfolio-platform/
├── config/
│   ├── cloudinary.js         # Cloudinary configuration for image uploads
│   ├── multer.js             # Multer setup for handling file uploads
│   ├── passport.js           # Passport.js configuration for user authentication
├── middlewares/
│   ├── admin.js              # Middleware to ensure user is an admin
│   ├── auth.js               # Middleware to ensure user is authenticated
├── models/
│   ├── User.js               # Mongoose schema for user data
│   ├── Portfolio.js          # Mongoose schema for portfolio data
├── routes/
│   ├── 2fa.js                # Routes for managing Two-Factor Authentication
│   ├── auth.js               # Routes for user authentication (login, register, logout)
│   ├── portfolio.js          # Routes for portfolio management
│   ├── financial.js          # Routes for retrieving data from alpha vintage api
├── utils/
│   ├── mailer.js             # Utility for sending emails
├── views/
│   ├── 2fa/
│   │   ├── setup.ejs         # Setup page for 2FA
│   ├── admin/
│   │   ├── dashboard.ejs     # Admin dashboard
│   │   ├── editPortfolio.ejs # Portfolio editing page for admin
│   │   ├── users.ejs         # User management page for admin
│   ├── partials/
│   │   ├── navbar.ejs        # Navbar partial
│   │   ├── footer.ejs        # Footer partial
│   ├── createPortfolio.ejs   # Portfolio creation page
│   ├── financial.ejs         # Graph of digital curencies
│   ├── layout.ejs            # Main layout template
│   ├── login.ejs             # Login page
│   ├── register.ejs          # Registration page
│   ├── portfolio.ejs         # User's portfolio dashboard
│   ├── viewPortfolio.ejs     # Detailed view of a specific portfolio
├── public/
│   ├── css/
│       ├── style.css         # Styles for the application
├── .env                      # Environment variables
├── app.js                    # Main entry point of the application
├── package.json              # Project dependencies and scripts
├── .gitignore                # Files and folders to ignore in Git
```

## Installation

### Prerequisites

- Node.js and npm installed.
- MongoDB database instance running.
- Cloudinary account for image hosting.

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/portfolio-platform.git
   cd portfolio-platform
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and add the following variables:

   ```env
   MONGO_URI=<your_mongo_connection_string>
   SESSION_SECRET=<your_session_secret>
   EMAIL_USER=<your_email_address>
   EMAIL_PASS=<your_email_password>
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
   CLOUDINARY_API_KEY=<your_cloudinary_api_key>
   CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
   ALPHA_VANTAGE_API_KEY=<your_alph_vintage_api_key>
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Open the application in your browser at `http://localhost:3000`.
