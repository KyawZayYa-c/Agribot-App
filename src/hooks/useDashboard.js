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
  const isMountedRef = useRef(true);

  // ===== Fetch today's work time from Firebase =====
  const fetchTodayWorkTime = useCallback(async () => {
    try {
      const result = await firebaseService.getTodayWorkTime();
      if (result && result.success) {
        setTodayWorkTime(result.data);
        setTelemetry(prev => ({
          ...prev,
          workingTime: result.data.formatted || '0h 0m',
        }));
        console.log(`✅ Today's work time: ${result.data.formatted}`);
      }
    } catch (error) {
      console.error('❌ Error fetching today work time:', error);
      // Don't set error here - it's not critical
    }
  }, []);

  // ===== Fetch data from ESP32 =====
  const fetchDashboardData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    if (!isConnected) {
      console.log('⏭️ Skipping fetch - not connected');
      return;
    }

    try {
      // ✅ Check if service methods exist before calling
      let batterySuccess = false;
      let statusSuccess = false;
      
      // Get battery status safely
      if (typeof esp32Service.getBatteryStatus === 'function') {
        try {
          const batteryResult = await esp32Service.getBatteryStatus();
          if (batteryResult && batteryResult.success) {
            setTelemetry(prev => ({
              ...prev,
              battery: batteryResult.data?.percentage || 0,
            }));
            batterySuccess = true;
            setErrorCount(0);
          }
        } catch (batteryErr) {
          console.warn('⚠️ Battery fetch failed:', batteryErr.message);
        }
      } else {
        console.warn('⚠️ getBatteryStatus method not available');
      }
      
      // Get status safely
      if (typeof esp32Service.getStatus === 'function') {
        try {
          const statusResult = await esp32Service.getStatus();
          if (statusResult && statusResult.success) {
            setIsConnected(true);
            setError(null);
            setErrorCount(0);
            statusSuccess = true;
          } else {
            // Only increment error count if we were previously connected
            setErrorCount(prev => prev + 1);
            if (errorCount >= 3) {
              setError('ESP32 not connected. Please check Settings.');
            }
          }
        } catch (statusErr) {
          console.warn('⚠️ Status fetch failed:', statusErr.message);
          setErrorCount(prev => prev + 1);
          if (errorCount >= 3) {
            setError('Cannot connect to ESP32. Please check connection.');
          }
        }
      } else {
        console.warn('⚠️ getStatus method not available');
        // If method doesn't exist, assume connected if we were before
        if (isConnected) {
          statusSuccess = true;
        }
      }

      // Only fetch work time if we have connection
      if (batterySuccess || statusSuccess || isConnected) {
        await fetchTodayWorkTime();
      }

    } catch (err) {
      console.error('❌ Fetch error:', err);
      // Don't set error state for every failure - only after multiple attempts
      setErrorCount(prev => prev + 1);
      if (errorCount >= 5) {
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
    
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);
    setErrorCount(0);
    setIsConnecting(true);
    
    console.log('🔍 Initializing Dashboard...');
    
    // Try to fetch work time even without ESP32 connection
    await fetchTodayWorkTime();
    
    try {
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
      
      // ✅ Check if autoConnect exists
      let result = { success: false, error: 'Method not available' };
      if (typeof esp32Service.autoConnect === 'function') {
        result = await esp32Service.autoConnect();
      } else {
        console.warn('⚠️ autoConnect method not available');
        // If autoConnect doesn't exist, try testConnection
        if (typeof esp32Service.testConnection === 'function') {
          const testResult = await esp32Service.testConnection();
          result = testResult;
        } else {
          // If no connection methods available, assume not connected
          setIsConnected(false);
          setError('ESP32 service not properly initialized');
        }
      }
      
      if (result && result.success) {
        console.log('✅ Connected to ESP32');
        setIsConnected(true);
        await fetchDashboardData();
      } else {
        console.log('❌ Connection failed:', result?.error || 'Unknown error');
        setIsConnected(false);
        setError(result?.error || 'Failed to connect to ESP32');
      }
      
    } catch (error) {
      console.error('❌ Init error:', error);
      setIsConnected(false);
      setError('Failed to initialize connection');
    }
    
    setLoading(false);
    setIsConnecting(false);
    setIsInitialized(true);
    initializedRef.current = true;
  }, [fetchDashboardData, fetchTodayWorkTime]);

  // ===== ✅ Auto initialize on mount =====
  useEffect(() => {
    isMountedRef.current = true;
    initializeDashboard();
    
    return () => {
      console.log('🧹 Cleaning up useDashboard...');
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      // ✅ Only disconnect if method exists
      if (typeof esp32Service.disconnect === 'function') {
        esp32Service.disconnect();
      }
    };
  }, [initializeDashboard]);

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