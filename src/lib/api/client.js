// lib/api/client.js

// ESP32 က လွှင့်ပေးထားတဲ့ IP Address ကို ထည့်ပါ
// (ဥပမာ - ESP32 Serial Monitor မှာ ပေါ်လာတဲ့ IP)
const ESP_IP = '192.168.1.15'; 

export const API_BASE_URL = `http://${ESP_IP}`;
export const callESP = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.ok;
  } catch (error) {
    console.error('ESP Connection Error:', error);
    return false;
  }
};