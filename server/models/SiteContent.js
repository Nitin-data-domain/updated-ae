const mongoose = require('mongoose');

// ── Campus Life Photo ──────────────────────────────────────────────────────
const campusPhotoSchema = new mongoose.Schema({
  imageUrl:  { type: String, required: true },
  caption:   { type: String, default: '' },
  subCaption: { type: String, default: '' },
  order:     { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

// ── Company / Placement Partner ────────────────────────────────────────────
const companyPartnerSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  logoUrl:   { type: String, required: true },
  order:     { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

const CampusPhoto    = mongoose.model('CampusPhoto',    campusPhotoSchema);
const CompanyPartner = mongoose.model('CompanyPartner', companyPartnerSchema);

module.exports = { CampusPhoto, CompanyPartner };
