const { Op } = require('sequelize');
const Feedback = require('../models/Feedback');

// @desc    Submit student feedback
// @route   POST /api/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const {
      studentName,
      email,
      phone,
      enrollmentNo,
      courseName,
      academicYear,
      rating,
      category,
      message,
    } = req.body;

    if (!studentName || !email || !courseName || !academicYear || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide student name, email, course, academic year, and feedback message.',
      });
    }

    const feedback = await Feedback.create({
      studentName: studentName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      enrollmentNo: enrollmentNo ? enrollmentNo.trim() : '',
      courseName: courseName.trim(),
      academicYear: academicYear.trim(),
      rating: rating ? parseInt(rating, 10) : 5,
      category: category || 'general',
      message: message.trim(),
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your submission has been received by academic administration.',
      data: feedback,
    });
  } catch (error) {
    console.error('submitFeedback error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit feedback' });
  }
};

// @desc    Get all feedback submissions (admin)
// @route   GET /api/feedback
exports.getFeedbacks = async (req, res) => {
  try {
    const { status, category, search } = req.query;

    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { studentName: { [Op.like]: q } },
        { email: { [Op.like]: q } },
        { phone: { [Op.like]: q } },
        { enrollmentNo: { [Op.like]: q } },
        { courseName: { [Op.like]: q } },
        { message: { [Op.like]: q } },
      ];
    }

    const feedbacks = await Feedback.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    console.error('getFeedbacks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
  }
};

// @desc    Get feedback summary statistics (admin)
// @route   GET /api/feedback/stats
exports.getFeedbackStats = async (req, res) => {
  try {
    const total = await Feedback.count();
    const newCount = await Feedback.count({ where: { status: 'new' } });
    const reviewedCount = await Feedback.count({ where: { status: 'reviewed' } });
    const resolvedCount = await Feedback.count({ where: { status: 'resolved' } });

    // Calculate average rating
    const all = await Feedback.findAll({ attributes: ['rating'] });
    const avgRating = all.length
      ? (all.reduce((sum, f) => sum + (f.rating || 5), 0) / all.length).toFixed(1)
      : '5.0';

    res.json({
      success: true,
      data: {
        total,
        new: newCount,
        reviewed: reviewedCount,
        resolved: resolvedCount,
        avgRating,
      },
    });
  } catch (error) {
    console.error('getFeedbackStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch feedback statistics' });
  }
};

// @desc    Update feedback status (admin)
// @route   PUT /api/feedback/:id/status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    await feedback.update({ status });
    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('updateFeedbackStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete feedback (admin)
// @route   DELETE /api/feedback/:id
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    await feedback.destroy();
    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('deleteFeedback error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete feedback' });
  }
};
