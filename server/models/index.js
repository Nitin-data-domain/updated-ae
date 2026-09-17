const { sequelize } = require('../config/db');
const User = require('./User');
const Program = require('./Program');
const Faculty = require('./Faculty');
const Event = require('./Event');
const Placement = require('./Placement');
const Enquiry = require('./Enquiry');
const Brochure = require('./Brochure');
const OTP = require('./OTP');
const Book = require('./Book');
const Feedback = require('./Feedback');
const FacultyRole = require('./FacultyRole');
const { CampusPhoto, CompanyPartner } = require('./SiteContent');

// Define Associations
Brochure.belongsTo(Program, { foreignKey: 'linkedProgramId', as: 'linkedProgram' });
Program.hasMany(Brochure, { foreignKey: 'linkedProgramId', as: 'brochures' });

// Function to sync all models
async function syncModels() {
  await sequelize.sync({ alter: false });

  // Ensure columns exist on books table
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDesc = await queryInterface.describeTable('books');
    if (!tableDesc.materialType) {
      await queryInterface.addColumn('books', 'materialType', {
        type: sequelize.Sequelize.STRING,
        defaultValue: 'book',
      });
      console.log('Added materialType column to books table');
    }
    if (!tableDesc.unit) {
      await queryInterface.addColumn('books', 'unit', {
        type: sequelize.Sequelize.STRING,
        defaultValue: '',
      });
      console.log('Added unit column to books table');
    }
    if (!tableDesc.semester) {
      await queryInterface.addColumn('books', 'semester', {
        type: sequelize.Sequelize.STRING,
        defaultValue: '',
      });
      console.log('Added semester column to books table');
    }

    // Backfill any books that don't have a semester yet
    await Book.update(
      { semester: 'Semester 1' },
      { where: { semester: ['', null] } }
    );

    // Auto-migrate any book records with broken Cloudinary PDF URLs
    const { Op } = require('sequelize');
    try {
      const brokenBooks = await Book.findAll({
        where: {
          fileUrl: {
            [Op.or]: [
              { [Op.like]: '%cloudinary%Teaching%20Load%202026%' },
              { [Op.like]: '%cloudinary%Teaching_Load_2026%' },
              { [Op.like]: '%Teaching%20Load%202026%' },
              { [Op.like]: '%Teaching_Load_2026%' },
            ],
          },
        },
      });
      for (const b of brokenBooks) {
        await b.update({
          fileUrl: '/uploads/books/Teaching_Load_2026_1789663607345.pdf',
        });
        console.log(`Repaired book #${b.id} (${b.title}) fileUrl to local uploads`);
      }
    } catch (migErr) {
      console.warn('Book URL migration check:', migErr.message);
    }
  } catch (colErr) {
    console.warn('Notice: Column migration check:', colErr.message);
  }

  // Ensure columns exist on faculties table
  try {
    const queryInterface = sequelize.getQueryInterface();
    const facultyDesc = await queryInterface.describeTable('faculties');
    if (!facultyDesc.rolesAndResponsibilities) {
      await queryInterface.addColumn('faculties', 'rolesAndResponsibilities', {
        type: sequelize.Sequelize.TEXT,
        defaultValue: '',
      });
      console.log('✅ Added rolesAndResponsibilities column to faculties table');
    }
  } catch (colErr) {
    console.warn('Notice: Faculty column migration check:', colErr.message);
  }
}

// Function to seed initial data
async function seedInitialData() {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('🌱 Fresh database detected. Seeding initial data...');

    // Admin Users
    await User.create({
      name: 'Admin',
      email: 'admin@aharada.edu',
      password: 'admin123',
      role: 'superadmin',
    });

    await User.create({
      name: 'Admin',
      email: 'md@aharadaedu.in',
      password: 'Aharada@Prabhu',
      role: 'superadmin',
    });

    console.log('   ✅ Default Admin Accounts created:');
    console.log('      - admin@aharada.edu / admin123');
    console.log('      - md@aharadaedu.in / Aharada@Prabhu');
    }

    // Programs
    const progCount = await Program.count();
    if (progCount === 0) {
      console.log('🌱 Seeding sample programs...');
      const programs = [
      {
        title: 'BBA Aviation & Travel',
        slug: 'bba-aviation-travel',
        shortDescription: 'Launch your career in the booming aviation and travel industry with our comprehensive BBA program integrated with leading universities.',
        overview: 'The BBA in Aviation & Travel is a 3-year undergraduate program designed to equip students with comprehensive knowledge of airline operations, airport management, travel and tourism, hospitality services, and aviation business management. Students gain exposure to real-world airline operations through industry visits, internships, and expert-led workshops at our partner university campuses.',
        eligibility: '10+2 from any recognized board with minimum 50% aggregate marks',
        duration: '3 Years (6 Semesters)',
        category: ['aviation'],
        universities: [
          { name: 'IIMT University', slug: 'iimt' },
          { name: 'Subharti University', slug: 'subharti' }
        ],
        careerOpportunities: ['Airline Operations Manager', 'Airport Ground Staff Manager', 'Travel Agency Manager', 'Cargo Operations Executive', 'Flight Operations Coordinator', 'Aviation Sales & Marketing Manager', 'Tourism Officer', 'Hospitality Manager'],
        industryExposure: ['Airport visits and live operations training', 'Airline management internships', 'Guest lectures by aviation industry leaders', 'Travel agency operational projects', 'International aviation conference participation'],
        highlights: ['100% Placement Assistance', 'Industry-Integrated Curriculum', 'Airport & Airline Visits', 'Certified Aviation Training Modules', 'Expert Faculty from Aviation Industry'],
        order: 1
      },
      {
        title: 'B.Tech Aerospace Engineering',
        slug: 'btech-aerospace-engineering',
        shortDescription: 'Engineer the future of flight with our cutting-edge Aerospace Engineering program offered through top technical universities.',
        overview: 'The B.Tech in Aerospace Engineering is a 4-year program that covers aerodynamics, propulsion systems, aircraft structures, avionics, and space technology. Students work on real aircraft components, use advanced simulation software, and collaborate with aerospace companies on capstone projects.',
        eligibility: '10+2 with Physics, Chemistry, and Mathematics with minimum 60% aggregate marks',
        duration: '4 Years (8 Semesters)',
        category: ['engineering'],
        universities: [
          { name: 'IIMT University', slug: 'iimt' },
          { name: 'Subharti University', slug: 'subharti' }
        ],
        careerOpportunities: ['Aerospace Design Engineer', 'Aircraft Maintenance Engineer', 'Avionics Systems Engineer', 'Propulsion Engineer', 'Space Research Scientist (ISRO/DRDO)', 'Quality Assurance Engineer', 'Flight Test Engineer', 'UAV/Drone Technology Specialist'],
        industryExposure: ['HAL industrial visits', 'ISRO center tours and workshops', 'Aircraft maintenance facility training', 'Aerospace company internships', 'National aerospace conference participation'],
        highlights: ['State-of-the-Art Aerospace Labs', 'Industry Partnerships with Defense & Aviation', 'Research Opportunities with DRDO/ISRO', 'Advanced CAD/CAM/CFD Training', 'International Collaboration Programs'],
        order: 2
      },
      {
        title: 'B.Sc Aeronautical Science',
        slug: 'bsc-aeronautical-science',
        shortDescription: 'Dive deep into the science of flight and aeronautical systems with this specialized program at IIMT University.',
        overview: 'The B.Sc in Aeronautical Science is a 3-year program focused on the scientific principles behind flight, aircraft systems, meteorology, navigation, and air traffic management. This program bridges theoretical science with practical aviation applications.',
        eligibility: '10+2 with Physics, Chemistry, and Mathematics with minimum 55% aggregate marks',
        duration: '3 Years (6 Semesters)',
        category: ['science'],
        universities: [
          { name: 'IIMT University', slug: 'iimt' }
        ],
        careerOpportunities: ['Aeronautical Scientist', 'Air Traffic Controller', 'Aircraft Systems Analyst', 'Aviation Safety Officer', 'Meteorological Officer', 'Navigation Systems Specialist', 'Flight Operations Analyst', 'Aeronautical Research Associate'],
        industryExposure: ['Airport ATC tower visits', 'Weather station and meteorological center tours', 'Navigation systems practical training', 'Aircraft component analysis labs', 'Aviation regulatory body interactions (DGCA)'],
        highlights: ['Focus on Aviation Science & Technology', 'DGCA Aligned Curriculum', 'Hands-on Flight Simulation Training', 'Meteorology & Navigation Labs', 'Pathway to Aviation Career'],
        order: 3
      },
      {
        title: 'MBA Aviation Management',
        slug: 'mba-aviation-management',
        shortDescription: 'Master the business of aviation with our specialized MBA program for future aviation leaders.',
        overview: 'The MBA in Aviation Management is a 2-year postgraduate program designed for professionals and graduates who want to lead in the aviation business sector. The program covers airline business strategy, airport economics, aviation finance, regulatory frameworks, and global aviation trends.',
        eligibility: 'Graduation in any discipline with minimum 50% aggregate. Valid CAT/MAT/XAT score preferred.',
        duration: '2 Years (4 Semesters)',
        category: ['management'],
        universities: [
          { name: 'IIMT University', slug: 'iimt' }
        ],
        careerOpportunities: ['Aviation Business Consultant', 'Airport Operations Director', 'Airline Strategy Manager', 'Aviation Finance Manager', 'Air Cargo Business Head', 'MRO Business Manager', 'Aviation Policy Analyst', 'Airport Commercial Manager'],
        industryExposure: ['C-suite mentorship from airline executives', 'International airport management case studies', 'Aviation business plan competitions', 'Global aviation industry conference participation', 'Strategic consulting projects with airlines'],
        highlights: ['Executive Mentorship Program', 'Global Aviation Case Studies', 'Airport & Airline Business Projects', 'Aviation Leadership Development', 'International Study Tour Options'],
        order: 4
      },
      {
        title: 'BBA Entrepreneurship & Innovation',
        slug: 'bba-entrepreneurship-innovation',
        shortDescription: 'Build your entrepreneurial journey with innovation-driven education and startup ecosystem exposure.',
        overview: 'The BBA in Entrepreneurship & Innovation is a 3-year program designed for aspiring entrepreneurs and innovators. Students learn startup development, business model design, venture financing, digital marketing, and innovation management.',
        eligibility: '10+2 from any recognized board with minimum 50% aggregate marks',
        duration: '3 Years (6 Semesters)',
        category: ['entrepreneurship'],
        universities: [
          { name: 'IIMT University', slug: 'iimt' }
        ],
        careerOpportunities: ['Startup Founder / Co-Founder', 'Business Development Manager', 'Innovation Consultant', 'Product Manager', 'Venture Capital Analyst', 'Digital Marketing Strategist', 'Social Entrepreneur', 'Business Operations Manager'],
        industryExposure: ['Startup incubator and accelerator visits', 'Pitch days with angel investors and VCs', 'Entrepreneur mentorship sessions', 'Innovation hackathons and ideathons', 'Industry immersion at tech startups'],
        highlights: ['In-house Startup Incubation Center', 'Investor Connect Program', 'Mentorship from Industry Leaders', 'Innovation & Design Thinking Labs', 'Real-World Business Projects'],
        order: 5
      },
      {
        title: 'BBA Data Analytics & Artificial Intelligence',
        slug: 'bba-data-analytics-ai',
        shortDescription: 'Future-proof your career with data-driven decision making and AI technologies in this cutting-edge BBA program.',
        overview: 'The BBA in Data Analytics & Artificial Intelligence is a 3-year program that combines business administration fundamentals with advanced data analytics, machine learning, and AI applications. Students learn to leverage data for strategic business decisions across industries.',
        eligibility: '10+2 from any recognized board with minimum 50% aggregate marks. Basic mathematics aptitude required.',
        duration: '3 Years (6 Semesters)',
        category: ['technology'],
        universities: [
          { name: 'IIMT University', slug: 'iimt' }
        ],
        careerOpportunities: ['Data Analyst', 'Business Intelligence Specialist', 'AI Solutions Consultant', 'Machine Learning Engineer', 'Data Science Manager', 'Analytics Consultant', 'Product Analyst', 'Digital Transformation Lead'],
        industryExposure: ['Tech company internships', 'AI/ML workshop series', 'Data hackathons and competitions', 'Industry expert masterclasses', 'Live project collaborations with tech firms'],
        highlights: ['Industry-Ready AI/ML Curriculum', 'Hands-on Data Lab Experience', 'Python & R Programming', 'Cloud Computing Training', 'Real-World Case Studies'],
        order: 6
      },
      {
        title: 'Bachelor in Fashion Design',
        slug: 'bachelor-fashion-design',
        shortDescription: 'Unleash your creative vision and master the art and business of fashion design at IIMT University.',
        overview: 'The Bachelor in Fashion Design is a 4-year program that covers fashion illustration, textile science, garment construction, fashion merchandising, and brand development. Students create portfolio-ready collections and gain industry exposure through fashion shows and internships.',
        eligibility: '10+2 from any recognized board with minimum 50% aggregate marks',
        duration: '4 Years (8 Semesters)',
        category: ['arts'],
        universities: [
          { name: 'IIMT University', slug: 'iimt' }
        ],
        careerOpportunities: ['Fashion Designer', 'Textile Designer', 'Fashion Merchandiser', 'Fashion Stylist', 'Brand Manager', 'Fashion Illustrator', 'Costume Designer', 'Fashion Entrepreneur'],
        industryExposure: ['Fashion week participation', 'Industry internships with leading brands', 'Textile mill visits', 'Fashion show organization', 'Designer mentorship programs'],
        highlights: ['Design Studio Access', 'Portfolio Development', 'Fashion Show Experience', 'Industry Mentorship', 'Brand Building Projects'],
        order: 7
      },
      {
        title: 'Bachelor in Fine Arts',
        slug: 'bachelor-fine-arts',
        shortDescription: 'Cultivate your artistic talents and explore diverse art forms in this comprehensive Fine Arts program.',
        overview: 'The Bachelor in Fine Arts is a 4-year program covering painting, sculpture, printmaking, digital art, and art history. Students develop their artistic voice through intensive studio practice, critiques, and exhibitions at IIMT University.',
        eligibility: '10+2 from any recognized board with minimum 45% aggregate marks. Portfolio review may be required.',
        duration: '4 Years (8 Semesters)',
        category: ['arts'],
        universities: [
          { name: 'IIMT University', slug: 'iimt' }
        ],
        careerOpportunities: ['Professional Artist', 'Art Director', 'Gallery Curator', 'Art Teacher', 'Illustrator', 'Graphic Designer', 'Animation Artist', 'Art Therapist'],
        industryExposure: ['Art gallery exhibitions', 'Artist residency programs', 'Museum visits and workshops', 'National art competition participation', 'Collaborative art projects'],
        highlights: ['Dedicated Art Studios', 'Exhibition Opportunities', 'Artist-in-Residence Program', 'Digital Art Training', 'Art History & Theory'],
        order: 8
      }
    ];
      await Program.bulkCreate(programs);
      console.log('   ✅ Seeded sample programs.');
    }

    // Faculty
    const facultyCount = await Faculty.count();
    if (facultyCount === 0) {
      console.log('🌱 Seeding sample faculty...');
      const faculty = [
      {
        name: 'Prof. (Dr.) Amitabh Sen',
        designation: 'Head of Department (HOD) - Aeronautical & Aerospace Engineering',
        qualification: 'Ph.D. in Aeronautical Engineering (IIT Bombay), M.Tech (Aerospace), DGCA Certified',
        experience: '22 years in Aerospace Engineering & Academic Administration',
        specialization: 'Hypersonic Aerodynamics, Aircraft Structural Dynamics & Space Propulsion',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
        bio: 'Leading the Aerospace & Aeronautical Engineering Department at Aharada Education. Former senior scientist at DRDO and advisor for commercial aerospace research initiatives.',
        rolesAndResponsibilities: `• Academic & Strategic Leadership of the Department of Aerospace Engineering
• Oversight of DGCA & AICTE compliant aeronautical curriculum development and laboratory upgrades
• Direct supervision of Flight Simulator & Wind Tunnel research facilities
• Industry collaboration with DRDO, HAL, ISRO, and global aerospace defense cells
• Guiding M.Tech & Ph.D. research scholars in hypersonic flows, CFD modeling, and space systems
• Steering faculty development programs, academic audits, and institutional accreditation`,
        order: 1
      },
      {
        name: 'Dr. Rajesh Kumar Singh',
        designation: 'Professor & Head - Aviation Studies',
        qualification: 'Ph.D. in Aviation Management, MBA',
        experience: '18 years in Aviation Industry & Academia',
        specialization: 'Airline Operations & Airport Management',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80',
        bio: 'Former operations manager at a major Indian airline with extensive experience in airport ground operations and airline strategy.',
        rolesAndResponsibilities: `• Department Head for Aviation Management, Airport Economics, and Air Cargo Studies
• Academic coordination of undergraduate and postgraduate aviation management programs
• Chair of Student Academic Grievance, Ethics & Mentorship Committee
• Industry immersion liaison with commercial airlines, GMR, and Adani Airport operators
• Executive workshops on air freight logistics, airline revenue management, and fleet scheduling`,
        order: 2
      },
      {
        name: 'Dr. Priya Sharma',
        designation: 'Associate Professor - Aerospace Engineering',
        qualification: 'Ph.D. in Aerospace Engineering, M.Tech',
        experience: '15 years in Aerospace R&D & Teaching',
        specialization: 'Aerodynamics & Propulsion Systems',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        bio: 'Research scientist with publications in leading aerospace journals and experience at DRDO and NAL.',
        rolesAndResponsibilities: `• Course coordinator for Aerodynamics, Flight Dynamics, and Gas Turbine Propulsion
• Laboratory In-Charge for Subsonic Wind Tunnel and Flow Visualization facilities
• Research supervisor for student aerodynamic modeling and UAV drag reduction projects
• Academic audit, mid-term evaluations, and continuous internal assessment management`,
        order: 3
      },
      {
        name: 'Prof. Amit Verma',
        designation: 'Professor - Entrepreneurship',
        qualification: 'MBA, Certified Business Coach',
        experience: '12 years in Startups & Business Mentoring',
        specialization: 'Startup Strategy & Venture Capital',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
        bio: 'Founded two successful startups and mentored over 50 student ventures. Angel investor and TEDx speaker.',
        rolesAndResponsibilities: `• Director of the Aharada Aviation & Aerospace Incubation Hub
• Mentoring student startups in drone delivery, aviation tech, and charter services
• Organizing Annual Angel Investor Pitch Sessions and Venture Capital networking
• Business plan development, intellectual property advisory, and seed grant management`,
        order: 4
      },
      {
        name: 'Capt. Vikram Malhotra (Retd.)',
        designation: 'Senior Instructor - Aviation Science',
        qualification: 'ATPL, B.Sc Aviation, DGCA Certified',
        experience: '22 years as Commercial Airline Pilot',
        specialization: 'Flight Operations & Aviation Safety',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80',
        bio: 'Retired captain with 15,000+ flying hours. Specialist in flight safety, CRM, and aviation regulations.',
        rolesAndResponsibilities: `• Lead Ground Instructor for Commercial Pilot License (CPL) and Instrument Rating (IR)
• Instruction in DGCA Air Regulations, Aviation Meteorology, and Radio Telephony
• Cockpit Resource Management (CRM) and Line-Oriented Flight Training (LOFT) workshops
• Pilot career counseling and interview preparation for major international carriers`,
        order: 5
      },
      {
        name: 'Capt. Meenakshi Sundaram',
        designation: 'Chief Flight Instructor & Head - Pilot Ground Training',
        qualification: 'ATPL (Airline Transport Pilot License), B.Sc Aviation Science, DGCA Ground Instructor',
        experience: '16 years in Commercial Aviation (Ex-Air India Commander, 12,000+ flight hours)',
        specialization: 'Multi-Crew Cooperation (MCC), Cockpit Resource Management (CRM) & Flight Navigation',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
        bio: 'Senior airline commander and certified DGCA ground instructor guiding aspiring aviators through instrument rating, navigation, and commercial pilot licensure.',
        rolesAndResponsibilities: `• Department Leadership for Pilot Ground School and Aviation Flight Sciences
• In-charge of Multi-Engine & Instrument Rating syllabus alignment with DGCA standards
• Conducting advanced flight simulator debriefings and emergency procedure drills
• Coordination with domestic flying clubs and flying training organizations (FTOs)`,
        order: 6
      },
      {
        name: 'Dr. Sneha Patel',
        designation: 'Assistant Professor - Management Studies',
        qualification: 'Ph.D. in Business Administration, NET Qualified',
        experience: '10 years in Academia & Corporate Training',
        specialization: 'Aviation Finance & Marketing',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
        bio: 'Corporate trainer turned academician with expertise in aviation marketing strategies and airline economics.',
        rolesAndResponsibilities: `• Teaching Airline Marketing, Aviation Finance, and Consumer Behavior in Travel
• Coordinator for Student Industry Internships and Live Corporate Projects
• Class mentor for BBA & MBA Aviation batches
• Managing guest lecture series with senior aviation executives`,
        order: 7
      },
      {
        name: 'Dr. Arvind Swaminathan',
        designation: 'Associate Professor - Avionics & Satellite Navigation',
        qualification: 'Ph.D. in Avionics & Telecommunications, M.Tech (Satellite Communications)',
        experience: '14 years in Radar Telemetry & NextGen Avionics',
        specialization: 'Fly-By-Wire Flight Controls, ADS-B Systems, Radar & Satellite Navigation',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
        bio: 'Former satellite telemetry specialist with ISRO payload teams. Conducts research and practical training on modern CNS/ATM systems and glass cockpit avionics.',
        rolesAndResponsibilities: `• Academic coordinator for Aircraft Avionics, Fly-By-Wire systems, and Radar Telemetry
• Managing NextGen CNS/ATM (Communication, Navigation, Surveillance / Air Traffic Management) lab
• Guiding student projects in ADS-B tracking and satellite communications
• In-charge of Departmental Technical Symposiums and IEEE Aerospace student chapter`,
        order: 8
      },
      {
        name: 'Prof. Mohammed Irfan',
        designation: 'Associate Professor - Technology',
        qualification: 'M.Tech in Avionics, B.E. Electronics',
        experience: '14 years in Avionics Systems',
        specialization: 'Avionics & Navigation Systems',
        image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&auto=format&fit=crop&q=80',
        bio: 'Former avionics engineer at HAL with expertise in aircraft electronics, radar systems, and modern CNS/ATM.',
        rolesAndResponsibilities: `• In-charge of Avionics Hardware Laboratories, Digital Circuits, and Microcontroller Systems
• Practical training on aircraft wiring standards, radio altimeters, and glass cockpit displays
• Supervision of laboratory safety protocols and electronic test bench calibration
• Student mentoring for national hackathons and robotics competitions`,
        order: 9
      },
      {
        name: 'Prof. Sunita Deshmukh',
        designation: 'Assistant Professor - Airport Operations & Airline Ground Services',
        qualification: 'MBA in Aviation Management, IATA Certified Ground Handling & Ramp Safety',
        experience: '11 years in Airport Ramp Operations & Passenger Logistics',
        specialization: 'Airport Terminal Operations, Air Cargo Handling & Passenger Services',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80',
        bio: 'Over a decade of direct airline operations experience with Singapore Airlines and DIAL. Mentors students in airline customer experience and ramp safety standards.',
        rolesAndResponsibilities: `• Course lead for Airport Terminal Operations, Ramp Safety Management, and Air Cargo Handling
• IATA certification preparation modules and Dangerous Goods Regulations (DGR) instruction
• Organizing on-site study visits to Indira Gandhi International Airport (IGI)
• Coordinator for campus recruitment drives with airline ground handling agencies`,
        order: 10
      },
      {
        name: 'Er. Devendra Pratap Verma',
        designation: 'Senior Technical Officer & Flight Simulator Instructor',
        qualification: 'B.Tech Aerospace, EASA & DGCA Approved Simulator Systems Specialist',
        experience: '9 years in Flight Simulator Maintenance & Flight Dynamics Prototyping',
        specialization: 'Full Flight Simulators (FFS), Drone Telemetry & Wind Tunnel Diagnostics',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
        bio: 'Oversees Aharada\'s high-fidelity flight simulation laboratory and drone prototyping facility. Coordinates live wind-tunnel data acquisition practicals.',
        rolesAndResponsibilities: `• Technical management and maintenance of Level-D Full Flight Simulators (FFS)
• Practical flight dynamics simulation exercises and flight envelope expansion labs
• In-charge of the Drone Testing and Rapid Prototyping Workshop
• Equipment maintenance, safety audits, and simulator software updates`,
        order: 11
      }
    ];
      await Faculty.bulkCreate(faculty);
      console.log('   ✅ Seeded sample faculty.');
    }

    // Events
    const eventCount = await Event.count();
    if (eventCount === 0) {
      console.log('🌱 Seeding sample events...');
      const events = [
        { title: 'National Aviation Summit 2026', description: 'Annual National Aviation Summit featuring keynote speeches from airline CEOs, panel discussions on the future of Indian aviation, and networking opportunities with industry leaders.', date: new Date('2026-05-15'), location: 'IIMT University Campus', category: 'conference', isUpcoming: true },
        { title: 'Aerospace Innovation Hackathon', description: 'A 48-hour hackathon challenging students to develop innovative solutions for real-world aerospace problems including drone technology and sustainable aviation fuels.', date: new Date('2026-04-20'), location: 'Innovation Lab, IIMT University', category: 'workshop', isUpcoming: true },
        { title: 'Career Fair - Aviation & Aerospace', description: 'Annual placement drive featuring over 30 aviation and aerospace companies including major airlines, airport operators, MRO companies, and aerospace defense firms.', date: new Date('2026-06-10'), location: 'Placement Cell, Main Campus', category: 'placement', isUpcoming: true },
        { title: 'Startup Pitch Day 2026', description: 'Entrepreneurship students present their startup ideas to angel investors and venture capitalists. Top pitches receive seed funding and incubation support.', date: new Date('2026-03-25'), location: 'Entrepreneurship Hub', category: 'seminar', isUpcoming: false },
        { title: 'Airport Operations Workshop', description: 'Hands-on workshop conducted in collaboration with Delhi International Airport. Students experience real-time airport ground operations and passenger management.', date: new Date('2026-07-05'), location: 'IGI Airport, New Delhi', category: 'workshop', isUpcoming: true },
      ];
      await Event.bulkCreate(events);
      console.log('   ✅ Seeded sample events.');
    }

    // Placements
    const placementCount = await Placement.count();
    if (placementCount === 0) {
      console.log('🌱 Seeding sample placements...');
      const placements = [
        { companyName: 'IndiGo Airlines', studentName: 'Rahul Verma', program: 'BBA Aviation & Travel Management', package: '6.5 LPA', year: 2026, role: 'Airport Operations Manager', order: 1 },
        { companyName: 'Air India', studentName: 'Priya Sharma', program: 'BBA Aviation & Travel Management', package: '7.2 LPA', year: 2026, role: 'Customer Service Executive', order: 2 },
        { companyName: 'Boeing India', studentName: 'Amit Kumar', program: 'B.Tech Aerospace Engineering', package: '12.5 LPA', year: 2026, role: 'Aerospace Design Engineer', order: 3 },
        { companyName: 'Airbus', studentName: 'Sneha Gupta', program: 'B.Tech Aerospace Engineering', package: '14.0 LPA', year: 2026, role: 'Systems Engineer', order: 4 },
        { companyName: 'GMR Group', studentName: 'Vikram Singh', program: 'MBA Aviation Management', package: '10.5 LPA', year: 2026, role: 'Airport Manager', order: 5 }
      ];
      await Placement.bulkCreate(placements);
      console.log('   ✅ Seeded sample placements.');
    }

    // Seed sample books if empty
    const bookCount = await Book.count();
    if (bookCount === 0) {
      const sampleBooks = [
        {
          title: 'Introduction to Aviation Management & Airline Business',
          academicYear: '2025-2026',
          courseName: 'BBA Aviation & Travel',
          subjectCode: 'AV-101',
          subjectName: 'Introduction to Aviation Management',
          author: 'Prof. Rajesh Kumar Singh',
          description: 'Core foundational textbook covering civil aviation structure, ICAO & DGCA regulations, passenger journey flows, and airport systems.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AV101_Aviation_Management.pdf',
          fileSize: '4.2 MB',
          downloadCount: 142,
          order: 1,
        },
        {
          title: 'Aviation Meteorology & Air Navigation Handbook',
          academicYear: '2025-2026',
          courseName: 'BBA Aviation & Travel',
          subjectCode: 'AV-102',
          subjectName: 'Aviation Meteorology & Navigation',
          author: 'Capt. Vikram Malhotra',
          description: 'Standard handbook covering atmosphere dynamics, jet streams, METAR/TAF weather briefings, and dead-reckoning navigation basics.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AV102_Meteorology_Navigation.pdf',
          fileSize: '6.8 MB',
          downloadCount: 98,
          order: 2,
        },
        {
          title: 'Airport Ground Handling & Cargo Logistics Guide',
          academicYear: '2026-2027',
          courseName: 'BBA Aviation & Travel',
          subjectCode: 'AV-201',
          subjectName: 'Airport Ground Handling & Cargo Operations',
          author: 'Dr. Sneha Patel',
          description: 'Operational guidelines for ramp safety, baggage management systems, air waybill procedures, and dangerous goods regulations.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AV201_Ground_Handling_Cargo.pdf',
          fileSize: '5.1 MB',
          downloadCount: 76,
          order: 3,
        },
        {
          title: 'Fluid Mechanics & Aerospace Thermodynamics',
          academicYear: '2025-2026',
          courseName: 'B.Tech Aerospace Engineering',
          subjectCode: 'AERO-101',
          subjectName: 'Fluid Mechanics & Thermodynamics',
          author: 'Dr. Priya Sharma',
          description: 'Comprehensive manual covering continuity, Navier-Stokes fundamentals, boundary layers, and thermodynamic cycles for aerospace craft.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AERO101_Fluid_Mechanics.pdf',
          fileSize: '8.4 MB',
          downloadCount: 215,
          order: 4,
        },
        {
          title: 'Aerodynamics I: Subsonic Flow & Airfoil Theory',
          academicYear: '2026-2027',
          courseName: 'B.Tech Aerospace Engineering',
          subjectCode: 'AERO-201',
          subjectName: 'Aerodynamics I',
          author: 'Dr. Priya Sharma',
          description: 'Detailed analysis of lift generation, NACA cambered profiles, induced drag, and finite wing vortex distribution.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AERO201_Aerodynamics_I.pdf',
          fileSize: '7.9 MB',
          downloadCount: 184,
          order: 5,
        },
        {
          title: 'Aircraft Propulsion & Gas Turbine Engineering',
          academicYear: '2025-2026',
          courseName: 'B.Tech Aerospace Engineering',
          subjectCode: 'AERO-301',
          subjectName: 'Aircraft Propulsion',
          author: 'Prof. Mohammed Irfan',
          description: 'Principles of turbojet, turbofan, ramjet cycles, afterburners, compressor aerodynamics, and rocket propulsion mechanics.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AERO301_Propulsion_Systems.pdf',
          fileSize: '9.2 MB',
          downloadCount: 160,
          order: 6,
        },
        {
          title: 'Principles of Aeronautical Science & DGCA Protocols',
          academicYear: '2025-2026',
          courseName: 'B.Sc Aeronautical Science',
          subjectCode: 'AS-101',
          subjectName: 'Aeronautical Science Fundamentals',
          author: 'Capt. Vikram Malhotra',
          description: 'Standard syllabus book covering aircraft stability, weight & balance, pitot-static instrumentation, and DGCA regulations.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AS101_Aeronautical_Fundamentals.pdf',
          fileSize: '4.8 MB',
          downloadCount: 88,
          order: 7,
        },
        {
          title: 'Strategic Airline Economics & Yield Management',
          academicYear: '2025-2026',
          courseName: 'MBA Aviation Management',
          subjectCode: 'MBA-AV-101',
          subjectName: 'Aviation Economics & Revenue Management',
          author: 'Dr. Rajesh Kumar Singh',
          description: 'Postgraduate textbook addressing dynamic airline pricing algorithms, slot allocation economics, and global fleet financing.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'MBA101_Airline_Economics.pdf',
          fileSize: '5.6 MB',
          downloadCount: 110,
          order: 8,
        }
      ];
      await Book.bulkCreate(sampleBooks);
      console.log('   ✅ Seeded sample library books.');
    }

    // Seed sample unit-wise notes if none exist
    const notesCount = await Book.count({ where: { materialType: 'notes' } });
    if (notesCount === 0) {
      const sampleNotes = [
        {
          title: 'Unit 1: Introduction to Civil Aviation & Global Regulatory Bodies',
          academicYear: '2025-2026',
          courseName: 'BBA Aviation & Travel',
          subjectCode: 'AV-101',
          subjectName: 'Introduction to Aviation Management',
          author: 'Prof. Rajesh Kumar Singh',
          description: 'Comprehensive handwritten & lecture slides covering ICAO annexes, DGCA civil aviation requirements (CARs), and international freedoms of air.',
          materialType: 'notes',
          unit: 'Unit 1',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AV101_Unit1_Civil_Aviation_Intro.pdf',
          fileSize: '2.4 MB',
          downloadCount: 84,
          order: 1,
        },
        {
          title: 'Unit 2: Airport Infrastructure, Airside Operations & Runways',
          academicYear: '2025-2026',
          courseName: 'BBA Aviation & Travel',
          subjectCode: 'AV-101',
          subjectName: 'Introduction to Aviation Management',
          author: 'Prof. Rajesh Kumar Singh',
          description: 'Lecture notes covering airport terminal design, runway pavement classifications (PCN/ACN), taxiway lighting, and apron operations.',
          materialType: 'notes',
          unit: 'Unit 2',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AV101_Unit2_Airside_Operations.pdf',
          fileSize: '3.1 MB',
          downloadCount: 65,
          order: 2,
        },
        {
          title: 'Unit 3: Airline Business Models (LCC vs FSC) & Revenue Streams',
          academicYear: '2025-2026',
          courseName: 'BBA Aviation & Travel',
          subjectCode: 'AV-101',
          subjectName: 'Introduction to Aviation Management',
          author: 'Prof. Rajesh Kumar Singh',
          description: 'Detailed unit study notes analyzing Low-Cost Carrier (LCC) economics, Full Service Carrier networks, code-share alliances, and ancillary revenues.',
          materialType: 'notes',
          unit: 'Unit 3',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AV101_Unit3_Airline_Business_Models.pdf',
          fileSize: '1.9 MB',
          downloadCount: 52,
          order: 3,
        },
        {
          title: 'Unit 1: Aerodynamic Forces, Boundary Layers & Incompressible Flow',
          academicYear: '2025-2026',
          courseName: 'B.Tech Aerospace Engineering',
          subjectCode: 'AERO-101',
          subjectName: 'Aerodynamics & Fluid Mechanics',
          author: 'Prof. (Dr.) Amitabh Sen',
          description: 'Mathematical derivation of Navier-Stokes equations, laminar to turbulent transition, and airfoil pressure distribution diagrams.',
          materialType: 'notes',
          unit: 'Unit 1',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AERO101_Unit1_Aerodynamics.pdf',
          fileSize: '4.5 MB',
          downloadCount: 112,
          order: 1,
        },
        {
          title: 'Unit 2: Airfoil Geometry, NACA Nomenclature & Lift-Drag Polars',
          academicYear: '2025-2026',
          courseName: 'B.Tech Aerospace Engineering',
          subjectCode: 'AERO-101',
          subjectName: 'Aerodynamics & Fluid Mechanics',
          author: 'Prof. (Dr.) Amitabh Sen',
          description: 'Detailed unit notes on 4-digit, 5-digit NACA profiles, supercritical airfoils, vortex drag generation, and wing tip stall mitigation.',
          materialType: 'notes',
          unit: 'Unit 2',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'AERO101_Unit2_Airfoil_Geometry.pdf',
          fileSize: '3.8 MB',
          downloadCount: 95,
          order: 2,
        },
      ];
      await Book.bulkCreate(sampleNotes);
      console.log('   ✅ Seeded sample unit-wise notes.');
    }

    // Seed sample faculty roles and responsibilities if empty
    const roleCount = await FacultyRole.count();
    if (roleCount === 0) {
      const sampleRoles = [
        {
          title: 'Teaching Excellence & Curriculum Delivery',
          designationLevel: 'All Faculty Members',
          category: 'Teaching & Curriculum',
          icon: 'FiBookOpen',
          summary: 'Design, plan, and deliver industry-aligned academic sessions in aviation, aerospace engineering, technology, management, and creative arts with measurable learning outcomes.',
          responsibilities: [
            'Prepare comprehensive course lesson plans, syllabi trackers, and learning resources prior to semester commencement.',
            'Deliver interactive classroom lectures utilizing modern pedagogic tools, aviation case studies, and digital simulations.',
            'Align academic course modules with UGC, DGCA, and partnering university curriculum standards.',
            'Maintain structured records of student attendance, continuous internal evaluations (CIE), and term progress.',
            'Conduct regular remedial sessions and academic clinic hours for students needing additional conceptual clarity.'
          ],
          expectations: [
            '100% on-time syllabus completion with verifiable course completion logs',
            'Maintenance of updated course files, lecture notes, and digital study materials',
            'Minimum 85% average student satisfaction feedback across all assigned courses'
          ],
          order: 1,
          isActive: true,
        },
        {
          title: 'Aviation, Simulator & Laboratory Practical Training',
          designationLevel: 'Technical Instructors & Lab Faculty',
          category: 'Practical & Lab Training',
          icon: 'FiCpu',
          summary: 'Supervise and lead hands-on laboratory sessions, wind tunnel testing, drone prototyping, flight simulator modules, and technical workshops.',
          responsibilities: [
            'Ensure 100% adherence to lab safety protocols, equipment calibration, and standard operating procedures (SOPs).',
            'Demonstrate live equipment operations, avionics telemetry systems, and computer-aided design (CAD/CFD) simulations.',
            'Guide undergraduate and postgraduate students through capstone engineering projects and experimental thesis work.',
            'Maintain logbooks, consumable inventory, safety equipment, and flight simulator run-time records.',
            'Coordinate with airport hangars and DGCA-approved maintenance organizations (MROs) for live component exposure.'
          ],
          expectations: [
            'Zero safety incidents across all engineering and avionics practical sessions',
            'Regular preventative maintenance and calibration logs for all simulator systems',
            'High-quality project prototypes suitable for national design competitions'
          ],
          order: 2,
          isActive: true,
        },
        {
          title: 'Student Mentorship, Welfare & Career Guidance',
          designationLevel: 'Class Coordinators & Faculty Mentors',
          category: 'Student Mentorship',
          icon: 'FiUsers',
          summary: 'Act as personal mentors and academic guides to empower students, monitor academic progression, resolve grievances, and foster career clarity.',
          responsibilities: [
            'Conduct bi-weekly proctoring and 1-on-1 mentorship meetings with assigned student batches.',
            'Monitor individual student attendance, identify early academic warning signs, and communicate with guardians proactively.',
            'Provide specialized counseling for competitive exams, aviation licenses, higher studies, and corporate recruitment.',
            'Address student academic grievances promptly and liaise with the Student Grievance & Academic Feedback Desk.',
            'Foster an inclusive, supportive, and psychologically safe learning environment on campus.'
          ],
          expectations: [
            'Documented mentorship interaction logs for all assigned mentees each semester',
            'Timely intervention for students falling below 75% attendance thresholds',
            'Cohesive liaison between parents, academic chairs, and student welfare bodies'
          ],
          order: 3,
          isActive: true,
        },
        {
          title: 'Industry Immersion, Internships & Corporate Liaison',
          designationLevel: 'Industry Liaison Faculty & Professors',
          category: 'Industry Collaboration',
          icon: 'FiBriefcase',
          summary: 'Bridge academia and the aviation industry by coordinating live airline visits, guest masterclasses, student internships, and corporate capstone projects.',
          responsibilities: [
            'Facilitate industry study tours to international airports (IGI Delhi, Jewar), airline maintenance bases, and cargo terminals.',
            'Invite C-suite aviation executives, airline captains, and defense scientists for guest lectures and leadership summits.',
            'Liaise with airline and corporate recruitment partners (IndiGo, Air India, Boeing, Airbus) for internship placements.',
            'Supervise student summer internships, ensure corporate mentor evaluation sheets, and review final internship reports.',
            'Track emerging aerospace trends (eVTOL, sustainable aviation fuels, AI in ATC) and infuse insights into classroom discussions.'
          ],
          expectations: [
            'Minimum 2 industry expert masterclasses organized per academic semester',
            '100% internship placement coordination for eligible students in assigned programs',
            'Active MoU collaborations and joint technical training workshops with corporate partners'
          ],
          order: 4,
          isActive: true,
        },
        {
          title: 'Examination, Assessment & Academic Integrity',
          designationLevel: 'Course Instructors & Exam Committee',
          category: 'Governance & Exams',
          icon: 'FiCheckCircle',
          summary: 'Uphold the highest standards of academic integrity through transparent evaluation, robust paper setting, invigilation, and timely assessment.',
          responsibilities: [
            'Formulate balanced, objective examination question papers aligned with Bloom\'s Taxonomy and course outcomes.',
            'Conduct diligent examination invigilation, upholding zero-tolerance policies toward unfair means and malpractice.',
            'Evaluate answer scripts, assignments, and capstone presentations fairly and transparently within institutional deadlines.',
            'Publish continuous evaluation marks and provide constructive feedback to students to guide performance improvement.',
            'Coordinate with university examination branches (IIMT, Subharti) for end-term score tabulation and grade moderation.'
          ],
          expectations: [
            'Submission of all internal assessment grades within 7 days of examination completion',
            'Zero compliance discrepancies in university grade moderation audits',
            'Strict adherence to standardized marking rubrics and transparent scoring keys'
          ],
          order: 5,
          isActive: true,
        },
        {
          title: 'Institutional Leadership, Accreditation & Research',
          designationLevel: 'Professors & Academic Committee Chairs',
          category: 'Leadership & Governance',
          icon: 'FiAward',
          summary: 'Drive institutional advancement through peer-reviewed research publications, committee leadership, university accreditation processes, and faculty development.',
          responsibilities: [
            'Publish research articles in Scopus / Web of Science / UGC-CARE indexed aerospace and management journals.',
            'Contribute to university accreditation preparations, academic audits, and statutory regulatory filings.',
            'Participate in Board of Studies (BOS) meetings, curriculum restructuring committees, and academic council discussions.',
            'Mentor junior faculty members in research methodology, classroom management, and innovative instructional tech.',
            'Organize national and international academic conferences, aerospace hackathons, and industry symposiums.'
          ],
          expectations: [
            'Publication of at least 1 quality research paper or case study per academic year',
            'Active membership in at least 2 institutional administrative or academic committees',
            'Participation in Faculty Development Programs (FDPs) and continuous pedagogy workshops'
          ],
          order: 6,
          isActive: true,
        }
      ];
      await FacultyRole.bulkCreate(sampleRoles);
      console.log('   ✅ Seeded sample faculty roles & responsibilities.');
    }

    console.log('✅ Initial database check & seed completed successfully!');
  } catch (error) {
    console.error('Initial database seed error:', error);
  }
}

module.exports = {
  User,
  Program,
  Faculty,
  Event,
  Placement,
  Enquiry,
  Brochure,
  OTP,
  Book,
  Feedback,
  FacultyRole,
  CampusPhoto,
  CompanyPartner,
  syncModels,
  seedInitialData,
};

