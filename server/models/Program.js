const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Program title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required']
  },
  overview: {
    type: String,
    required: [true, 'Program overview is required']
  },
  eligibility: {
    type: String,
    required: [true, 'Eligibility criteria is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  careerOpportunities: [{
    type: String
  }],
  industryExposure: [{
    type: String
  }],
  highlights: [{
    type: String
  }],
  // University associations
  universities: [{
    name: { type: String, required: true },
    slug: { type: String }
  }],
  category: [{
    type: String,
    enum: ['aviation', 'engineering', 'management', 'entrepreneurship', 'technology', 'arts', 'science']
  }],
  image: {
    type: String,
    default: ''
  },
  brochureUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

programSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Program', programSchema);
