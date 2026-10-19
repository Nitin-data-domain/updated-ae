const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Generate a comprehensive, professional Study Notes PDF for Aharada Education.
 * @param {Object} options
 * @param {string} options.title - e.g. "Unit 1: Data Base Management & SQL"
 * @param {string} options.subjectCode - e.g. "MBA - AI105"
 * @param {string} options.subjectName - e.g. "Data Base Management & SQL"
 * @param {string} options.courseName - e.g. "B.Sc Aeronautical Science"
 * @param {string} options.unit - e.g. "Unit 1"
 * @param {string} options.semester - e.g. "Semester 5"
 * @param {string} options.author - e.g. "Mr. Kunal Rawat"
 * @param {string} options.description - syllabus topics / outline
 * @param {string} options.outputPath - destination file path
 */
function generateStudyNotesPdf(options) {
  const {
    title = 'Academic Study Notes',
    subjectCode = 'CS-101',
    subjectName = 'Database Management',
    courseName = 'Aharada Academic Program',
    unit = 'Unit 1',
    semester = 'Semester 1',
    author = 'Faculty Member',
    description = '',
    outputPath,
  } = options;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
    });

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    const primaryColor = '#0f172a'; // Navy
    const accentColor = '#0284c7';  // Sky blue
    const textDark = '#1e293b';
    const textMuted = '#475569';

    // ── COVER / HEADER BANNER ──────────────────────────────────────────
    doc.rect(50, 45, 495, 75).fill('#0f172a');

    doc
      .fontSize(18)
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .text('AHARADA EDUCATION', 65, 60, { characterSpacing: 1 });

    doc
      .fontSize(9)
      .fillColor('#93c5fd')
      .font('Helvetica')
      .text('Excellence in Aviation, Aerospace & Advanced Computing Technologies', 65, 82);

    doc
      .fontSize(8)
      .fillColor('#cbd5e1')
      .font('Helvetica')
      .text('OFFICIAL CURRICULUM STUDY MATERIAL & LECTURE NOTES', 65, 96);

    doc.moveDown(3);

    // ── DOCUMENT METADATA BOX ──────────────────────────────────────────
    const metaY = 135;
    doc.rect(50, metaY, 495, 115).strokeColor('#cbd5e1').lineWidth(1).stroke();
    doc.rect(50, metaY, 495, 26).fill('#f1f5f9');

    doc
      .fontSize(11)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('COURSE & SUBJECT SPECIFICATION', 65, metaY + 8);

    const leftColX = 65;
    const rightColX = 310;
    let curY = metaY + 34;

    const addMetaRow = (label, val, x, y) => {
      doc.fontSize(9).font('Helvetica-Bold').fillColor(textDark).text(`${label}: `, x, y, { continued: true });
      doc.font('Helvetica').fillColor(textMuted).text(val || 'N/A');
    };

    addMetaRow('Course', courseName, leftColX, curY);
    addMetaRow('Subject Code', subjectCode, rightColX, curY);
    curY += 16;
    addMetaRow('Subject Name', subjectName, leftColX, curY);
    addMetaRow('Semester', semester, rightColX, curY);
    curY += 16;
    addMetaRow('Target Unit', unit, leftColX, curY);
    addMetaRow('Prepared By', author, rightColX, curY);
    curY += 16;
    addMetaRow('Document Title', title, leftColX, curY);
    addMetaRow('Academic Year', '2025 - 2026', rightColX, curY);

    // ── UNIT TITLE HEADING ─────────────────────────────────────────────
    doc.y = 270;
    doc
      .fontSize(16)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text(title, 50, doc.y);

    doc
      .fontSize(10)
      .fillColor(accentColor)
      .font('Helvetica-Bold')
      .text(`Subject: ${subjectName} (${subjectCode})`, 50, doc.y + 4);

    doc.moveDown(1);
    doc.strokeColor(accentColor).lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);

    // ── SECTION 1: UNIT SYLLABUS & OVERVIEW ────────────────────────────
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('1. Unit Syllabus & Module Breakdown');

    doc.moveDown(0.5);

    const cleanDesc = description || 'Standard university curriculum guidelines for this academic unit.';
    doc
      .fontSize(9.5)
      .fillColor(textDark)
      .font('Helvetica')
      .text(cleanDesc, { align: 'justify', lineGap: 3 });

    doc.moveDown(1.2);

    // Parse topics from description semicolon or newline separated
    const topics = cleanDesc
      .split(/;|\n|\r\n/)
      .map((t) => t.trim())
      .filter((t) => t.length > 3);

    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('2. Core Learning Objectives & Key Concepts');
    doc.moveDown(0.5);

    if (topics.length > 0) {
      topics.forEach((topic, idx) => {
        doc
          .fontSize(9.5)
          .fillColor(accentColor)
          .font('Helvetica-Bold')
          .text(`• Topic 2.${idx + 1}: `, { continued: true });
        doc
          .fillColor(textDark)
          .font('Helvetica')
          .text(topic, { lineGap: 2 });
      });
    }

    doc.moveDown(1.5);

    // ── SECTION 3: THEORETICAL FOUNDATION & SUMMARY NOTES ──────────────
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('3. Detailed Chapter Notes & Concepts');
    doc.moveDown(0.5);

    if (title.toLowerCase().includes('database') || title.toLowerCase().includes('sql') || subjectName.toLowerCase().includes('sql')) {
      if (unit.toLowerCase().includes('2')) {
        doc
          .fontSize(10.5)
          .fillColor(accentColor)
          .font('Helvetica-Bold')
          .text('3.1 Entity-Relationship (ER) Modeling & Diagrams');
        doc
          .fontSize(9)
          .fillColor(textDark)
          .font('Helvetica')
          .text(
            'The ER model defines the conceptual view of a database. Key components include Entities (real-world objects with independent existence), Attributes (properties or characteristics of entities such as simple, composite, single-valued, multi-valued, and derived), and Relationships (associations among entities). Cardinality ratios define the number of relationship instances (1:1, 1:N, M:N). Participation constraints specify mandatory or optional existence.',
            { align: 'justify', lineGap: 2 }
          );
        doc.moveDown(0.8);

        doc
          .fontSize(10.5)
          .fillColor(accentColor)
          .font('Helvetica-Bold')
          .text('3.2 Relational Schema & Relational Integrity Constraints');
        doc
          .fontSize(9)
          .fillColor(textDark)
          .font('Helvetica')
          .text(
            'A relational database consists of tables (relations) with rows (tuples) and columns (attributes). Integrity constraints maintain data validity:\n' +
            '• Entity Integrity: The primary key cannot contain null values.\n' +
            '• Referential Integrity: A foreign key value must match an existing primary key or be null.\n' +
            '• Domain Integrity: Column values must adhere to defined data types and ranges.',
            { align: 'justify', lineGap: 2 }
          );
        doc.moveDown(0.8);

        doc
          .fontSize(10.5)
          .fillColor(accentColor)
          .font('Helvetica-Bold')
          .text('3.3 Normalization & Functional Dependencies');
        doc
          .fontSize(9)
          .fillColor(textDark)
          .font('Helvetica')
          .text(
            'Normalization minimizes data redundancy and avoids insertion, update, and deletion anomalies:\n' +
            '• 1NF (First Normal Form): Eliminates repeating groups; all attribute values are atomic.\n' +
            '• 2NF (Second Normal Form): In 1NF and contains no partial functional dependencies (every non-prime attribute is fully functionally dependent on the entire primary key).\n' +
            '• 3NF (Third Normal Form): In 2NF and contains no transitive functional dependencies (X -> Y and Y -> Z where Z is non-prime).\n' +
            '• BCNF (Boyce-Codd Normal Form): Stricter version of 3NF where for every functional dependency X -> Y, X must be a super key.',
            { align: 'justify', lineGap: 2 }
          );
      } else {
        doc
          .fontSize(10.5)
          .fillColor(accentColor)
          .font('Helvetica-Bold')
          .text('3.1 Introduction to Database Management Systems (DBMS)');
        doc
          .fontSize(9)
          .fillColor(textDark)
          .font('Helvetica')
          .text(
            'A DBMS is system software for creating, managing, and querying databases. Compared to legacy file systems, DBMS provides structured data independence, reduces data redundancy, enforces concurrent access control, ensures ACID properties (Atomicity, Consistency, Isolation, Durability), and provides automated backup and recovery mechanisms.',
            { align: 'justify', lineGap: 2 }
          );
        doc.moveDown(0.8);

        doc
          .fontSize(10.5)
          .fillColor(accentColor)
          .font('Helvetica-Bold')
          .text('3.2 Three-Schema Architecture (ANSI/SPARC)');
        doc
          .fontSize(9)
          .fillColor(textDark)
          .font('Helvetica')
          .text(
            'The three-schema architecture partitions database systems into three abstraction layers:\n' +
            '1. External Level (View Schema): Individual end-user views of the data.\n' +
            '2. Conceptual Level (Logical Schema): Community view describing what data is stored and relationships among entities.\n' +
            '3. Internal Level (Physical Schema): Physical storage organization on disk, indices, and file structures.',
            { align: 'justify', lineGap: 2 }
          );
        doc.moveDown(0.8);

        doc
          .fontSize(10.5)
          .fillColor(accentColor)
          .font('Helvetica-Bold')
          .text('3.3 Database Users & DBMS Applications');
        doc
          .fontSize(9)
          .fillColor(textDark)
          .font('Helvetica')
          .text(
            'Key stakeholders include Database Administrators (DBAs responsible for schema definition, permissions, security, and performance tuning), Application Programmers, and End Users. Modern relational engines include PostgreSQL, MySQL, Oracle, and Microsoft SQL Server, powering mission-critical workflows in Aviation, Airline Operations, Financial Analytics, Supply Chain, and Artificial Intelligence.',
            { align: 'justify', lineGap: 2 }
          );
      }
    } else {
      doc
        .fontSize(9.5)
        .fillColor(textDark)
        .font('Helvetica')
        .text(
          `These lecture notes cover the required curriculum prescribed for ${courseName} under subject code ${subjectCode}. Students are advised to review the core formulas, theoretical derivations, and practical case studies presented during departmental lectures.`,
          { align: 'justify', lineGap: 3 }
        );
    }

    doc.moveDown(1.5);

    // ── SECTION 4: PRACTICE & REVISION QUESTIONS ───────────────────────
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('4. Review Questions & Self-Assessment');
    doc.moveDown(0.5);

    const questions = [
      `1. Explain the fundamental architectural distinctions between physical and logical data independence.`,
      `2. Discuss how the topics covered in this unit apply to industrial workflows in ${courseName}.`,
      `3. Formulate standard case diagrams and explain key constraints discussed under ${title}.`,
      `4. Review previous university examination questions related to ${subjectName} (${subjectCode}).`,
    ];

    questions.forEach((q) => {
      doc.fontSize(9).fillColor(textDark).font('Helvetica').text(q, { lineGap: 3 });
    });

    // ── FOOTER ON ALL PAGES ────────────────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.rect(50, 780, 495, 0.5).fill('#cbd5e1');
      doc
        .fontSize(8)
        .fillColor('#64748b')
        .font('Helvetica')
        .text('Aharada Education Academic Portal | https://aharadaedu.com', 50, 788, { align: 'left' });
      doc
        .fontSize(8)
        .fillColor('#64748b')
        .font('Helvetica')
        .text(`Page ${i + 1} of ${range.count}`, 50, 788, { align: 'right' });
    }

    doc.end();

    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', reject);
  });
}

module.exports = { generateStudyNotesPdf };
