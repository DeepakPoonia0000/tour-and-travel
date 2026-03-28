const mongoose = require('mongoose');
const { Schema } = mongoose;

const PackageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    summary: { type: String, trim: true },
    description: { type: String, trim: true },
    duration: { type: String, trim: true },
    price: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    itineraryCountries: [{ type: Schema.Types.ObjectId, ref: 'Country' }],
    itineraryStates: [{ type: Schema.Types.ObjectId, ref: 'State' }],
    itineraryCities: [{ type: Schema.Types.ObjectId, ref: 'City' }],
    itineraryAttractions: [{ type: Schema.Types.ObjectId, ref: 'Attraction' }],
    itineraryActivities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: { type: String, trim: true },
    priority: { type: Number, default: 9999, min: 1, max: 9999 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', PackageSchema);
