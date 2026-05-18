const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://nitin_db_user:aharada_updated_website@cluster0.snmfzr9.mongodb.net/aharada_education?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    for (let c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`${c.name}: ${count}`);
    }
    process.exit(0);
  });
