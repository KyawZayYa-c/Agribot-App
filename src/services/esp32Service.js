// services/esp32Service.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ESP_IP: '@esp_ip',
  CAMERA_IP: '@camera_ip',
  AUTO_CONNECT: '@auto_connect',
};

class ESP32Service {
  constructor() {
    this.ipAddress = null;
    this.cameraIpAddress = null;  
    this.baseURL = null;
     this.cameraBaseURL = null;    
    this.isConnected = false;
    this.connectionCheckInterval = null;
  }

  // ================= CONFIGURATION =================
  
  setIPAddress(ip) {
    this.ipAddress = ip;
    this.baseURL = `http://${ip}`;
    AsyncStorage.setItem(STORAGE_KEYS.ESP_IP, ip);
    return this.testConnection();
  }

setCameraIPAddress(ip) {
  this.cameraIpAddress = ip;
  this.cameraBaseURL = `http://${ip}`;
  AsyncStorage.setItem(STORAGE_KEYS.CAMERA_IP, ip);
  console.log(`📷 Camera IP set to: ${ip}`);
  return true;
}
async getSavedCameraIP() {
  try {
    const ip = await AsyncStorage.getItem(STORAGE_KEYS.CAMERA_IP);
    console.log(`📷 Saved Camera IP from storage: ${ip}`);
    return ip;
  } catch (error) {
    console.error('Error getting saved camera IP:', error);
    return null;
  }
}

  //  getCameraStreamURL() {
  //   if (this.cameraBaseURL) {
  //     return `${this.cameraBaseURL}/stream`;  // ESP32-CAM stream endpoint
  //   }
  //   const savedIP = this.getSavedCameraIP();
  //   if (savedIP) {
  //     this.cameraBaseURL = `http://${savedIP}`;
  //     return `${this.cameraBaseURL}/stream`;
  //   }
  //   return null;
  // }


async getCameraStreamURL() {
  console.log('📷 Getting camera stream URL...');
  
  // 1. class variable မှာ ရှိရင် ပြန်ပေး
  if (this.cameraBaseURL) {
    console.log(`📷 Using existing cameraBaseURL: ${this.cameraBaseURL}`);
    return `${this.cameraBaseURL}/stream`;
  }
  
  // 2. Saved Camera IP ကို Storage ကနေ ယူပါ
  const savedIP = await this.getSavedCameraIP();
  console.log(`📷 Saved IP from storage: ${savedIP}`);
  
  if (savedIP) {
    this.cameraBaseURL = `http://${savedIP}`;
    this.cameraIpAddress = savedIP;
    const streamUrl = `${this.cameraBaseURL}/stream`;
    console.log(`📷 Camera Stream URL created: ${streamUrl}`);
    return streamUrl;
  }
  
  console.log('⚠️ No Camera IP found in storage');
  return null;
}

  async getCameraStreamURLAsync() {
  const savedIP = await this.getSavedCameraIP();
  if (savedIP) {
    this.cameraBaseURL = `http://${savedIP}`;
    this.cameraIpAddress = savedIP;
    return `${this.cameraBaseURL}/stream`;
  }
  return null;
}

  
  
  async getSavedIP() {
    try {
      const ip = await AsyncStorage.getItem(STORAGE_KEYS.ESP_IP);
      return ip;
    } catch (error) {
      console.error('Error getting saved IP:', error);
      return null;
    }
  }

async setAutoConnect(enabled) {
  await AsyncStorage.setItem(STORAGE_KEYS.AUTO_CONNECT, JSON.stringify(enabled));
  if (!enabled) {
    // Auto Connect ပိတ်ရင် Connection Check ကိုရပ်
    this.stopConnectionCheck();
  }
  }
  
  stopConnectionCheck() {
  if (this.connectionCheckInterval) {
    clearInterval(this.connectionCheckInterval);
    this.connectionCheckInterval = null;
  }
}

  async getAutoConnect() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_CONNECT);
      return value ? JSON.parse(value) : true;
    } catch {
      return true;
    }
  }

  // ================= CONNECTION MANAGEMENT =================

  async testConnection() {
    if (!this.baseURL) return { success: false, error: 'No base URL' };
    
    try {
      const response = await fetch(`${this.baseURL}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 3000,
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isConnected = true;
        console.log('✅ ESP32 connected:', data);
        return { success: true, data };
      }
      this.isConnected = false;
      return { success: false, error: 'Not connected' };
    } catch (error) {
      this.isConnected = false;
      console.error('❌ Connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async autoConnect() {
    const autoConnect = await this.getAutoConnect();
    if (!autoConnect) {
      console.log('⏸️ Auto connect is disabled');
      return { success: false, error: 'Auto connect disabled' };
    }

    const savedIP = await this.getSavedIP();
    if (!savedIP) {
      console.log('⚠️ No saved IP found');
      return { success: false, error: 'No saved IP' };
    }

    console.log('🔄 Auto connecting to:', savedIP);
    this.setIPAddress(savedIP);
    const result = await this.testConnection();
    
    if (result.success) {
      this.startConnectionCheck();
    }
    
    return result;
  }

  async ping() {
    console.log('📡 Pinging ESP32...');
    return this.sendCommand('/');
  }

  resetServos() {
    console.log('🔄 Resetting servos to home position');
    return this.sendCommand('/reset_servos');
  }

startConnectionCheck() {
  this.getAutoConnect().then(autoConnect => {
    if (!autoConnect) {
      console.log('⏸️ Auto Connect disabled, not starting connection check');
      return;
    }
    
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    
    this.connectionCheckInterval = setInterval(async () => {
      // ✅ Auto Connect ပိတ်သွားရင် ရပ်
      const isAutoConnect = await this.getAutoConnect();
      if (!isAutoConnect) {
        this.stopConnectionCheck();
        return;
      }
      await this.checkConnection();
    }, 10000);
  });
}

  async checkConnection() {
    if (!this.baseURL) return { success: false, error: 'No base URL' };
    
    try {
      const response = await fetch(`${this.baseURL}/status`, {
        method: 'GET',
        timeout: 2000,
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isConnected = true;
        return { success: true, data };
      }
      
      this.isConnected = false;
      return { success: false, error: 'Not connected' };
    } catch (error) {
      this.isConnected = false;
      return { success: false, error: error.message };
    }
  }

  disconnect() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
    this.isConnected = false;
    console.log('🔌 Disconnected from ESP32');
  }

  // ================= GET STATUS =================

  async getStatus() {
    if (!this.baseURL) {
      const savedIP = await this.getSavedIP();
      if (savedIP) {
        this.baseURL = `http://${savedIP}`;
        this.ipAddress = savedIP;
      } else {
        return { success: false, error: 'No ESP32 IP configured' };
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 3000,
      });

      if (response.ok) {
        const data = await response.json();
        this.isConnected = true;
        return { success: true, data };
      }
      return { success: false, error: 'Failed to get status' };
    } catch (error) {
      console.error('❌ Get status error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // async getBatteryStatus() {
  //   if (!this.baseURL) {
  //     const savedIP = await this.getSavedIP();
  //     if (savedIP) {
  //       this.baseURL = `http://${savedIP}`;
  //       this.ipAddress = savedIP;
  //     } else {
  //       return { success: false, error: 'No ESP32 IP configured' };
  //     }
  //   }

  //   try {
  //     console.log(`📡 Fetching battery from: ${this.baseURL}/battery`);
  //     const response = await fetch(`${this.baseURL}/battery`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       timeout: 3000,
  //     });

  //     console.log(`📡 Battery response status: ${response.status}`);

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log('✅ Battery data received:', data);
  //       return { 
  //         success: true, 
  //         data: {
  //           voltage: data.voltage || 0,
  //           percentage: data.percentage || 0,
  //           isCharging: data.isCharging || false,
  //         }
  //       };
  //     }
  //     return { success: false, error: `HTTP ${response.status}` };
  //   } catch (error) {
  //     console.error('❌ Get battery error:', error.message);
  //     return { success: false, error: error.message };
  //   }
  // }

  async getSystemTest() {
    if (!this.baseURL) {
      const savedIP = await this.getSavedIP();
      if (savedIP) {
        this.baseURL = `http://${savedIP}`;
        this.ipAddress = savedIP;
      } else {
        return { success: false, error: 'No ESP32 IP configured' };
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 3000,
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
      return { success: false, error: 'Failed to get test info' };
    } catch (error) {
      console.error('❌ Get test error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ================= DRIVE COMMANDS =================

  async sendCommand(endpoint, params = null) {
    if (!this.baseURL) {
      const savedIP = await this.getSavedIP();
      if (savedIP) {
        this.baseURL = `http://${savedIP}`;
        this.ipAddress = savedIP;
        console.log(`📡 Using saved IP: ${savedIP}`);
      } else {
        return { success: false, error: 'No ESP32 IP configured. Please go to Settings.' };
      }
    }

    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const queryString = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&');
      url += `?${queryString}`;
    }

    console.log(`📤 Sending: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          return { success: true, data };
        }
        const text = await response.text();
        return { success: true, data: text };
      }
      return { success: false, error: `HTTP ${response.status}` };
    } catch (error) {
      console.error('❌ Command error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ===== DRIVE COMMANDS =====
  moveForward() {
    console.log('🚗 Forward');
    return this.sendCommand('/f');
  }

  moveBackward() {
    console.log('🚗 Backward');
    return this.sendCommand('/b');
  }

  moveLeft() {
    console.log('🚗 Left');
    return this.sendCommand('/l');
  }

  moveRight() {
    console.log('🚗 Right');
    return this.sendCommand('/r');
  }

  stopRobot() {
    console.log('🛑 Stop');
    return this.sendCommand('/s');
  }

  setDriveSpeed(speed) {
    if (speed < 0 || speed > 255) {
      return { success: false, error: 'Speed must be 0-255' };
    }
    console.log(`⚡ Drive Speed: ${speed}`);
    return this.sendCommand('/speed', { val: speed });
  }

  // ===== PUMP COMMANDS =====
  setPump(state) {
    console.log(`💧 Pump: ${state ? 'ON' : 'OFF'}`);
    return this.sendCommand('/api', { pump: state ? 1 : 0 });
  }

  pumpOn() {
    return this.setPump(true);
  }

  pumpOff() {
    return this.setPump(false);
  }

  // ===== SEED MOTOR (GEAR) COMMANDS =====
  setGear(state) {
    console.log(`⚙️ Seed Motor: ${state ? 'ON' : 'OFF'}`);
    return this.sendCommand('/api', { motor: state ? 1 : 0 });
  }

  gearOn() {
    return this.setGear(true);
  }

  gearOff() {
    return this.setGear(false);
  }

  setGearSpeed(speed) {
    if (speed < 0 || speed > 255) {
      return { success: false, error: 'Speed must be 0-255' };
    }
    console.log(`⚙️ Seed Speed: ${speed}`);
    return this.sendCommand('/api', { speed: speed });
  }

  // ===== SERVO COMMANDS (UPDATED) =====
  setPanAngle(angle) {
    if (angle < 0 || angle > 180) {
      return { success: false, error: 'Angle must be 0-180' };
    }
    console.log(`🎯 Pan: ${angle}°`);
    return this.sendCommand('/api', { pan: angle });
  }

  setTiltAngle(angle) {
    if (angle < 10 || angle > 170) {
      return { success: false, error: 'Angle must be 10-170' };
    }
    console.log(`🎯 Tilt: ${angle}°`);
    return this.sendCommand('/api', { tilt: angle });
  }

  setRakeAngle(angle) {
    if (angle < 0 || angle > 160) {
      return { success: false, error: 'Angle must be 0-160' };
    }
    console.log(`🎯 Rake: ${angle}°`);
    return this.sendCommand('/api', { rake: angle });
  }

  // ===== COMBINED COMMANDS =====
  async sendCommands(commands) {
    const results = [];
    for (const cmd of commands) {
      const result = await this.sendCommand(cmd.endpoint, cmd.params);
      results.push({ command: cmd, result });
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return results;
  }

  async moveForwardWithSpeed(speed) {
    const results = [];
    const speedResult = await this.setDriveSpeed(speed);
    results.push(speedResult);
    if (speedResult.success) {
      const moveResult = await this.moveForward();
      results.push(moveResult);
    }
    return results;
  }

  async emergencyStop() {
    console.log('🆘 EMERGENCY STOP!');
    const commands = [
      { endpoint: '/s' },
    ];
    return this.sendCommands(commands);
  }
}

const esp32Service = new ESP32Service();
export default esp32Service;