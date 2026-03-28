const mongoose = require('mongoose');
const { Schema } = mongoose;

const BlogSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    summary: { type: String, trim: true },
    description: { type: String, trim: true },
    content: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    authorName: { type: String, trim: true },
    authorRole: { type: String, trim: true },
    authorBio: { type: String, trim: true },
    authorImage: { type: String, trim: true },
    primaryCategory: { type: String, trim: true },
    categories: [{ type: String, trim: true }],
    readTime: { type: String, trim: true },
    publishedAt: { type: Date },
    countries: [{ type: Schema.Types.ObjectId, ref: 'Country' }],
    states: [{ type: Schema.Types.ObjectId, ref: 'State' }],
    cities: [{ type: Schema.Types.ObjectId, ref: 'City' }],
    attractions: [{ type: Schema.Types.ObjectId, ref: 'Attraction' }],
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: { type: String, trim: true },
    priority: { type: Number, default: 9999, min: 1, max: 9999 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', BlogSchema);
