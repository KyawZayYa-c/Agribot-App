// services/wifiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const STORAGE_KEYS = {
  ESP_IP: '@esp_ip',
  AUTO_CONNECT: '@auto_connect',
  SCANNED_IPS: '@scanned_ips',
  MANUAL_IPS: '@manual_ips',
};

class WifiService {
  constructor() {
    this.scannedDevices = [];
    this.isScanning = false;
    this.manualIPs = [];
  }

  // ================= MANUAL IP MANAGEMENT =================

  async addManualIP(ip) {
    const ips = await this.getManualIPs();
    if (!ips.includes(ip)) {
      ips.push(ip);
      await AsyncStorage.setItem(STORAGE_KEYS.MANUAL_IPS, JSON.stringify(ips));
      console.log(`✅ Manual IP added: ${ip}`);
    }
    return ips;
  }

  async getManualIPs() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MANUAL_IPS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async removeManualIP(ip) {
    let ips = await this.getManualIPs();
    ips = ips.filter(item => item !== ip);
    await AsyncStorage.setItem(STORAGE_KEYS.MANUAL_IPS, JSON.stringify(ips));
    console.log(`✅ Manual IP removed: ${ip}`);
    return ips;
  }

  // ================= NETWORK INFO =================

  async getCurrentWifiInfo() {
    try {
      const state = await NetInfo.fetch();
      console.log('📶 NetInfo state:', JSON.stringify(state, null, 2));
      
      if (!state || !state.isConnected) {
        console.log('📶 NetInfo returned null - using fallback');
        return {
          isConnected: true,
          isWifi: true,
          ssid: 'Connected (Expo)',
          ipAddress: '192.168.1.1',
          bssid: null,
        };
      }
      
      return {
        isConnected: state.isConnected,
        isWifi: state.type === 'wifi',
        ssid: state.details?.ssid || 'Unknown',
        ipAddress: state.details?.ipAddress || '192.168.1.1',
        bssid: state.details?.bssid || null,
      };
    } catch (error) {
      console.error('Error getting WiFi info:', error);
      return {
        isConnected: true,
        isWifi: true,
        ssid: 'Connected (Expo)',
        ipAddress: '192.168.1.1',
        bssid: null,
      };
    }
  }

  async isWifiConnected() {
    const info = await this.getCurrentWifiInfo();
    return info?.isConnected && info?.isWifi;
  }

  // ================= ESP32 DISCOVERY =================

  async scanForESP32() {
    if (this.isScanning) {
      return { success: false, error: 'Already scanning' };
    }

    console.log('🔍 Starting scanForESP32...');
    this.isScanning = true;
    this.scannedDevices = [];

    try {
      // Method 1: MDNS Scan
      console.log('📡 Scanning MDNS...');
      const mdnsDevices = await this.scanMDNS();
      this.scannedDevices.push(...mdnsDevices);

      // Method 2: Scan ALL common ranges (STOP when found)
      console.log('📡 Scanning ALL common network ranges...');
      const networkDevices = await this.scanAllRanges();
      this.scannedDevices.push(...networkDevices);

      // Method 3: Manual IPs
      console.log('📡 Checking manual IPs...');
      const manualIPs = await this.getManualIPs();
      for (const ip of manualIPs) {
        if (!this.scannedDevices.find(d => d.ip === ip)) {
          const isValid = await this.testDevice(ip);
          if (isValid) {
            this.scannedDevices.push({
              ip: ip,
              name: `ESP32 (${ip}) [Manual]`,
              type: 'manual',
            });
            console.log(`✅ Found ESP32 at manual IP: ${ip}`);
          }
        }
      }

      // Method 4: Saved Scanned IPs
      console.log('📡 Checking saved scanned IPs...');
      const savedIPs = await this.getScannedIPs();
      for (const ip of savedIPs) {
        if (!this.scannedDevices.find(d => d.ip === ip)) {
          const isValid = await this.testDevice(ip);
          if (isValid) {
            this.scannedDevices.push({
              ip: ip,
              name: 'ESP32 Robot (Saved)',
              type: 'saved',
            });
          }
        }
      }

      // Remove duplicates
      this.scannedDevices = this.scannedDevices.filter(
        (device, index, self) => 
          index === self.findIndex(d => d.ip === device.ip)
      );

      const ips = this.scannedDevices.map(d => d.ip);
      await this.saveScannedIPs(ips);

      this.isScanning = false;
      console.log(`📊 Scan complete. Found ${this.scannedDevices.length} device(s)`);
      return { success: true, devices: this.scannedDevices };
    } catch (error) {
      this.isScanning = false;
      console.error('❌ Scan error:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== SCAN ALL COMMON RANGES (STOP IMMEDIATELY WHEN FOUND) =====
  async scanAllRanges() {
    const ranges = [
      '10.143.201.',
      '10.11.128.',   // First - ခင်ဗျားရဲ့ IP range
      '10.248.244.',  // Second IP range
      '10.11.0.',
      '10.10.0.',
      '10.0.0.',
      '192.168.1.',
      '192.168.0.',
      '192.168.100.',
      '172.16.0.',
      '172.17.0.',
    ];

    console.log('📶 Scanning ranges:', ranges);
    const found = [];

    for (const baseIP of ranges) {
      // ✅ တွေ့ပြီးသားဆိုရင် ချက်ချင်းရပ်
      if (found.length > 0) {
        console.log(`✅ Found ${found.length} device(s), stopping scan immediately!`);
        break;
      }
      
      console.log(`📶 Scanning range: ${baseIP}1-254`);
      
      const promises = [];
      let foundCount = 0;
      let shouldStop = false;
      
      for (let i = 1; i <= 254; i++) {
        if (shouldStop) break;
        
        const ip = baseIP + i;
        promises.push(
          this.testDevice(ip).then(isValid => {
            if (isValid && !shouldStop) {
              shouldStop = true;
              foundCount++;
              found.push({
                ip: ip,
                name: `ESP32 (${ip})`,
                type: 'scan',
              });
              console.log(`✅ Found ESP32 at: ${ip}`);
            }
          }).catch(() => {})
        );
        
        if (promises.length >= 20) {
          await Promise.all(promises);
          promises.length = 0;
          if (shouldStop) break;
        }
      }
      
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      
      console.log(`📶 Range ${baseIP} complete. Found ${foundCount} device(s)`);
      
      // ✅ တွေ့ပြီးသားဆိုရင် ချက်ချင်းရပ်
      if (found.length > 0) {
        console.log(`✅ Found ${found.length} device(s), stopping scan immediately!`);
        break;
      }
    }
    
    console.log(`📶 Scan complete. Total found: ${found.length} device(s)`);
    return found;
  }

  // ===== MDNS SCAN =====
  async scanMDNS() {
    const hostnames = [
      'agrirobot.local',
      'esp32.local',
      'esp32-robot.local',
    ];

    const found = [];
    for (const hostname of hostnames) {
      try {
        const response = await fetch(`http://${hostname}/`, {
          method: 'GET',
          timeout: 1000,
        });
        if (response.ok) {
          found.push({
            ip: hostname,
            name: hostname.replace('.local', ''),
            type: 'mdns',
          });
          console.log(`✅ Found ESP32 via MDNS: ${hostname}`);
        }
      } catch (error) {
        // Host not found, continue
      }
    }
    return found;
  }

  // ===== RESOLVE HOSTNAME =====
  async resolveHostname(hostname) {
    try {
      const response = await fetch(`http://${hostname}/`, {
        method: 'GET',
        timeout: 2000,
      });
      if (response.ok) {
        return hostname;
      }
      return null;
    } catch {
      return null;
    }
  }

  // ===== TEST DEVICE =====
  async testDevice(ip) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      
      const response = await fetch(`http://${ip}/status`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'online' || data.driveSpeed !== undefined) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  // ===== GET LOCAL IP =====
  async getLocalIP() {
    const info = await this.getCurrentWifiInfo();
    console.log('📶 getLocalIP result:', info?.ipAddress);
    
    if (!info?.ipAddress || info.ipAddress === 'Unknown') {
      return '192.168.1.1';
    }
    return info.ipAddress;
  }

  // ================= IP STORAGE =================

  async saveESP32IP(ip) {
    await AsyncStorage.setItem(STORAGE_KEYS.ESP_IP, ip);
  }

  async getESP32IP() {
    return await AsyncStorage.getItem(STORAGE_KEYS.ESP_IP);
  }

  async saveScannedIPs(ips) {
    await AsyncStorage.setItem(STORAGE_KEYS.SCANNED_IPS, JSON.stringify(ips));
  }

  async getScannedIPs() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCANNED_IPS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // ================= AUTO CONNECT =================

  async setAutoConnect(enabled) {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_CONNECT, JSON.stringify(enabled));
  }

  async getAutoConnect() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_CONNECT);
      return value ? JSON.parse(value) : true;
    } catch {
      return true;
    }
  }

  async autoConnect() {
    const autoConnect = await this.getAutoConnect();
    if (!autoConnect) {
      return { success: false, error: 'Auto connect disabled' };
    }

    const savedIP = await this.getESP32IP();
    if (!savedIP) {
      return { success: false, error: 'No saved IP' };
    }

    const isValid = await this.testDevice(savedIP);
    if (isValid) {
      return { success: true, ip: savedIP };
    }

    const scanResult = await this.scanForESP32();
    if (scanResult.success && scanResult.devices.length > 0) {
      const device = scanResult.devices[0];
      await this.saveESP32IP(device.ip);
      return { success: true, ip: device.ip };
    }

    return { success: false, error: 'No ESP32 found' };
  }
}

const wifiService = new WifiService();
export default wifiService;