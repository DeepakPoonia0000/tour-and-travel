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
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: { type: String, trim: true },
    priority: { type: Number, default: 9999, min: 1, max: 9999 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attraction', AttractionSchema);
