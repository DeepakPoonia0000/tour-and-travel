const mongoose = require('mongoose');
const { Schema } = mongoose;
const { BestTimeToVisitGuideSchema } = require('./shared/bestTimeToVisitGuide');
const { HowToReachGuideSchema } = require('./shared/howToReachGuide');
const { HotelGuideSchema } = require('./shared/hotelGuide');

const CitySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    country: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
    state: { type: Schema.Types.ObjectId, ref: 'State', required: true },
    externalId: { type: Number, index: true },
    latitude: { type: Number },
    longitude: { type: Number },
    timezone: { type: String, trim: true },
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

module.exports = mongoose.model('City', CitySchema);
