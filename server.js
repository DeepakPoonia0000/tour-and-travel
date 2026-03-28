require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const webRoutes = require('./routes/web');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 3 }
}));

app.use((req, res, next) => {
  res.locals.admin = req.session?.admin;
  res.locals.currentUrl = req.originalUrl;
  res.locals.siteUrl = process.env.SITE_URL || `http://localhost:${port}`;
  next();
});

app.use('/', webRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    metaTitle: 'Page not found | Tour & Travel',
    metaDescription: 'The page you requested could not be found.',
    metaKeywords: 'travel, tours, destination, 404',
    metaUrl: `${res.locals.siteUrl}${req.originalUrl}`,
    metaImage: '/images/og-default.jpg'
  });
});

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tour-and-travel', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
