const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Set defaults
const defaults = { 
  users: [], 
  tenants: [], 
  complaints: [],
  config: {
    ownerContact: '9099113546',
    emergencyContact: ''
  }
};

db.defaults(defaults).write();

// Ensure config exists even if defaults were already applied to an old file
if (!db.has('config').value()) {
  db.set('config', defaults.config).write();
}

const connectDB = () => {
  console.log('LowDB Connected: Local file storage');
  return db;
};

module.exports = { connectDB, db };
