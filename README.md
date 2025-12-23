---

# Express + MongoDB Backend

A RESTful backend API built using **Node.js**, **Express.js**, and **MongoDB**.
This project follows a clean folder structure and supports scalable development for web and mobile applications.

---

## Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB** (Mongoose ODM)
* **JWT** (Authentication)
* **bcrypt** (Password hashing)
* **dotenv** (Environment variables)
* **cors**
* **nodemon** (Development)

---

## Features

* RESTful API architecture
* MongoDB connection using Mongoose
* User authentication (JWT-based)
* Secure password hashing
* Environment-based configuration
* Modular route and controller structure
* Error handling middleware
* Ready for integration with React / React Native frontend

---

## Project Structure

```
backend/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── authController.js
│   │
│   ├── models/
│   │   └── User.js
│   │
│   ├── routes/
│   │   └── authRoutes.js
│   │
│   ├── middlewares/
│   │   └── authMiddleware.js
│   │
│   ├── utils/
│   │   └── generateToken.js
│   │
│   └── app.js
│
├── .env
├── server.js
├── package.json
└── README.md
```

---

## Installation

1. Clone the repository

```bash
git clone https://github.com/AryaVeerJai/wattn_inventory.git
cd your-repo-name
```

2. Install dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=4000
NEW_DB_LOCAL_URI=mongodb://localhost:27017/your_db_name
JWT_SECRET=your_secret_key
NODE_ENV=production
GOOGLE_USER_ID=your_google_email_id_for_OAuth_Email
GOOGLE_USER_PASS=your_google_auth_password_for_OAuth_Email
JWT_EXPIRES_TIME=7d
FRONTEND_URL=https://your_frontend_url/
```

---

## Running the Server

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm start
```

Server will run on:

```
http://localhost:4000
```

---

## API Endpoints (Example)

### Auth Routes

| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| POST   | /api/auth/register | Register user    |
| POST   | /api/auth/login    | Login user       |
| GET    | /api/auth/profile  | Get user profile |

---

## Database

* MongoDB is used as the primary database
* Mongoose handles schema modeling and validation
* Connection logic is located in `src/config/database.js`

---

## Security

* Passwords are hashed using **bcrypt**
* Authentication handled using **JWT**
* Protected routes use auth middleware

---

## Scripts

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## Future Improvements

* Role-based access control
* Refresh tokens
* API documentation using Swagger
* Rate limiting
* Logging with Winston

---

## License

This project is licensed under the **Wattn Engineering**.

---

## Author

**Jai Prakash Kumar**
Backend Developer | MERN Stack

---

