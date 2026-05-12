const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Please add a company name']
  },
  studentName: {
    type: String,
    required: [true, 'Please add a student name']
  },
  program: {
    type: String,
    required: [true, 'Please add a program name']
  },
  package: {
    type: String,
    required: [true, 'Please add the package (e.g., 12 LPA)']
  },
  year: {
    type: Number,
    required: [true, 'Please add the placement year']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  role: {
    type: String,
    required: [true, 'Please add the role offered']
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Placement', placementSchema);
