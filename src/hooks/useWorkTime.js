import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WORK_SESSION: '@work_session',
  WORK_TIME: '@work_time',
};

export const useWorkTime = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [workTime, setWorkTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadWorkTime();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadWorkTime = async () => {
    try {
      const savedTime = await AsyncStorage.getItem(STORAGE_KEYS.WORK_TIME);
      const savedSession = await AsyncStorage.getItem(STORAGE_KEYS.WORK_SESSION);
      
      if (savedTime) {
        const parsedTime = parseInt(savedTime, 10);
        setWorkTime(parsedTime);
        console.log(`📂 Loaded work time: ${parsedTime}s`);
      } else {
        setWorkTime(0);
        console.log('📂 No saved work time, starting from 0');
      }
      
      if (savedSession === 'running') {
        await AsyncStorage.setItem(STORAGE_KEYS.WORK_SESSION, 'stopped');
        console.log('⏱️ Auto-resume prevented. Session set to stopped.');
      }
      
    } catch (error) {
      console.error('Error loading work time:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setWorkTime((prev) => {
        const newTime = prev + 1;
        if (newTime % 5 === 0) {
          AsyncStorage.setItem(STORAGE_KEYS.WORK_TIME, String(newTime));
        }
        return newTime;
      });
    }, 1000);
  };

  const startWork = async () => {
    console.log('⏱️ Work started!');
    setWorkTime(0);
    setIsRunning(true);
    await AsyncStorage.setItem(STORAGE_KEYS.WORK_TIME, '0');
    await AsyncStorage.setItem(STORAGE_KEYS.WORK_SESSION, 'running');
    startTimer();
  };

  const stopWork = async () => {
    console.log('⏱️ Work stopped!');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const currentTime = workTime;
    await AsyncStorage.setItem(STORAGE_KEYS.WORK_TIME, String(currentTime));
    await AsyncStorage.setItem(STORAGE_KEYS.WORK_SESSION, 'stopped');
    
    setIsRunning(false);
    console.log(`📊 Final work time saved: ${currentTime}s`);
  };

  // ✅ resetWork - တစ်ခါပဲသတ်မှတ်
  const resetWork = async () => {
    console.log('⏱️ Work reset!');
    setIsRunning(false);
    setWorkTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    await AsyncStorage.setItem(STORAGE_KEYS.WORK_TIME, '0');
    await AsyncStorage.setItem(STORAGE_KEYS.WORK_SESSION, 'stopped');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getMinutes = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  return {
    isRunning,
    workTime,
    isLoading,
    startWork,
    stopWork,
    resetWork,  
    formatTime,
    getMinutes,
  };
};