// // const express = require('express');
// // const cors = require('cors');
// // const bodyParser = require('body-parser');
// // const path = require('path');
// // const cron = require('node-cron');

// // // Import routes
// // const tankRoutes = require('./routes/tanks');
// // const alertRoutes = require('./routes/alerts');
// // const scheduleRoutes = require('./routes/schedule');
// // const metricsRoutes = require('./routes/metrics');
// // const reportRoutes = require('./routes/reports');

// // // Import database and models
// // const { initializeDatabase } = require('./models/database');
// // const { simulateSensorData, checkForAlerts } = require('./models/predictionModel');

// // const app = express();
// // const PORT = process.env.PORT || 5000;

// // // Middleware
// // app.use(cors());
// // app.use(bodyParser.json());
// // app.use(express.static('public'));

// // // Routes
// // app.use('/api/tanks', tankRoutes);
// // app.use('/api/alerts', alertRoutes);
// // app.use('/api/schedule', scheduleRoutes);
// // app.use('/api/metrics', metricsRoutes);
// // app.use('/api/reports', reportRoutes);

// // // Root endpoint
// // app.get('/', (req, res) => {
// //   res.json({
// //     message: '🚰 JalSaathi AI Backend Server',
// //     version: '1.0.0',
// //     endpoints: {
// //       tanks: '/api/tanks',
// //       alerts: '/api/alerts',
// //       schedule: '/api/schedule',
// //       metrics: '/api/metrics',
// //       reports: '/api/reports'
// //     }
// //   });
// // });

// // // Health check
// // app.get('/health', (req, res) => {
// //   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// // });

// // // Simulate sensor data every 5 minutes
// // cron.schedule('*/5 * * * *', () => {
// //   console.log('📡 Simulating sensor data update...');
// //   simulateSensorData();
// //   checkForAlerts();
// // });

// // // Initialize database and start server
// // initializeDatabase().then(() => {
// //   app.listen(PORT, () => {
// //     console.log(`🚀 JalSaathi AI Backend running on port ${PORT}`);
// //     console.log(`📊 Dashboard: http://localhost:${PORT}`);
// //     console.log(`🔧 API Base: http://localhost:${PORT}/api`);
    
// //     // Initial data simulation
// //     setTimeout(() => {
// //       simulateSensorData();
// //       checkForAlerts();
// //     }, 2000);
// //   });
// // }).catch(err => {
// //   console.error('❌ Failed to initialize database:', err);
// // });


// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const path = require('path');
// const cron = require('node-cron');

// // Import routes
// const tankRoutes = require('./routes/tanks');
// const alertRoutes = require('./routes/alerts');
// const scheduleRoutes = require('./routes/schedule');
// const metricsRoutes = require('./routes/metrics');
// const reportRoutes = require('./routes/reports');

// // Import database and models
// const { initializeDatabase } = require('./models/database');
// const { simulateSensorData, checkForAlerts } = require('./models/predictionModel');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ FIX: Proper CORS setup
// app.use(cors({
//     origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
// }));

// // ✅ FIX: Pre-flight requests handle karo
// app.options('*', cors());

// app.use(bodyParser.json());
// app.use(express.static('public'));

// // Routes
// app.use('/api/tanks', tankRoutes);
// app.use('/api/alerts', alertRoutes);
// app.use('/api/schedule', scheduleRoutes);
// app.use('/api/metrics', metricsRoutes);
// app.use('/api/reports', reportRoutes);

// // Root endpoint - TESTING KE LIYE
// app.get('/', (req, res) => {
//     console.log('✅ Root route hit');
//     res.json({
//         message: '🚰 JalSaathi AI Backend Server - WORKING!',
//         version: '1.0.0',
//         timestamp: new Date().toISOString(),
//         endpoints: {
//             tanks: '/api/tanks',
//             alerts: '/api/alerts', 
//             schedule: '/api/schedule',
//             metrics: '/api/metrics',
//             reports: '/api/reports'
//         }
//     });
// });

// // Health check
// app.get('/health', (req, res) => {
//     res.json({ 
//         status: 'OK', 
//         timestamp: new Date().toISOString(),
//         message: 'Server is running perfectly!'
//     });
// });

// // ✅ TEST ROUTE - Simple data without database
// app.get('/api/test', (req, res) => {
//     console.log('✅ Test API hit');
//     res.json({
//         message: 'Test API is working!',
//         tanks: [
//             { id: 1, name: 'टैंक-1 (टेस्ट)', current_level: 75, days_until_depletion: 8, location: 'टेस्ट लोकेशन' },
//             { id: 2, name: 'टैंक-2 (टेस्ट)', current_level: 45, days_until_depletion: 3, location: 'टेस्ट लोकेशन' }
//         ],
//         timestamp: new Date().toISOString()
//     });
// });

// // Simulate sensor data every 5 minutes
// cron.schedule('*/5 * * * *', () => {
//     console.log('📡 Simulating sensor data update...');
//     simulateSensorData();
//     checkForAlerts();
// });

// // Initialize database and start server
// initializeDatabase().then(() => {
//     app.listen(PORT, '0.0.0.0', () => {  // ✅ '0.0.0.0' add karo
//         console.log('🎉 🎉 🎉 JALSAATHI AI BACKEND RUNNING! 🎉 🎉 🎉');
//         console.log(`🚀 Server running on port ${PORT}`);
//         console.log(`🌐 Local: http://localhost:${PORT}`);
//         console.log(`🌐 Network: http://127.0.0.1:${PORT}`);
//         console.log(`📊 API Base: http://localhost:${PORT}/api`);
//         console.log('✅ TEST URL: http://localhost:5000/api/test');
//         console.log('⏰ Started at:', new Date().toLocaleString());
//         console.log('\n📋 Available URLs:');
//         console.log('   🌐 http://localhost:5000');
//         console.log('   🔧 http://localhost:5000/api/tanks');
//         console.log('   ❤️ http://localhost:5000/health');
//         console.log('   🧪 http://localhost:5000/api/test');
//     });
// }).catch(err => {
//     console.error('❌ Failed to initialize database:', err);
// });


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.static('public'));

// Enhanced Sample Data
const sampleData = {
    tanks: [
        { 
            id: 1, 
            name: 'टैंक-1 (पीने का पानी)', 
            name_english: 'Tank-1 (Drinking Water)',
            current_level: 75, 
            capacity: 10000, 
            flow_rate: 120, 
            location: 'ग्राम पंचायत',
            location_english: 'Gram Panchayat',
            last_updated: new Date().toISOString()
        },
        { 
            id: 2, 
            name: 'टैंक-2 (सिंचाई)', 
            name_english: 'Tank-2 (Irrigation)',
            current_level: 45, 
            capacity: 15000, 
            flow_rate: 280, 
            location: 'खेत क्षेत्र',
            location_english: 'Farm Area', 
            last_updated: new Date().toISOString()
        },
        { 
            id: 3, 
            name: 'टैंक-3 (मिश्रित)', 
            name_english: 'Tank-3 (Mixed)',
            current_level: 30, 
            capacity: 12000, 
            flow_rate: 180, 
            location: 'आवासीय क्षेत्र',
            location_english: 'Residential Area',
            last_updated: new Date().toISOString()
        }
    ],
    alerts: [
        {
            id: 1,
            tank_id: 3,
            message: 'CRITICAL: Tank-3 water level low (30%). Reduce usage by 20%.',
            message_hindi: 'आपात: टैंक-3 में पानी कम (30%)। उपयोग 20% कम करें।',
            type: 'critical',
            created_at: new Date().toISOString(),
            status: 'active',
            sms_sent: true,
            voice_sent: false
        }
    ],
    schedule: [
        {
            id: 1,
            day: 'सोमवार',
            day_english: 'Monday',
            time_slot: '4-6 PM',
            tank_id: 1,
            purpose: 'Drinking Water',
            purpose_hindi: 'पीने का पानी',
            tank_name: 'टैंक-1 (पीने का पानी)'
        },
        {
            id: 2,
            day: 'मंगलवार', 
            day_english: 'Tuesday',
            time_slot: '7-8 AM',
            tank_id: 3,
            purpose: 'Irrigation',
            purpose_hindi: 'सिंचाई',
            tank_name: 'टैंक-3 (मिश्रित)'
        }
    ],
    metrics: {
        equity_score: 74,
        walking_distance_saved: 1.4,
        women_safety_improvement: 'उच्च',
        women_safety_improvement_english: 'High',
        water_saved_liters: 12500,
        total_tanks: 3,
        critical_tanks: 1,
        warning_tanks: 1,
        normal_tanks: 1,
        total_alerts: 3
    }
};

// AI Prediction Function
const predictDaysUntilDepletion = (tank) => {
    const currentWater = (tank.current_level / 100) * tank.capacity;
    const dailyUsage = tank.flow_rate * 24;
    const daysLeft = Math.floor(currentWater / dailyUsage);
    return Math.max(1, daysLeft);
};

// Generate Suggestion
const generateSuggestion = (daysLeft, tankName, tankNameEnglish) => {
    if (daysLeft <= 2) {
        return {
            english: `CRITICAL! ${tankNameEnglish} will be empty in ${daysLeft} days. Reduce usage by 25% immediately.`,
            hindi: `आपात! ${tankName} ${daysLeft} दिनों में खाली हो जाएगा। तुरंत उपयोग 25% कम करें।`
        };
    } else if (daysLeft <= 5) {
        return {
            english: `Warning! ${tankNameEnglish} has only ${daysLeft} days of water left. Reduce usage by 15%.`,
            hindi: `चेतावनी! ${tankName} में केवल ${daysLeft} दिन का पानी बचा है। उपयोग 15% कम करें।`
        };
    } else {
        return {
            english: `Normal. ${tankNameEnglish} has ${daysLeft} days of water. Maintain current usage.`,
            hindi: `सामान्य। ${tankName} में ${daysLeft} दिन का पानी है। वर्तमान उपयोग जारी रखें।`
        };
    }
};

// Enhanced Routes

// Get all tanks with AI predictions
app.get('/api/tanks', (req, res) => {
    const tanksWithPredictions = sampleData.tanks.map(tank => {
        const daysLeft = predictDaysUntilDepletion(tank);
        const suggestion = generateSuggestion(daysLeft, tank.name, tank.name_english);
        
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

// Get tank explanation (XAI)
app.get('/api/tanks/:id/explanation', (req, res) => {
    const tankId = parseInt(req.params.id);
    const tank = sampleData.tanks.find(t => t.id === tankId);
    
    if (!tank) {
        return res.status(404).json({ error: 'Tank not found' });
    }
    
    const daysLeft = predictDaysUntilDepletion(tank);
    const explanation = {
        tank_id: tank.id,
        tank_name: tank.name,
        tank_name_english: tank.name_english,
        current_level: tank.current_level,
        days_until_depletion: daysLeft,
        factors: [
            `Current water level: ${tank.current_level}%`,
            `Average daily usage: ${Math.round(tank.flow_rate * 24)} liters`,
            `Flow rate: ${tank.flow_rate} L/hour`,
            tank.flow_rate > 200 ? 'Flow spike detected at 5 PM - possible leak' : 'Normal flow pattern',
            'Rainfall forecast: Low',
            `Predicted depletion: ${daysLeft} days`
        ],
        factors_hindi: [
            `वर्तमान जल स्तर: ${tank.current_level}%`,
            `औसत दैनिक उपयोग: ${Math.round(tank.flow_rate * 24)} लीटर`,
            `प्रवाह दर: ${tank.flow_rate} लीटर/घंटा`,
            tank.flow_rate > 200 ? 'दोपहर 5 बजे प्रवाह स्पाइक का पता चला - संभावित रिसाव' : 'सामान्य प्रवाह पैटर्न',
            'बारिश का पूर्वानुमान: कम',
            `अनुमानित समाप्ति: ${daysLeft} दिन`
        ],
        leak_detected: tank.flow_rate > 200,
        leak_confidence: tank.flow_rate > 200 ? 85 : 0
    };
    
    res.json(explanation);
});

// Get alerts
app.get('/api/alerts', (req, res) => {
    res.json(sampleData.alerts);
});

// Create alert (SMS simulation)
app.post('/api/alerts', (req, res) => {
    const { tank_id, message, message_hindi, type } = req.body;
    
    const newAlert = {
        id: sampleData.alerts.length + 1,
        tank_id,
        message,
        message_hindi,
        type: type || 'info',
        created_at: new Date().toISOString(),
        status: 'active',
        sms_sent: true,
        voice_sent: false
    };
    
    sampleData.alerts.unshift(newAlert);
    
    console.log(`📱 SMS Sent: ${message_hindi}`);
    console.log(`🔊 Voice Alert Prepared: ${message_hindi}`);
    
    res.json({
        id: newAlert.id,
        message: 'Alert created and SMS sent successfully',
        sms_sent: true,
        voice_sent: false
    });
});

// Send voice alert
app.post('/api/alerts/:id/voice', (req, res) => {
    const alertId = parseInt(req.params.id);
    const alert = sampleData.alerts.find(a => a.id === alertId);
    
    if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
    }
    
    // Mark as voice sent
    alert.voice_sent = true;
    
    res.json({
        message: 'Voice alert generated successfully',
        alert_text: alert.message_hindi,
        voice_file: `/voice-alerts/alert-${alertId}.mp3`,
        language: 'hi-IN'
    });
});

// Get schedule
app.get('/api/schedule', (req, res) => {
    res.json(sampleData.schedule);
});

// Get metrics
app.get('/api/metrics', (req, res) => {
    res.json(sampleData.metrics);
});

// Generate weekly report (LLM simulation)
app.get('/api/reports/weekly', (req, res) => {
    const report = {
        title: "साप्ताहिक जल रिपोर्ट",
        title_english: "Weekly Water Report",
        period: "18-24 November 2025",
        generated_at: new Date().toISOString(),
        
        content_hindi: `इस सप्ताह जल उपयोग में 12% की वृद्धि हुई है जो गर्मी के कारण है। टैंक-3 में पानी का स्तर खतरनाक रूप से कम है। सिफारिश: टैंक-3 के लिए सिंचाई समय में समायोजन करें और उपयोग 20% कम करें। रिसाव का पता चला है - तत्काल मरम्मत की आवश्यकता है।`,
        
        content_english: `This week water usage increased by 12% due to heatwave. Tank-3 water level is critically low. Recommendation: Adjust irrigation schedule for Tank-3 and reduce usage by 20%. Leak detected - immediate repair needed.`,
        
        summary_hindi: "जल संरक्षण के लिए तत्काल कार्रवाई आवश्यक",
        summary_english: "Immediate action required for water conservation",
        
        recommendations: [
            {
                priority: "high",
                action: "टैंक-3 का उपयोग 20% कम करें",
                action_english: "Reduce Tank-3 usage by 20%"
            },
            {
                priority: "medium", 
                action: "रिसाव की मरम्मत करें",
                action_english: "Repair detected leak"
            },
            {
                priority: "low",
                action: "वर्षा जल संचयन बढ़ाएं", 
                action_english: "Increase rainwater harvesting"
            }
        ]
    };
    
    res.json(report);
});

// Update tank data
app.put('/api/tanks/:id', (req, res) => {
    const tankId = parseInt(req.params.id);
    const { current_level, flow_rate } = req.body;
    
    const tank = sampleData.tanks.find(t => t.id === tankId);
    if (!tank) {
        return res.status(404).json({ error: 'Tank not found' });
    }
    
    if (current_level !== undefined) tank.current_level = current_level;
    if (flow_rate !== undefined) tank.flow_rate = flow_rate;
    tank.last_updated = new Date().toISOString();
    
    res.json({ message: 'Tank updated successfully', tank });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'JalSaathi AI Backend Running Perfectly!',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🚰 JalSaathi AI Enhanced Backend',
        version: '2.0.0',
        features: [
            'Multi-language support',
            'AI Predictions with XAI', 
            'SMS & Voice Alerts',
            'Leak Detection',
            'Weekly Reports',
            'Real-time Updates'
        ],
        endpoints: {
            tanks: '/api/tanks',
            alerts: '/api/alerts',
            schedule: '/api/schedule', 
            metrics: '/api/metrics',
            reports: '/api/reports/weekly'
        }
    });
});

// Auto-update simulation
setInterval(() => {
    sampleData.tanks.forEach(tank => {
        // Simulate small changes
        const change = (Math.random() - 0.5) * 2;
        tank.current_level = Math.max(10, Math.min(100, tank.current_level + change));
        tank.last_updated = new Date().toISOString();
    });
    console.log('🔄 Auto-updated tank levels');
}, 30000);

// Start server
app.listen(PORT, () => {
    console.log('🎉 🎉 ENHANCED JALSAATHI AI BACKEND RUNNING! 🎉 🎉');
    console.log(`🚀 Port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('✅ All features enabled: Multi-language, AI, SMS, Voice, XAI');
    console.log('⏰ Started at:', new Date().toLocaleString());
});