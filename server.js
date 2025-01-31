const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerDocs = require('./swagger');
const connectDB = require('./config/db');
const User = require('./models/User');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Seed Admin User
const seedAdmin = async () => {
  const adminExists = await User.findOne({ email: 'admin@example.com' });
  if (!adminExists) {
    const admin = new User({
      email: 'admin@example.com',
      password: 'Pa$$w0rd',
      firstName: 'admin',
      lastName: 'admin',
    });
    await admin.save();
    console.log('Admin user seeded!');
  }
};
seedAdmin();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));

// Swagger Documentation
swaggerDocs(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
