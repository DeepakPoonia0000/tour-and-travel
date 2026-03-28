const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const slugify = require('slugify');
const Country = require('../models/Country');
const State = require('../models/State');
const City = require('../models/City');
const Attraction = require('../models/Attraction');
const Activity = require('../models/Activity');
const Package = require('../models/Package');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${slugify(file.originalname.replace(/\s+/g, '-'), { lower: true, strict: true })}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

const router = express.Router();
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'password';

const buildMeta = ({ title }) => ({
  metaTitle: title,
  metaDescription: title,
  metaKeywords: 'admin, dashboard, travel',
  metaImage: `${process.env.SITE_URL || 'http://localhost:3000'}/images/og-default.jpg`,
  metaUrl: `${process.env.SITE_URL || 'http://localhost:3000'}${'/admin'}`
});

const ensureAdmin = (req, res, next) => {
  if (req.session?.admin) return next();
  res.redirect('/admin/login');
};

const entityMap = {
  countries: Country,
  states: State,
  cities: City,
  attractions: Attraction,
  activities: Activity,
  packages: Package
};

const entityLabels = {
  countries: 'Country',
  states: 'State',
  cities: 'City',
  attractions: 'Attraction',
  activities: 'Activity',
  packages: 'Package'
};

const slugValue = (value, fallback) => {
  const target = (value || fallback || '').toString();
  return slugify(target, { lower: true, strict: true, remove: /[*+~.()"!:@]/g });
};

const loadReferences = async () => ({
  countries: await Country.find().sort({ name: 1 }).lean(),
  states: await State.find().sort({ name: 1 }).lean(),
  cities: await City.find().sort({ name: 1 }).lean(),
  attractions: await Attraction.find().sort({ name: 1 }).lean(),
  activities: await Activity.find().sort({ name: 1 }).lean()
});

router.get('/login', (req, res) => {
  res.render('admin/login', { error: null, ...buildMeta({ title: 'Admin Login | Tour & Travel' }) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === adminEmail && password === adminPassword) {
    req.session.admin = { email };
    return res.redirect('/admin');
  }
  res.render('admin/login', { error: 'Invalid credentials', ...buildMeta({ title: 'Admin Login | Tour & Travel' }) });
});

router.post('/logout', ensureAdmin, (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.get('/', ensureAdmin, async (req, res) => {
  const [countries, states, cities, attractions, activities, packages] = await Promise.all([
    Country.countDocuments(),
    State.countDocuments(),
    City.countDocuments(),
    Attraction.countDocuments(),
    Activity.countDocuments(),
    Package.countDocuments()
  ]);
  res.render('admin/dashboard', {
    counts: { countries, states, cities, attractions, activities, packages },
    ...buildMeta({ title: 'Admin Dashboard | Tour & Travel' })
  });
});

router.get('/:entity', ensureAdmin, async (req, res) => {
  const { entity } = req.params;
  const Model = entityMap[entity];
  if (!Model) return res.redirect('/admin');

  const items = await Model.find().sort({ priority: 1, updatedAt: -1 }).lean();
  res.render('admin/list', {
    entity,
    entityLabel: entityLabels[entity],
    items,
    ...buildMeta({ title: `${entityLabels[entity]}s | Admin` })
  });
});

router.get('/:entity/new', ensureAdmin, async (req, res) => {
  const { entity } = req.params;
  if (!entityMap[entity]) return res.redirect('/admin');
  const refs = await loadReferences();
  res.render('admin/form', {
    entity,
    entityLabel: entityLabels[entity],
    record: {},
    references: refs,
    action: `/admin/${entity}`,
    method: 'POST',
    ...buildMeta({ title: `Create ${entityLabels[entity]} | Admin` })
  });
});

router.get('/:entity/:id/edit', ensureAdmin, async (req, res) => {
  const { entity, id } = req.params;
  const Model = entityMap[entity];
  if (!Model) return res.redirect('/admin');

  const record = await Model.findById(id).lean();
  if (!record) return res.redirect(`/admin/${entity}`);

  const refs = await loadReferences();
  res.render('admin/form', {
    entity,
    entityLabel: entityLabels[entity],
    record,
    references: refs,
    action: `/admin/${entity}/${id}`,
    method: 'POST',
    ...buildMeta({ title: `Edit ${entityLabels[entity]} | Admin` })
  });
});

router.post('/:entity', ensureAdmin, upload.single('heroImageFile'), async (req, res) => {
  const { entity } = req.params;
  const Model = entityMap[entity];
  if (!Model) return res.redirect('/admin');

  const recordData = { ...req.body };
  if (req.file) {
    recordData.heroImage = `/uploads/${req.file.filename}`;
  } else if (req.body.heroImageUrl) {
    recordData.heroImage = req.body.heroImageUrl;
  }
  recordData.slug = slugValue(req.body.slug, req.body.name);
  recordData.priority = parseInt(req.body.priority, 10) || 9999;

  if (entity === 'states') recordData.country = req.body.country;
  if (entity === 'cities') {
    recordData.country = req.body.country;
    recordData.state = req.body.state;
  }
  if (entity === 'attractions' || entity === 'activities') {
    if (req.body.country) recordData.country = req.body.country;
    if (req.body.state) recordData.state = req.body.state;
    if (req.body.city) recordData.city = req.body.city;
  }

  if (entity === 'packages') {
    recordData.price = req.body.price;
    recordData.duration = req.body.duration;
    recordData.itineraryCountries = Array.isArray(req.body.itineraryCountries) ? req.body.itineraryCountries.filter(Boolean) : req.body.itineraryCountries ? [req.body.itineraryCountries] : [];
    recordData.itineraryStates = Array.isArray(req.body.itineraryStates) ? req.body.itineraryStates.filter(Boolean) : req.body.itineraryStates ? [req.body.itineraryStates] : [];
    recordData.itineraryCities = Array.isArray(req.body.itineraryCities) ? req.body.itineraryCities.filter(Boolean) : req.body.itineraryCities ? [req.body.itineraryCities] : [];
    recordData.itineraryAttractions = Array.isArray(req.body.itineraryAttractions) ? req.body.itineraryAttractions.filter(Boolean) : req.body.itineraryAttractions ? [req.body.itineraryAttractions] : [];
    recordData.itineraryActivities = Array.isArray(req.body.itineraryActivities) ? req.body.itineraryActivities.filter(Boolean) : req.body.itineraryActivities ? [req.body.itineraryActivities] : [];
  }

  try {
    await Model.create(recordData);
    res.redirect(`/admin/${entity}`);
  } catch (error) {
    const refs = await loadReferences();
    res.render('admin/form', {
      entity,
      entityLabel: entityLabels[entity],
      record: recordData,
      references: refs,
      action: `/admin/${entity}`,
      method: 'POST',
      error: error.message,
      ...buildMeta({ title: `Create ${entityLabels[entity]} | Admin` })
    });
  }
});

router.post('/:entity/:id', ensureAdmin, upload.single('heroImageFile'), async (req, res) => {
  const { entity, id } = req.params;
  const Model = entityMap[entity];
  if (!Model) return res.redirect('/admin');

  const recordData = { ...req.body };
  if (req.file) {
    recordData.heroImage = `/uploads/${req.file.filename}`;
  } else if (req.body.heroImageUrl) {
    recordData.heroImage = req.body.heroImageUrl;
  }
  recordData.slug = slugValue(req.body.slug, req.body.name);
  recordData.priority = parseInt(req.body.priority, 10) || 9999;

  if (entity === 'states') recordData.country = req.body.country;
  if (entity === 'cities') {
    recordData.country = req.body.country;
    recordData.state = req.body.state;
  }
  if (entity === 'attractions' || entity === 'activities') {
    recordData.country = req.body.country;
    recordData.state = req.body.state;
    recordData.city = req.body.city;
  }

  if (entity === 'packages') {
    recordData.price = req.body.price;
    recordData.duration = req.body.duration;
    recordData.itineraryCountries = Array.isArray(req.body.itineraryCountries) ? req.body.itineraryCountries.filter(Boolean) : req.body.itineraryCountries ? [req.body.itineraryCountries] : [];
    recordData.itineraryStates = Array.isArray(req.body.itineraryStates) ? req.body.itineraryStates.filter(Boolean) : req.body.itineraryStates ? [req.body.itineraryStates] : [];
    recordData.itineraryCities = Array.isArray(req.body.itineraryCities) ? req.body.itineraryCities.filter(Boolean) : req.body.itineraryCities ? [req.body.itineraryCities] : [];
    recordData.itineraryAttractions = Array.isArray(req.body.itineraryAttractions) ? req.body.itineraryAttractions.filter(Boolean) : req.body.itineraryAttractions ? [req.body.itineraryAttractions] : [];
    recordData.itineraryActivities = Array.isArray(req.body.itineraryActivities) ? req.body.itineraryActivities.filter(Boolean) : req.body.itineraryActivities ? [req.body.itineraryActivities] : [];
  }

  try {
    await Model.findByIdAndUpdate(id, recordData, { runValidators: true });
    res.redirect(`/admin/${entity}`);
  } catch (error) {
    const refs = await loadReferences();
    const record = await Model.findById(id).lean();
    res.render('admin/form', {
      entity,
      entityLabel: entityLabels[entity],
      record: { ...record, ...recordData },
      references: refs,
      action: `/admin/${entity}/${id}`,
      method: 'POST',
      error: error.message,
      ...buildMeta({ title: `Edit ${entityLabels[entity]} | Admin` })
    });
  }
});

router.post('/:entity/:id/delete', ensureAdmin, async (req, res) => {
  const { entity, id } = req.params;
  const Model = entityMap[entity];
  if (Model) {
    await Model.findByIdAndDelete(id);
  }
  res.redirect(`/admin/${entity}`);
});

module.exports = router;
