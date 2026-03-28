const mongoose = require('mongoose');

const { Schema } = mongoose;

const TransportHubSchema = new Schema(
  {
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    detail: { type: String, trim: true },
    icon: { type: String, trim: true }
  },
  { _id: false }
);

const ReachSectionSchema = new Schema(
  {
    eyebrow: { type: String, trim: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    imageAlt: { type: String, trim: true },
    quote: { type: String, trim: true },
    items: { type: [TransportHubSchema], default: [] }
  },
  { _id: false }
);

const ReachTipSchema = new Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    buttonLabel: { type: String, trim: true }
  },
  { _id: false }
);

const ReachFinalMileSchema = new Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true }
  },
  { _id: false }
);

const HowToReachGuideSchema = new Schema(
  {
    heroEyebrow: { type: String, trim: true },
    heroTitle: { type: String, trim: true },
    heroDescription: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    heroImageAlt: { type: String, trim: true },
    heroCardTitle: { type: String, trim: true },
    heroCardText: { type: String, trim: true },
    sections: { type: [ReachSectionSchema], default: [] },
    mapTitle: { type: String, trim: true },
    mapDescription: { type: String, trim: true },
    mapImage: { type: String, trim: true },
    mapImageAlt: { type: String, trim: true },
    mapBadgeOne: { type: String, trim: true },
    mapBadgeTwo: { type: String, trim: true },
    connectivityTip: { type: ReachTipSchema, default: () => ({}) },
    finalMile: { type: ReachFinalMileSchema, default: () => ({}) }
  },
  { _id: false }
);

module.exports = { HowToReachGuideSchema };
