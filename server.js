const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (Dashboard UI)
app.use(express.static(path.join(__dirname)));

// Health check for Render
app.get('/health', (req, res) => res.status(200).send('OK'));

// ============================================================
// DATA STORAGE (In-memory, no SQLite for maximum reliability on Render)
// ============================================================
let bins = [
  { id: "bin_1", name: "UniMall, LPU", location: "Lovely Professional University UniMall", lat: 31.2548, lng: 75.7015, deviceId: "ESP32-LIVE", fill: 0, status: "Empty", isLive: true, lastUpdated: new Date().toISOString() },
  { id: "bin_2", name: "Block 30 – Admissions", location: "Block 30 Admissions, LPU, Phagwara", lat: 31.2562, lng: 75.7048, deviceId: "SIM-002", fill: 68, status: "Warning", isLive: false, lastUpdated: new Date().toISOString() },
  { id: "bin_3", name: "Block 35", location: "Block 35, LPU, Phagwara", lat: 31.2545, lng: 75.7068, deviceId: "SIM-003", fill: 45, status: "Normal", isLive: false, lastUpdated: new Date().toISOString() },
  { id: "bin_4", name: "LPU Open Audi", location: "LPU Open Audi Road, Punjab", lat: 31.2535, lng: 75.7002, deviceId: "SIM-004", fill: 88, status: "Critical", isLive: false, lastUpdated: new Date().toISOString() },
  { id: "bin_5", name: "Khajurla Gate Area", location: "7P44+JRR, Khajurla, Punjab", lat: 31.2505, lng: 75.6998, deviceId: "SIM-005", fill: 22, status: "Normal", isLive: false, lastUpdated: new Date().toISOString() },
  { id: "bin_6", name: "LPU South Zone", location: "7P44+855, Phagwara, Punjab", lat: 31.2518, lng: 75.7040, deviceId: "SIM-006", fill: 91, status: "Critical", isLive: false, lastUpdated: new Date().toISOString() }
];

// Helper to determine status
function getStatus(fill) {
  if (fill >= 80) return "Critical";
  if (fill >= 60) return "Warning";
  if (fill > 0)  return "Normal";
  return "Empty";
}

// ============================================================
// API ROUTES
// ============================================================

// GET  /api/bins  → send all bin data to dashboard
app.get('/api/bins', (req, res) => {
  res.json(bins);
});

// POST /api/update  → ESP32 sends { deviceId, fill }
app.post('/api/update', (req, res) => {
  const { deviceId, fill } = req.body;
  if (!deviceId || fill === undefined) {
    return res.status(400).json({ error: "Missing deviceId or fill level" });
  }

  const bin = bins.find(b => b.deviceId === deviceId);
  if (bin) {
    bin.fill        = Math.min(100, Math.max(0, parseInt(fill)));
    bin.status      = getStatus(bin.fill);
    bin.lastUpdated = new Date().toISOString();
    console.log(`[UPDATE] ${deviceId} -> ${bin.fill}%`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Device not found" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Running on PORT: ${PORT}`);
});

