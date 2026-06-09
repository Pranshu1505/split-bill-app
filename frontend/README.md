# 💸 SplitBill App

MERN Stack (MongoDB + Express + React + Node.js) bill splitting app.

## Features
- ✅ User registration & login (JWT auth)
- ✅ Groups banao — trips, flat, friends
- ✅ Expenses add karo with categories (food, travel, shopping...)
- ✅ Equal ya custom split
- ✅ Auto balance calculation — kaun kisko kitna dega
- ✅ Members add karo email se
- ✅ Expense delete karo

## Project Structure

```
split-bill-app/
├── backend/
│   ├── src/
│   │   ├── models/       # User, Group, Expense
│   │   ├── routes/       # auth, groups, expenses
│   │   ├── middleware/   # JWT auth middleware
│   │   └── server.js     # Express entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/        # Login, Register, Home, GroupDetail
    │   ├── components/   # Navbar
    │   ├── context/      # AuthContext
    │   └── services/     # axios API service
    └── vite.config.js
```

## Setup & Run karo

### 1. MongoDB start karo
```bash
# Local MongoDB install hai toh:
mongod

# Ya MongoDB Atlas use karo (free) — https://www.mongodb.com/atlas
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# .env mein MONGO_URI aur JWT_SECRET set karo

npm install
npm run dev      # nodemon ke saath (install karo: npm i -g nodemon)
# ya
node src/server.js
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open karo
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Naya user banao |
| POST | /api/auth/login | Login karo |
| GET  | /api/auth/me | Current user info |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/groups | Saare groups |
| POST   | /api/groups | Naya group |
| GET    | /api/groups/:id | Group details |
| POST   | /api/groups/:id/members | Member add karo |
| DELETE | /api/groups/:id | Group delete karo |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/expenses/group/:id | Group ke expenses |
| POST   | /api/expenses | Naya expense |
| GET    | /api/expenses/group/:id/balances | Balance & settle up |
| DELETE | /api/expenses/:id | Expense delete |

## Environment Variables (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/splitbill
JWT_SECRET=koi_bhi_secret_string_likho_yahan
NODE_ENV=development
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Notifications | react-hot-toast |