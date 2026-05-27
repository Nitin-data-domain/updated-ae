const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (localErr) {
      console.log('Local MongoDB not available, starting in-memory MongoDB...');
    }

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB In-Memory Connected: ${conn.connection.host}`);
    await seedInMemory();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedInMemory = async () => {
  const User = require('../models/User');
  const Program = require('../models/Program');
  const Faculty = require('../models/Faculty');
  const Event = require('../models/Event');

  const userCount = await User.countDocuments();
  if (userCount > 0) return;

  console.log('Auto-seeding in-memory database...');

  await User.create({
    name: 'Admin',
    email: 'md@aharadaedu.in',
    password: 'Ahrada@Nitin',
    role: 'superadmin'
  });

  // Programs with University Mappings
  const programs = [
    {
      title: 'BBA Aviation & Travel',
      slug: 'bba-aviation-travel',
      shortDescription: 'Launch your career in the booming aviation and travel industry with our comprehensive BBA program integrated with leading universities.',
      overview: 'The BBA in Aviation & Travel is a 3-year undergraduate program designed to equip students with comprehensive knowledge of airline operations, airport management, travel and tourism, hospitality services, and aviation business management. Students gain exposure to real-world airline operations through industry visits, internships, and expert-led workshops at our partner university campuses.',
      eligibility: '10+2 from any recognized board with minimum 50% aggregate marks',
      duration: '3 Years (6 Semesters)',
      category: 'aviation',
      universities: [
        { name: 'IIMT University', slug: 'iimt' },
        { name: 'Future University', slug: 'future' },
        { name: 'Subharti University', slug: 'subharti' },
        { name: 'Sage University', slug: 'sage' }
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
      category: 'engineering',
      universities: [
        { name: 'IIMT University', slug: 'iimt' },
        { name: 'Future University', slug: 'future' },
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
      category: 'science',
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
      category: 'management',
      universities: [
        { name: 'IIMT University', slug: 'iimt' },
        { name: 'Future University', slug: 'future' }
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
      category: 'entrepreneurship',
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
      category: 'technology',
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
      category: 'arts',
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
      category: 'arts',
      universities: [
        { name: 'IIMT University', slug: 'iimt' }
      ],
      careerOpportunities: ['Professional Artist', 'Art Director', 'Gallery Curator', 'Art Teacher', 'Illustrator', 'Graphic Designer', 'Animation Artist', 'Art Therapist'],
      industryExposure: ['Art gallery exhibitions', 'Artist residency programs', 'Museum visits and workshops', 'National art competition participation', 'Collaborative art projects'],
      highlights: ['Dedicated Art Studios', 'Exhibition Opportunities', 'Artist-in-Residence Program', 'Digital Art Training', 'Art History & Theory'],
      order: 8
    }
  ];
  await Program.insertMany(programs);

  // Faculty
  const faculty = [
    { name: 'Dr. Rajesh Kumar Singh', designation: 'Professor & Head - Aviation Studies', qualification: 'Ph.D. in Aviation Management, MBA', experience: '18 years in Aviation Industry & Academia', specialization: 'Airline Operations & Airport Management', bio: 'Former operations manager at a major Indian airline with extensive experience in airport ground operations and airline strategy.', order: 1 },
    { name: 'Dr. Priya Sharma', designation: 'Associate Professor - Aerospace Engineering', qualification: 'Ph.D. in Aerospace Engineering, M.Tech', experience: '15 years in Aerospace R&D & Teaching', specialization: 'Aerodynamics & Propulsion Systems', bio: 'Research scientist with publications in leading aerospace journals and experience at DRDO and NAL.', order: 2 },
    { name: 'Prof. Amit Verma', designation: 'Professor - Entrepreneurship', qualification: 'MBA, Certified Business Coach', experience: '12 years in Startups & Business Mentoring', specialization: 'Startup Strategy & Venture Capital', bio: 'Founded two successful startups and mentored over 50 student ventures. Angel investor and TEDx speaker.', order: 3 },
    { name: 'Capt. Vikram Malhotra (Retd.)', designation: 'Senior Instructor - Aviation Science', qualification: 'ATPL, B.Sc Aviation, DGCA Certified', experience: '22 years as Commercial Airline Pilot', specialization: 'Flight Operations & Aviation Safety', bio: 'Retired captain with 15,000+ flying hours. Specialist in flight safety, CRM, and aviation regulations.', order: 4 },
    { name: 'Dr. Sneha Patel', designation: 'Assistant Professor - Management Studies', qualification: 'Ph.D. in Business Administration, NET Qualified', experience: '10 years in Academia & Corporate Training', specialization: 'Aviation Finance & Marketing', bio: 'Corporate trainer turned academician with expertise in aviation marketing strategies and airline economics.', order: 5 },
    { name: 'Prof. Mohammed Irfan', designation: 'Associate Professor - Technology', qualification: 'M.Tech in Avionics, B.E. Electronics', experience: '14 years in Avionics Systems', specialization: 'Avionics & Navigation Systems', bio: 'Former avionics engineer at HAL with expertise in aircraft electronics, radar systems, and modern CNS/ATM.', order: 6 },
  ];
  await Faculty.insertMany(faculty);

  // Events
  const events = [
    { title: 'National Aviation Summit 2026', description: 'Annual National Aviation Summit featuring keynote speeches from airline CEOs, panel discussions on the future of Indian aviation, and networking opportunities with industry leaders.', date: new Date('2026-05-15'), location: 'IIMT University Campus', category: 'conference', isUpcoming: true },
    { title: 'Aerospace Innovation Hackathon', description: 'A 48-hour hackathon challenging students to develop innovative solutions for real-world aerospace problems including drone technology and sustainable aviation fuels.', date: new Date('2026-04-20'), location: 'Innovation Lab, IIMT University', category: 'workshop', isUpcoming: true },
    { title: 'Career Fair - Aviation & Aerospace', description: 'Annual placement drive featuring over 30 aviation and aerospace companies including major airlines, airport operators, MRO companies, and aerospace defense firms.', date: new Date('2026-06-10'), location: 'Placement Cell, Main Campus', category: 'placement', isUpcoming: true },
    { title: 'Startup Pitch Day 2026', description: 'Entrepreneurship students present their startup ideas to angel investors and venture capitalists. Top pitches receive seed funding and incubation support.', date: new Date('2026-03-25'), location: 'Entrepreneurship Hub', category: 'seminar', isUpcoming: false },
    { title: 'Airport Operations Workshop', description: 'Hands-on workshop conducted in collaboration with Delhi International Airport. Students experience real-time airport ground operations and passenger management.', date: new Date('2026-07-05'), location: 'IGI Airport, New Delhi', category: 'workshop', isUpcoming: true },
  ];
  await Event.insertMany(events);

  console.log('✅ In-memory database seeded successfully!');
  console.log('   Admin Login: admin@aharada.edu / admin123');

  // Placements
  const Placement = require('../models/Placement');
  const placements = [
    { companyName: 'IndiGo Airlines', studentName: 'Rahul Verma', program: 'BBA Aviation & Travel Management', package: '6.5 LPA', year: 2026, role: 'Airport Operations Manager', order: 1 },
    { companyName: 'Air India', studentName: 'Priya Sharma', program: 'BBA Aviation & Travel Management', package: '7.2 LPA', year: 2026, role: 'Customer Service Executive', order: 2 },
    { companyName: 'Boeing India', studentName: 'Amit Kumar', program: 'B.Tech Aerospace Engineering', package: '12.5 LPA', year: 2026, role: 'Aerospace Design Engineer', order: 3 },
    { companyName: 'Airbus', studentName: 'Sneha Gupta', program: 'B.Tech Aerospace Engineering', package: '14.0 LPA', year: 2026, role: 'Systems Engineer', order: 4 },
    { companyName: 'GMR Group', studentName: 'Vikram Singh', program: 'MBA Aviation Management', package: '10.5 LPA', year: 2026, role: 'Airport Manager', order: 5 }
  ];
  await Placement.insertMany(placements);
};

module.exports = connectDB;
