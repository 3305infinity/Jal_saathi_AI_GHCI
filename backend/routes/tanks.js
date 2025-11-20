const express = require('express');
const router = express.Router();
const { db } = require('../models/database');
const { predictDaysUntilDepletion, generateSuggestion, detectLeaks } = require('../models/predictionModel');

// Get all tanks with predictions
router.get('/', (req, res) => {
  db.all('SELECT * FROM tanks WHERE is_active = 1 ORDER BY id', (err, tanks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Add AI predictions and suggestions
    const tanksWithPredictions = tanks.map(tank => {
      const daysLeft = predictDaysUntilDepletion(tank);
      const suggestion = generateSuggestion(daysLeft, tank.name);
      
      return {
        ...tank,
        days_until_depletion: daysLeft,
        suggestion: suggestion.english,
        suggestion_hindi: suggestion.hindi,
        status: daysLeft <= 2 ? 'critical' : daysLeft <= 5 ? 'warning' : 'normal'
      };
    });

    res.json(tanksWithPredictions);
  });
});

// Get single tank details
router.get('/:id', (req, res) => {
  const tankId = req.params.id;
  
  db.get('SELECT * FROM tanks WHERE id = ? AND is_active = 1', [tankId], (err, tank) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!tank) {
      return res.status(404).json({ error: 'Tank not found' });
    }

    const daysLeft = predictDaysUntilDepletion(tank);
    const suggestion = generateSuggestion(daysLeft, tank.name);
    
    res.json({
      ...tank,
      days_until_depletion: daysLeft,
      suggestion: suggestion.english,
      suggestion_hindi: suggestion.hindi
    });
  });
});

// Get XAI explanation for tank prediction
router.get('/:id/explanation', (req, res) => {
  const tankId = req.params.id;
  
  db.get('SELECT * FROM tanks WHERE id = ? AND is_active = 1', [tankId], (err, tank) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!tank) {
      return res.status(404).json({ error: 'Tank not found' });
    }

    const daysLeft = predictDaysUntilDepletion(tank);
    
    // Get historical data for leak detection
    db.all(
      'SELECT flow_rate FROM usage_logs WHERE tank_id = ? AND timestamp > datetime("now", "-24 hours")',
      [tankId],
      (err, logs) => {
        const leakInfo = detectLeaks(tank, logs);
        
        const explanation = {
          tank_id: tank.id,
          tank_name: tank.name,
          current_level: tank.current_level,
          days_until_depletion: daysLeft,
          factors: [
            `Current water level: ${tank.current_level}%`,
            `Average daily usage: ${Math.round(tank.flow_rate * 24)} liters`,
            `Flow rate: ${tank.flow_rate} L/hour`,
            leakInfo.leakDetected ? 'Flow spike detected - possible leak' : 'Normal flow pattern',
            'Rainfall forecast: Low',
            `Predicted depletion: ${daysLeft} days`
          ],
          factors_hindi: [
            `वर्तमान जल स्तर: ${tank.current_level}%`,
            `औसत दैनिक उपयोग: ${Math.round(tank.flow_rate * 24)} लीटर`,
            `प्रवाह दर: ${tank.flow_rate} लीटर/घंटा`,
            leakInfo.leakDetected ? 'प्रवाह स्पाइक का पता चला - संभावित रिसाव' : 'सामान्य प्रवाह पैटर्न',
            'बारिश का पूर्वानुमान: कम',
            `अनुमानित समाप्ति: ${daysLeft} दिन`
          ],
          leak_detected: leakInfo.leakDetected,
          leak_confidence: leakInfo.confidence
        };
        
        res.json(explanation);
      }
    );
  });
});

// Update tank data (for simulation)
router.put('/:id', (req, res) => {
  const tankId = req.params.id;
  const { current_level, flow_rate } = req.body;
  
  if (current_level === undefined || flow_rate === undefined) {
    return res.status(400).json({ error: 'current_level and flow_rate are required' });
  }

  db.run(
    'UPDATE tanks SET current_level = ?, flow_rate = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
    [current_level, flow_rate, tankId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Log the update
      db.run(
        'INSERT INTO usage_logs (tank_id, usage_amount, flow_rate) VALUES (?, ?, ?)',
        [tankId, 0, flow_rate] // usage_amount 0 for manual updates
      );
      
      res.json({ 
        message: 'Tank updated successfully',
        changes: this.changes
      });
    }
  );
});

// Get tank usage history
router.get('/:id/usage-history', (req, res) => {
  const tankId = req.params.id;
  
  db.all(
    `SELECT * FROM usage_logs 
     WHERE tank_id = ? 
     AND timestamp > datetime('now', '-7 days')
     ORDER BY timestamp DESC
     LIMIT 50`,
    [tankId],
    (err, logs) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(logs);
    }
  );
});

module.exports = router;