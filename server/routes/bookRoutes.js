const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookOptions,
  downloadBook,
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');
const { uploadBook } = require('../middleware/upload');

// Public routes
router.get('/', getBooks);
router.get('/options', getBookOptions);
router.get('/download/:id', downloadBook);

// Admin routes
router.get('/admin', protect, getAllBooks);
router.post('/', protect, uploadBook.single('file'), createBook);
router.put('/:id', protect, uploadBook.single('file'), updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
