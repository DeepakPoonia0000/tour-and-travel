require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const { faker } = require('@faker-js/faker');
const Country = require('./models/Country');
const State = require('./models/State');
const City = require('./models/City');
const Attraction = require('./models/Attraction');
const Activity = require('./models/Activity');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tour-and-travel';

const makeSlug = (text) => slugify(text, { lower: true, strict: true, remove: /[*+~.()"!:@]/g });
const randomPriority = (min = 1, max = 9999) => Math.floor(Math.random() * (max - min + 1)) + min;
const sampleImage = (label = 'travel') => {
  const seed = `${label}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;
};

const uniqueNames = async (count, generator) => {
  const names = new Set();
  while (names.size < count) {
    names.add(generator());
  }
  return Array.from(names);
};

(async () => {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding.');

  await Promise.all([
    Country.deleteMany({}),
    State.deleteMany({}),
    City.deleteMany({}),
    Attraction.deleteMany({}),
    Activity.deleteMany({})
  ]);
  console.log('Cleared existing Country, State, City, Attraction, Activity documents.');

  const countries = [];
  const countryNames = await uniqueNames(5, () => faker.location.country());

  for (const countryName of countryNames) {
    const country = await Country.create({
      name: countryName,
      slug: makeSlug(countryName),
      summary: faker.lorem.sentences(2),
      description: faker.lorem.paragraphs(2),
      heroImage: sampleImage(),
      tags: faker.lorem.words(5),
      thingsToDo: faker.lorem.sentences(2),
      placesToVisit: faker.lorem.sentences(2),
      bestTimeToVisit: `Best visited between ${faker.date.month()} and ${faker.date.month()}.`,
      howToReach: `Fly into ${faker.location.city()} International Airport and take the scenic route into ${countryName}.`,
      hotels: `Stay at boutique hotels, countryside lodges, or luxury resorts in ${countryName}.`,
      seoTitle: `${countryName} Travel Guide | Tour & Travel`,
      seoDescription: faker.lorem.sentence(),
      seoKeywords: `${countryName.toLowerCase()}, travel, attractions, activities`,
      priority: randomPriority(1, 50)
    });
    countries.push(country);
  }

  const states = [];
  const cities = [];
  const attractions = [];
  const activities = [];

  for (const country of countries) {
    const stateNames = await uniqueNames(5, () => faker.location.state());
    for (const stateName of stateNames) {
      const state = await State.create({
        name: stateName,
        slug: makeSlug(`${country.name} ${stateName}`),
        country: country._id,
        summary: faker.lorem.sentences(2),
        description: faker.lorem.paragraphs(2),
        heroImage: sampleImage(),
        tags: faker.lorem.words(4),
        thingsToDo: faker.lorem.sentences(2),
        placesToVisit: faker.lorem.sentences(2),
        bestTimeToVisit: `Perfect between ${faker.date.month()} and ${faker.date.month()}.`,
        howToReach: `Take the scenic route to reach ${stateName}.`,
        hotels: `Discover countryside inns, mountain retreats, and riverside hotels in ${stateName}.`,
        seoTitle: `${stateName} Travel Guide`,
        seoDescription: faker.lorem.sentence(),
        seoKeywords: `${stateName.toLowerCase()}, ${country.name.toLowerCase()}, travel`,
        priority: randomPriority(51, 150)
      });
      states.push(state);

      const cityNames = await uniqueNames(5, () => faker.location.city());
      for (const cityName of cityNames) {
        const city = await City.create({
          name: cityName,
          slug: makeSlug(`${stateName} ${cityName}`),
          country: country._id,
          state: state._id,
          summary: faker.lorem.sentences(2),
          description: faker.lorem.paragraphs(2),
          heroImage: sampleImage(),
          tags: faker.lorem.words(4),
          thingsToDo: faker.lorem.sentences(2),
          placesToVisit: faker.lorem.sentences(2),
          bestTimeToVisit: `Best visited during ${faker.date.month()} for warm weather and local festivals.`,
          howToReach: `Reach ${cityName} by train, shuttle, or scenic road.`,
          hotels: `From boutique stays to city-center hotels, ${cityName} offers lodging for every traveler.`,
          seoTitle: `${cityName} Travel Guide`,
          seoDescription: faker.lorem.sentence(),
          seoKeywords: `${cityName.toLowerCase()}, ${stateName.toLowerCase()}, travel`,
          priority: randomPriority(151, 300)
        });
        cities.push(city);

        for (let ai = 0; ai < 2; ai += 1) {
          const attractionName = `${faker.location.city()} ${faker.word.noun()}`;
          const attraction = await Attraction.create({
            name: attractionName,
            slug: makeSlug(`${cityName} ${attractionName}`),
            country: country._id,
            state: state._id,
            city: city._id,
            category: 'Landmark',
            summary: faker.lorem.sentence(),
            description: faker.lorem.paragraphs(1),
            heroImage: sampleImage(),
            seoTitle: `${attractionName} | ${cityName}`,
            seoDescription: faker.lorem.sentence(),
            seoKeywords: `${cityName.toLowerCase()}, attraction, travel`,
            priority: randomPriority(301, 500)
          });
          attractions.push(attraction);
        }

        for (let ai = 0; ai < 2; ai += 1) {
          const activityName = `${faker.word.adjective()} ${faker.word.noun()}`;
          const activity = await Activity.create({
            name: activityName,
            slug: makeSlug(`${cityName} ${activityName}`),
            country: country._id,
            state: state._id,
            city: city._id,
            category: 'Experience',
            summary: faker.lorem.sentence(),
            description: faker.lorem.paragraphs(1),
            heroImage: sampleImage(),
            seoTitle: `${activityName} | ${cityName}`,
            seoDescription: faker.lorem.sentence(),
            seoKeywords: `${cityName.toLowerCase()}, activity, travel`,
            priority: randomPriority(501, 700)
          });
          activities.push(activity);
        }
      }
    }
  }

  const activitiesExtra = [];
  for (let extra = 0; extra < 20; extra += 1) {
    const activityName = `${faker.word.adjective()} ${faker.word.noun()}`;
    const activity = await Activity.create({
      name: activityName,
      slug: makeSlug(activityName),
      category: 'Featured Activity',
      summary: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(1),
      heroImage: sampleImage(),
      seoTitle: `${activityName} | Tour & Travel`,
      seoDescription: faker.lorem.sentence(),
      seoKeywords: 'activity, featured, travel',
      priority: randomPriority(701, 9999)
    });
    activitiesExtra.push(activity);
  }

  console.log(`Inserted ${countries.length} countries, ${states.length} states, ${cities.length} cities, ${attractions.length} attractions, ${activities.length} city-based activities, and ${activitiesExtra.length} standalone activities.`);
  await mongoose.disconnect();
  console.log('Seed complete and disconnected from MongoDB.');
})();
