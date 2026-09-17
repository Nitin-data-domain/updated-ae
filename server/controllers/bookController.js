const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const Book = require('../models/Book');
const { cloudinary } = require('../middleware/upload');

// Helper to sanitize legacy broken Cloudinary book URLs to local uploads
const sanitizeBookRecord = (book) => {
  if (!book) return book;
  const data = book.toJSON ? book.toJSON() : { ...book };
  if (
    data.fileUrl &&
    (data.fileUrl.includes('Teaching%20Load%202026') ||
      data.fileUrl.includes('Teaching_Load_2026') ||
      data.fileUrl.includes('Teaching%20Load'))
  ) {
    data.fileUrl = '/uploads/books/Teaching_Load_2026_1789663607345.pdf';
  }
  return data;
};

// Helper to save book/notes file locally in server/uploads/books
const saveBookLocally = (buffer, filename) => {
  const uploadDir = path.join(__dirname, '../uploads/books');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const cleanName = (filename || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${cleanName.replace(/\.[^/.]+$/, '')}_${Date.now()}${path.extname(cleanName) || '.pdf'}`;
  const filePath = path.join(uploadDir, uniqueName);
  fs.writeFileSync(filePath, buffer);
  return {
    localUrl: `/uploads/books/${uniqueName}`,
    filePath,
    uniqueName,
  };
};

// Helper to upload buffer to Cloudinary for raw/PDF files (non-blocking backup)
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'aharada-education/books',
          resource_type: 'raw',
          public_id: filename ? filename.replace(/\.[^/.]+$/, '') + '_' + Date.now() : undefined,
        },
        (error, result) => {
          if (error) {
            console.warn('Cloudinary raw upload notice:', error.message);
            resolve(null);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    } catch (e) {
      console.warn('Cloudinary upload stream notice:', e.message);
      resolve(null);
    }
  });
};

// @desc    Get books with cascading filters and search
// @route   GET /api/books
exports.getBooks = async (req, res) => {
  try {
    const { academicYear, courseName, subjectCode, subjectName, search, materialType, unit, semester } = req.query;

    const where = { isActive: true };

    if (materialType && materialType !== 'all') {
      where.materialType = materialType;
    }

    if (unit && unit !== 'all') {
      where.unit = unit;
    }

    if (semester && semester !== 'all') {
      where.semester = semester;
    }

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
        { unit: { [Op.like]: q } },
        { semester: { [Op.like]: q } },
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

    const sanitizedBooks = books.map(sanitizeBookRecord);

    res.json({
      success: true,
      count: sanitizedBooks.length,
      data: sanitizedBooks,
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
    const { academicYear, courseName, subjectCode, semester } = req.query;

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

    // 2. Semesters
    const semWhere = { isActive: true };
    if (academicYear && academicYear !== 'all') semWhere.academicYear = academicYear;
    if (courseName && courseName !== 'all') semWhere.courseName = courseName;
    const allSemesters = await Book.findAll({
      where: semWhere,
      attributes: ['semester'],
      group: ['semester'],
    });
    const semesters = allSemesters
      .map((b) => b.semester)
      .filter(Boolean)
      .sort();

    // 3. Courses (filtered by academicYear if selected)
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

    // 4. Subject Codes (filtered by academicYear & courseName & semester if selected)
    const codeWhere = { isActive: true };
    if (academicYear && academicYear !== 'all') codeWhere.academicYear = academicYear;
    if (courseName && courseName !== 'all') codeWhere.courseName = courseName;
    if (semester && semester !== 'all') codeWhere.semester = semester;
    const allCodes = await Book.findAll({
      where: codeWhere,
      attributes: ['subjectCode'],
      group: ['subjectCode'],
    });
    const subjectCodes = allCodes
      .map((b) => b.subjectCode)
      .filter(Boolean)
      .sort();

    // 5. Subject Names (filtered by academicYear, courseName, subjectCode if selected)
    const nameWhere = { isActive: true };
    if (academicYear && academicYear !== 'all') nameWhere.academicYear = academicYear;
    if (courseName && courseName !== 'all') nameWhere.courseName = courseName;
    if (subjectCode && subjectCode !== 'all') nameWhere.subjectCode = subjectCode;
    if (semester && semester !== 'all') nameWhere.semester = semester;
    const allNames = await Book.findAll({
      where: nameWhere,
      attributes: ['subjectName'],
      group: ['subjectName'],
    });
    const subjectNames = allNames
      .map((b) => b.subjectName)
      .filter(Boolean)
      .sort();

    // 6. Distinct units for notes
    const unitWhere = { isActive: true };
    if (academicYear && academicYear !== 'all') unitWhere.academicYear = academicYear;
    if (courseName && courseName !== 'all') unitWhere.courseName = courseName;
    if (subjectCode && subjectCode !== 'all') unitWhere.subjectCode = subjectCode;
    if (semester && semester !== 'all') unitWhere.semester = semester;
    const allUnits = await Book.findAll({
      where: unitWhere,
      attributes: ['unit'],
      group: ['unit'],
    });
    const units = allUnits
      .map((b) => b.unit)
      .filter(Boolean)
      .sort();

    res.json({
      success: true,
      data: {
        academicYears,
        semesters,
        courseNames,
        subjectCodes,
        subjectNames,
        units,
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
    await book.increment('downloadCount', { by: 1 }).catch(() => {});

    const sanitized = sanitizeBookRecord(book);

    // If query ?redirect=true, redirect directly to file
    if (req.query.redirect === 'true') {
      return res.redirect(sanitized.fileUrl);
    }

    res.json({
      success: true,
      data: {
        id: book.id,
        title: book.title,
        downloadUrl: sanitized.fileUrl,
        fileName: book.fileName,
        downloadCount: (book.downloadCount || 0) + 1,
      },
    });
  } catch (error) {
    console.error('downloadBook error:', error);
    res.status(500).json({ success: false, message: 'Failed to download book' });
  }
};

// @desc    Direct view/download streaming for a book
// @route   GET /api/books/file/:id
// @route   GET /api/books/view/:id
exports.serveBookFile = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).send('Book not found');
    }

    await book.increment('downloadCount', { by: 1 }).catch(() => {});

    const sanitized = sanitizeBookRecord(book);
    let targetUrl = sanitized.fileUrl;

    // Check if targetUrl is a local /uploads/ path
    if (targetUrl && targetUrl.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, '..', targetUrl.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(book.fileName || 'document.pdf')}"`);
        return res.sendFile(fullPath);
      }
    }

    // Check uploads/books directory for matching file
    const uploadsDir = path.join(__dirname, '../uploads/books');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const matched = files.find(
        (f) =>
          (book.fileName && f.toLowerCase().includes(book.fileName.replace(/\.[^/.]+$/, '').toLowerCase())) ||
          (targetUrl && targetUrl.toLowerCase().includes('teaching') && f.toLowerCase().includes('teaching'))
      );
      if (matched) {
        const fullPath = path.join(uploadsDir, matched);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(book.fileName || 'document.pdf')}"`);
        return res.sendFile(fullPath);
      }
    }

    if (targetUrl) {
      return res.redirect(targetUrl);
    }

    return res.status(404).send('File not found');
  } catch (error) {
    console.error('serveBookFile error:', error);
    res.status(500).send('Internal server error');
  }
};

// @desc    Get all books for admin panel (including inactive)
// @route   GET /api/books/admin
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      order: [['createdAt', 'DESC']],
    });
    const sanitizedBooks = books.map(sanitizeBookRecord);
    res.json({ success: true, count: sanitizedBooks.length, data: sanitizedBooks });
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
      materialType,
      unit,
      semester,
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
      const saved = saveBookLocally(req.file.buffer, req.file.originalname);
      fileUrl = saved.localUrl;
      fileName = req.file.originalname;
      const sizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
      fileSize = `${sizeMB} MB`;

      // Non-blocking background upload to Cloudinary as raw backup
      uploadToCloudinary(req.file.buffer, req.file.originalname).catch(() => {});
    }

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a file upload or a download link / file URL',
      });
    }

    if (!title || !academicYear || !courseName || !subjectCode || !subjectName) {
      return res.status(400).json({
        success: false,
        message: 'Title, Academic Year, Course Name, Subject Code, and Subject Name are all required',
      });
    }

    const isNotes = (materialType || '').toLowerCase() === 'notes';

    const book = await Book.create({
      title: title.trim(),
      academicYear: academicYear.trim(),
      courseName: courseName.trim(),
      subjectCode: subjectCode.trim().toUpperCase(),
      subjectName: subjectName.trim(),
      author: author ? author.trim() : isNotes ? 'Faculty Notes' : '',
      description: description ? description.trim() : '',
      materialType: isNotes ? 'notes' : 'book',
      unit: unit ? unit.trim() : '',
      semester: semester ? semester.trim() : '',
      fileUrl,
      fileName: fileName || `${subjectCode.trim()}_${isNotes ? unit || 'Notes' : 'Book'}.pdf`,
      fileSize: fileSize || 'PDF Document',
      isActive: isActive !== undefined ? isActive : true,
      order: order ? parseInt(order, 10) : 0,
    });

    res.status(201).json({ success: true, data: sanitizeBookRecord(book) });
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
      const saved = saveBookLocally(req.file.buffer, req.file.originalname);
      updateData.fileUrl = saved.localUrl;
      updateData.fileName = req.file.originalname;
      const sizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
      updateData.fileSize = `${sizeMB} MB`;

      // Non-blocking background upload to Cloudinary as raw backup
      uploadToCloudinary(req.file.buffer, req.file.originalname).catch(() => {});
    }

    if (updateData.subjectCode) {
      updateData.subjectCode = updateData.subjectCode.trim().toUpperCase();
    }

    await book.update(updateData);
    res.json({ success: true, data: sanitizeBookRecord(book) });
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
