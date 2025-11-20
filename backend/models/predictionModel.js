const { db } = require('./database');

// AI Prediction Model for water depletion
const predictDaysUntilDepletion = (tank) => {
  const currentWater = (tank.current_level / 100) * tank.capacity;
  const dailyUsage = tank.flow_rate * 24; // liters per day
  
  if (dailyUsage <= 0) return 999;
  
  const daysLeft = Math.floor(currentWater / dailyUsage);
  return Math.max(0, Math.min(daysLeft, 30));
};

// Generate suggestion based on prediction
const generateSuggestion = (daysLeft, tankName) => {
  if (daysLeft <= 2) {
    return {
      english: `Critical! ${tankName} will be empty in ${daysLeft} days. Reduce usage by 25% immediately.`,
      hindi: `आपात स्थिति! ${tankName} ${daysLeft} दिनों में खाली हो जाएगा। तुरंत उपयोग 25% कम करें।`
    };
  } else if (daysLeft <= 5) {
    return {
      english: `Warning! ${tankName} has only ${daysLeft} days of water left. Reduce usage by 15%.`,
      hindi: `चेतावनी! ${tankName} में केवल ${daysLeft} दिन का पानी बचा है। उपयोग 15% कम करें।`
    };
  } else {
    return {
      english: `Normal. ${tankName} has ${daysLeft} days of water. Maintain current usage.`,
      hindi: `सामान्य। ${tankName} में ${daysLeft} दिन का पानी है। वर्तमान उपयोग जारी रखें।`
    };
  }
};

// Leak detection algorithm
const detectLeaks = (tank, historicalData) => {
  const avgFlowRate = historicalData.reduce((sum, data) => sum + data.flow_rate, 0) / historicalData.length;
  const currentFlowRate = tank.flow_rate;
  
  // If current flow rate is 50% higher than average, possible leak
  if (currentFlowRate > avgFlowRate * 1.5) {
    return {
      leakDetected: true,
      confidence: 85,
      message: `Possible leak detected in ${tank.name}. Flow rate is ${Math.round((currentFlowRate/avgFlowRate - 1) * 100)}% above average.`,
      message_hindi: `${tank.name} में संभावित रिसाव का पता चला। प्रवाह दर औसत से ${Math.round((currentFlowRate/avgFlowRate - 1) * 100)}% अधिक है।`
    };
  }
  
  return { leakDetected: false, confidence: 0 };
};

// Simulate sensor data updates
const simulateSensorData = () => {
  db.all('SELECT * FROM tanks WHERE is_active = 1', (err, tanks) => {
    if (err) {
      console.error('Error fetching tanks for simulation:', err);
      return;
    }

    tanks.forEach(tank => {
      // Simulate realistic changes
      const levelChange = (Math.random() - 0.5) * 5; // -2.5 to +2.5%
      const flowChange = (Math.random() - 0.4) * 40; // -20 to +20 L/hr
      
      const newLevel = Math.max(10, Math.min(100, tank.current_level + levelChange));
      const newFlowRate = Math.max(50, Math.min(400, tank.flow_rate + flowChange));

      // Update tank
      db.run(
        'UPDATE tanks SET current_level = ?, flow_rate = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
        [newLevel, newFlowRate, tank.id]
      );

      // Log usage
      db.run(
        'INSERT INTO usage_logs (tank_id, usage_amount, flow_rate) VALUES (?, ?, ?)',
        [tank.id, (tank.current_level - newLevel) * tank.capacity / 100, newFlowRate]
      );
    });
    
    console.log('📊 Sensor data simulated and updated');
  });
};

// Check for alerts and generate them
const checkForAlerts = () => {
  db.all(`
    SELECT t.*, 
           (SELECT COUNT(*) FROM usage_logs ul WHERE ul.tank_id = t.id AND ul.timestamp > datetime('now', '-1 hour')) as recent_logs
    FROM tanks t 
    WHERE t.is_active = 1
  `, (err, tanks) => {
    if (err) {
      console.error('Error checking alerts:', err);
      return;
    }

    tanks.forEach(tank => {
      const daysLeft = predictDaysUntilDepletion(tank);
      
      // Check for critical levels
      if (tank.current_level < 20) {
        const alertMsg = {
          message: `CRITICAL: ${tank.name} has only ${tank.current_level}% water remaining!`,
          message_hindi: `आपात: ${tank.name} में केवल ${tank.current_level}% पानी बचा है!`,
          type: 'critical'
        };
        createAlert(tank.id, alertMsg);
      }
      // Check for low levels
      else if (tank.current_level < 40) {
        const alertMsg = {
          message: `WARNING: ${tank.name} water level low (${tank.current_level}%).`,
          message_hindi: `चेतावनी: ${tank.name} का जल स्तर कम है (${tank.current_level}%)।`,
          type: 'warning'
        };
        createAlert(tank.id, alertMsg);
      }

      // Check for unusual flow rates (possible leaks)
      if (tank.recent_logs > 0) {
        db.all(
          'SELECT flow_rate FROM usage_logs WHERE tank_id = ? AND timestamp > datetime("now", "-6 hours")',
          [tank.id],
          (err, logs) => {
            if (!err && logs.length > 5) {
              const leakInfo = detectLeaks(tank, logs);
              if (leakInfo.leakDetected) {
                createAlert(tank.id, {
                  message: leakInfo.message,
                  message_hindi: leakInfo.message_hindi,
                  type: 'warning'
                });
              }
            }
          }
        );
      }
    });
  });
};

const createAlert = (tankId, alertData) => {
  db.run(
    'INSERT INTO alerts (tank_id, message, message_hindi, type) VALUES (?, ?, ?, ?)',
    [tankId, alertData.message, alertData.message_hindi, alertData.type],
    function(err) {
      if (err) {
        console.error('Error creating alert:', err);
      } else {
        console.log(`🚨 Alert created: ${alertData.message}`);
      }
    }
  );
};

module.exports = {
  predictDaysUntilDepletion,
  generateSuggestion,
  detectLeaks,
  simulateSensorData,
  checkForAlerts
};