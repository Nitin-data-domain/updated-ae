const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  location: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['seminar', 'workshop', 'conference', 'cultural', 'placement', 'other'],
    default: 'other'
  },
  isUpcoming: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
