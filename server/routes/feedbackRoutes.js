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
const { requirePermission } = require('../middleware/permissionMiddleware');

// Public route to submit feedback
router.post('/', submitFeedback);

// Admin routes
router.get('/', protect, requirePermission('feedback'), getFeedbacks);
router.get('/stats', protect, requirePermission('feedback'), getFeedbackStats);
router.put('/:id/status', protect, requirePermission('feedback'), updateFeedbackStatus);
router.delete('/:id', protect, requirePermission('feedback'), deleteFeedback);

module.exports = router;
