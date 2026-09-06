const { Op } = require('sequelize');
const Book = require('../models/Book');
const { cloudinary } = require('../middleware/upload');

// Helper to upload buffer to Cloudinary for raw/PDF files
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'aharada-education/books',
        resource_type: 'auto',
        public_id: filename ? filename.replace(/\.[^/.]+$/, '') + '_' + Date.now() : undefined,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// @desc    Get books with cascading filters and search
// @route   GET /api/books
exports.getBooks = async (req, res) => {
  try {
    const { academicYear, courseName, subjectCode, subjectName, search } = req.query;

    const where = { isActive: true };

    if (academicYear && academicYear !== 'all') {
      where.academicYear = academicYear;
    }

    if (courseName && courseName !== 'all') {
      where.courseName = courseName;
    }

    if (subjectCode && subjectCode !== 'all') {
      where.subjectCode = subjectCode;
    }

    if (subjectName && subjectName !== 'all') {
      where.subjectName = subjectName;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: q } },
        { subjectName: { [Op.like]: q } },
        { subjectCode: { [Op.like]: q } },
        { author: { [Op.like]: q } },
        { courseName: { [Op.like]: q } },
        { description: { [Op.like]: q } },
      ];
    }

    const books = await Book.findAll({
      where,
      order: [
        ['academicYear', 'ASC'],
        ['courseName', 'ASC'],
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error('getBooks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch books' });
  }
};

// @desc    Get cascading filter options for Library page
// @route   GET /api/books/options
exports.getBookOptions = async (req, res) => {
  try {
    const { academicYear, courseName, subjectCode } = req.query;

    // 1. All distinct academic years
    const allYears = await Book.findAll({
      where: { isActive: true },
      attributes: ['academicYear'],
      group: ['academicYear'],
    });
    const academicYears = allYears
      .map((b) => b.academicYear)
      .filter(Boolean)
      .sort();

    // 2. Courses (filtered by academicYear if selected)
    const courseWhere = { isActive: true };
    if (academicYear && academicYear !== 'all') {
      courseWhere.academicYear = academicYear;
    }
    const allCourses = await Book.findAll({
      where: courseWhere,
      attributes: ['courseName'],
      group: ['courseName'],
    });
    const courseNames = allCourses
      .map((b) => b.courseName)
      .filter(Boolean)
      .sort();

    // 3. Subject Codes (filtered by academicYear & courseName if selected)
    const codeWhere = { isActive: true };
    if (academicYear && academicYear !== 'all') codeWhere.academicYear = academicYear;
    if (courseName && courseName !== 'all') codeWhere.courseName = courseName;
    const allCodes = await Book.findAll({
      where: codeWhere,
      attributes: ['subjectCode'],
      group: ['subjectCode'],
    });
    const subjectCodes = allCodes
      .map((b) => b.subjectCode)
      .filter(Boolean)
      .sort();

    // 4. Subject Names (filtered by academicYear, courseName, subjectCode if selected)
    const nameWhere = { isActive: true };
    if (academicYear && academicYear !== 'all') nameWhere.academicYear = academicYear;
    if (courseName && courseName !== 'all') nameWhere.courseName = courseName;
    if (subjectCode && subjectCode !== 'all') nameWhere.subjectCode = subjectCode;
    const allNames = await Book.findAll({
      where: nameWhere,
      attributes: ['subjectName'],
      group: ['subjectName'],
    });
    const subjectNames = allNames
      .map((b) => b.subjectName)
      .filter(Boolean)
      .sort();

    res.json({
      success: true,
      data: {
        academicYears,
        courseNames,
        subjectCodes,
        subjectNames,
      },
    });
  } catch (error) {
    console.error('getBookOptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch book options' });
  }
};

// @desc    Download / track download of a book
// @route   GET /api/books/download/:id
exports.downloadBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Increment download count
    await book.increment('downloadCount', { by: 1 });

    // If query ?redirect=true, redirect directly to file
    if (req.query.redirect === 'true') {
      return res.redirect(book.fileUrl);
    }

    res.json({
      success: true,
      data: {
        id: book.id,
        title: book.title,
        downloadUrl: book.fileUrl,
        fileName: book.fileName,
        downloadCount: book.downloadCount + 1,
      },
    });
  } catch (error) {
    console.error('downloadBook error:', error);
    res.status(500).json({ success: false, message: 'Failed to download book' });
  }
};

// @desc    Get all books for admin panel (including inactive)
// @route   GET /api/books/admin
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      order: [
        ['createdAt', 'DESC'],
      ],
    });
    res.json({ success: true, count: books.length, data: books });
  } catch (error) {
    console.error('getAllBooks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin books' });
  }
};

// @desc    Create new book
// @route   POST /api/books
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      academicYear,
      courseName,
      subjectCode,
      subjectName,
      author,
      description,
      fileUrl: providedFileUrl,
      fileName: providedFileName,
      fileSize: providedFileSize,
      isActive,
      order,
    } = req.body;

    let fileUrl = providedFileUrl;
    let fileName = providedFileName;
    let fileSize = providedFileSize;

    // Handle file upload if sent via multer
    if (req.file) {
      const uploadRes = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      fileUrl = uploadRes.secure_url;
      fileName = req.file.originalname;
      const sizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
      fileSize = `${sizeMB} MB`;
    }

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a book file upload or a download link / file URL',
      });
    }

    if (!title || !academicYear || !courseName || !subjectCode || !subjectName) {
      return res.status(400).json({
        success: false,
        message: 'Title, Academic Year, Course Name, Subject Code, and Subject Name are all required',
      });
    }

    const book = await Book.create({
      title: title.trim(),
      academicYear: academicYear.trim(),
      courseName: courseName.trim(),
      subjectCode: subjectCode.trim().toUpperCase(),
      subjectName: subjectName.trim(),
      author: author ? author.trim() : '',
      description: description ? description.trim() : '',
      fileUrl,
      fileName: fileName || `${subjectCode.trim()}_Book.pdf`,
      fileSize: fileSize || 'PDF Document',
      isActive: isActive !== undefined ? isActive : true,
      order: order ? parseInt(order, 10) : 0,
    });

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    console.error('createBook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const updateData = { ...req.body };

    // Handle file upload if new file provided
    if (req.file) {
      const uploadRes = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      updateData.fileUrl = uploadRes.secure_url;
      updateData.fileName = req.file.originalname;
      const sizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
      updateData.fileSize = `${sizeMB} MB`;
    }

    if (updateData.subjectCode) {
      updateData.subjectCode = updateData.subjectCode.trim().toUpperCase();
    }

    await book.update(updateData);
    res.json({ success: true, data: book });
  } catch (error) {
    console.error('updateBook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    await book.destroy();
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('deleteBook error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete book' });
  }
};
