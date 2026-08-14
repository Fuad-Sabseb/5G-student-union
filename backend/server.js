const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

let helmet;
try {
  helmet = require('helmet');
} catch (e) {}

let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch (e) {}

const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const blogRoutes = require('./routes/blogRoutes');
const supportRoutes = require('./routes/supportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const forumRoutes = require('./routes/forumRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');

connectDB();

const app = express();

if (helmet) {
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
}

if (rateLimit) {
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    message: { message: 'Too many requests, please try again later.' },
  });
  app.use('/api', globalLimiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { message: 'Too many authentication attempts, please try again later.' },
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
}

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded images (gallery photos, post covers, profile pictures)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Shanan Gibe Student Union API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/announcements', announcementRoutes); // news + events
app.use('/api/gallery', galleryRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/support-requests', supportRoutes); // mentorship + conflict resolution
app.use('/api/resources', resourceRoutes); // academic & student documents
app.use('/api/forum', forumRoutes); // student community discussion
app.use('/api/notifications', notificationRoutes); // in-app notification bell
app.use('/api/ai', aiRoutes); // Gemini AI student support assistant
app.use('/api/upload', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
