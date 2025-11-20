// Sample data for initial setup and testing
const sampleData = {
  villages: [
    {
      id: 1,
      name: "रामपुर गाँव",
      district: "बिहार",
      population: 1200,
      water_sources: ["बोरवेल", "रेनवाटर हार्वेस्टिंग"],
      implemented_date: "2024-01-15"
    },
    {
      id: 2, 
      name: "सूखा क्षेत्र",
      district: "राजस्थान",
      population: 800,
      water_sources: ["हैंडपंप", "वाटर टैंकर"],
      implemented_date: "2024-02-01"
    }
  ],
  
  sensors: [
    {
      id: 1,
      type: "water_level",
      model: "JL-SENSOR-001",
      installation_date: "2024-01-20",
      battery_level: 85,
      status: "active"
    },
    {
      id: 2,
      type: "flow_meter", 
      model: "JL-FLOW-001",
      installation_date: "2024-01-20",
      battery_level: 92,
      status: "active"
    }
  ],
  
  weatherData: [
    {
      date: "2024-01-20",
      temperature: 28.5,
      humidity: 65,
      rainfall: 0,
      forecast: "sunny"
    },
    {
      date: "2024-01-21", 
      temperature: 29.2,
      humidity: 62,
      rainfall: 0,
      forecast: "partly_cloudy"
    }
  ]
};

module.exports = sampleData;