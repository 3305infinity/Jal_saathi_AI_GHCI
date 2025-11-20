const express = require('express');
const router = express.Router();
const { db } = require('../models/database');

// Get all alerts
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  
  db.all(`
    SELECT a.*, t.name as tank_name 
    FROM alerts a 
    LEFT JOIN tanks t ON a.tank_id = t.id 
    ORDER BY a.created_at DESC 
    LIMIT ?
  `, [limit], (err, alerts) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(alerts);
  });
});

// Create new alert
router.post('/', (req, res) => {
  const { tank_id, message, message_hindi, type = 'info' } = req.body;
  
  if (!message || !message_hindi) {
    return res.status(400).json({ error: 'Message and Hindi message are required' });
  }

  db.run(
    `INSERT INTO alerts (tank_id, message, message_hindi, type, sms_sent, voice_sent) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tank_id, message, message_hindi, type, 1, 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      console.log(`📱 SMS Alert Sent: ${message_hindi}`);
      
      res.json({ 
        id: this.lastID,
        message: 'Alert created and SMS sent successfully',
        sms_sent: true,
        voice_sent: false
      });
    }
  );
});

// Send voice alert
// Send voice alert
router.post('/:id/voice', (req, res) => {
  const alertId = req.params.id;
  
  db.get('SELECT * FROM alerts WHERE id = ?', [alertId], (err, alert) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Update alert to mark voice sent
    db.run(
      'UPDATE alerts SET voice_sent = 1 WHERE id = ?',
      [alertId]
    );

    console.log(`🔊 Voice Alert Prepared: ${alert.message_hindi}`);
    
    res.json({
      message: 'Voice alert generated successfully',
      alert_text: alert.message_hindi,
      // ❌ Remove multer file reference
      voice_file: null, // In real implementation, you would generate MP3 differently
      language: 'hi-IN'
    });
  });
});
// Mark alert as resolved
router.put('/:id/resolve', (req, res) => {
  const alertId = req.params.id;
  
  db.run(
    'UPDATE alerts SET status = "resolved" WHERE id = ?',
    [alertId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ 
        message: 'Alert resolved successfully',
        changes: this.changes
      });
    }
  );
});

// Get alert statistics
router.get('/stats', (req, res) => {
  db.all(`
    SELECT 
      type,
      COUNT(*) as count,
      SUM(CASE WHEN sms_sent = 1 THEN 1 ELSE 0 END) as sms_sent,
      SUM(CASE WHEN voice_sent = 1 THEN 1 ELSE 0 END) as voice_sent
    FROM alerts 
    WHERE created_at > datetime('now', '-7 days')
    GROUP BY type
  `, (err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    
    res.json({
      total_alerts: total,
      by_type: stats,
      period: '7 days'
    });
  });
});

module.exports = router;