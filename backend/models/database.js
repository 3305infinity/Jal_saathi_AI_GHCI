const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'jalsaathi.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Create tables
    db.serialize(() => {
      // Tanks table
      db.run(`CREATE TABLE IF NOT EXISTS tanks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        current_level REAL DEFAULT 0,
        capacity REAL NOT NULL,
        flow_rate REAL DEFAULT 0,
        location TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )`);

      // Alerts table
      db.run(`CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tank_id INTEGER,
        message TEXT NOT NULL,
        message_hindi TEXT NOT NULL,
        type TEXT CHECK(type IN ('critical', 'warning', 'info')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        sms_sent BOOLEAN DEFAULT 0,
        voice_sent BOOLEAN DEFAULT 0,
        FOREIGN KEY (tank_id) REFERENCES tanks (id)
      )`);

      // Water schedule table
      db.run(`CREATE TABLE IF NOT EXISTS water_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        tank_id INTEGER,
        purpose TEXT,
        purpose_hindi TEXT,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (tank_id) REFERENCES tanks (id)
      )`);

      // Usage logs table
      db.run(`CREATE TABLE IF NOT EXISTS usage_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tank_id INTEGER,
        usage_amount REAL,
        flow_rate REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tank_id) REFERENCES tanks (id)
      )`);

      // Insert sample data
      db.run(`INSERT OR IGNORE INTO tanks (id, name, current_level, capacity, flow_rate, location) VALUES
        (1, 'टैंक-1 (पीने का पानी)', 75, 10000, 120, 'ग्राम पंचायत'),
        (2, 'टैंक-2 (सिंचाई)', 45, 15000, 280, 'खेत क्षेत्र'),
        (3, 'टैंक-3 (मिश्रित)', 30, 12000, 180, 'आवासीय क्षेत्र')`);

      db.run(`INSERT OR IGNORE INTO water_schedule (day, time_slot, tank_id, purpose, purpose_hindi) VALUES
        ('सोमवार', '4-6 PM', 1, 'Drinking Water', 'पीने का पानी'),
        ('मंगलवार', '7-8 AM', 3, 'Irrigation', 'सिंचाई'),
        ('बुधवार', '5-7 PM', 2, 'Domestic Use', 'घरेलू उपयोग'),
        ('गुरुवार', '6-8 AM', 1, 'Drinking Water', 'पीने का पानी'),
        ('शुक्रवार', '3-5 PM', 2, 'Irrigation', 'सिंचाई'),
        ('शनिवार', '8-10 AM', 3, 'Domestic Use', 'घरेलू उपयोग'),
        ('रविवार', '9-11 AM', 1, 'Community Use', 'सामुदायिक उपयोग')`);

      db.run(`INSERT OR IGNORE INTO alerts (tank_id, message, message_hindi, type) VALUES
        (3, 'Tank-3 water level critically low! Only 30% remaining.', 'टैंक-3 में पानी खतरनाक स्तर तक कम! केवल 30% पानी बचा है।', 'critical')`);

      console.log('✅ Database initialized successfully');
      resolve();
    });
  });
};

module.exports = {
  db,
  initializeDatabase
};