const mongoose = require('mongoose');

const brochureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Brochure title is required'],
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileName: {
    type: String,
    required: true
  },
  linkedPage: {
    type: String,
    enum: ['home', 'faculty', 'events', 'programs', 'contact', 'general'],
    default: 'general'
  },
  linkedProgram: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    default: null
  },
  fileSize: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Brochure', brochureSchema);
