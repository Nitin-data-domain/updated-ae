const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookOptions,
  downloadBook,
  serveBookFile,
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  approveBook,
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');
const { uploadBook } = require('../middleware/upload');
const { requirePermission, requireSuperAdmin } = require('../middleware/permissionMiddleware');

// Public routes
router.get('/', getBooks);
router.get('/options', getBookOptions);
router.get('/download/:id', downloadBook);
router.head('/download/:id', downloadBook);
router.get('/file/:id', serveBookFile);
router.head('/file/:id', serveBookFile);
router.get('/view/:id', serveBookFile);
router.head('/view/:id', serveBookFile);

// Admin routes (requires 'books' permission or superadmin)
router.get('/admin', protect, requirePermission('books'), getAllBooks);
router.post('/', protect, requirePermission('books'), uploadBook.single('file'), createBook);
router.put('/:id', protect, requirePermission('books'), uploadBook.single('file'), updateBook);
router.delete('/:id', protect, requirePermission('books'), deleteBook);

// Super Admin approval endpoint
router.patch('/:id/approve', protect, requireSuperAdmin, approveBook);

module.exports = router;
