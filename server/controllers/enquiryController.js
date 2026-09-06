const Enquiry = require('../models/Enquiry');
const { sequelize } = require('../config/db');

// ── TeleCRM Config ──────────────────────────────────────────────────────────
const ENTERPRISE_ID = '69d0d3b277280f7160851462';
const TELECRM_BASE_URL = `https://next-api.telecrm.in/enterprise/${ENTERPRISE_ID}/autoupdatelead`;

const UNIVERSITY_CONFIG = {
  'IIMT University': {
    token: 'c93ed921-a15f-4fad-96c3-fefcc628e70f1778584852812:f9eca84f-910f-4b75-a957-306c3c79868b',
    campaign: '@iimt-data',
  },
};

const DEFAULT_CONFIG = UNIVERSITY_CONFIG['IIMT University'];

function resolveUniConfig(universityName) {
  if (!universityName) return DEFAULT_CONFIG;
  const key = Object.keys(UNIVERSITY_CONFIG).find(
    k => k.toLowerCase() === universityName.trim().toLowerCase()
  );
  if (!key) {
    console.warn(`⚠️  TeleCRM: No config for "${universityName}" → falling back to IIMT`);
    return DEFAULT_CONFIG;
  }
  const cfg = UNIVERSITY_CONFIG[key];
  if (!cfg.token || cfg.token.includes('PLACEHOLDER') || cfg.token.includes('TOKEN_HERE')) {
    console.warn(`⚠️  TeleCRM: Placeholder token for "${universityName}" → falling back to IIMT`);
    return DEFAULT_CONFIG;
  }
  return cfg;
}

async function pushToTeleCRM(data) {
  try {
    const uniConfig = resolveUniConfig(data.university);

    let phone = String(data.phone || '').replace(/\D/g, '');
    if (phone.length === 10) phone = `91${phone}`;
    else if (phone.length > 10 && !phone.startsWith('91')) phone = `91${phone}`;

    const payload = {
      fields: {
        name:               data.name        || '',
        phone,
        email:              data.email       || '',
        stream:             data.program     || '',
        preferred_colleges: data.university  || '',
        message:            data.message     || '',
      },
      actions: [
        {
          type: 'SYSTEM_NOTE',
          text: `Applied via Website | Program: ${data.program || 'N/A'} | University: ${data.university || 'N/A'}${data.message ? ' | Message: ' + data.message : ''}`,
        },
      ],
    };

    const res = await fetch(TELECRM_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${uniConfig.token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log(`📡 TeleCRM push [${uniConfig.campaign || 'default'}] status:`, res.status, JSON.stringify(result));
  } catch (err) {
    console.error('TeleCRM push failed (non-blocking):', err.message);
  }
}

// ── Controller Methods ──────────────────────────────────────────────────────

// @desc    Submit enquiry or admission lead
// @route   POST /api/enquiries
exports.createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, program, university, message, type } = req.body;

    if (!name || !email || !phone || !program) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const leadType = type === 'admission_lead' ? 'admission_lead' : 'enquiry';

    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      program,
      university: university || '',
      message: message || '',
      type: leadType,
      status: 'new',
      source: 'website',
    });

    if (leadType === 'admission_lead') {
      pushToTeleCRM({ name, email, phone, program, university, message });
    }

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! We will contact you soon.',
      data: enquiry,
    });
  } catch (error) {
    console.error('Enquiry error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit enquiry' });
  }
};

// @desc    Get all enquiries (admin)
// @route   GET /api/enquiries
exports.getEnquiries = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: enquiries } = await Enquiry.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: enquiries,
    });
  } catch (error) {
    console.error('getEnquiries error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update enquiry status
// @route   PUT /api/enquiries/:id
exports.updateEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    await enquiry.update({ status: req.body.status });
    res.json({ success: true, data: enquiry });
  } catch (error) {
    console.error('updateEnquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/enquiries/:id
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    await enquiry.destroy();
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    console.error('deleteEnquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get enquiry stats
// @route   GET /api/enquiries/stats
exports.getEnquiryStats = async (req, res) => {
  try {
    const { type } = req.query;
    const baseWhere = type ? { type } : {};

    const total = await Enquiry.count({ where: baseWhere });
    const newCount = await Enquiry.count({ where: { ...baseWhere, status: 'new' } });
    const contacted = await Enquiry.count({ where: { ...baseWhere, status: 'contacted' } });
    const enrolled = await Enquiry.count({ where: { ...baseWhere, status: 'enrolled' } });

    res.json({
      success: true,
      data: { total, new: newCount, contacted, enrolled },
    });
  } catch (error) {
    console.error('getEnquiryStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get per-program lead counts (admission_lead only)
// @route   GET /api/enquiries/program-stats
exports.getProgramStats = async (req, res) => {
  try {
    const rawData = await sequelize.query(`
      SELECT 
        program AS _id,
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS \`new\`,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) AS contacted,
        SUM(CASE WHEN status = 'enrolled' THEN 1 ELSE 0 END) AS enrolled,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed
      FROM enquiries
      WHERE type = 'admission_lead'
      GROUP BY program
      ORDER BY total DESC
    `, { type: sequelize.QueryTypes.SELECT });

    const data = rawData.map(r => ({
      _id: r._id,
      total: Number(r.total || 0),
      new: Number(r.new || 0),
      contacted: Number(r.contacted || 0),
      enrolled: Number(r.enrolled || 0),
      closed: Number(r.closed || 0),
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('getProgramStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
