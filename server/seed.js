require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Program = require('./models/Program');
const Faculty = require('./models/Faculty');
const Event = require('./models/Event');
const Placement = require('./models/Placement');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Program.deleteMany();
    await Faculty.deleteMany();
    await Event.deleteMany();
    await Placement.deleteMany();

    // Create admin user
    await User.create({
      name: 'Admin',
      email: 'admin@aharada.edu',
      password: 'admin123',
      role: 'superadmin'
    });
    console.log('✅ Admin user created (admin@aharada.edu / admin123)');

    // Seed Programs
    const programs = [
      {
        title: 'BBA Aviation & Airport Management',
        slug: 'bba-aviation-airport-management',
        shortDescription: 'Launch your career in the booming aviation and travel industry with our comprehensive BBA program.',
        overview: 'The BBA in Aviation & Airport Management is a 3-year undergraduate program designed to equip students with comprehensive knowledge of airline operations, airport management, travel and tourism, hospitality services, and aviation business management. Students gain exposure to real-world airline operations, airport systems, and travel industry dynamics through industry visits, internships, and expert-led workshops.',
        eligibility: '10+2 from any recognized board with minimum 50% aggregate marks',
        duration: '3 Years (6 Semesters)',
        careerOpportunities: [
          'Airline Operations Manager',
          'Airport Ground Staff Manager',
          'Travel Agency Manager',
          'Cargo Operations Executive',
          'Flight Operations Coordinator',
          'Aviation Sales & Marketing Manager',
          'Tourism Officer',
          'Hospitality Manager'
        ],
        industryExposure: [
          'Airport visits and live operations training',
          'Airline management internships',
          'Guest lectures by aviation industry leaders',
          'Travel agency operational projects',
          'International aviation conference participation'
        ],
        highlights: [
          '100% Placement Assistance',
          'Industry-Integrated Curriculum',
          'Airport & Airline Visits',
          'Certified Aviation Training Modules',
          'Expert Faculty from Aviation Industry'
        ],
        universities: [{ name: 'Subharti University' }],
        icon: '✈️',
        order: 1
      },
      {
        title: 'B.Tech Aerospace Engineering',
        slug: 'btech-aerospace-engineering',
        shortDescription: 'Engineer the future of flight with our cutting-edge Aerospace Engineering program.',
        overview: 'The B.Tech in Aerospace Engineering is a 4-year program that covers aerodynamics, propulsion systems, aircraft structures, avionics, and space technology. Students work on real aircraft components, use advanced simulation software, and collaborate with aerospace companies on capstone projects. The program integrates theoretical foundations with hands-on laboratory work to produce industry-ready aerospace engineers.',
        eligibility: '10+2 with Physics, Chemistry, and Mathematics with minimum 60% aggregate marks',
        duration: '4 Years (8 Semesters)',
        careerOpportunities: [
          'Aerospace Design Engineer',
          'Aircraft Maintenance Engineer',
          'Avionics Systems Engineer',
          'Propulsion Engineer',
          'Space Research Scientist (ISRO/DRDO)',
          'Quality Assurance Engineer',
          'Flight Test Engineer',
          'UAV/Drone Technology Specialist'
        ],
        industryExposure: [
          'HAL (Hindustan Aeronautics Limited) industrial visits',
          'ISRO center tours and workshops',
          'Aircraft maintenance facility training',
          'Aerospace company internships',
          'National aerospace conference participation'
        ],
        highlights: [
          'State-of-the-Art Aerospace Labs',
          'Industry Partnerships with Defense & Aviation',
          'Research Opportunities with DRDO/ISRO',
          'Advanced CAD/CAM/CFD Training',
          'International Collaboration Programs'
        ],
        universities: [{ name: 'Subharti University' }, { name: 'Future University' }],
        icon: '🚀',
        order: 2
      },
      {
        title: 'B.Sc Aeronautical Science',
        slug: 'bsc-aeronautical-science',
        shortDescription: 'Dive deep into the science of flight and aeronautical systems with this specialized program.',
        overview: 'The B.Sc in Aeronautical Science is a 3-year program focused on the scientific principles behind flight, aircraft systems, meteorology, navigation, and air traffic management. This program bridges theoretical science with practical aviation applications, preparing graduates for careers in aviation science, flight operations support, and aeronautical research.',
        eligibility: '10+2 with Physics, Chemistry, and Mathematics with minimum 55% aggregate marks',
        duration: '3 Years (6 Semesters)',
        careerOpportunities: [
          'Aeronautical Scientist',
          'Air Traffic Controller',
          'Aircraft Systems Analyst',
          'Aviation Safety Officer',
          'Meteorological Officer',
          'Navigation Systems Specialist',
          'Flight Operations Analyst',
          'Aeronautical Research Associate'
        ],
        industryExposure: [
          'Airport ATC tower visits',
          'Weather station and meteorological center tours',
          'Navigation systems practical training',
          'Aircraft component analysis labs',
          'Aviation regulatory body interactions (DGCA)'
        ],
        highlights: [
          'Focus on Aviation Science & Technology',
          'DGCA Aligned Curriculum',
          'Hands-on Flight Simulation Training',
          'Meteorology & Navigation Labs',
          'Pathway to Aviation Career'
        ],
        icon: '🛫',
        order: 3
      },
      {
        title: 'MBA (HR & Aviation)',
        slug: 'mba-hr-aviation',
        shortDescription: 'Master the business of aviation with our specialized MBA program for future aviation leaders.',
        overview: 'The MBA in HR & Aviation is a 2-year postgraduate program designed for professionals and graduates who want to lead in the aviation business sector. The program covers airline HR strategy, airport economics, aviation finance, regulatory frameworks, and global aviation trends. Students engage with C-suite executives from major airlines and airport operators through masterclasses and mentorship programs.',
        eligibility: 'Graduation in any discipline with minimum 50% aggregate. Valid CAT/MAT/XAT score preferred.',
        duration: '2 Years (4 Semesters)',
        careerOpportunities: [
          'Aviation HR Manager',
          'Airport Operations Director',
          'Airline Strategy Manager',
          'Aviation Finance Manager',
          'Air Cargo Business Head',
          'MRO Business Manager',
          'Aviation Policy Analyst',
          'Airport Commercial Manager'
        ],
        industryExposure: [
          'C-suite mentorship from airline executives',
          'International airport management case studies',
          'Aviation business plan competitions',
          'Global aviation industry conference participation',
          'Strategic HR management projects with airlines'
        ],
        highlights: [
          'Executive Mentorship Program',
          'Global Aviation Case Studies',
          'Airport & Airline Business Projects',
          'Aviation Leadership Development',
          'International Study Tour Options'
        ],
        universities: [{ name: 'Subharti University' }],
        icon: '📊',
        order: 4
      },
      {
        title: 'BBA Entrepreneurship & Innovation',
        slug: 'bba-entrepreneurship-innovation',
        shortDescription: 'Build your entrepreneurial journey with innovation-driven education and startup ecosystem exposure.',
        overview: 'The BBA in Entrepreneurship & Innovation is a 3-year program designed for aspiring entrepreneurs and innovators. Students learn startup development, business model design, venture financing, digital marketing, and innovation management. The program includes incubation support, mentorship from successful entrepreneurs, and opportunities to pitch ideas to real investors.',
        eligibility: '10+2 from any recognized board with minimum 50% aggregate marks',
        duration: '3 Years (6 Semesters)',
        careerOpportunities: [
          'Startup Founder / Co-Founder',
          'Business Development Manager',
          'Innovation Consultant',
          'Product Manager',
          'Venture Capital Analyst',
          'Digital Marketing Strategist',
          'Social Entrepreneur',
          'Business Operations Manager'
        ],
        industryExposure: [
          'Startup incubator and accelerator visits',
          'Pitch days with angel investors and VCs',
          'Entrepreneur mentorship sessions',
          'Innovation hackathons and ideathons',
          'Industry immersion at tech startups'
        ],
        highlights: [
          'In-house Startup Incubation Center',
          'Investor Connect Program',
          'Mentorship from Industry Leaders',
          'Innovation & Design Thinking Labs',
          'Real-World Business Projects'
        ],
        universities: [{ name: 'Sage University' }, { name: 'IIMT University' }],
        icon: '💡',
        order: 5
      },
      {
        title: 'MBA Data Analytics & Artificial Intelligence',
        slug: 'mba-data-analytics-ai',
        shortDescription: 'Lead the data-driven future with highly specialized skills in Business Analytics and AI.',
        overview: 'This comprehensive 2-year MBA program combines core business management principles with advanced Data Analytics and Artificial Intelligence. Students will master machine learning models, big data tools, and strategic data interpretation to make high-level business decisions across global industries.',
        eligibility: 'Graduation in any discipline with minimum 50% aggregate marks',
        duration: '2 Years (4 Semesters)',
        careerOpportunities: [
          'Data Project Manager',
          'Business Intelligence Lead',
          'AI Operations Manager',
          'Consultant - Data Strategy',
          'Analytics Director'
        ],
        industryExposure: [
          'Live Big Data projects',
          'Tech incubation site visits',
          'Mentorship from Data Scientists',
          'AI implementation hackathons'
        ],
        highlights: [
          'Industry Standard Tools (Python, R, Tableau)',
          'AI Strategy Workshops',
          '100% Placement Assistance'
        ],
        universities: [{ name: 'IIMT University' }],
        icon: '💻',
        order: 6
      }
    ];

    await Program.insertMany(programs);
    console.log('✅ Programs seeded');

    // Seed Faculty
    const faculty = [
      {
        name: 'Dr. Rajesh Kumar Singh',
        designation: 'Professor & Head - Aviation Studies',
        qualification: 'Ph.D. in Aviation Management, MBA',
        experience: '18 years in Aviation Industry & Academia',
        specialization: 'Airline Operations & Airport Management',
        bio: 'Former operations manager at a major Indian airline with extensive experience in airport ground operations and airline strategy.',
        order: 1
      },
      {
        name: 'Dr. Priya Sharma',
        designation: 'Associate Professor - Aerospace Engineering',
        qualification: 'Ph.D. in Aerospace Engineering, M.Tech',
        experience: '15 years in Aerospace R&D & Teaching',
        specialization: 'Aerodynamics & Propulsion Systems',
        bio: 'Research scientist with publications in leading aerospace journals and experience at DRDO and NAL.',
        order: 2
      },
      {
        name: 'Prof. Amit Verma',
        designation: 'Professor - Entrepreneurship',
        qualification: 'MBA, Certified Business Coach',
        experience: '12 years in Startups & Business Mentoring',
        specialization: 'Startup Strategy & Venture Capital',
        bio: 'Founded two successful startups and mentored over 50 student ventures. Angel investor and TEDx speaker.',
        order: 3
      },
      {
        name: 'Capt. Vikram Malhotra (Retd.)',
        designation: 'Senior Instructor - Aviation Science',
        qualification: 'ATPL, B.Sc Aviation, DGCA Certified Examiner',
        experience: '22 years as Commercial Airline Pilot',
        specialization: 'Flight Operations & Aviation Safety',
        bio: 'Retired captain with 15,000+ flying hours. Specialist in flight safety, CRM, and aviation regulations.',
        order: 4
      },
      {
        name: 'Dr. Sneha Patel',
        designation: 'Assistant Professor - Management Studies',
        qualification: 'Ph.D. in Business Administration, NET Qualified',
        experience: '10 years in Academia & Corporate Training',
        specialization: 'Aviation Finance & Marketing',
        bio: 'Corporate trainer turned academician with expertise in aviation marketing strategies and airline economics.',
        order: 5
      },
      {
        name: 'Prof. Mohammed Irfan',
        designation: 'Associate Professor - Technology',
        qualification: 'M.Tech in Avionics, B.E. Electronics',
        experience: '14 years in Avionics Systems',
        specialization: 'Avionics & Navigation Systems',
        bio: 'Former avionics engineer at HAL with expertise in aircraft electronics, radar systems, and modern CNS/ATM.',
        order: 6
      }
    ];

    await Faculty.insertMany(faculty);
    console.log('✅ Faculty seeded');

    // Seed Events
    const events = [
      {
        title: 'National Aviation Summit 2026',
        description: 'Join us for the annual National Aviation Summit featuring keynote speeches from airline CEOs, panel discussions on the future of Indian aviation, and networking opportunities with industry leaders. Students will get a chance to interact with hiring managers from top airlines.',
        date: new Date('2026-05-15'),
        location: 'Aharada Education Campus, Main Auditorium',
        category: 'conference',
        isUpcoming: true
      },
      {
        title: 'Aerospace Innovation Hackathon',
        description: 'A 48-hour hackathon challenging students to develop innovative solutions for real-world aerospace problems. Teams will work on challenges provided by partner companies including drone technology, sustainable aviation fuels, and AI in air traffic management.',
        date: new Date('2026-04-20'),
        location: 'Innovation Lab, Block C',
        category: 'workshop',
        isUpcoming: true
      },
      {
        title: 'Career Fair - Aviation & Aerospace',
        description: 'Annual placement drive featuring over 30 aviation and aerospace companies. Participating organizations include major airlines, airport operators, MRO companies, and aerospace defense firms. Open to all final-year students and alumni.',
        date: new Date('2026-06-10'),
        location: 'Placement Cell, Main Campus',
        category: 'placement',
        isUpcoming: true
      },
      {
        title: 'Startup Pitch Day 2026',
        description: 'Our entrepreneurship students present their startup ideas to a panel of angel investors and venture capitalists. The top three pitches receive seed funding and incubation support. Previous editions have launched 5 successful startups.',
        date: new Date('2026-03-25'),
        location: 'Entrepreneurship Hub',
        category: 'seminar',
        isUpcoming: false
      },
      {
        title: 'Airport Operations Workshop',
        description: 'A hands-on workshop conducted in collaboration with Delhi International Airport Limited (DIAL). Students experience real-time airport operations including ground handling, passenger management, and cargo operations.',
        date: new Date('2026-07-05'),
        location: 'IGI Airport, New Delhi',
        category: 'workshop',
        isUpcoming: true
      }
    ];

    await Event.insertMany(events);
    console.log('✅ Events seeded');

    // Seed Placements
    const placements = [
      {
        companyName: 'IndiGo Airlines',
        studentName: 'Rahul Verma',
        program: 'BBA Aviation & Travel Management',
        package: '6.5 LPA',
        year: 2026,
        role: 'Airport Operations Manager',
        order: 1
      },
      {
        companyName: 'Air India',
        studentName: 'Priya Sharma',
        program: 'BBA Aviation & Travel Management',
        package: '7.2 LPA',
        year: 2026,
        role: 'Customer Service Executive',
        order: 2
      },
      {
        companyName: 'Boeing India',
        studentName: 'Amit Kumar',
        program: 'B.Tech Aerospace Engineering',
        package: '12.5 LPA',
        year: 2026,
        role: 'Aerospace Design Engineer',
        order: 3
      },
      {
        companyName: 'Airbus',
        studentName: 'Sneha Gupta',
        program: 'B.Tech Aerospace Engineering',
        package: '14.0 LPA',
        year: 2026,
        role: 'Systems Engineer',
        order: 4
      },
      {
        companyName: 'GMR Group',
        studentName: 'Vikram Singh',
        program: 'MBA Aviation Management',
        package: '10.5 LPA',
        year: 2026,
        role: 'Airport Manager',
        order: 5
      },
      {
        companyName: 'MakeMyTrip',
        studentName: 'Anjali Desai',
        program: 'BBA Aviation & Travel Management',
        package: '8.0 LPA',
        year: 2026,
        role: 'Travel Consultant',
        order: 6
      }
    ];

    await Placement.insertMany(placements);
    console.log('✅ Placements seeded');

    console.log('\n🎉 Database seeded successfully!');
    console.log('Admin Login: admin@aharada.edu / admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
