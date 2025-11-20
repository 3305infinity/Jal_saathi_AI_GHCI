const express = require('express');
const router = express.Router();
const { db } = require('../models/database');

// Generate weekly report
router.get('/weekly', (req, res) => {
  // Get data for report
  Promise.all([
    getTankStatus(),
    getUsageSummary(),
    getAlertSummary(),
    getRecommendations()
  ]).then(([tankStatus, usageSummary, alertSummary, recommendations]) => {
    
    const report = {
      title: "साप्ताहिक जल प्रबंधन रिपोर्ट",
      title_english: "Weekly Water Management Report",
      period: getLastWeekPeriod(),
      generated_at: new Date().toISOString(),
      
      // Hindi content
      content_hindi: generateHindiReport(tankStatus, usageSummary, alertSummary, recommendations),
      
      // English content  
      content_english: generateEnglishReport(tankStatus, usageSummary, alertSummary, recommendations),
      
      // Summary
      summary_hindi: generateHindiSummary(tankStatus, recommendations),
      summary_english: generateEnglishSummary(tankStatus, recommendations),
      
      // Data for charts
      data: {
        tank_status: tankStatus,
        usage_trend: usageSummary,
        alerts: alertSummary
      }
    };
    
    res.json(report);
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Helper functions for report generation
function getLastWeekPeriod() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

function getTankStatus() {
  return new Promise((resolve, reject) => {
    db.all('SELECT name, current_level, capacity, flow_rate FROM tanks WHERE is_active = 1', (err, tanks) => {
      if (err) {
        reject(err);
        return;
      }
      
      const status = tanks.map(tank => ({
        ...tank,
        status: tank.current_level < 20 ? 'critical' : tank.current_level < 40 ? 'warning' : 'normal',
        days_left: Math.floor((tank.current_level / 100 * tank.capacity) / (tank.flow_rate * 24))
      }));
      
      resolve(status);
    });
  });
}

function getUsageSummary() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        DATE(timestamp) as date,
        SUM(usage_amount) as daily_usage,
        AVG(flow_rate) as avg_flow
      FROM usage_logs 
      WHERE timestamp > datetime('now', '-7 days')
      GROUP BY DATE(timestamp)
      ORDER BY date
    `, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(results);
    });
  });
}

function getAlertSummary() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        type,
        COUNT(*) as count,
        GROUP_CONCAT(DISTINCT tank_id) as affected_tanks
      FROM alerts 
      WHERE created_at > datetime('now', '-7 days')
      GROUP BY type
    `, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(results);
    });
  });
}

function getRecommendations() {
  return new Promise((resolve, reject) => {
    db.all('SELECT name, current_level FROM tanks WHERE is_active = 1', (err, tanks) => {
      if (err) {
        reject(err);
        return;
      }
      
      const criticalTanks = tanks.filter(t => t.current_level < 30);
      const warningTanks = tanks.filter(t => t.current_level >= 30 && t.current_level < 50);
      
      const recommendations = [];
      
      if (criticalTanks.length > 0) {
        recommendations.push({
          priority: 'high',
          action: 'immediate_reduction',
          tanks: criticalTanks.map(t => t.name),
          message: `तत्काल कार्रवाई आवश्यक: ${criticalTanks.map(t => t.name).join(', ')} में पानी कम है`,
          message_english: `Immediate action required: ${criticalTanks.map(t => t.name).join(', ')} have critically low water`
        });
      }
      
      if (warningTanks.length > 0) {
        recommendations.push({
          priority: 'medium', 
          action: 'conservation',
          tanks: warningTanks.map(t => t.name),
          message: `जल संरक्षण: ${warningTanks.map(t => t.name).join(', ')} में पानी मध्यम स्तर पर है`,
          message_english: `Water conservation: ${warningTanks.map(t => t.name).join(', ')} have moderate water levels`
        });
      }
      
      // Always include general recommendations
      recommendations.push({
        priority: 'low',
        action: 'maintenance',
        tanks: [],
        message: 'नियमित रखरखाव जारी रखें और रिसाव की जांच करते रहें',
        message_english: 'Continue regular maintenance and monitor for leaks'
      });
      
      resolve(recommendations);
    });
  });
}

function generateHindiReport(tankStatus, usageSummary, alertSummary, recommendations) {
  const criticalTanks = tankStatus.filter(t => t.status === 'critical');
  const totalUsage = usageSummary.reduce((sum, day) => sum + day.daily_usage, 0);
  const criticalAlerts = alertSummary.find(a => a.type === 'critical')?.count || 0;
  
  let report = `# साप्ताहिक जल प्रबंधन रिपोर्ट\n\n`;
  
  report += `## सारांश\n`;
  report += `- कुल ${tankStatus.length} टैंक मॉनिटर किए गए\n`;
  report += `- ${criticalTanks.length} टैंक आपात स्थिति में\n`;
  report += `- ${criticalAlerts} आपात सतर्कताएं जारी की गईं\n`;
  report += `- साप्ताहिक कुल उपयोग: ${Math.round(totalUsage / 1000)}k लीटर\n\n`;
  
  report += `## टैंक स्थिति\n`;
  tankStatus.forEach(tank => {
    const statusText = tank.status === 'critical' ? 'आपात' : tank.status === 'warning' ? 'चेतावनी' : 'सामान्य';
    report += `- ${tank.name}: ${tank.current_level}% (${statusText}) - ${tank.days_left} दिन शेष\n`;
  });
  
  report += `\n## सिफारिशें\n`;
  recommendations.forEach(rec => {
    const priorityText = rec.priority === 'high' ? '🔴 उच्च' : rec.priority === 'medium' ? '🟡 मध्यम' : '🟢 निम्न';
    report += `- ${priorityText}: ${rec.message}\n`;
  });
  
  return report;
}

function generateEnglishReport(tankStatus, usageSummary, alertSummary, recommendations) {
  const criticalTanks = tankStatus.filter(t => t.status === 'critical');
  const totalUsage = usageSummary.reduce((sum, day) => sum + day.daily_usage, 0);
  const criticalAlerts = alertSummary.find(a => a.type === 'critical')?.count || 0;
  
  let report = `# Weekly Water Management Report\n\n`;
  
  report += `## Summary\n`;
  report += `- Total ${tankStatus.length} tanks monitored\n`;
  report += `- ${criticalTanks.length} tanks in critical condition\n`;
  report += `- ${criticalAlerts} critical alerts issued\n`;
  report += `- Weekly total usage: ${Math.round(totalUsage / 1000)}k liters\n\n`;
  
  report += `## Tank Status\n`;
  tankStatus.forEach(tank => {
    report += `- ${tank.name}: ${tank.current_level}% (${tank.status}) - ${tank.days_left} days left\n`;
  });
  
  report += `\n## Recommendations\n`;
  recommendations.forEach(rec => {
    const priorityText = rec.priority === 'high' ? '🔴 High' : rec.priority === 'medium' ? '🟡 Medium' : '🟢 Low';
    report += `- ${priorityText}: ${rec.message_english}\n`;
  });
  
  return report;
}

function generateHindiSummary(tankStatus, recommendations) {
  const criticalCount = tankStatus.filter(t => t.status === 'critical').length;
  
  if (criticalCount > 0) {
    return `आपात स्थिति! ${criticalCount} टैंक में पानी खतरनाक स्तर तक कम। तत्काल कार्रवाई आवश्यक।`;
  }
  
  const warningCount = tankStatus.filter(t => t.status === 'warning').length;
  if (warningCount > 0) {
    return `सतर्कता आवश्यक। ${warningCount} टैंक में पानी मध्यम स्तर पर। जल संरक्षण अपनाएं।`;
  }
  
  return `सभी टैंक सामान्य स्थिति में। जल संरक्षण जारी रखें।`;
}

function generateEnglishSummary(tankStatus, recommendations) {
  const criticalCount = tankStatus.filter(t => t.status === 'critical').length;
  
  if (criticalCount > 0) {
    return `Emergency! ${criticalCount} tanks have critically low water. Immediate action required.`;
  }
  
  const warningCount = tankStatus.filter(t => t.status === 'warning').length;
  if (warningCount > 0) {
    return `Caution needed. ${warningCount} tanks have moderate water levels. Practice water conservation.`;
  }
  
  return `All tanks in normal condition. Continue water conservation practices.`;
}

// Generate custom report
router.post('/custom', (req, res) => {
  const { start_date, end_date, report_type } = req.body;
  
  // In a real implementation, this would generate custom reports
  // based on the specified date range and type
  
  res.json({
    message: 'Custom report generation initiated',
    report_id: 'rep_' + Date.now(),
    parameters: {
      start_date,
      end_date, 
      report_type,
      generated_at: new Date().toISOString()
    }
  });
});

module.exports = router;