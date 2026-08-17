// React Native
const API_BASE_URL = 'http://192.168.167.172:5233'; // ခင်ဗျားရဲ့ IP

// ==========================================
// 1. Connection Status
// ==========================================
// 📌 သုံးပုံ: getConnectionStatus()
// 📤 Response: { isConnected: true, status: "Connected", timestamp: "2026-06-27T15:30:00" }
const getConnectionStatus = async () => {
    const response = await fetch(`${API_BASE_URL}/api/status/connection`);
    return response.json();
};

// ==========================================
// 2. Send Command
// ==========================================
// 📌 သုံးပုံ: sendCommand('forward', '50')
// 📤 Request Body: { command: "forward", value: "50" }
// 📤 Response: { message: "Command sent successfully" }
const sendCommand = async (command, value) => {
    const response = await fetch(`${API_BASE_URL}/api/status/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, value })
    });
    return response.json();
};

// ==========================================
// 3. Get Vehicles
// ==========================================
// 📌 သုံးပုံ: getVehicles()
// 📤 Response: [ { id: 1, vehicleId: "agribot-001", name: "AgriBot-001", status: "Online", ... } ]
const getVehicles = async () => {
    const response = await fetch(`${API_BASE_URL}/api/vehicles`);
    return response.json();
};

// ==========================================
// 4. Get Latest Telemetry
// ==========================================
// 📌 သုံးပုံ: getLatestTelemetry('agribot-001')
// 📤 Response: { id: 1, vehicleId: "agribot-001", battery: 85, seedLevel: 40, areaCovered: 35.5, status: "Running", timestamp: "2026-06-27T15:30:00" }
const getLatestTelemetry = async (vehicleId) => {
    const response = await fetch(`${API_BASE_URL}/api/telemetry/latest?vehicleId=${vehicleId}`);
    return response.json();
};

// ==========================================
// 5. Get Telemetry History
// ==========================================
// 📌 သုံးပုံ: getTelemetryHistory('agribot-001', 50)
// 📤 Response: [ { id: 1, vehicleId: "agribot-001", battery: 85, ... }, ... ]
const getTelemetryHistory = async (vehicleId, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/api/telemetry/history?vehicleId=${vehicleId}&limit=${limit}`);
    return response.json();
};

// ==========================================
// 6. Get Command History
// ==========================================
// 📌 သုံးပုံ: getCommandHistory('agribot-001', 50)
// 📤 Response: [ { id: 1, vehicleId: "agribot-001", commandType: "forward", value: "50", source: "dashboard", timestamp: "2026-06-27T15:30:00" }, ... ]
const getCommandHistory = async (vehicleId, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/api/commands/history?vehicleId=${vehicleId}&limit=${limit}`);
    return response.json();
};

// ==========================================
// 7. Get Statistics
// ==========================================
// 📌 သုံးပုံ: getStatistics('agribot-001')
// 📤 Response: { totalTelemetry: 100, todayTelemetry: 25, latestBattery: 85, latestSeedLevel: 40 }
const getStatistics = async (vehicleId) => {
    const response = await fetch(`${API_BASE_URL}/api/telemetry/statistics?vehicleId=${vehicleId}`);
    return response.json();
};