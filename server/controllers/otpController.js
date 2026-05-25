const OTP = require('../models/OTP');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMSviaFast2SMS(phone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    // Dev mode — print to console so testing still works
    console.log(`\n📱 [DEV OTP] Phone: ${phone}  OTP: ${otp}\n`);
    return true;
  }

  // Fast2SMS Quick SMS API (free tier, no DLT registration needed)
  const message = `Your Aharada Education OTP is ${otp}. Valid for 10 minutes. Do not share it with anyone.`;
  const mobile = phone.replace(/\D/g, '').slice(-10); // ensure 10-digit

  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: mobile,
      }),
    });
    const data = await res.json();
    if (data.return === true) {
      console.log(`✅ OTP sent to ${mobile} via Fast2SMS | Request ID: ${data.request_id}`);
    } else {
      console.error('Fast2SMS error:', JSON.stringify(data));
      console.log(`📱 [FALLBACK OTP] Phone: ${phone}  OTP: ${otp}`);
    }
  } catch (err) {
    console.error('Fast2SMS fetch error:', err.message);
    console.log(`📱 [FALLBACK OTP] Phone: ${phone}  OTP: ${otp}`);
  }
  return true; // Always succeed so form flow continues
}

// ── POST /api/otp/send ────────────────────────────────────────────────────────
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });

    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) return res.status(400).json({ success: false, message: 'Enter a valid 10-digit number' });

    // Rate-limit: max 3 OTPs per phone in 15 minutes
    const since = new Date(Date.now() - 15 * 60 * 1000);
    const recent = await OTP.countDocuments({ phone: clean, expiresAt: { $gt: since } });
    if (recent >= 3) {
      return res.status(429).json({ success: false, message: 'Too many OTP requests. Try again in 15 minutes.' });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ phone: clean });
    await OTP.create({ phone: clean, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

    await sendSMSviaFast2SMS(clean, otp);

    res.json({ success: true, message: `OTP sent to +91 ${clean.slice(-10)}` });
  } catch (err) {
    console.error('sendOTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};

// ── POST /api/otp/verify ──────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required' });

    const clean = phone.replace(/\D/g, '');
    const record = await OTP.findOne({ phone: clean, expiresAt: { $gt: new Date() } });

    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new OTP.' });
    }

    record.attempts += 1;
    await record.save();

    if (record.attempts > 5) {
      await OTP.deleteMany({ phone: clean });
      return res.status(400).json({ success: false, message: 'Too many wrong attempts. Request a new OTP.' });
    }

    if (record.otp !== otp.toString().trim()) {
      const left = 5 - record.attempts;
      return res.status(400).json({ success: false, message: `Incorrect OTP. ${left} attempt(s) remaining.` });
    }

    await OTP.deleteMany({ phone: clean });
    res.json({ success: true, message: 'Phone number verified successfully.' });
  } catch (err) {
    console.error('verifyOTP error:', err);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};
