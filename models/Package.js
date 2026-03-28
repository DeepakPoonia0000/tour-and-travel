const mongoose = require('mongoose');
const { Schema } = mongoose;

const PackageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    summary: { type: String, trim: true },
    description: { type: String, trim: true },
    heroEyebrow: { type: String, trim: true },
    heroLocation: { type: String, trim: true },
    heroSeason: { type: String, trim: true },
    introHeading: { type: String, trim: true },
    introBody: { type: String, trim: true },
    introImage: { type: String, trim: true },
    testimonialQuote: { type: String, trim: true },
    testimonialAuthor: { type: String, trim: true },
    pricingHeading: { type: String, trim: true },
    pricingDescription: { type: String, trim: true },
    bookingPriceLabel: { type: String, trim: true },
    bookingButtonLabel: { type: String, trim: true },
    bookingSecondaryLabel: { type: String, trim: true },
    duration: { type: String, trim: true },
    price: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    itineraryDays: [{
      dayLabel: { type: String, trim: true },
      title: { type: String, trim: true },
      description: { type: String, trim: true }
    }],
    pricingTiers: [{
      eyebrow: { type: String, trim: true },
      name: { type: String, trim: true },
      price: { type: String, trim: true },
      priceSuffix: { type: String, trim: true },
      features: [{ type: String, trim: true }],
      buttonLabel: { type: String, trim: true },
      isFeatured: { type: Boolean, default: false }
    }],
    inclusions: [{ type: String, trim: true }],
    exclusions: [{ type: String, trim: true }],
    reviews: [{
      name: { type: String, trim: true },
      meta: { type: String, trim: true },
      quote: { type: String, trim: true },
      image: { type: String, trim: true }
    }],
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
