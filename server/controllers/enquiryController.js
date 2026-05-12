const Enquiry = require('../models/Enquiry');

// ── TeleCRM Config ──────────────────────────────────────────────────────────
const ENTERPRISE_ID = '69d0d3b277280f7160851462';
const TELECRM_BASE_URL = `https://next-api.telecrm.in/enterprise/${ENTERPRISE_ID}/autoupdatelead`;

// University → { token, campaign } routing
const UNIVERSITY_CONFIG = {
  'IIMT University': {
    token: 'c93ed921-a15f-4fad-96c3-fefcc628e70f1778584852812:f9eca84f-910f-4b75-a957-306c3c79868b',
    campaign: '@iimt-data',
  },
  'Future University': {
    token: 'FUTURE_UNIVERSITY_TOKEN_HERE', // ← paste Future University token
    campaign: '@future-university-data',
  },
};

// Default fallback (IIMT) if university not matched
const DEFAULT_CONFIG = UNIVERSITY_CONFIG['IIMT University'];
// ───────────────────────────────────────────────────────────────────────────

async function pushToTeleCRM(data) {
  try {
    // Pick token & campaign based on selected university
    const uniConfig = UNIVERSITY_CONFIG[data.university] || DEFAULT_CONFIG;

    // Phone must include country code (91 for India)
    const phone = data.phone.replace(/\D/g, '');
    const phoneWithCC = phone.startsWith('91') ? phone : `91${phone}`;

    const payload = {
      fields: {
        name: data.name,
        phone: phoneWithCC,
        email: data.email,
        stream: data.program || '',              // "Stream" field in TeleCRM
        preferred_colleges: data.university || '', // "Preferred Colleges" field in TeleCRM
        message: data.message || '',             // "Message" field
      },
      campaign: uniConfig.campaign,
    };

    const res = await fetch(TELECRM_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${uniConfig.token}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    if (!res.ok) {
      console.error(`❌ TeleCRM error ${res.status} [${data.university}]:`, responseText);
    } else {
      console.log(`✅ TeleCRM lead pushed [${data.university}] → ${uniConfig.campaign}:`, responseText);
    }
  } catch (err) {
    console.error('❌ TeleCRM push exception:', err.message);
  }
}

// @desc    Create enquiry (public)
// @route   POST /api/enquiries
exports.createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, program, university, message, type } = req.body;

    if (!name || !email || !phone || !program) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, phone, and program' 
      });
    }

    const leadType = type === 'admission_lead' ? 'admission_lead' : 'enquiry';

    const enquiry = await Enquiry.create({
      name, email, phone, program,
      university: university || '',
      message: message || '',
      type: leadType
    });

    // Push to TeleCRM from server (bypasses browser CORS)
    if (leadType === 'admission_lead') {
      pushToTeleCRM({ name, email, phone, program, university, message }); // fire & don't await
    }

    res.status(201).json({ 
      success: true, 
      message: 'Enquiry submitted successfully! We will contact you soon.',
      data: enquiry 
    });
  } catch (error) {
    console.error('Enquiry error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit enquiry' });
  }
};

// @desc    Get all enquiries (admin)
// @route   GET /api/enquiries
exports.getEnquiries = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Enquiry.countDocuments(query);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: enquiries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update enquiry status
// @route   PUT /api/enquiries/:id
exports.updateEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/enquiries/:id
exports.deleteEnquiry = async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get enquiry stats
// @route   GET /api/enquiries/stats
exports.getEnquiryStats = async (req, res) => {
  try {
    const { type } = req.query;
    const baseQuery = type ? { type } : {};

    const total = await Enquiry.countDocuments(baseQuery);
    const newCount = await Enquiry.countDocuments({ ...baseQuery, status: 'new' });
    const contacted = await Enquiry.countDocuments({ ...baseQuery, status: 'contacted' });
    const enrolled = await Enquiry.countDocuments({ ...baseQuery, status: 'enrolled' });

    res.json({
      success: true,
      data: { total, new: newCount, contacted, enrolled }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
