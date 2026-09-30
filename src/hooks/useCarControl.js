import { useState, useCallback } from 'react';
import esp32Service from '../services/esp32Service';

export const useCarControl = () => {
  const [isSending, setIsSending] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [error, setError] = useState(null);

  const sendCarCommand = useCallback(async (commandFn, commandName, params = null) => {
    setIsSending(true);
    setError(null);
    setLastCommand({ name: commandName, params });

    console.log(`🎮 Car Command: ${commandName}`, params || '');

    try {
      const result = await commandFn();
      console.log(`📊 Result:`, result);
      
      setLastResponse(result);
      
      if (!result.success) {
        setError(result.error || 'Command failed');
      }
      
      return result;
    } catch (error) {
      console.log(`❌ Command error: ${error.message}`);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsSending(false);
    }
  }, []);

  const moveForward = useCallback(() => {
    return sendCarCommand(
      () => esp32Service.moveForward(),
      'moveForward'
    );
  }, [sendCarCommand]);

  const moveBackward = useCallback(() => {
    return sendCarCommand(
      () => esp32Service.moveBackward(),
      'moveBackward'
    );
  }, [sendCarCommand]);

  const moveLeft = useCallback(() => {
    return sendCarCommand(
      () => esp32Service.moveLeft(),
      'moveLeft'
    );
  }, [sendCarCommand]);

  const moveRight = useCallback(() => {
    return sendCarCommand(
      () => esp32Service.moveRight(),
      'moveRight'
    );
  }, [sendCarCommand]);

  const stopRobot = useCallback(() => {
    return sendCarCommand(
      () => esp32Service.stopRobot(),
      'stop'
    );
  }, [sendCarCommand]);

  const emergencyStop = useCallback(async () => {
    setIsSending(true);
    setError(null);
    setLastCommand({ name: 'emergencyStop' });

    console.log('🆘 EMERGENCY STOP!');

    try {
      // ✅ ESP32 Service ရဲ့ emergencyStop ကို သုံးပါ
      const results = await esp32Service.emergencyStop();
      console.log(`📊 Emergency Stop Results:`, results);
      setLastResponse(results);
      return { success: true, results };
    } catch (error) {
      console.log(`❌ Emergency stop error: ${error.message}`);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsSending(false);
    }
  }, []);

  const setDriveSpeed = useCallback((speed) => {
    return sendCarCommand(
      () => esp32Service.setDriveSpeed(speed),
      'setDriveSpeed',
      { speed }
    );
  }, [sendCarCommand]);

  // ✅ Optional: Connection check
  const checkConnection = useCallback(async () => {
    console.log('🔍 Checking ESP32 connection...');
    const result = await esp32Service.testConnection();
    console.log(`📊 Connection: ${result.success ? '✅ Connected' : '❌ Disconnected'}`);
    return result;
  }, []);

  return {
    isSending,
    lastCommand,
    lastResponse,
    error,
    moveForward,
    moveBackward,
    moveLeft,
    moveRight,
    stopRobot,
    emergencyStop,
    setDriveSpeed,
    checkConnection, 
  };
};