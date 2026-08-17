// hooks/useDashboard.js
import { useState, useEffect, useCallback, useRef } from 'react';
import esp32Service from '../services/esp32Service';
import firebaseService from '../services/firebaseService';

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [todayWorkTime, setTodayWorkTime] = useState({
    totalSeconds: 0,
    hours: 0,
    minutes: 0,
    formatted: '0h 0m',
  });
  const [telemetry, setTelemetry] = useState({
    battery: 0,
    seedLevel: 75,
    distance: 0,
    workingTime: '00:00',
  });
  
  const initializedRef = useRef(false);
  const refreshIntervalRef = useRef(null);

  // ===== Fetch today's work time from Firebase =====
  const fetchTodayWorkTime = useCallback(async () => {
    try {
      const result = await firebaseService.getTodayWorkTime();
      if (result.success) {
        setTodayWorkTime(result.data);
        setTelemetry(prev => ({
          ...prev,
          workingTime: result.data.formatted,
        }));
        console.log(`✅ Today's work time: ${result.data.formatted}`);
      }
    } catch (error) {
      console.error('❌ Error fetching today work time:', error);
    }
  }, []);

  // ===== Fetch data from ESP32 =====
  const fetchDashboardData = useCallback(async () => {
    if (!isConnected) {
      console.log('⏭️ Skipping fetch - not connected');
      return;
    }

    try {
      const batteryResult = await esp32Service.getBatteryStatus();
      if (batteryResult.success) {
        setTelemetry(prev => ({
          ...prev,
          battery: batteryResult.data.percentage || 0,
        }));
        setErrorCount(0);
      } else {
        setErrorCount(prev => prev + 1);
      }

      const statusResult = await esp32Service.getStatus();
      if (statusResult.success) {
        setIsConnected(true);
        setError(null);
        setErrorCount(0);
      } else {
        setIsConnected(false);
        setErrorCount(prev => prev + 1);
        if (errorCount >= 3) {
          setError('ESP32 not connected. Please check Settings.');
        }
      }

      await fetchTodayWorkTime();

    } catch (err) {
      console.error('Fetch error:', err);
      setErrorCount(prev => prev + 1);
      if (errorCount >= 3) {
        setError('Cannot connect to ESP32. Please check connection.');
      }
    }
  }, [fetchTodayWorkTime, errorCount, isConnected]);

  // ===== Initialize dashboard =====
  const initializeDashboard = useCallback(async () => {
    if (initializedRef.current) {
      console.log('⏭️ Dashboard already initialized, skipping...');
      return;
    }
    
    setLoading(true);
    setError(null);
    setErrorCount(0);
    setIsConnecting(true);
    
    console.log('🔍 Initializing Dashboard...');
    
    await fetchTodayWorkTime();
    
    const savedIP = await esp32Service.getSavedIP();
    if (!savedIP) {
      console.log('⚠️ No saved IP found');
      setIsConnected(false);
      setError('Please set ESP32 IP in Settings');
      setLoading(false);
      setIsConnecting(false);
      setIsInitialized(true);
      initializedRef.current = true;
      return;
    }
    
    console.log(`📡 Connecting to ${savedIP}...`);
    const result = await esp32Service.autoConnect();
    
    if (result.success) {
      console.log('✅ Connected to ESP32');
      setIsConnected(true);
      await fetchDashboardData();
    } else {
      console.log('❌ Connection failed:', result.error);
      setIsConnected(false);
      setError(result.error || 'Failed to connect to ESP32');
    }
    
    setLoading(false);
    setIsConnecting(false);
    setIsInitialized(true);
    initializedRef.current = true;
  }, [fetchDashboardData, fetchTodayWorkTime]);

  // ===== ✅ Auto initialize on mount =====
  useEffect(() => {
    initializeDashboard();
    
    return () => {
      console.log('🧹 Cleaning up useDashboard...');
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      esp32Service.disconnect();
    };
  }, [initializeDashboard]); // ✅ ဒီမှာ initializeDashboard ကိုခေါ်

  // ===== Auto refresh every 30 seconds =====
  useEffect(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    if (!isConnected || !isInitialized) {
      console.log('⏸️ Auto-refresh paused');
      return;
    }

    console.log('🔄 Starting auto-refresh (every 30s)');
    
    refreshIntervalRef.current = setInterval(() => {
      console.log('🔄 Refreshing dashboard data...');
      fetchDashboardData();
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        console.log('⏹️ Stopping auto-refresh');
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [isConnected, isInitialized, fetchDashboardData]);

  return {
    loading,
    isConnected,
    isConnecting,
    telemetry,
    todayWorkTime,
    error,
    isInitialized,
    refreshData: fetchDashboardData,
    initializeDashboard,
  };
};