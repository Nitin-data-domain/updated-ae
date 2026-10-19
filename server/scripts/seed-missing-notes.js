const path = require('path');
const fs = require('fs');
const { generateStudyNotesPdf } = require('./generate-notes-pdf');

const missingNotes = [
  {
    filename: 'DBMS_SQL_Unit_2nd_1792232620022.pdf',
    title: 'Unit 2: Data Base Management & SQL',
    courseName: 'B.Sc Aeronautical Science',
    subjectCode: 'MBA - AI105',
    subjectName: 'Data Base Management & SQL',
    author: 'Mr. Kunal Rawat',
    unit: 'Unit 2',
    semester: 'Semester 5',
    description: 'Entity Relationship (ER) Model; ER Diagrams; Entities, Attributes, Relationships; Cardinality; Keys (Primary, Foreign, Composite, Candidate); Relational Schema; Functional Dependencies; Database Design Process; Normalization (1NF, 2NF, 3NF, BCNF); Denormalization; Data Integrity Constraints; Business database modelling.',
  },
  {
    filename: 'DBMS_SQL_Unit_1st_1792232537668.pdf',
    title: 'Unit 1: Data Base Management & SQL',
    courseName: 'B.Sc Aeronautical Science',
    subjectCode: 'MBA - AI105',
    subjectName: 'Data Base Management & SQL',
    author: 'Mr. Kunal Rawat',
    unit: 'Unit 1',
    semester: 'Semester 5',
    description: 'Introduction to Data, Information, and Databases; File Processing System vs DBMS; Advantages of DBMS; Database Architecture; Components of DBMS; Three-Schema Architecture; Data Models; Relational Database Model; Database Users; Database Administrator (DBA); Introduction to MySQL, PostgreSQL, Oracle, SQL Server; Applications of DBMS in AI, Data Analytics, Finance, Healthcare, Retail, and Supply Chain.',
  },
  {
    filename: 'DBMS_SQL_Unit_2nd_1792232448058.pdf',
    title: 'Unit 2: Data Base Management & SQL',
    courseName: 'B.Tech Aerospace Engineering',
    subjectCode: 'MBA - AI105',
    subjectName: 'Data Base Management & SQL',
    author: 'Mr. Kunal Rawat',
    unit: 'Unit 2',
    semester: 'Semester 5',
    description: 'Entity Relationship (ER) Model; ER Diagrams; Entities, Attributes, Relationships; Cardinality; Keys (Primary, Foreign, Composite, Candidate); Relational Schema; Functional Dependencies; Database Design Process; Normalization (1NF, 2NF, 3NF, BCNF); Denormalization; Data Integrity Constraints; Business database modelling.',
  },
  {
    filename: 'DBMS_SQL_Unit_1st_1792232108347.pdf',
    title: 'Unit 1: Data Base Management & SQL',
    courseName: 'B.Tech Aerospace Engineering',
    subjectCode: 'MBA - AI105',
    subjectName: 'Data Base Management & SQL',
    author: 'Mr. Kunal Rawat',
    unit: 'Unit 1',
    semester: 'Semester 1',
    description: 'Introduction to Data, Information, and Databases; File Processing System vs DBMS; Advantages of DBMS; Database Architecture; Components of DBMS; Three-Schema Architecture; Data Models; Relational Database Model; Database Users; Database Administrator (DBA); Introduction to MySQL, PostgreSQL, Oracle, SQL Server; Applications of DBMS in AI, Data Analytics, Finance, Healthcare, Retail, and Supply Chain.',
  },
  {
    filename: 'DBMS_SQL_Unit_2nd_1792232887353.pdf',
    title: 'Unit 2: Data Base Management & SQL',
    courseName: 'MBA Data Analytics & Artificial Intelligence',
    subjectCode: 'MBA - AI105',
    subjectName: 'Data Base Management & SQL',
    author: 'Mr. Kunal Rawat',
    unit: 'Unit 2',
    semester: 'Semester 1',
    description: 'Entity Relationship (ER) Model; ER Diagrams; Entities, Attributes, Relationships; Cardinality; Keys (Primary, Foreign, Composite, Candidate); Relational Schema; Functional Dependencies; Database Design Process; Normalization (1NF, 2NF, 3NF, BCNF); Denormalization; Data Integrity Constraints; Business database modelling.',
  },
  {
    filename: 'DBMS_SQL_Unit_1st_1792232768886.pdf',
    title: 'Unit 1: Data Base Management & SQL',
    courseName: 'MBA Data Analytics & Artificial Intelligence',
    subjectCode: 'MBA - AI105',
    subjectName: 'Data Base Management & SQL',
    author: 'Mr. Kunal Rawat',
    unit: 'Unit 1',
    semester: 'Semester 1',
    description: 'Introduction to Data, Information, and Databases; File Processing System vs DBMS; Advantages of DBMS; Database Architecture; Components of DBMS; Three-Schema Architecture; Data Models; Relational Database Model; Database Users; Database Administrator (DBA); Introduction to MySQL, PostgreSQL, Oracle, SQL Server; Applications of DBMS in AI, Data Analytics, Finance, Healthcare, Retail, and Supply Chain.',
  },
];

async function run() {
  const booksDir = path.join(__dirname, '../uploads/books');
  if (!fs.existsSync(booksDir)) {
    fs.mkdirSync(booksDir, { recursive: true });
  }

  console.log('Generating missing DBMS & SQL notes PDF files...');
  for (const item of missingNotes) {
    const dest = path.join(booksDir, item.filename);
    await generateStudyNotesPdf({
      ...item,
      outputPath: dest,
    });
    console.log(`✅ Generated: ${item.filename}`);
  }

  // Also create generic copies for fuzzy matching
  const unit1Src = path.join(booksDir, 'DBMS_SQL_Unit_1st_1792232537668.pdf');
  const unit2Src = path.join(booksDir, 'DBMS_SQL_Unit_2nd_1792232620022.pdf');

  const aliases = [
    { src: unit1Src, alias: 'DBMS_SQL_Unit_1st.pdf' },
    { src: unit1Src, alias: 'DBMS&SQL_Unit_1st.pdf' },
    { src: unit1Src, alias: 'DBMS_SQL_Unit_1.pdf' },
    { src: unit2Src, alias: 'DBMS_SQL_Unit_2nd.pdf' },
    { src: unit2Src, alias: 'DBMS&SQL_Unit_2nd.pdf' },
    { src: unit2Src, alias: 'DBMS_SQL_Unit_2.pdf' },
  ];

  for (const a of aliases) {
    const dest = path.join(booksDir, a.alias);
    fs.copyFileSync(a.src, dest);
    console.log(`✅ Created alias: ${a.alias}`);
  }

  console.log('🎉 All study notes successfully generated and bundled!');
}

run().catch((err) => {
  console.error('Error generating notes:', err);
  process.exit(1);
});
