require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const slugify = require('slugify');
const Country = require('./models/Country');
const State = require('./models/State');
const City = require('./models/City');
const Attraction = require('./models/Attraction');
const Activity = require('./models/Activity');
const Hotel = require('./models/Hotel');
const Blog = require('./models/Blog');
const Package = require('./models/Package');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tour-and-travel';
const sourcePath = path.join(__dirname, 'countries+states+cities.json');

const makeSlug = (text) => slugify(text, { lower: true, strict: true, remove: /[*+~.()"!:@]/g });
const buildUniqueSlug = (text, externalId, usedSlugs) => {
  const baseSlug = makeSlug(text) || `item-${externalId || Math.floor(Math.random() * 1000000)}`;
  let slug = baseSlug;

  if (usedSlugs.has(slug)) {
    slug = externalId ? `${baseSlug}-${externalId}` : `${baseSlug}-2`;
  }

  let counter = 2;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${externalId || counter}`;
    counter += 1;
  }

  usedSlugs.add(slug);
  return slug;
};
const sampleImage = (label = 'travel') => {
  const seed = `${label}-${Math.floor(Math.random() * 1000000)}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildCountrySummary = (country) => {
  const parts = [country.region, country.subregion].filter(Boolean).join(', ');
  const capital = country.capital ? `Capital: ${country.capital}.` : '';
  const descriptor = parts ? `${country.name} is in ${parts}.` : `${country.name} is a travel destination with multiple regions and cities.`;
  return `${descriptor} ${capital}`.trim();
};

const buildStateSummary = (state, countryName) => {
  const type = state.type ? `${state.type} in ${countryName}` : `region in ${countryName}`;
  return `${state.name} is a ${type} with connected cities and local destinations.`;
};

const buildCitySummary = (city, stateName, countryName) => {
  return `${city.name} is a destination in ${stateName}, ${countryName}, ready for future travel content, guides, and itineraries.`;
};

const orderCountriesForSeed = (countries) => {
  const india = [];
  const rest = [];

  for (const country of countries) {
    if (country.name === 'India' || country.iso2 === 'IN') {
      india.push(country);
    } else {
      rest.push(country);
    }
  }

  return [...india, ...rest];
};

const insertManyInBatches = async (Model, docs, batchSize = 1000) => {
  const inserted = [];

  for (let index = 0; index < docs.length; index += batchSize) {
    const batch = docs.slice(index, index + batchSize);
    const batchInserted = await Model.insertMany(batch, { ordered: false });
    inserted.push(...batchInserted);
  }

  return inserted;
};

const resetCollections = async () => {
  await Promise.all([
    Package.deleteMany({}),
    Blog.deleteMany({}),
    Hotel.deleteMany({}),
    Activity.deleteMany({}),
    Attraction.deleteMany({}),
    City.deleteMany({}),
    State.deleteMany({}),
    Country.deleteMany({})
  ]);
};

const run = async () => {
  const raw = fs.readFileSync(sourcePath, 'utf8');
  const countriesData = orderCountriesForSeed(JSON.parse(raw));

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for import.');

  await resetCollections();
  console.log('Cleared previous country/state/city data and related dependent entries.');

  const usedCountrySlugs = new Set();
  const countryDocs = countriesData.map((country, countryIndex) => ({
    externalId: country.id,
    name: country.name,
    slug: buildUniqueSlug(country.name, country.id, usedCountrySlugs),
    iso2: country.iso2,
    iso3: country.iso3,
    numericCode: country.numeric_code,
    phoneCode: country.phonecode,
    capital: country.capital,
    currency: country.currency,
    currencyName: country.currency_name,
    currencySymbol: country.currency_symbol,
    tld: country.tld,
    nativeName: country.native,
    population: toNumber(country.population),
    gdp: toNumber(country.gdp),
    region: country.region,
    regionId: toNumber(country.region_id),
    subregion: country.subregion,
    subregionId: toNumber(country.subregion_id),
    nationality: country.nationality,
    latitude: toNumber(country.latitude),
    longitude: toNumber(country.longitude),
    emoji: country.emoji,
    emojiU: country.emojiU,
    translations: country.translations || {},
    timezones: Array.isArray(country.timezones) ? country.timezones : [],
    summary: buildCountrySummary(country),
    description: `${country.name} includes ${Array.isArray(country.states) ? country.states.length : 0} states and territories available for future destination content.`,
    heroImage: sampleImage(country.name),
    tags: [country.region, country.subregion, country.nationality].filter(Boolean).join(', '),
    thingsToDo: '',
    placesToVisit: '',
    bestTimeToVisit: '',
    howToReach: '',
    hotels: '',
    seoTitle: `${country.name} Travel Guide | Tour & Travel`,
    seoDescription: buildCountrySummary(country),
    seoKeywords: [country.name, country.region, country.subregion, 'travel'].filter(Boolean).join(', '),
    priority: countryIndex + 1
  }));

  const insertedCountries = await insertManyInBatches(Country, countryDocs, 250);
  const countryIdByExternalId = new Map(insertedCountries.map((doc) => [doc.externalId, doc._id]));

  const stateDocs = [];
  const usedStateSlugs = new Set();
  let statePriority = 1;

  for (const country of countriesData) {
    for (const state of country.states || []) {
      stateDocs.push({
        externalId: state.id,
        name: state.name,
        slug: buildUniqueSlug(`${country.name}-${state.name}`, state.id, usedStateSlugs),
        country: countryIdByExternalId.get(country.id),
        iso2: state.iso2,
        iso3166_2: state.iso3166_2,
        nativeName: state.native,
        latitude: toNumber(state.latitude),
        longitude: toNumber(state.longitude),
        stateType: state.type,
        timezone: state.timezone,
        summary: buildStateSummary(state, country.name),
        description: `${state.name} contains ${Array.isArray(state.cities) ? state.cities.length : 0} imported cities ready for future travel guides.`,
        heroImage: sampleImage(`${country.name}-${state.name}`),
        tags: [state.type, state.timezone, country.name].filter(Boolean).join(', '),
        thingsToDo: '',
        placesToVisit: '',
        bestTimeToVisit: '',
        howToReach: '',
        hotels: '',
        seoTitle: `${state.name}, ${country.name} Travel Guide`,
        seoDescription: buildStateSummary(state, country.name),
        seoKeywords: [state.name, country.name, state.type, 'travel'].filter(Boolean).join(', '),
        priority: statePriority++
      });
    }
  }

  const insertedStates = await insertManyInBatches(State, stateDocs, 500);
  const stateIdByExternalId = new Map(insertedStates.map((doc) => [doc.externalId, doc._id]));

  let insertedCityCount = 0;
  const usedCitySlugs = new Set();
  let cityPriority = 1;
  let cityDocs = [];

  const flushCities = async () => {
    if (!cityDocs.length) return;
    const insertedBatch = await insertManyInBatches(City, cityDocs, 1000);
    insertedCityCount += insertedBatch.length;
    cityDocs = [];
  };

  for (const country of countriesData) {
    for (const state of country.states || []) {
      for (const city of state.cities || []) {
        cityDocs.push({
          externalId: city.id,
          name: city.name,
          slug: buildUniqueSlug(`${country.name}-${state.name}-${city.name}`, city.id, usedCitySlugs),
          country: countryIdByExternalId.get(country.id),
          state: stateIdByExternalId.get(state.id),
          latitude: toNumber(city.latitude),
          longitude: toNumber(city.longitude),
          timezone: city.timezone,
          summary: buildCitySummary(city, state.name, country.name),
          description: `${city.name} is imported from the geographic source data and can now be extended with attractions, activities, hotels, and travel content.`,
          heroImage: sampleImage(`${country.name}-${state.name}-${city.name}`),
          tags: [state.name, country.name, city.timezone].filter(Boolean).join(', '),
          thingsToDo: '',
          placesToVisit: '',
          bestTimeToVisit: '',
          howToReach: '',
          hotels: '',
          seoTitle: `${city.name}, ${state.name} Travel Guide`,
          seoDescription: buildCitySummary(city, state.name, country.name),
          seoKeywords: [city.name, state.name, country.name, 'travel'].filter(Boolean).join(', '),
          priority: cityPriority++
        });

        if (cityDocs.length >= 5000) {
          await flushCities();
        }
      }
    }
  }

  await flushCities();

  console.log(`Imported ${insertedCountries.length} countries, ${insertedStates.length} states, and ${insertedCityCount} cities from JSON.`);

  await mongoose.disconnect();
  console.log('Import complete and disconnected from MongoDB.');
};

run().catch(async (error) => {
  console.error('Import failed:', error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('Disconnect failed:', disconnectError);
  }
  process.exit(1);
});
