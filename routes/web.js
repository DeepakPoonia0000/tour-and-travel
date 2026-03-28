const express = require('express');
const Country = require('../models/Country');
const State = require('../models/State');
const City = require('../models/City');
const Attraction = require('../models/Attraction');
const Activity = require('../models/Activity');
const Package = require('../models/Package');

const router = express.Router();
const sortQuery = { priority: 1, updatedAt: -1 };

const sectionTitles = {
  'things-to-do': 'Things to Do',
  'places-to-visit': 'Places to Visit',
  'best-time-to-visit': 'Best Time to Visit',
  'how-to-reach': 'How to Reach',
  hotels: 'Hotels',
  attractions: 'Attractions',
  activities: 'Activities',
  cities: 'Cities'
};

const buildMeta = ({ title, description, keywords, image, url }) => ({
  metaTitle: title,
  metaDescription: description,
  metaKeywords: keywords || 'travel, tours, destinations, activities, attractions',
  metaImage: image || `${process.env.SITE_URL || 'http://localhost:3000'}/images/og-default.jpg`,
  metaUrl: url
});

const renderNotFound = (res, path) => {
  res.status(404).render('404', buildMeta({
    title: 'Not Found | Tour & Travel',
    description: `The requested resource ${path} was not found on this site.`,
    url: `${process.env.SITE_URL || 'http://localhost:3000'}${path}`
  }));
};

const buildPackageQuery = ({ countryIds = [], stateIds = [], cityIds = [], attractionIds = [], activityIds = [] }) => {
  const clauses = [];
  if (countryIds.length) clauses.push({ itineraryCountries: { $in: countryIds } });
  if (stateIds.length) clauses.push({ itineraryStates: { $in: stateIds } });
  if (cityIds.length) clauses.push({ itineraryCities: { $in: cityIds } });
  if (attractionIds.length) clauses.push({ itineraryAttractions: { $in: attractionIds } });
  if (activityIds.length) clauses.push({ itineraryActivities: { $in: activityIds } });
  return clauses.length ? { $or: clauses } : { _id: null };
};

const findPackages = async (query) => {
  return Package.find(query).sort(sortQuery).lean();
};

router.get('/', async (req, res) => {
  const [countries, states, cities, attractions, activities, packages] = await Promise.all([
    Country.find().sort(sortQuery).lean(),
    State.find().sort(sortQuery).limit(8).lean(),
    City.find().sort(sortQuery).limit(8).lean(),
    Attraction.find().sort(sortQuery).limit(8).lean(),
    Activity.find().sort(sortQuery).limit(8).lean(),
    Package.find().sort(sortQuery).limit(6).lean()
  ]);

  const featuredCountry = countries[0] || null;
  const featuredCountryStates = featuredCountry ? states.filter((state) => String(state.country) === String(featuredCountry._id)) : [];
  const featuredCountryAttractions = featuredCountry ? attractions.filter((item) => String(item.country) === String(featuredCountry._id)) : [];
  const topState = featuredCountryStates[0] || null;
  const topAttraction = featuredCountryAttractions[0] || null;

  res.render('index', {
    countries,
    states,
    cities,
    attractions,
    activities,
    packages,
    featuredCountry,
    topState,
    topAttraction,
    ...buildMeta({
      title: 'Tour & Travel | Curated Destinations',
      description: 'Discover countries, states, cities, attractions and activities with admin-managed content and priority ordering.',
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/countries', async (req, res) => {
  const countries = await Country.find().sort(sortQuery).lean();
  res.render('countries', {
    countries,
    ...buildMeta({
      title: 'Countries | Tour & Travel',
      description: 'Browse all countries available in the travel portal.',
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/countries/:slug', async (req, res) => {
  const country = await Country.findOne({ slug: req.params.slug }).lean();
  if (!country) return renderNotFound(res, req.originalUrl);

  const [states, cities, attractions, activities] = await Promise.all([
    State.find({ country: country._id }).sort(sortQuery).lean(),
    City.find({ country: country._id }).sort(sortQuery).lean(),
    Attraction.find({ country: country._id }).sort(sortQuery).lean(),
    Activity.find({ country: country._id }).sort(sortQuery).lean()
  ]);

  const packages = await findPackages(buildPackageQuery({
    countryIds: [country._id],
    stateIds: states.map((item) => item._id),
    cityIds: cities.map((item) => item._id),
    attractionIds: attractions.map((item) => item._id),
    activityIds: activities.map((item) => item._id)
  }));

  res.render('country', {
    country,
    states,
    cities,
    attractions,
    activities,
    packages,
    ...buildMeta({
      title: country.seoTitle || `${country.name} | Tour & Travel`,
      description: country.seoDescription || country.summary || country.description || `Explore ${country.name} with curated travel guides, attractions, and activities.`,
      keywords: country.seoKeywords || country.tags,
      image: country.heroImage,
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/countries/:slug/:section', async (req, res) => {
  const country = await Country.findOne({ slug: req.params.slug }).lean();
  if (!country) return renderNotFound(res, req.originalUrl);
  const section = req.params.section;
  const title = sectionTitles[section];
  if (!title) return renderNotFound(res, req.originalUrl);

  const sectionContent = {
    'things-to-do': country.thingsToDo,
    'places-to-visit': country.placesToVisit,
    'best-time-to-visit': country.bestTimeToVisit,
    'how-to-reach': country.howToReach,
    hotels: country.hotels
  };

  if (section in sectionContent) {
    return res.render('special-page', {
      entity: country,
      entityType: 'country',
      section,
      sectionTitle: title,
      bodyContent: sectionContent[section],
      ...buildMeta({
        title: `${title} in ${country.name} | Tour & Travel`,
        description: country.seoDescription || `Discover ${title.toLowerCase()} in ${country.name}.`,
        url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
      })
    });
  }

  if (section === 'attractions' || section === 'activities' || section === 'cities') {
    const items = await {
      attractions: Attraction,
      activities: Activity,
      cities: City
    }[section].find({ country: country._id }).sort(sortQuery).lean();

    return res.render('entity-list', {
      entity: country,
      entityType: 'country',
      section,
      sectionTitle: title,
      items,
      ...buildMeta({
        title: `${title} in ${country.name} | Tour & Travel`,
        description: `Browse ${title.toLowerCase()} in ${country.name}.`,
        url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
      })
    });
  }

  return renderNotFound(res, req.originalUrl);
});

router.get('/states', async (req, res) => {
  const states = await State.find().sort(sortQuery).lean();
  res.render('states', {
    states,
    ...buildMeta({
      title: 'States | Tour & Travel',
      description: 'Browse all states and regions available in the travel portal.',
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/cities', async (req, res) => {
  const cities = await City.find().sort(sortQuery).populate('state country').lean();
  res.render('cities', {
    cities,
    ...buildMeta({
      title: 'Cities | Tour & Travel',
      description: 'Browse all cities in the travel portal, dynamically sorted by priority.',
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/attractions', async (req, res) => {
  const attractions = await Attraction.find().sort(sortQuery).populate('country state city').lean();
  res.render('attractions', {
    attractions,
    ...buildMeta({
      title: 'Attractions | Tour & Travel',
      description: 'Explore the attractions curated by the travel admin.',
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/activities', async (req, res) => {
  const activities = await Activity.find().sort(sortQuery).populate('country state city').lean();
  res.render('activities', {
    activities,
    ...buildMeta({
      title: 'Activities | Tour & Travel',
      description: 'Browse the activity-led experiences curated for travelers.',
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/packages', async (req, res) => {
  const packages = await Package.find().sort(sortQuery).lean();
  res.render('packages', {
    packages,
    ...buildMeta({
      title: 'Packages | Tour & Travel',
      description: 'Explore curated tour packages and itineraries managed through the admin portal.',
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/packages/:slug', async (req, res) => {
  const pkg = await Package.findOne({ slug: req.params.slug }).lean();
  if (!pkg) return renderNotFound(res, req.originalUrl);

  const [itineraryCountries, itineraryStates, itineraryCities, itineraryAttractions, itineraryActivities] = await Promise.all([
    Country.find({ _id: { $in: pkg.itineraryCountries } }).lean(),
    State.find({ _id: { $in: pkg.itineraryStates } }).lean(),
    City.find({ _id: { $in: pkg.itineraryCities } }).lean(),
    Attraction.find({ _id: { $in: pkg.itineraryAttractions } }).lean(),
    Activity.find({ _id: { $in: pkg.itineraryActivities } }).lean()
  ]);

  res.render('package', {
    pkg,
    itineraryCountries,
    itineraryStates,
    itineraryCities,
    itineraryAttractions,
    itineraryActivities,
    ...buildMeta({
      title: pkg.seoTitle || `${pkg.name} | Tour & Travel`,
      description: pkg.seoDescription || pkg.summary || pkg.description || `Discover the ${pkg.name} package itinerary.`,
      keywords: pkg.seoKeywords,
      image: pkg.heroImage,
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/states/:slug', async (req, res) => {
  const state = await State.findOne({ slug: req.params.slug }).populate('country').lean();
  if (!state) return renderNotFound(res, req.originalUrl);

  const [cities, attractions, activities] = await Promise.all([
    City.find({ state: state._id }).sort(sortQuery).lean(),
    Attraction.find({ state: state._id }).sort(sortQuery).lean(),
    Activity.find({ state: state._id }).sort(sortQuery).lean()
  ]);

  const packages = await findPackages(buildPackageQuery({
    countryIds: [state.country._id],
    stateIds: [state._id],
    cityIds: cities.map((item) => item._id),
    attractionIds: attractions.map((item) => item._id),
    activityIds: activities.map((item) => item._id)
  }));

  res.render('state', {
    state,
    cities,
    attractions,
    activities,
    packages,
    ...buildMeta({
      title: state.seoTitle || `${state.name}, ${state.country.name} | Tour & Travel`,
      description: state.seoDescription || state.summary || state.description || `Explore ${state.name} and discover top cities, attractions, and activities.`,
      keywords: state.seoKeywords || state.tags,
      image: state.heroImage,
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/states/:slug/:section', async (req, res) => {
  const state = await State.findOne({ slug: req.params.slug }).populate('country').lean();
  if (!state) return renderNotFound(res, req.originalUrl);
  const section = req.params.section;
  const title = sectionTitles[section];
  if (!title) return renderNotFound(res, req.originalUrl);

  const sectionContent = {
    'things-to-do': state.thingsToDo,
    'places-to-visit': state.placesToVisit,
    'best-time-to-visit': state.bestTimeToVisit,
    'how-to-reach': state.howToReach,
    hotels: state.hotels
  };

  if (section in sectionContent) {
    return res.render('special-page', {
      entity: state,
      entityType: 'state',
      section,
      sectionTitle: title,
      bodyContent: sectionContent[section],
      ...buildMeta({
        title: `${title} in ${state.name} | Tour & Travel`,
        description: state.seoDescription || `Discover ${title.toLowerCase()} in ${state.name}.`,
        url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
      })
    });
  }

  if (section === 'attractions' || section === 'activities' || section === 'cities') {
    const items = await {
      attractions: Attraction,
      activities: Activity,
      cities: City
    }[section].find({ state: state._id }).sort(sortQuery).lean();

    return res.render('entity-list', {
      entity: state,
      entityType: 'state',
      section,
      sectionTitle: title,
      items,
      ...buildMeta({
        title: `${title} in ${state.name} | Tour & Travel`,
        description: `Browse ${title.toLowerCase()} in ${state.name}.`,
        url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
      })
    });
  }

  return renderNotFound(res, req.originalUrl);
});

router.get('/cities/:slug', async (req, res) => {
  const city = await City.findOne({ slug: req.params.slug }).populate('country state').lean();
  if (!city) return renderNotFound(res, req.originalUrl);

  const [attractions, activities] = await Promise.all([
    Attraction.find({ city: city._id }).sort(sortQuery).lean(),
    Activity.find({ city: city._id }).sort(sortQuery).lean()
  ]);

  const packages = await findPackages(buildPackageQuery({
    countryIds: [city.country._id],
    stateIds: [city.state._id],
    cityIds: [city._id],
    attractionIds: attractions.map((item) => item._id),
    activityIds: activities.map((item) => item._id)
  }));

  res.render('city', {
    city,
    attractions,
    activities,
    packages,
    ...buildMeta({
      title: city.seoTitle || `${city.name}, ${city.state.name} | Tour & Travel`,
      description: city.seoDescription || city.summary || city.description || `Explore ${city.name} with curated attractions and activities.`,
      keywords: city.seoKeywords || city.tags,
      image: city.heroImage,
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/cities/:slug/:section', async (req, res) => {
  const city = await City.findOne({ slug: req.params.slug }).populate('country state').lean();
  if (!city) return renderNotFound(res, req.originalUrl);
  const section = req.params.section;
  const title = sectionTitles[section];
  if (!title) return renderNotFound(res, req.originalUrl);

  const sectionContent = {
    'things-to-do': city.thingsToDo,
    'places-to-visit': city.placesToVisit,
    'best-time-to-visit': city.bestTimeToVisit,
    'how-to-reach': city.howToReach,
    hotels: city.hotels
  };

  if (section in sectionContent) {
    return res.render('special-page', {
      entity: city,
      entityType: 'city',
      section,
      sectionTitle: title,
      bodyContent: sectionContent[section],
      ...buildMeta({
        title: `${title} in ${city.name} | Tour & Travel`,
        description: city.seoDescription || `Discover ${title.toLowerCase()} in ${city.name}.`,
        url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
      })
    });
  }

  if (section === 'attractions' || section === 'activities') {
    const items = await {
      attractions: Attraction,
      activities: Activity
    }[section].find({ city: city._id }).sort(sortQuery).lean();

    return res.render('entity-list', {
      entity: city,
      entityType: 'city',
      section,
      sectionTitle: title,
      items,
      ...buildMeta({
        title: `${title} in ${city.name} | Tour & Travel`,
        description: `Browse ${title.toLowerCase()} in ${city.name}.`,
        url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
      })
    });
  }

  return renderNotFound(res, req.originalUrl);
});

router.get('/attractions/:slug', async (req, res) => {
  const attraction = await Attraction.findOne({ slug: req.params.slug }).populate('country state city').lean();
  if (!attraction) return renderNotFound(res, req.originalUrl);
  const packages = await findPackages(buildPackageQuery({
    countryIds: [attraction.country?._id].filter(Boolean),
    stateIds: [attraction.state?._id].filter(Boolean),
    cityIds: [attraction.city?._id].filter(Boolean),
    attractionIds: [attraction._id],
    activityIds: []
  }));

  res.render('attraction', {
    attraction,
    packages,
    ...buildMeta({
      title: attraction.seoTitle || `${attraction.name} | Tour & Travel`,
      description: attraction.seoDescription || attraction.summary || attraction.description || `Discover ${attraction.name}.`,
      keywords: attraction.seoKeywords || attraction.category,
      image: attraction.heroImage,
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

router.get('/activities/:slug', async (req, res) => {
  const activity = await Activity.findOne({ slug: req.params.slug }).populate('country state city').lean();
  if (!activity) return renderNotFound(res, req.originalUrl);
  const packages = await findPackages(buildPackageQuery({
    countryIds: [activity.country?._id].filter(Boolean),
    stateIds: [activity.state?._id].filter(Boolean),
    cityIds: [activity.city?._id].filter(Boolean),
    attractionIds: [],
    activityIds: [activity._id]
  }));

  res.render('activity', {
    activity,
    packages,
    ...buildMeta({
      title: activity.seoTitle || `${activity.name} | Tour & Travel`,
      description: activity.seoDescription || activity.summary || activity.description || `Discover ${activity.name}.`,
      keywords: activity.seoKeywords || activity.category,
      image: activity.heroImage,
      url: `${process.env.SITE_URL || 'http://localhost:3000'}${req.originalUrl}`
    })
  });
});

module.exports = router;
