import React, { createContext, useState, useContext, useEffect } from 'react';
import wifiService from '../services/wifiService';
import esp32Service from '../services/esp32Service';

const WifiContext = createContext();

export const WifiProvider = ({ children }) => {
  const [isWifiConnected, setIsWifiConnected] = useState(false);
  const [wifiInfo, setWifiInfo] = useState(null);
  const [esp32IP, setEsp32IP] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [autoConnect, setAutoConnect] = useState(true);
  const [scannedDevices, setScannedDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  // Initialize
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      // Get auto connect setting
      const auto = await wifiService.getAutoConnect();
      setAutoConnect(auto);

      // Get saved IP
      const savedIP = await wifiService.getESP32IP();
      if (savedIP) {
        setEsp32IP(savedIP);
      }

      // Check WiFi connection
      const wifiConnected = await wifiService.isWifiConnected();
      setIsWifiConnected(wifiConnected);
      if (wifiConnected) {
        const info = await wifiService.getCurrentWifiInfo();
        setWifiInfo(info);
      }

      // Auto connect if enabled
      if (auto && wifiConnected) {
        await autoConnectToESP32();
      }
    } catch (error) {
      console.error('Init error:', error);
      setError(error.message);
    }
  };

  // Auto connect to ESP32
  const autoConnectToESP32 = async () => {
    if (!isWifiConnected) {
      setError('Not connected to WiFi');
      return { success: false };
    }

    try {
      const result = await wifiService.autoConnect();
      if (result.success) {
        setEsp32IP(result.ip);
        setIsConnected(true);
        await esp32Service.setIPAddress(result.ip);
        setError(null);
        return { success: true, ip: result.ip };
      } else {
        setError(result.error);
        setIsConnected(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      setIsConnected(false);
      return { success: false, error: error.message };
    }
  };

  // Manual connect with IP
  const manualConnect = async (ip) => {
    if (!isWifiConnected) {
      setError('Not connected to WiFi');
      return { success: false };
    }

    try {
      // Validate IP format
      if (!ip || !ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
        setError('Invalid IP address');
        return { success: false, error: 'Invalid IP' };
      }

      // Test connection
      const isValid = await wifiService.testDevice(ip);
      if (isValid) {
        setEsp32IP(ip);
        setIsConnected(true);
        await wifiService.saveESP32IP(ip);
        await esp32Service.setIPAddress(ip);
        setError(null);
        
        // Add to scanned history
        const history = await wifiService.getScannedIPs();
        if (!history.includes(ip)) {
          history.unshift(ip);
          await wifiService.saveScannedIPs(history.slice(0, 20));
        }
        
        return { success: true, ip };
      } else {
        setError('No ESP32 found at this IP');
        setIsConnected(false);
        return { success: false, error: 'No ESP32 found' };
      }
    } catch (error) {
      setError(error.message);
      setIsConnected(false);
      return { success: false, error: error.message };
    }
  };

  // Scan for ESP32 devices
  const scanDevices = async () => {
    if (!isWifiConnected) {
      setError('Not connected to WiFi');
      return { success: false };
    }

    setIsScanning(true);
    try {
      const result = await wifiService.scanForESP32();
      if (result.success) {
        setScannedDevices(result.devices);
        setError(null);
        return result;
      } else {
        setError(result.error);
        return { success: false };
      }
    } catch (error) {
      setError(error.message);
      return { success: false };
    } finally {
      setIsScanning(false);
    }
  };

  // Toggle auto connect
  const toggleAutoConnect = async (enabled) => {
    setAutoConnect(enabled);
    await wifiService.setAutoConnect(enabled);
  };

  // Refresh WiFi status
  const refreshWifiStatus = async () => {
    const wifiConnected = await wifiService.isWifiConnected();
    setIsWifiConnected(wifiConnected);
    if (wifiConnected) {
      const info = await wifiService.getCurrentWifiInfo();
      setWifiInfo(info);
    }
    return wifiConnected;
  };

  // Disconnect ESP32
  const disconnectESP32 = () => {
    setIsConnected(false);
    esp32Service.disconnect();
  };

  return (
    <WifiContext.Provider
      value={{
        isWifiConnected,
        wifiInfo,
        esp32IP,
        isConnected,
        autoConnect,
        scannedDevices,
        isScanning,
        error,
        autoConnectToESP32,
        manualConnect,
        scanDevices,
        toggleAutoConnect,
        refreshWifiStatus,
        disconnectESP32,
        setError,
      }}
    >
      {children}
    </WifiContext.Provider>
  );
};

export const useWifi = () => useContext(WifiContext);