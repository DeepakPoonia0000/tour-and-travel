const mongoose = require('mongoose');
const { Schema } = mongoose;

const CountrySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    summary: { type: String, trim: true },
    description: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    tags: { type: String, trim: true },
    thingsToDo: { type: String, trim: true },
    placesToVisit: { type: String, trim: true },
    bestTimeToVisit: { type: String, trim: true },
    howToReach: { type: String, trim: true },
    hotels: { type: String, trim: true },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: { type: String, trim: true },
    priority: { type: Number, default: 9999, min: 1, max: 9999 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Country', CountrySchema);
