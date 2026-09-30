import { useState, useEffect, useCallback } from 'react';
import esp32Service from '../services/esp32Service';
import firebaseService from '../services/firebaseService';

export const useRobot = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [batteryStatus, setBatteryStatus] = useState({
    voltage: 0,
    percentage: 0,
    isCharging: false,
  });
  const [lastCommand, setLastCommand] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      
      await firebaseService.initialize();
      
      // Start session
      await firebaseService.startSession();
      
      // Auto connect to ESP32
      const result = await esp32Service.autoConnect();
      setIsConnected(result.success);
      
      if (result.success) {
        // Get initial battery status
        await refreshBatteryStatus();
      }
      
      setIsLoading(false);
    };
    
    init();
    
    // Cleanup
    return () => {
      esp32Service.disconnect();
      firebaseService.endSession();
    };
  }, []);

  // Refresh battery status
  const refreshBatteryStatus = useCallback(async () => {
    const result = await esp32Service.getBatteryStatus();
    if (result.success) {
      setBatteryStatus(result.data);
      
      // Log to Firebase
      await firebaseService.logBatteryStatus(result.data);
    }
    return result;
  }, []);

  // Send command with logging
  const sendCommand = useCallback(async (commandFn, commandName, params = null) => {
    setError(null);
    
    try {
      const result = await commandFn();
      
      // Log command
      await firebaseService.logCommand(commandName, params, result);
      
      setLastCommand({ name: commandName, params, result });
      
      // Refresh battery after commands
      setTimeout(refreshBatteryStatus, 1000);
      
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, [refreshBatteryStatus]);

  // Individual command wrappers with logging
  const commands = {
    moveForward: () => sendCommand(
      () => esp32Service.moveForward(),
      'moveForward'
    ),
    moveBackward: () => sendCommand(
      () => esp32Service.moveBackward(),
      'moveBackward'
    ),
    moveLeft: () => sendCommand(
      () => esp32Service.moveLeft(),
      'moveLeft'
    ),
    moveRight: () => sendCommand(
      () => esp32Service.moveRight(),
      'moveRight'
    ),
    stop: () => sendCommand(
      () => esp32Service.stopRobot(),
      'stop'
    ),
    setDriveSpeed: (speed) => sendCommand(
      () => esp32Service.setDriveSpeed(speed),
      'setDriveSpeed',
      { speed }
    ),
    setPump: (state) => sendCommand(
      () => esp32Service.setPump(state),
      'setPump',
      { state }
    ),
    setGear: (state) => sendCommand(
      () => esp32Service.setGear(state),
      'setGear',
      { state }
    ),
    setGearSpeed: (speed) => sendCommand(
      () => esp32Service.setGearSpeed(speed),
      'setGearSpeed',
      { speed }
    ),
    setPan: (angle) => sendCommand(
      () => esp32Service.setPanAngle(angle),
      'setPan',
      { angle }
    ),
    setTilt: (angle) => sendCommand(
      () => esp32Service.setTiltAngle(angle),
      'setTilt',
      { angle }
    ),
    setRake: (angle) => sendCommand(
      () => esp32Service.setRakeAngle(angle),
      'setRake',
      { angle }
    ),
    emergencyStop: () => sendCommand(
      () => esp32Service.emergencyStop(),
      'emergencyStop'
    ),
  };

  // Manual IP setting
  const setIPAddress = useCallback(async (ip) => {
    setIsLoading(true);
    const result = await esp32Service.setIPAddress(ip);
    setIsConnected(result.success);
    if (result.success) {
      await refreshBatteryStatus();
    }
    setIsLoading(false);
    return result;
  }, [refreshBatteryStatus]);

  // Reconnect
  const reconnect = useCallback(async () => {
    setIsLoading(true);
    const result = await esp32Service.autoConnect();
    setIsConnected(result.success);
    if (result.success) {
      await refreshBatteryStatus();
    }
    setIsLoading(false);
    return result;
  }, [refreshBatteryStatus]);

  return {
    // State
    isConnected,
    isLoading,
    batteryStatus,
    lastCommand,
    error,
    
    // Commands
    ...commands,
    
    // Utils
    setIPAddress,
    reconnect,
    refreshBatteryStatus,
  };
};