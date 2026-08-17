import { Platform } from 'react-native';

const getBaseUrl = () => {
  // Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5233';;
  }
  // iOS Simulator
  if (Platform.OS === 'ios') {
    return 'http://localhost:5233';
  }
  // Web Browser
  if (typeof window !== 'undefined') {
    return 'http://localhost:5233';
  }
  // Physical Device (USB) - Laptop IP
  return 'http://10.214.84.172:5233';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {

  // Status
  CONNECTION_STATUS: '/api/status/connection',
  
  // Vehicle
  VEHICLES: '/api/vehicles',
  
  // Telemetry
  TELEMETRY_LATEST: '/api/telemetry/latest',
  TELEMETRY_HISTORY: '/api/telemetry/history',
  TELEMETRY_STATISTICS: '/api/telemetry/statistics',
  
  // Commands
  COMMANDS_HISTORY: '/api/commands/history',
  COMMANDS_LATEST: '/api/commands/latest',
  
  // Soil
  SOIL_TYPES: '/api/soil/types',
  SOIL_DETECT: '/api/soil/detect',

    // AI Chat
  AI_CHAT_MESSAGE: '/api/aichat/message',
  AI_CHAT_FEATURES: '/api/aichat/features',
  AI_CHAT_HEALTH: '/api/aichat/health',
  CHAT_HISTORY: '/api/chathistory',
  CHAT_HISTORY_CLEAR: '/api/chathistory/clear',
  AI_CHAT_START_SESSION: '/api/aichat/start-session',
  
  
  // ==========================================
  // ✅ Camera APIs (ထပ်ထည့်ပါ)
  // ==========================================
  CAMERA_STREAM: '/api/camera/stream',
  CAMERA_CAPTURE: '/api/camera/capture',
  CAMERA_PHOTO: '/api/camera/photo',
  CAMERA_LATEST: '/api/camera/latest',
  CAMERA_STATUS: '/api/camera/status',
  CAMERA_UPDATE_IP: '/api/camera/update-ip',

  // Plant Disease Classification
  PLANT_DISEASE_CLASSIFY: '/api/plantdisease/classify',
};