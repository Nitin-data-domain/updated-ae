/**
 * Quick data check — prints counts of all collections
 * Run: node check-data.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.\n');

  const db = mongoose.connection.db;
  const collections = ['programs', 'events', 'faculties', 'placements', 'enquiries', 'brochures'];

  console.log('═══════════════════════════════════════');
  console.log('       DATABASE RECORD COUNTS          ');
  console.log('═══════════════════════════════════════');

  for (const col of collections) {
    try {
      const docs = await db.collection(col).find({}).toArray();
      console.log(`  ${col.padEnd(15)} : ${docs.length} records`);
      if (col === 'events' && docs.length > 0) {
        docs.forEach(d => console.log(`     → "${d.title}" [${d.category}] ${d.isUpcoming ? '(Upcoming)' : '(Past)'}`));
      }
      if (col === 'programs' && docs.length > 0) {
        docs.forEach(d => console.log(`     → "${d.title}" [${JSON.stringify(d.category)}]`));
      }
    } catch {
      console.log(`  ${col.padEnd(15)} : (collection not found)`);
    }
  }

  console.log('═══════════════════════════════════════');
  await mongoose.disconnect();
  console.log('\nAll done. Your data is safe! ✅');
}

check().catch(err => { console.error(err); process.exit(1); });
