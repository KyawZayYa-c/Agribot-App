// hooks/useCamera.js
import { useState, useEffect, useRef, useCallback } from 'react';
import esp32Service from '../services/esp32Service';

export const useCamera = () => {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [videoStreamUrl, setVideoStreamUrl] = useState(null);
  
  const [panAngle, setPanAngle] = useState(90);
  const [tiltAngle, setTiltAngle] = useState(90);
  
  const checkIntervalRef = useRef(null);

  // ===== Camera Command Handler - FIXED =====
  const handleCameraCommand = useCallback(async (direction) => {
    console.log(`📷 Camera direction: ${direction}`);
    
    try {
      let newPan = panAngle;
      let newTilt = tiltAngle;
      let commandSent = false;
      
      switch (direction) {
        case 'up':
          // ⚠️ FIX: up ဆိုရင် pan left သွားရမယ်
          newPan = Math.max(0, panAngle - 10);
          if (newPan !== panAngle) {
            console.log(`📷 Up → Pan left: ${newPan}°`);
            const result = await esp32Service.setPanAngle(newPan);
            if (result.success) {
              setPanAngle(newPan);
              commandSent = true;
            }
          }
          break;
          
        case 'down':
          // ⚠️ FIX: down ဆိုရင် pan right သွားရမယ်
          newPan = Math.min(180, panAngle + 10);
          if (newPan !== panAngle) {
            console.log(`📷 Down → Pan right: ${newPan}°`);
            const result = await esp32Service.setPanAngle(newPan);
            if (result.success) {
              setPanAngle(newPan);
              commandSent = true;
            }
          }
          break;
          
        case 'left':
          // ⚠️ FIX: left ဆိုရင် tilt up သွားရမယ်
          newTilt = Math.min(170, tiltAngle + 10);
          if (newTilt !== tiltAngle) {
            console.log(`📷 Left → Tilt up: ${newTilt}°`);
            const result = await esp32Service.setTiltAngle(newTilt);
            if (result.success) {
              setTiltAngle(newTilt);
              commandSent = true;
            }
          }
          break;
          
        case 'right':
          // ⚠️ FIX: right ဆိုရင် tilt down သွားရမယ်
          newTilt = Math.max(10, tiltAngle - 10);
          if (newTilt !== tiltAngle) {
            console.log(`📷 Right → Tilt down: ${newTilt}°`);
            const result = await esp32Service.setTiltAngle(newTilt);
            if (result.success) {
              setTiltAngle(newTilt);
              commandSent = true;
            }
          }
          break;
          
        case 'stop':
          console.log('📷 Camera stop');
          break;
          
        default:
          console.log(`❌ Unknown camera command: ${direction}`);
      }
      
      if (commandSent) {
        console.log(`✅ Camera ${direction} command sent!`);
      }
      
    } catch (error) {
      console.error('❌ Camera command error:', error);
    }
  }, [panAngle, tiltAngle]);

  // ===== Get Camera Stream URL =====
  const getStreamUrl = useCallback(async () => {
    try {
      console.log('📷 Getting camera stream URL...');
      const url = await esp32Service.getCameraStreamURL();
      console.log('📷 Camera Stream URL result:', url);
      
      if (url) {
        setVideoStreamUrl(url);
        setVideoError(false);
        console.log('✅ Camera stream URL set successfully');
        return url;
      } else {
        console.log('⚠️ No Camera IP found - please set in Settings');
        setVideoError(true);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting stream URL:', error);
      setVideoError(true);
      return null;
    }
  }, []);

  // ===== Check Connection =====
  const checkConnection = useCallback(async () => {
    try {
      console.log('🔍 Checking ESP32 connection...');
      const result = await esp32Service.testConnection();
      console.log('📊 Connection result:', result.success);
      
      if (result.success) {
        setIsConnected(true);
        setVideoError(false);
        console.log('✅ ESP32 connected for camera');
        await getStreamUrl();
      } else {
        setIsConnected(false);
        setVideoError(true);
        console.log('❌ ESP32 not connected');
      }
    } catch (error) {
      setIsConnected(false);
      setVideoError(true);
      console.log('❌ Connection check failed:', error.message);
    } finally {
      setIsVideoLoading(false);
    }
  }, [getStreamUrl]);

  const resetServos = useCallback(async () => {
    console.log('🔄 Resetting servos to home position...');
    try {
      const result = await esp32Service.resetServos();
      if (result.success) {
        console.log('✅ Servos reset successfully!');
        setPanAngle(90);
        setTiltAngle(90);
        console.log('🎯 Pan: 90°, Tilt: 90°');
        return { success: true };
      } else {
        console.log('❌ Servos reset failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.log('❌ Reset servos error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const reloadVideo = useCallback(() => {
    console.log('🔄 Reloading video...');
    setIsVideoLoading(true);
    checkConnection();
    setTimeout(() => {
      setIsVideoLoading(false);
    }, 1000);
  }, [checkConnection]);

  const toggleVideoVisibility = useCallback(() => {
    setIsVideoVisible(prev => !prev);
  }, []);

  // ===== Effects =====
  useEffect(() => {
    checkConnection();
    
    checkIntervalRef.current = setInterval(checkConnection, 30000);
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkConnection]);

  return {
    isVideoLoading,
    videoError,
    isVideoVisible,
    isConnected,
    panAngle,
    tiltAngle,
    videoStreamUrl,
    resetServos,
    handleCameraCommand,
    reloadVideo,
    toggleVideoVisibility,
    checkConnection,
  };
};