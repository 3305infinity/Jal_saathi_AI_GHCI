const express = require('express');
const router = express.Router();
const { db } = require('../models/database');

// Get water distribution schedule
router.get('/', (req, res) => {
  db.all(`
    SELECT ws.*, t.name as tank_name, t.location
    FROM water_schedule ws
    LEFT JOIN tanks t ON ws.tank_id = t.id
    WHERE ws.is_active = 1
    ORDER BY 
      CASE ws.day 
        WHEN 'सोमवार' THEN 1
        WHEN 'मंगलवार' THEN 2
        WHEN 'बुधवार' THEN 3
        WHEN 'गुरुवार' THEN 4
        WHEN 'शुक्रवार' THEN 5
        WHEN 'शनिवार' THEN 6
        WHEN 'रविवार' THEN 7
      END,
      ws.time_slot
  `, (err, schedule) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(schedule);
  });
});

// Update schedule
router.put('/:id', (req, res) => {
  const scheduleId = req.params.id;
  const { day, time_slot, tank_id, purpose, purpose_hindi } = req.body;
  
  db.run(
    `UPDATE water_schedule 
     SET day = ?, time_slot = ?, tank_id = ?, purpose = ?, purpose_hindi = ?
     WHERE id = ?`,
    [day, time_slot, tank_id, purpose, purpose_hindi, scheduleId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ 
        message: 'Schedule updated successfully',
        changes: this.changes
      });
    }
  );
});

// Add new schedule entry
router.post('/', (req, res) => {
  const { day, time_slot, tank_id, purpose, purpose_hindi } = req.body;
  
  if (!day || !time_slot || !tank_id) {
    return res.status(400).json({ error: 'Day, time_slot and tank_id are required' });
  }

  db.run(
    `INSERT INTO water_schedule (day, time_slot, tank_id, purpose, purpose_hindi)
     VALUES (?, ?, ?, ?, ?)`,
    [day, time_slot, tank_id, purpose, purpose_hindi],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ 
        id: this.lastID,
        message: 'Schedule entry added successfully'
      });
    }
  );
});

// Delete schedule entry
router.delete('/:id', (req, res) => {
  const scheduleId = req.params.id;
  
  db.run(
    'DELETE FROM water_schedule WHERE id = ?',
    [scheduleId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ 
        message: 'Schedule entry deleted successfully',
        changes: this.changes
      });
    }
  );
});

// Get today's schedule
router.get('/today', (req, res) => {
  const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const today = days[new Date().getDay()];
  
  db.all(`
    SELECT ws.*, t.name as tank_name, t.location, t.current_level
    FROM water_schedule ws
    LEFT JOIN tanks t ON ws.tank_id = t.id
    WHERE ws.day = ? AND ws.is_active = 1
    ORDER BY ws.time_slot
  `, [today], (err, schedule) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({
      day: today,
      schedule: schedule,
      current_time: new Date().toLocaleTimeString('hi-IN')
    });
  });
});

module.exports = router;