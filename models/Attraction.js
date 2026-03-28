const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttractionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    country: { type: Schema.Types.ObjectId, ref: 'Country' },
    state: { type: Schema.Types.ObjectId, ref: 'State' },
    city: { type: Schema.Types.ObjectId, ref: 'City' },
    category: { type: String, trim: true },
    summary: { type: String, trim: true },
    description: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    showcaseEyebrow: { type: String, trim: true },
    showcaseLocation: { type: String, trim: true },
    showcaseTitle: { type: String, trim: true },
    showcaseIntro: { type: String, trim: true },
    overviewTitle: { type: String, trim: true },
    overviewBody: { type: String, trim: true },
    galleryImages: [{ type: String, trim: true }],
    expectTitle: { type: String, trim: true },
    expectItems: [{
      icon: { type: String, trim: true },
      title: { type: String, trim: true },
      text: { type: String, trim: true }
    }],
    bestTime: { type: String, trim: true },
    difficulty: { type: String, trim: true },
    duration: { type: String, trim: true },
    groupSize: { type: String, trim: true },
    bookingPrice: { type: String, trim: true },
    bookingLabel: { type: String, trim: true },
    bookingNote: { type: String, trim: true },
    mapImage: { type: String, trim: true },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: { type: String, trim: true },
    priority: { type: Number, default: 9999, min: 1, max: 9999 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attraction', AttractionSchema);
