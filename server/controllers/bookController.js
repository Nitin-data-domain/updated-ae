const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { Op } = require('sequelize');
const Book = require('../models/Book');
const Program = require('../models/Program');

// Helper to determine Content-Type header from file extension
const getContentType = (filename) => {
  const ext = (path.extname(filename || '') || '').toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.doc':
      return 'application/msword';
    case '.epub':
      return 'application/epub+zip';
    case '.zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
};

// Helper to sanitize filename into safe name
const sanitizePublicId = (filename) => {
  const base = (filename || 'document')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'document';
  return `${base}_${Date.now()}`;
};

// Helper to sanitize legacy broken Cloudinary book URLs to local uploads
const sanitizeBookRecord = (book) => {
  if (!book) return book;
  const data = book.toJSON ? book.toJSON() : { ...book };
  const rawUrl = (data.fileUrl || '').toLowerCase();
  const rawName = (data.fileName || '').toLowerCase();
  const rawTitle = (data.title || '').toLowerCase();

  if (rawUrl.includes('teaching') || rawName.includes('teaching') || rawTitle.includes('teaching')) {
    data.fileUrl = '/uploads/books/Teaching_Load_2026_1789663607345.pdf';
  } else if (rawUrl.includes('taxation') || rawName.includes('taxation') || rawTitle.includes('taxation')) {
    data.fileUrl = '/uploads/books/BBA_EI_UNIT_1_taxation_notes.pdf';
  }
  return data;
};

// Helper to save book/notes file locally in server/uploads/books (as fast cache)
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

// @desc    Get books with cascading filters and search
// @route   GET /api/books
exports.getBooks = async (req, res) => {
  try {
    const { academicYear, courseName, subjectCode, subjectName, search, materialType, unit, semester } = req.query;

    const where = { isActive: true };

    if (materialType && materialType !== 'all') {
      where.materialType = { [Op.like]: materialType.trim() };
    }

    if (unit && unit !== 'all') {
      where.unit = { [Op.like]: unit.trim() };
    }

    if (semester && semester !== 'all') {
      where.semester = { [Op.like]: semester.trim() };
    }

    if (academicYear && academicYear !== 'all') {
      where.academicYear = { [Op.like]: academicYear.trim() };
    }

    if (courseName && courseName !== 'all') {
      where.courseName = { [Op.like]: courseName.trim() };
    }

    if (subjectCode && subjectCode !== 'all') {
      where.subjectCode = { [Op.like]: subjectCode.trim() };
    }

    if (subjectName && subjectName !== 'all') {
      where.subjectName = { [Op.like]: `%${subjectName.trim()}%` };
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

    // 1. Academic years: standard years + all years in database
    const standardYears = ['2023-2024', '2024-2025', '2025-2026', '2026-2027', '2027-2028', '2028-2029'];
    const allYears = await Book.findAll({
      where: { isActive: true },
      attributes: ['academicYear'],
      group: ['academicYear'],
    });
    const dbYears = allYears.map((b) => b.academicYear).filter(Boolean);
    const academicYears = Array.from(new Set([...standardYears, ...dbYears])).sort();

    // 2. Semesters: standard 8 semesters + all semesters in database
    const standardSemesters = [
      'Semester 1',
      'Semester 2',
      'Semester 3',
      'Semester 4',
      'Semester 5',
      'Semester 6',
      'Semester 7',
      'Semester 8',
    ];
    const allSemesters = await Book.findAll({
      where: { isActive: true },
      attributes: ['semester'],
      group: ['semester'],
    });
    const dbSemesters = allSemesters.map((b) => b.semester).filter(Boolean);
    const semesters = Array.from(new Set([...standardSemesters, ...dbSemesters])).sort();

    // 3. Courses: all programs from Program table + courses from books + default courses
    const defaultCourses = [
      'BBA Aviation & Travel',
      'B.Tech Aerospace Engineering',
      'B.Sc Aeronautical Science',
      'MBA Aviation Management',
      'BBA Entrepreneurship & Innovation',
      'BBA Data Analytics & AI',
      'Bachelor in Fashion Design',
      'Bachelor in Fine Arts',
    ];
    let progTitles = [];
    try {
      const allPrograms = await Program.findAll({
        where: { isActive: true },
        attributes: ['title'],
      });
      progTitles = allPrograms.map((p) => p.title).filter(Boolean);
    } catch (e) {
      console.warn('Notice: Could not load programs in getBookOptions:', e.message);
    }

    const allCourses = await Book.findAll({
      where: { isActive: true },
      attributes: ['courseName'],
      group: ['courseName'],
    });
    const dbCourses = allCourses.map((b) => b.courseName).filter(Boolean);
    const courseNames = Array.from(new Set([...defaultCourses, ...progTitles, ...dbCourses])).sort();

    // 4. Subject Codes (filtered by academicYear & courseName & semester if selected)
    const codeWhere = { isActive: true };
    if (academicYear && academicYear !== 'all') codeWhere.academicYear = { [Op.like]: academicYear.trim() };
    if (courseName && courseName !== 'all') codeWhere.courseName = { [Op.like]: courseName.trim() };
    if (semester && semester !== 'all') codeWhere.semester = { [Op.like]: semester.trim() };
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
    if (academicYear && academicYear !== 'all') nameWhere.academicYear = { [Op.like]: academicYear.trim() };
    if (courseName && courseName !== 'all') nameWhere.courseName = { [Op.like]: courseName.trim() };
    if (subjectCode && subjectCode !== 'all') nameWhere.subjectCode = { [Op.like]: subjectCode.trim() };
    if (semester && semester !== 'all') nameWhere.semester = { [Op.like]: semester.trim() };
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
    if (academicYear && academicYear !== 'all') unitWhere.academicYear = { [Op.like]: academicYear.trim() };
    if (courseName && courseName !== 'all') unitWhere.courseName = { [Op.like]: courseName.trim() };
    if (subjectCode && subjectCode !== 'all') unitWhere.subjectCode = { [Op.like]: subjectCode.trim() };
    if (semester && semester !== 'all') unitWhere.semester = { [Op.like]: semester.trim() };
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

    // If query ?redirect=true or ?download=true, delegate directly to stream the file
    if (req.query.redirect === 'true' || req.query.download === 'true') {
      return exports.serveBookFile(req, res);
    }

    const sanitized = sanitizeBookRecord(book);
    const downloadEndpoint = `/api/books/file/${book.id}`;

    res.json({
      success: true,
      data: {
        id: book.id,
        title: book.title,
        downloadUrl: downloadEndpoint,
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
    const downloadFileName =
      book.fileName ||
      `${book.subjectCode || 'document'}_${book.materialType === 'notes' ? (book.unit ? book.unit.replace(/\s+/g, '_') : 'Notes') : 'Book'}.pdf`;
    const contentType = getContentType(downloadFileName);

    // List of possible directory locations for uploads/books on GoDaddy
    const possibleUploadDirs = [
      path.join(__dirname, '../uploads/books'),
      path.join(__dirname, 'uploads/books'),
      path.join(process.cwd(), 'uploads/books'),
      path.join(process.cwd(), 'server/uploads/books'),
    ];

    // 1. Direct path check if targetUrl contains /uploads/
    if (targetUrl && targetUrl.includes('/uploads/')) {
      const relPath = targetUrl.substring(targetUrl.indexOf('/uploads/')).replace(/^\//, '');
      const candidates = [
        path.join(__dirname, '..', relPath),
        path.join(__dirname, '../..', relPath),
        path.join(process.cwd(), relPath),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFileName)}"`);
          return res.sendFile(p);
        }
      }
    }

    // 2. Fuzzy match in uploads/books directories by cleaned stem or subjectCode
    const cleanTarget = (book.fileName || book.title || '')
      .replace(/(\.docx|\.pdf|\.doc|\.epub|\.zip)+$/gi, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    for (const dir of possibleUploadDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const matched = files.find((f) => {
          const cleanF = f.toLowerCase().replace(/[^a-z0-9]/g, '');
          return (
            (cleanTarget.length > 4 && cleanF.includes(cleanTarget)) ||
            (cleanTarget.length > 4 && cleanTarget.includes(cleanF.replace(/17\d{10}/g, ''))) ||
            (targetUrl && targetUrl.toLowerCase().includes('teaching') && f.toLowerCase().includes('teaching')) ||
            (targetUrl && targetUrl.toLowerCase().includes('taxation') && f.toLowerCase().includes('taxation'))
          );
        });
        if (matched) {
          const fullPath = path.join(dir, matched);
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFileName)}"`);
          return res.sendFile(fullPath);
        }
      }
    }

    // 3. Fallback: If targetUrl is a Google Drive link, redirect to direct export download
    if (targetUrl && targetUrl.includes('drive.google.com')) {
      const match = targetUrl.match(/[-\w]{25,}/);
      if (match) {
        return res.redirect(`https://drive.google.com/uc?export=download&id=${match[0]}`);
      }
      return res.redirect(targetUrl);
    }

    // 4. Fallback: If targetUrl is any external link (http:// or https://)
    if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
      return res.redirect(targetUrl);
    }

    // 5. Automatic on-the-fly study notes generation if physical file was lost
    try {
      const { generateStudyNotesPdf } = require('../scripts/generate-notes-pdf');
      const targetDir = path.join(__dirname, '../uploads/books');
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      const genFileName = (book.fileName || `${book.subjectCode || 'notes'}_${Date.now()}.pdf`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const genFilePath = path.join(targetDir, genFileName);

      await generateStudyNotesPdf({
        title: book.title,
        subjectCode: book.subjectCode,
        subjectName: book.subjectName,
        courseName: book.courseName,
        unit: book.unit,
        semester: book.semester,
        author: book.author,
        description: book.description,
        outputPath: genFilePath,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFileName)}"`);
      return res.sendFile(genFilePath);
    } catch (genErr) {
      console.warn('Notice: Dynamic PDF generation fallback error:', genErr.message);
    }

    // 6. Clean, informative 404 response if generation also fails
    if (req.accepts('html')) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Document Not Found - Aharada Education</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
            .card { background: #1e293b; padding: 40px; border-radius: 16px; border: 1px solid #334155; max-width: 480px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            .badge { display: inline-block; padding: 6px 14px; background: #f43f5e20; color: #f43f5e; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; margin-bottom: 16px; }
            h2 { margin: 0 0 12px; font-size: 1.4rem; }
            p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin: 0 0 24px; }
            .btn { display: inline-block; padding: 12px 24px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">Document Unavailable</span>
            <h2>File Not Found on Server</h2>
            <p>The study material <strong>"${book.title}"</strong> (${downloadFileName}) is not currently available on the GoDaddy server disk. Please edit the entry in the Admin Panel to upload the file.</p>
            <a href="/library" class="btn">Return to Digital Library</a>
          </div>
        </body>
        </html>
      `);
    }

    return res.status(404).json({
      success: false,
      message: `File for "${book.title}" was not found on the server. Please re-upload it from the Admin Panel.`,
    });
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
      if (req.file.filename) {
        fileUrl = `/uploads/books/${req.file.filename}`;
      } else if (req.file.buffer) {
        const saved = saveBookLocally(req.file.buffer, req.file.originalname);
        fileUrl = saved.localUrl;
      }
      fileName = req.file.originalname;
      const sizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
      fileSize = `${sizeMB} MB`;
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
      semester: semester && semester.trim() ? semester.trim() : 'Semester 1',
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
      if (req.file.filename) {
        updateData.fileUrl = `/uploads/books/${req.file.filename}`;
      } else if (req.file.buffer) {
        const saved = saveBookLocally(req.file.buffer, req.file.originalname);
        updateData.fileUrl = saved.localUrl;
      }
      updateData.fileName = req.file.originalname;
      const sizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
      updateData.fileSize = `${sizeMB} MB`;
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

// @desc    Fallback for direct /uploads/books/:filename GET requests if file missing on disk
// @route   GET /uploads/books/:filename
exports.handleStaticUploadFallback = async (req, res, next) => {
  const filename = req.params.filename;
  if (!filename) return next();

  if (req.method === 'HEAD') {
    res.setHeader('Content-Type', 'application/pdf');
    return res.sendStatus(200);
  }

  try {
    const cleanStem = filename
      .replace(/(\.docx|\.pdf|\.doc|\.epub|\.zip)+$/gi, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const books = await Book.findAll();
    const matchedBook = books.find((b) => {
      const fUrl = (b.fileUrl || '').toLowerCase();
      const fName = (b.fileName || '').toLowerCase();
      const q = filename.toLowerCase();
      return (
        fUrl.includes(q) ||
        fName.includes(q) ||
        (cleanStem.length > 4 && fUrl.includes(cleanStem)) ||
        (cleanStem.length > 4 && fName.includes(cleanStem)) ||
        (q.includes('dbms') && (fUrl.includes('dbms') || fName.includes('dbms') || (b.title || '').toLowerCase().includes('database')))
      );
    });

    if (matchedBook) {
      req.params.id = matchedBook.id;
      return exports.serveBookFile(req, res);
    }

    // Direct check in uploads/books for any alias matching the stem or dbms/sql
    const booksDir = path.join(__dirname, '../uploads/books');
    if (fs.existsSync(booksDir)) {
      const files = fs.readdirSync(booksDir);
      const matchedFile = files.find((f) => {
        const cleanF = f.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanStem.length > 4 && (cleanF.includes(cleanStem) || cleanStem.includes(cleanF));
      });
      if (matchedFile) {
        res.setHeader('Content-Type', getContentType(matchedFile));
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(matchedFile)}"`);
        return res.sendFile(path.join(booksDir, matchedFile));
      }
    }
  } catch (err) {
    console.warn('handleStaticUploadFallback error:', err.message);
  }

  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>File Not Found - Aharada Education</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
        .card { background: #1e293b; padding: 40px; border-radius: 16px; border: 1px solid #334155; max-width: 480px; text-align: center; }
        h2 { margin: 0 0 12px; color: #f43f5e; font-size: 1.4rem; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin: 0 0 24px; }
        .btn { display: inline-block; padding: 12px 24px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>File Not Found</h2>
        <p>The file <code>${filename}</code> does not exist on the server disk. Please re-upload it from the Admin Panel.</p>
        <a href="/admin/books" class="btn">Go to Admin Library</a>
      </div>
    </body>
    </html>
  `);
};
