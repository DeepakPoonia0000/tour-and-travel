const mongoose = require('mongoose');

const { Schema } = mongoose;

const HotelCardSchema = new Schema(
  {
    area: { type: String, trim: true },
    name: { type: String, trim: true },
    image: { type: String, trim: true },
    imageAlt: { type: String, trim: true },
    rating: { type: String, trim: true },
    price: { type: String, trim: true },
    features: [{ type: String, trim: true }]
  },
  { _id: false }
);

const HotelGuideSchema = new Schema(
  {
    heroEyebrow: { type: String, trim: true },
    heroTitle: { type: String, trim: true },
    heroDescription: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    heroImageAlt: { type: String, trim: true },
    filterPrimary: { type: String, trim: true },
    filterSecondary: { type: String, trim: true },
    filterTertiary: { type: String, trim: true },
    tagOne: { type: String, trim: true },
    tagTwo: { type: String, trim: true },
    tagThree: { type: String, trim: true },
    hotels: { type: [HotelCardSchema], default: [] },
    newsletterTitle: { type: String, trim: true },
    newsletterText: { type: String, trim: true }
  },
  { _id: false }
);

module.exports = { HotelGuideSchema };
