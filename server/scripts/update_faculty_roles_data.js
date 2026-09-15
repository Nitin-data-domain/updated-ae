const { sequelize } = require('../config/db');
const Faculty = require('../models/Faculty');

const facultyRolesData = [
  {
    name: 'Prof. (Dr.) Amitabh Sen',
    designation: 'Head of Department (HOD) - Aeronautical & Aerospace Engineering',
    rolesAndResponsibilities: `• Academic & Strategic Leadership of the Department of Aerospace Engineering
• Oversight of DGCA & AICTE compliant aeronautical curriculum development and laboratory upgrades
• Direct supervision of Flight Simulator & Wind Tunnel research facilities
• Industry collaboration with DRDO, HAL, ISRO, and global aerospace defense cells
• Guiding M.Tech & Ph.D. research scholars in hypersonic flows, CFD modeling, and space systems
• Steering faculty development programs, academic audits, and institutional accreditation`
  },
  {
    name: 'Dr. Rajesh Kumar Singh',
    designation: 'Professor & Head - Aviation Studies',
    rolesAndResponsibilities: `• Department Head for Aviation Management, Airport Economics, and Air Cargo Studies
• Academic coordination of undergraduate and postgraduate aviation management programs
• Chair of Student Academic Grievance, Ethics & Mentorship Committee
• Industry immersion liaison with commercial airlines, GMR, and Adani Airport operators
• Executive workshops on air freight logistics, airline revenue management, and fleet scheduling`
  },
  {
    name: 'Dr. Priya Sharma',
    designation: 'Associate Professor - Aerospace Engineering',
    rolesAndResponsibilities: `• Course coordinator for Aerodynamics, Flight Dynamics, and Gas Turbine Propulsion
• Laboratory In-Charge for Subsonic Wind Tunnel and Flow Visualization facilities
• Research supervisor for student aerodynamic modeling and UAV drag reduction projects
• Academic audit, mid-term evaluations, and continuous internal assessment management`
  },
  {
    name: 'Prof. Amit Verma',
    designation: 'Professor - Entrepreneurship',
    rolesAndResponsibilities: `• Director of the Aharada Aviation & Aerospace Incubation Hub
• Mentoring student startups in drone delivery, aviation tech, and charter services
• Organizing Annual Angel Investor Pitch Sessions and Venture Capital networking
• Business plan development, intellectual property advisory, and seed grant management`
  },
  {
    name: 'Capt. Vikram Malhotra (Retd.)',
    designation: 'Senior Instructor - Aviation Science',
    rolesAndResponsibilities: `• Lead Ground Instructor for Commercial Pilot License (CPL) and Instrument Rating (IR)
• Instruction in DGCA Air Regulations, Aviation Meteorology, and Radio Telephony
• Cockpit Resource Management (CRM) and Line-Oriented Flight Training (LOFT) workshops
• Pilot career counseling and interview preparation for major international carriers`
  },
  {
    name: 'Capt. Meenakshi Sundaram',
    designation: 'Chief Flight Instructor & Head - Pilot Ground Training',
    rolesAndResponsibilities: `• Department Leadership for Pilot Ground School and Aviation Flight Sciences
• In-charge of Multi-Engine & Instrument Rating syllabus alignment with DGCA standards
• Conducting advanced flight simulator debriefings and emergency procedure drills
• Coordination with domestic flying clubs and flying training organizations (FTOs)`
  },
  {
    name: 'Dr. Sneha Patel',
    designation: 'Assistant Professor - Management Studies',
    rolesAndResponsibilities: `• Teaching Airline Marketing, Aviation Finance, and Consumer Behavior in Travel
• Coordinator for Student Industry Internships and Live Corporate Projects
• Class mentor for BBA & MBA Aviation batches
• Managing guest lecture series with senior aviation executives`
  },
  {
    name: 'Dr. Arvind Swaminathan',
    designation: 'Associate Professor - Avionics & Satellite Navigation',
    rolesAndResponsibilities: `• Academic coordinator for Aircraft Avionics, Fly-By-Wire systems, and Radar Telemetry
• Managing NextGen CNS/ATM (Communication, Navigation, Surveillance / Air Traffic Management) lab
• Guiding student projects in ADS-B tracking and satellite communications
• In-charge of Departmental Technical Symposiums and IEEE Aerospace student chapter`
  },
  {
    name: 'Prof. Mohammed Irfan',
    designation: 'Associate Professor - Technology',
    rolesAndResponsibilities: `• In-charge of Avionics Hardware Laboratories, Digital Circuits, and Microcontroller Systems
• Practical training on aircraft wiring standards, radio altimeters, and glass cockpit displays
• Supervision of laboratory safety protocols and electronic test bench calibration
• Student mentoring for national hackathons and robotics competitions`
  },
  {
    name: 'Prof. Sunita Deshmukh',
    designation: 'Assistant Professor - Airport Operations & Airline Ground Services',
    rolesAndResponsibilities: `• Course lead for Airport Terminal Operations, Ramp Safety Management, and Air Cargo Handling
• IATA certification preparation modules and Dangerous Goods Regulations (DGR) instruction
• Organizing on-site study visits to Indira Gandhi International Airport (IGI)
• Coordinator for campus recruitment drives with airline ground handling agencies`
  },
  {
    name: 'Er. Devendra Pratap Verma',
    designation: 'Senior Technical Officer & Flight Simulator Instructor',
    rolesAndResponsibilities: `• Technical management and maintenance of Level-D Full Flight Simulators (FFS)
• Practical flight dynamics simulation exercises and flight envelope expansion labs
• In-charge of the Drone Testing and Rapid Prototyping Workshop
• Equipment maintenance, safety audits, and simulator software updates`
  }
];

async function updateFacultyRoles() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Ensure column exists
    const queryInterface = sequelize.getQueryInterface();
    const tableDesc = await queryInterface.describeTable('faculties');
    if (!tableDesc.rolesAndResponsibilities) {
      console.log('Adding column rolesAndResponsibilities to faculties...');
      await sequelize.query('ALTER TABLE faculties ADD COLUMN rolesAndResponsibilities TEXT DEFAULT "";');
      console.log('Column added.');
    } else {
      console.log('Column rolesAndResponsibilities already exists.');
    }

    // Update records
    for (const item of facultyRolesData) {
      const [updated] = await Faculty.update(
        { rolesAndResponsibilities: item.rolesAndResponsibilities },
        { where: { name: item.name } }
      );
      console.log(`Updated ${item.name}: ${updated ? 'SUCCESS' : 'NOT FOUND'}`);
    }

    // Verify
    const all = await Faculty.findAll({ attributes: ['id', 'name', 'designation', 'rolesAndResponsibilities'] });
    console.log(`\nVerified ${all.length} faculty members. Sample:`);
    console.log(all[0].name, '-> roles length:', (all[0].rolesAndResponsibilities || '').length);

    console.log('\nAll faculty roles & responsibilities updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

updateFacultyRoles();
