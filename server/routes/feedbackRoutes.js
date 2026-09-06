const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getFeedbacks,
  getFeedbackStats,
  updateFeedbackStatus,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

// Public route to submit feedback
router.post('/', submitFeedback);

// Admin routes
router.get('/', protect, getFeedbacks);
router.get('/stats', protect, getFeedbackStats);
router.put('/:id/status', protect, updateFeedbackStatus);
router.delete('/:id', protect, deleteFeedback);

module.exports = router;
