require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');
const Product = require('./models/Product');
const Service = require('./models/Service');

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

const ensureDemoMarketplaceData = async () => {
  try {
    const entrepreneurCount = await User.countDocuments({ role: 'entrepreneur' });
    if (entrepreneurCount > 0) {
      return;
    }

    const demoEntrepreneurs = await User.create([
      {
        name: 'Ramesh Cobbler',
        email: 'ramesh.cobbler@hunarhub.local',
        password: 'Demo@123',
        role: 'entrepreneur',
        phone: '9876543210',
        location: 'Jaipur',
        bio: 'Footwear repair specialist serving local communities with affordable and durable workmanship.',
        skillType: 'cobbler',
        skills: ['Shoe Repair', 'Leather Stitching', 'Polishing'],
        experienceYears: 12,
        pricingDetails: 'Starts from Rs 80',
        availability: 'Available 10 AM - 7 PM',
        isVerified: true
      },
      {
        name: 'Meera Kumhar',
        email: 'meera.potter@hunarhub.local',
        password: 'Demo@123',
        role: 'entrepreneur',
        phone: '9988776655',
        location: 'Udaipur',
        bio: 'Traditional potter creating handmade clay decor, kitchenware, and festive items.',
        skillType: 'potter',
        skills: ['Clay Pots', 'Decor Items', 'Custom Pottery'],
        experienceYears: 9,
        pricingDetails: 'Starts from Rs 150',
        availability: 'Orders accepted daily',
        isVerified: true
      },
      {
        name: 'Sana Tailors',
        email: 'sana.tailor@hunarhub.local',
        password: 'Demo@123',
        role: 'entrepreneur',
        phone: '9090909090',
        location: 'Delhi',
        bio: 'Tailoring and alteration services for daily wear, custom stitching, and occasion outfits.',
        skillType: 'tailor',
        skills: ['Alterations', 'Custom Stitching', 'Women Tailoring'],
        experienceYears: 11,
        pricingDetails: 'Starts from Rs 200',
        availability: 'Available on weekdays and weekends',
        isVerified: true
      }
    ]);

    await Product.insertMany([
      {
        name: 'Handcrafted Leather Sandal Repair',
        description: 'Repair package for worn-out sandals with stitching and sole reinforcement.',
        price: 120,
        category: 'cobbler',
        location: 'Jaipur',
        seller: demoEntrepreneurs[0]._id,
        stock: 10
      },
      {
        name: 'Decorative Clay Vase',
        description: 'Handmade painted clay vase crafted by a traditional potter.',
        price: 450,
        category: 'potter',
        location: 'Udaipur',
        seller: demoEntrepreneurs[1]._id,
        stock: 6
      },
      {
        name: 'Hand-stitched Cotton Kurti',
        description: 'Locally tailored kurti with custom fitting and breathable cotton fabric.',
        price: 850,
        category: 'tailor',
        location: 'Delhi',
        seller: demoEntrepreneurs[2]._id,
        stock: 8
      }
    ]);

    await Service.insertMany([
      {
        entrepreneur: demoEntrepreneurs[0]._id,
        title: 'Shoe Repair Service',
        description: 'Repair of torn shoes, sole replacement, and leather restoration.',
        category: 'cobbler',
        location: 'Jaipur',
        price: 150,
        priceUnit: 'per pair',
        availability: 'Same-day service available'
      },
      {
        entrepreneur: demoEntrepreneurs[1]._id,
        title: 'Custom Pottery Order',
        description: 'Custom clay decor and utility pottery for homes and events.',
        category: 'potter',
        location: 'Udaipur',
        price: 300,
        priceUnit: 'per order',
        availability: '3-5 days turnaround'
      },
      {
        entrepreneur: demoEntrepreneurs[2]._id,
        title: 'Dress Alteration and Stitching',
        description: 'Tailoring, fitting, and alterations for casual and occasion wear.',
        category: 'tailor',
        location: 'Delhi',
        price: 250,
        priceUnit: 'per service',
        availability: 'Bookings open all week'
      }
    ]);

    console.log('Demo marketplace data created');
  } catch (error) {
    console.error('Demo data bootstrap failed:', error.message);
  }
};

seedAdmin().then(ensureDemoMarketplaceData);

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
