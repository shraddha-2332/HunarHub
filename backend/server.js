require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const marketplaceRoutes = require('./routes/marketplace');
const entrepreneurRoutes = require('./routes/entrepreneur');
const orderRoutes = require('./routes/orders');
const serviceRequestRoutes = require('./routes/serviceRequests');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

const app = express();
const rootDir = path.join(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');

app.use(cors());
app.use(express.json());

connectDB();

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hunarhub.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!existingAdmin) {
      await User.create({
        name: 'Platform Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        location: 'Head Office',
        isVerified: true
      });
      console.log(`Demo admin created: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Admin bootstrap failed:', error.message);
  }
};

seedAdmin();

app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/entrepreneur', entrepreneurRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/css', express.static(path.join(rootDir, 'css')));
app.use('/js', express.static(path.join(rootDir, 'js')));
app.use('/frontend', express.static(frontendDir));
app.use(express.static(rootDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
