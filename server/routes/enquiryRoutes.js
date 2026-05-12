const express = require('express');
const router = express.Router();
const {
  createEnquiry, getEnquiries, updateEnquiry, deleteEnquiry, getEnquiryStats
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');

router.post('/', createEnquiry);
router.get('/', protect, getEnquiries);
router.get('/stats', protect, getEnquiryStats);
router.put('/:id', protect, updateEnquiry);
router.delete('/:id', protect, deleteEnquiry);

module.exports = router;
