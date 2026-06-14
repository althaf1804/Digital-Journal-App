# 📔 Digital Journal App

A full-stack MERN (MongoDB, Express, React, Node.js) Digital Journal application built as part of a Full Stack Web Development Internship project. Users can register, log in, and create, edit, delete, search, filter, and favorite personal journal entries with mood tracking.

## ✨ Features

- **User Authentication** – Secure registration and login using JWT and bcrypt password hashing
- **Create, Read, Update, Delete (CRUD)** journal entries
- **Mood Tracking** – Tag entries with moods (happy, sad, excited, anxious, etc.)
- **Tags** – Organize entries with custom tags
- **Search & Filter** – Search by keyword, filter by mood or favorites
- **Favorites** – Mark important entries as favorites
- **Pagination** – Browse entries page by page
- **Dashboard Stats** – View total entries and favorite counts
- **Protected Routes** – Only logged-in users can access their own journal
- **Responsive UI** – Clean, mobile-friendly design

## 🛠️ Tech Stack

**Frontend**
- React 18 (Vite)
- React Router DOM
- Axios
- Context API for auth state

**Backend**
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for authentication
- bcryptjs for password hashing
- dotenv & CORS

## 📁 Project Structure

```
digital-journal-app/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── entryController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Entry.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── entryRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── EntryCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── EntryForm.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/digital-journal-app.git
cd digital-journal-app
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Update `.env` with your MongoDB URI and a strong JWT secret:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/digital_journal
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```
Run the server:
```bash
npm run dev
```
Server runs at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
```
Update `.env` if needed:
```
VITE_API_URL=http://localhost:5000/api
```
Run the dev server:
```bash
npm run dev
```
App runs at `http://localhost:3000`.

## 🔑 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user profile | Private |

### Journal Entry Routes (`/api/entries`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all entries (supports `search`, `mood`, `favorite`, `page`, `limit`) | Private |
| GET | `/stats` | Get journal statistics | Private |
| GET | `/:id` | Get single entry | Private |
| POST | `/` | Create new entry | Private |
| PUT | `/:id` | Update entry | Private |
| DELETE | `/:id` | Delete entry | Private |

All private routes require an `Authorization: Bearer <token>` header.

## 📦 Deployment Tips

- **Backend**: Deploy to Render, Railway, or Heroku. Set environment variables in the hosting dashboard.
- **Frontend**: Deploy to Vercel or Netlify. Set `VITE_API_URL` to your deployed backend URL.
- **Database**: Use [MongoDB Atlas](https://www.mongodb.com/atlas) for a free cloud database.

## 📄 License

This project is open source and available for educational use under the MIT License.

## 👤 Author

Built as a Full Stack Web Development Internship project.
