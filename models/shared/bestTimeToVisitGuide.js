const mongoose = require('mongoose');

const { Schema } = mongoose;

const SeasonalSectionSchema = new Schema(
  {
    name: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    temperature: { type: String, trim: true },
    peakMonth: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
    verdictLabel: { type: String, trim: true },
    verdictText: { type: String, trim: true },
    image: { type: String, trim: true },
    imageAlt: { type: String, trim: true },
    accentLabel: { type: String, trim: true }
  },
  { _id: false }
);

const TravelerProfileSchema = new Schema(
  {
    title: { type: String, trim: true },
    recommendation: { type: String, trim: true },
    text: { type: String, trim: true }
  },
  { _id: false }
);

const BestTimeToVisitGuideSchema = new Schema(
  {
    heroEyebrow: { type: String, trim: true },
    heroTitle: { type: String, trim: true },
    heroDescription: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    heroImageAlt: { type: String, trim: true },
    heroCardTitle: { type: String, trim: true },
    heroCardText: { type: String, trim: true },
    seasons: { type: [SeasonalSectionSchema], default: [] },
    travelerProfiles: { type: [TravelerProfileSchema], default: [] },
    ctaLabel: { type: String, trim: true },
    ctaHref: { type: String, trim: true }
  },
  { _id: false }
);

module.exports = { BestTimeToVisitGuideSchema };
