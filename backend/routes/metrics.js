const express = require('express');
const router = express.Router();
const { db } = require('../models/database');

// Get community metrics
router.get('/', (req, res) => {
  // Get all metrics in parallel
  Promise.all([
    getTankMetrics(),
    getAlertMetrics(),
    getUsageMetrics(),
    getEquityMetrics()
  ]).then(([tankMetrics, alertMetrics, usageMetrics, equityMetrics]) => {
    res.json({
      ...tankMetrics,
      ...alertMetrics,
      ...usageMetrics,
      ...equityMetrics,
      last_updated: new Date().toISOString()
    });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Tank metrics
function getTankMetrics() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM tanks WHERE is_active = 1', (err, tanks) => {
      if (err) {
        reject(err);
        return;
      }

      const totalTanks = tanks.length;
      const avgWaterLevel = tanks.reduce((sum, tank) => sum + tank.current_level, 0) / totalTanks;
      const criticalTanks = tanks.filter(tank => tank.current_level < 20).length;
      const warningTanks = tanks.filter(tank => tank.current_level >= 20 && tank.current_level < 40).length;
      const normalTanks = tanks.filter(tank => tank.current_level >= 40).length;

      resolve({
        total_tanks: totalTanks,
        avg_water_level: Math.round(avgWaterLevel),
        critical_tanks: criticalTanks,
        warning_tanks: warningTanks,
        normal_tanks: normalTanks,
        total_capacity: tanks.reduce((sum, tank) => sum + tank.capacity, 0)
      });
    });
  });
}

// Alert metrics
function getAlertMetrics() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN type = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN type = 'warning' THEN 1 ELSE 0 END) as warning,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
      FROM alerts 
      WHERE created_at > datetime('now', '-7 days')
    `, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      const stats = result[0];
      resolve({
        total_alerts: stats.total,
        critical_alerts: stats.critical,
        warning_alerts: stats.warning,
        active_alerts: stats.active
      });
    });
  });
}

// Usage metrics
function getUsageMetrics() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        SUM(usage_amount) as total_usage,
        AVG(flow_rate) as avg_flow_rate,
        COUNT(*) as readings
      FROM usage_logs 
      WHERE timestamp > datetime('now', '-24 hours')
    `, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      const usage = result[0];
      resolve({
        daily_usage: Math.round(usage.total_usage || 0),
        avg_flow_rate: Math.round(usage.avg_flow_rate || 0),
        total_readings: usage.readings
      });
    });
  });
}

// Equity and social metrics
function getEquityMetrics() {
  return new Promise((resolve, reject) => {
    db.all('SELECT current_level FROM tanks WHERE is_active = 1', (err, tanks) => {
      if (err) {
        reject(err);
        return;
      }

      const levels = tanks.map(t => t.current_level);
      const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
      
      // Calculate equity score (0-100)
      const minLevel = Math.min(...levels);
      const maxLevel = Math.max(...levels);
      const equityRange = maxLevel - minLevel;
      
      let equityScore;
      if (equityRange === 0) {
        equityScore = 100; // Perfect equity
      } else {
        equityScore = Math.max(0, 100 - (equityRange * 2));
      }

      // Women safety metric based on water availability
      const lowWaterTanks = tanks.filter(t => t.current_level < 30).length;
      const walkingDistanceSaved = lowWaterTanks === 0 ? 2.5 : lowWaterTanks < 2 ? 1.8 : 0.8;
      
      // Water saved through leak detection (simulated)
      const waterSaved = 12500 + (Math.random() * 5000);

      resolve({
        equity_score: Math.round(equityScore),
        walking_distance_saved: walkingDistanceSaved,
        women_safety_improvement: equityScore > 80 ? 'उच्च' : equityScore > 60 ? 'मध्यम' : 'निम्न',
        water_saved_liters: Math.round(waterSaved),
        fairness_index: calculateFairnessIndex(levels)
      });
    });
  });
}

function calculateFairnessIndex(levels) {
  if (levels.length === 0) return 100;
  
  const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
  const variance = levels.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / levels.length;
  
  // Convert variance to fairness index (0-100)
  const maxVariance = 2500; // Assuming max possible variance
  const fairness = Math.max(0, 100 - (variance / maxVariance * 100));
  
  return Math.round(fairness);
}

// Get historical metrics for charts
router.get('/history', (req, res) => {
  const days = parseInt(req.query.days) || 7;
  
  // This would normally query historical data
  // For now, return simulated data
  const history = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    history.push({
      date: date.toISOString().split('T')[0],
      avg_water_level: 50 + Math.random() * 30,
      total_usage: 8000 + Math.random() * 4000,
      equity_score: 70 + Math.random() * 25,
      alerts_count: Math.floor(Math.random() * 5)
    });
  }
  
  res.json(history);
});

module.exports = router;