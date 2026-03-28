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
const Hotel = require('../models/Hotel');
const Blog = require('../models/Blog');
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
  hotels: Hotel,
  blogs: Blog,
  packages: Package
};

const entityLabels = {
  countries: 'Country',
  states: 'State',
  cities: 'City',
  attractions: 'Attraction',
  activities: 'Activity',
  hotels: 'Hotel',
  blogs: 'Blog',
  packages: 'Package'
};

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.map((item) => item?.toString().trim()).filter(Boolean);
  if (typeof value === 'string') return value.split('\n').map((item) => item.trim()).filter(Boolean);
  return [];
};

const normalizeBestTimeGuide = (guide = {}) => {
  if (!guide || typeof guide !== 'object') return undefined;

  const seasons = Array.isArray(guide.seasons)
    ? guide.seasons.map((season) => ({
      ...season,
      highlights: normalizeList(season?.highlights)
    })).filter((season) => Object.values(season).some((value) => Array.isArray(value) ? value.length : String(value || '').trim()))
    : [];

  const travelerProfiles = Array.isArray(guide.travelerProfiles)
    ? guide.travelerProfiles.filter((profile) => Object.values(profile || {}).some((value) => String(value || '').trim()))
    : [];

  const normalized = {
    heroEyebrow: guide.heroEyebrow,
    heroTitle: guide.heroTitle,
    heroDescription: guide.heroDescription,
    heroImage: guide.heroImage,
    heroImageAlt: guide.heroImageAlt,
    heroCardTitle: guide.heroCardTitle,
    heroCardText: guide.heroCardText,
    seasons,
    travelerProfiles,
    ctaLabel: guide.ctaLabel,
    ctaHref: guide.ctaHref
  };

  return Object.values(normalized).some((value) => Array.isArray(value) ? value.length : String(value || '').trim())
    ? normalized
    : undefined;
};

const normalizeItems = (items = [], listFields = []) => {
  if (!Array.isArray(items)) return [];
  return items.map((item = {}) => {
    const normalizedItem = { ...item };
    for (const field of listFields) {
      normalizedItem[field] = normalizeList(item?.[field]);
    }
    return normalizedItem;
  }).filter((item) => Object.values(item).some((value) => Array.isArray(value) ? value.length : String(value || '').trim()));
};

const normalizePackageItems = (items = [], listFields = [], booleanFields = []) => {
  if (!Array.isArray(items)) return [];
  return items.map((item = {}) => {
    const normalizedItem = { ...item };
    for (const field of listFields) {
      normalizedItem[field] = normalizeList(item?.[field]);
    }
    for (const field of booleanFields) {
      normalizedItem[field] = item?.[field] === 'true' || item?.[field] === true || item?.[field] === 'on';
    }
    return normalizedItem;
  }).filter((item) => Object.values(item).some((value) => Array.isArray(value) ? value.length : typeof value === 'boolean' ? value : String(value || '').trim()));
};

const normalizeHotelGuide = (guide = {}) => {
  if (!guide || typeof guide !== 'object') return undefined;
  const normalized = {
    heroEyebrow: guide.heroEyebrow,
    heroTitle: guide.heroTitle,
    heroDescription: guide.heroDescription,
    heroImage: guide.heroImage,
    heroImageAlt: guide.heroImageAlt,
    filterPrimary: guide.filterPrimary,
    filterSecondary: guide.filterSecondary,
    filterTertiary: guide.filterTertiary,
    tagOne: guide.tagOne,
    tagTwo: guide.tagTwo,
    tagThree: guide.tagThree,
    hotels: normalizeItems(guide.hotels, ['features']),
    newsletterTitle: guide.newsletterTitle,
    newsletterText: guide.newsletterText
  };

  return Object.values(normalized).some((value) => Array.isArray(value) ? value.length : String(value || '').trim())
    ? normalized
    : undefined;
};

const normalizeHowToReachGuide = (guide = {}) => {
  if (!guide || typeof guide !== 'object') return undefined;
  const normalized = {
    heroEyebrow: guide.heroEyebrow,
    heroTitle: guide.heroTitle,
    heroDescription: guide.heroDescription,
    heroImage: guide.heroImage,
    heroImageAlt: guide.heroImageAlt,
    heroCardTitle: guide.heroCardTitle,
    heroCardText: guide.heroCardText,
    sections: Array.isArray(guide.sections)
      ? guide.sections.map((section) => ({
        ...section,
        items: normalizeItems(section?.items || [])
      })).filter((section) => Object.values(section).some((value) => Array.isArray(value) ? value.length : String(value || '').trim()))
      : [],
    mapTitle: guide.mapTitle,
    mapDescription: guide.mapDescription,
    mapImage: guide.mapImage,
    mapImageAlt: guide.mapImageAlt,
    mapBadgeOne: guide.mapBadgeOne,
    mapBadgeTwo: guide.mapBadgeTwo,
    connectivityTip: guide.connectivityTip,
    finalMile: guide.finalMile
  };

  return Object.values(normalized).some((value) => Array.isArray(value) ? value.length : String(value || '').trim())
    ? normalized
    : undefined;
};

const slugValue = (value, fallback) => {
  const target = (value || fallback || '').toString();
  return slugify(target, { lower: true, strict: true, remove: /[*+~.()"!:@]/g });
};

const referenceModelMap = {
  countries: Country,
  states: State,
  cities: City,
  attractions: Attraction,
  activities: Activity,
  hotels: Hotel
  ,blogs: Blog
};

const normalizeIdList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [String(value)];
};

const loadSelectedReferences = async (record = {}) => {
  const selections = {
    countries: normalizeIdList(record.country || record.itineraryCountries),
    states: normalizeIdList(record.state || record.itineraryStates),
    cities: normalizeIdList(record.city || record.itineraryCities),
    attractions: normalizeIdList(record.attraction || record.attractions || record.itineraryAttractions),
    activities: normalizeIdList(record.itineraryActivities),
    hotels: normalizeIdList(record.hotel || record.itineraryHotels),
    blogs: normalizeIdList(record.blogs)
  };

  const entries = await Promise.all(Object.entries(selections).map(async ([key, ids]) => {
    if (!ids.length) return [key, []];
    const docs = await referenceModelMap[key].find({ _id: { $in: ids } }).sort({ name: 1 }).lean();
    return [key, docs];
  }));

  return Object.fromEntries(entries);
};

const parseSearchQuery = (req) => {
  const search = (req.query.search || req.query.q || '').toString().trim();
  if (!search) return {};
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return { $or: [{ name: regex }, { slug: regex }, { summary: regex }] };
};

const parsePagination = (req, defaultLimit = 20) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

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
  const [countries, states, cities, attractions, activities, hotels, blogs, packages] = await Promise.all([
    Country.countDocuments(),
    State.countDocuments(),
    City.countDocuments(),
    Attraction.countDocuments(),
    Activity.countDocuments(),
    Hotel.countDocuments(),
    Blog.countDocuments(),
    Package.countDocuments()
  ]);
  res.render('admin/dashboard', {
    counts: { countries, states, cities, attractions, activities, hotels, blogs, packages },
    ...buildMeta({ title: 'Admin Dashboard | Tour & Travel' })
  });
});

router.get('/api/options/:entity', ensureAdmin, async (req, res) => {
  const { entity } = req.params;
  const Model = entityMap[entity];
  if (!Model) return res.status(404).json({ items: [] });

  const q = (req.query.q || '').toString().trim();
  const regex = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
  const limit = Math.max(1, Math.min(25, parseInt(req.query.limit, 10) || 15));
  const filter = {};

  if (regex) filter.$or = [{ name: regex }, { slug: regex }];
  if (entity === 'states' && req.query.countryId) filter.country = req.query.countryId;
  if (entity === 'cities') {
    if (req.query.stateId) filter.state = req.query.stateId;
    else if (req.query.countryId) filter.country = req.query.countryId;
  }
  if (entity === 'attractions' || entity === 'activities' || entity === 'hotels') {
    if (req.query.cityId) filter.city = req.query.cityId;
    else if (req.query.stateId) filter.state = req.query.stateId;
    else if (req.query.countryId) filter.country = req.query.countryId;
  }

  const items = await Model.find(filter).sort({ priority: 1, name: 1 }).limit(limit).lean();
  res.json({
    items: items.map((item) => ({
      value: String(item._id),
      text: item.name,
      meta: item.slug
    }))
  });
});

router.get('/:entity', ensureAdmin, async (req, res) => {
  const { entity } = req.params;
  const Model = entityMap[entity];
  if (!Model) return res.redirect('/admin');

  const searchFilter = parseSearchQuery(req);
  const { page, limit, skip } = parsePagination(req, 20);
  const total = await Model.countDocuments(searchFilter);
  const items = await Model.find(searchFilter).sort({ priority: 1, updatedAt: -1 }).skip(skip).limit(limit).lean();

  res.render('admin/list', {
    entity,
    entityLabel: entityLabels[entity],
    items,
    search: req.query.search || req.query.q || '',
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      baseUrl: `/admin/${entity}`,
      query: req.query.search ? `search=${encodeURIComponent(req.query.search)}` : ''
    },
    ...buildMeta({ title: `${entityLabels[entity]}s | Admin` })
  });
});

router.get('/:entity/new', ensureAdmin, async (req, res) => {
  const { entity } = req.params;
  if (!entityMap[entity]) return res.redirect('/admin');
  const selectedReferences = await loadSelectedReferences({});
  res.render('admin/form', {
    entity,
    entityLabel: entityLabels[entity],
    record: {},
    selectedReferences,
    action: `/admin/${entity}`,
    method: 'POST',
    error: null,
    ...buildMeta({ title: `Create ${entityLabels[entity]} | Admin` })
  });
});

router.get('/:entity/:id/edit', ensureAdmin, async (req, res) => {
  const { entity, id } = req.params;
  const Model = entityMap[entity];
  if (!Model) return res.redirect('/admin');

  const record = await Model.findById(id).lean();
  if (!record) return res.redirect(`/admin/${entity}`);

  const selectedReferences = await loadSelectedReferences(record);
  res.render('admin/form', {
    entity,
    entityLabel: entityLabels[entity],
    record,
    selectedReferences,
    action: `/admin/${entity}/${id}`,
    method: 'POST',
    error: null,
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
  recordData.bestTimeToVisitGuide = normalizeBestTimeGuide(req.body.bestTimeToVisitGuide);
  recordData.hotelGuide = normalizeHotelGuide(req.body.hotelGuide);
  recordData.howToReachGuide = normalizeHowToReachGuide(req.body.howToReachGuide);

  if (entity === 'states') recordData.country = req.body.country;
  if (entity === 'cities') {
    recordData.country = req.body.country;
    recordData.state = req.body.state;
  }
  if (entity === 'attractions' || entity === 'activities' || entity === 'hotels') {
    if (req.body.country) recordData.country = req.body.country;
    if (req.body.state) recordData.state = req.body.state;
    if (req.body.city) recordData.city = req.body.city;
  }

  if (entity === 'attractions') {
    recordData.galleryImages = normalizeList(req.body.galleryImages);
    recordData.expectItems = normalizeItems(req.body.expectItems || []);
  }

  if (entity === 'hotels') {
    recordData.rating = req.body.rating;
    recordData.price = req.body.price;
    recordData.amenities = normalizeList(req.body.amenities);
  }

  if (entity === 'blogs') {
    recordData.content = req.body.content;
    recordData.authorName = req.body.authorName;
    recordData.authorRole = req.body.authorRole;
    recordData.authorBio = req.body.authorBio;
    recordData.authorImage = req.body.authorImage;
    recordData.primaryCategory = req.body.primaryCategory;
    recordData.categories = normalizeList(req.body.categories);
    recordData.readTime = req.body.readTime;
    recordData.publishedAt = req.body.publishedAt || undefined;
    recordData.countries = normalizeIdList(req.body.countries);
    recordData.states = normalizeIdList(req.body.states);
    recordData.cities = normalizeIdList(req.body.cities);
    recordData.attractions = normalizeIdList(req.body.attractions);
  }

  if (entity === 'packages') {
    recordData.heroEyebrow = req.body.heroEyebrow;
    recordData.heroLocation = req.body.heroLocation;
    recordData.heroSeason = req.body.heroSeason;
    recordData.introHeading = req.body.introHeading;
    recordData.introBody = req.body.introBody;
    recordData.introImage = req.body.introImage;
    recordData.testimonialQuote = req.body.testimonialQuote;
    recordData.testimonialAuthor = req.body.testimonialAuthor;
    recordData.pricingHeading = req.body.pricingHeading;
    recordData.pricingDescription = req.body.pricingDescription;
    recordData.bookingPriceLabel = req.body.bookingPriceLabel;
    recordData.bookingButtonLabel = req.body.bookingButtonLabel;
    recordData.bookingSecondaryLabel = req.body.bookingSecondaryLabel;
    recordData.price = req.body.price;
    recordData.duration = req.body.duration;
    recordData.itineraryDays = normalizePackageItems(req.body.itineraryDays || []);
    recordData.pricingTiers = normalizePackageItems(req.body.pricingTiers || [], ['features'], ['isFeatured']);
    recordData.inclusions = normalizeList(req.body.inclusions);
    recordData.exclusions = normalizeList(req.body.exclusions);
    recordData.reviews = normalizePackageItems(req.body.reviews || []);
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
    const selectedReferences = await loadSelectedReferences(recordData);
    res.render('admin/form', {
      entity,
      entityLabel: entityLabels[entity],
      record: recordData,
      selectedReferences,
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
  recordData.bestTimeToVisitGuide = normalizeBestTimeGuide(req.body.bestTimeToVisitGuide);
  recordData.hotelGuide = normalizeHotelGuide(req.body.hotelGuide);
  recordData.howToReachGuide = normalizeHowToReachGuide(req.body.howToReachGuide);

  if (entity === 'states') recordData.country = req.body.country;
  if (entity === 'cities') {
    recordData.country = req.body.country;
    recordData.state = req.body.state;
  }
  if (entity === 'attractions' || entity === 'activities' || entity === 'hotels') {
    recordData.country = req.body.country;
    recordData.state = req.body.state;
    recordData.city = req.body.city;
  }

  if (entity === 'attractions') {
    recordData.galleryImages = normalizeList(req.body.galleryImages);
    recordData.expectItems = normalizeItems(req.body.expectItems || []);
  }

  if (entity === 'hotels') {
    recordData.rating = req.body.rating;
    recordData.price = req.body.price;
    recordData.amenities = normalizeList(req.body.amenities);
  }

  if (entity === 'blogs') {
    recordData.content = req.body.content;
    recordData.authorName = req.body.authorName;
    recordData.authorRole = req.body.authorRole;
    recordData.authorBio = req.body.authorBio;
    recordData.authorImage = req.body.authorImage;
    recordData.primaryCategory = req.body.primaryCategory;
    recordData.categories = normalizeList(req.body.categories);
    recordData.readTime = req.body.readTime;
    recordData.publishedAt = req.body.publishedAt || undefined;
    recordData.countries = normalizeIdList(req.body.countries);
    recordData.states = normalizeIdList(req.body.states);
    recordData.cities = normalizeIdList(req.body.cities);
    recordData.attractions = normalizeIdList(req.body.attractions);
  }

  if (entity === 'packages') {
    recordData.heroEyebrow = req.body.heroEyebrow;
    recordData.heroLocation = req.body.heroLocation;
    recordData.heroSeason = req.body.heroSeason;
    recordData.introHeading = req.body.introHeading;
    recordData.introBody = req.body.introBody;
    recordData.introImage = req.body.introImage;
    recordData.testimonialQuote = req.body.testimonialQuote;
    recordData.testimonialAuthor = req.body.testimonialAuthor;
    recordData.pricingHeading = req.body.pricingHeading;
    recordData.pricingDescription = req.body.pricingDescription;
    recordData.bookingPriceLabel = req.body.bookingPriceLabel;
    recordData.bookingButtonLabel = req.body.bookingButtonLabel;
    recordData.bookingSecondaryLabel = req.body.bookingSecondaryLabel;
    recordData.price = req.body.price;
    recordData.duration = req.body.duration;
    recordData.itineraryDays = normalizePackageItems(req.body.itineraryDays || []);
    recordData.pricingTiers = normalizePackageItems(req.body.pricingTiers || [], ['features'], ['isFeatured']);
    recordData.inclusions = normalizeList(req.body.inclusions);
    recordData.exclusions = normalizeList(req.body.exclusions);
    recordData.reviews = normalizePackageItems(req.body.reviews || []);
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
    const selectedReferences = await loadSelectedReferences(recordData);
    const record = await Model.findById(id).lean();
    res.render('admin/form', {
      entity,
      entityLabel: entityLabels[entity],
      record: { ...record, ...recordData },
      selectedReferences,
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
