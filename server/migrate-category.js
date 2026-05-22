/**
 * One-time migration: convert Program.category from String → [String]
 * Run once: node migrate-category.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI;

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const db = mongoose.connection.db;
  const collection = db.collection('programs');

  // Find all programs where category is a string (not an array)
  const programs = await collection.find({}).toArray();

  let updated = 0;
  let skipped = 0;
  let alreadyArray = 0;

  for (const prog of programs) {
    const cat = prog.category;

    if (Array.isArray(cat)) {
      // Already an array — check if it contains strings (correct) vs is empty
      if (cat.length === 0) {
        // Empty array — set default
        await collection.updateOne(
          { _id: prog._id },
          { $set: { category: ['aviation'] } }
        );
        console.log(`  [FIXED empty array] "${prog.title}" → ['aviation']`);
        updated++;
      } else {
        alreadyArray++;
        // no change needed
      }
    } else if (typeof cat === 'string' && cat.trim() !== '') {
      // Legacy string — wrap in array
      await collection.updateOne(
        { _id: prog._id },
        { $set: { category: [cat.trim()] } }
      );
      console.log(`  [MIGRATED] "${prog.title}": "${cat}" → ["${cat}"]`);
      updated++;
    } else {
      // null / undefined / empty string — set default
      await collection.updateOne(
        { _id: prog._id },
        { $set: { category: ['aviation'] } }
      );
      console.log(`  [DEFAULTED] "${prog.title}" → ['aviation']`);
      updated++;
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Programs migrated : ${updated}`);
  console.log(`   Already arrays    : ${alreadyArray}`);
  console.log(`   Total programs    : ${programs.length}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
