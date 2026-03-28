const mongoose = require('mongoose');
const { Schema } = mongoose;
const { BestTimeToVisitGuideSchema } = require('./shared/bestTimeToVisitGuide');
const { HowToReachGuideSchema } = require('./shared/howToReachGuide');
const { HotelGuideSchema } = require('./shared/hotelGuide');

const CountrySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    externalId: { type: Number, index: true },
    iso2: { type: String, trim: true, uppercase: true },
    iso3: { type: String, trim: true, uppercase: true },
    numericCode: { type: String, trim: true },
    phoneCode: { type: String, trim: true },
    capital: { type: String, trim: true },
    currency: { type: String, trim: true },
    currencyName: { type: String, trim: true },
    currencySymbol: { type: String, trim: true },
    tld: { type: String, trim: true },
    nativeName: { type: String, trim: true },
    population: { type: Number },
    gdp: { type: Number },
    region: { type: String, trim: true },
    regionId: { type: Number },
    subregion: { type: String, trim: true },
    subregionId: { type: Number },
    nationality: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    emoji: { type: String, trim: true },
    emojiU: { type: String, trim: true },
    translations: { type: Schema.Types.Mixed },
    timezones: { type: [Schema.Types.Mixed], default: [] },
    summary: { type: String, trim: true },
    description: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    tags: { type: String, trim: true },
    thingsToDo: { type: String, trim: true },
    placesToVisit: { type: String, trim: true },
    bestTimeToVisit: { type: String, trim: true },
    bestTimeToVisitGuide: { type: BestTimeToVisitGuideSchema, default: () => ({}) },
    howToReach: { type: String, trim: true },
    howToReachGuide: { type: HowToReachGuideSchema, default: () => ({}) },
    hotels: { type: String, trim: true },
    hotelGuide: { type: HotelGuideSchema, default: () => ({}) },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: { type: String, trim: true },
    priority: { type: Number, default: 9999, min: 1, max: 9999 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Country', CountrySchema);
