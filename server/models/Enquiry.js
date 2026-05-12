const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  program: {
    type: String,
    required: [true, 'Program selection is required']
  },
  university: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'enrolled', 'closed'],
    default: 'new'
  },
  type: {
    type: String,
    enum: ['admission_lead', 'enquiry'],
    default: 'enquiry'
  },
  source: {
    type: String,
    default: 'website'
  }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
