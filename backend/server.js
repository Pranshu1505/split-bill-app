const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const groupRoutes = require('./src/routes/groups');
const expenseRoutes = require('./src/routes/expenses');
const settlementRoutes = require('./src/routes/settlements');

const app = express();

// app.use(cors({ origin: 'http://localhost:5173',"https://gleeful-genie-e48191.netlify.app"
//   , credentials: true }));
app.use(cors({
  origin: [
    "http://localhost:5173",
    // "https://gleeful-genie-e48191.netlify.app",
    // "split-bill-app-pranshu.netlify.app"
    process.env.CLIENT_URL
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('❌ MongoDB error:', err));