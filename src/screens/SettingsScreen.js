// src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import esp32Service from '../services/esp32Service';
import wifiService from '../services/wifiService';

const STORAGE_KEYS = {
  ESP_IP: '@esp_ip',
  CAMERA_IP: '@camera_ip',
  AUTO_CONNECT: '@auto_connect',
};

const SettingsScreen = ({ navigation }) => {
  const [espIP, setEspIP] = useState('10.248.244.165');
  const [cameraIP, setCameraIP] = useState('10.248.244.99');
  const [manualIP, setManualIP] = useState('');
  const [manualCameraIP, setManualCameraIP] = useState('');
  const [autoConnect, setAutoConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraConnected, setIsCameraConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info');

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const showModal = (title, message, type = 'info') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // ================= LOAD SETTINGS =================
  // const loadSettings = async () => {
  //   console.log('📂 Loading settings...');
  //   try {
  //     const savedIP = await AsyncStorage.getItem(STORAGE_KEYS.ESP_IP);
  //     const savedCameraIP = await AsyncStorage.getItem(STORAGE_KEYS.CAMERA_IP);
  //     const auto = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_CONNECT);
      
  //     console.log('📂 Saved ESP IP:', savedIP);
  //     console.log('📂 Saved Camera IP:', savedCameraIP);
  //     console.log('📂 Auto Connect:', auto);
      
  //     if (savedIP) {
  //       setEspIP(savedIP);
  //       setManualIP(savedIP);
  //       console.log(`🔄 Checking connection for saved IP: ${savedIP}`);
  //       await testConnection(savedIP);
  //     }
      
  //     if (savedCameraIP) {
  //       setCameraIP(savedCameraIP);
  //       setManualCameraIP(savedCameraIP);
  //       console.log(`🔄 Checking camera connection for saved IP: ${savedCameraIP}`);
  //       await testCameraConnection(savedCameraIP);
  //     }
      
  //     if (auto !== null) {
  //       setAutoConnect(JSON.parse(auto));
  //     }
  //   } catch (error) {
  //     console.error('❌ Error loading settings:', error);
  //   }
  // };

  // src/screens/SettingsScreen.js

const loadSettings = async () => {
  console.log('📂 Loading settings...');
  try {
    const savedIP = await AsyncStorage.getItem(STORAGE_KEYS.ESP_IP);
    const savedCameraIP = await AsyncStorage.getItem(STORAGE_KEYS.CAMERA_IP);
    const auto = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_CONNECT);
    
    console.log('📂 Saved ESP IP:', savedIP);
    console.log('📂 Saved Camera IP:', savedCameraIP);
    console.log('📂 Auto Connect:', auto);
    
    const isAutoOn = auto !== null ? JSON.parse(auto) : true;
    setAutoConnect(isAutoOn);
    
    if (savedIP) {
      setEspIP(savedIP);
      setManualIP(savedIP);
      
      // ✅ Auto Connect ဖွင့်ထားမှသာ connection စစ်ပါ
      if (isAutoOn) {
        console.log(`🔄 Checking connection for saved IP: ${savedIP}`);
        await testConnection(savedIP);
      } else {
        console.log(`⏸️ Auto Connect is off, skipping ESP connection check`);
      }
    }
    
    if (savedCameraIP) {
      setCameraIP(savedCameraIP);
      setManualCameraIP(savedCameraIP);
      
      // ✅ Auto Connect ဖွင့်ထားမှသာ camera connection စစ်ပါ
      if (isAutoOn) {
        console.log(`🔄 Checking camera connection for saved IP: ${savedCameraIP}`);
        await testCameraConnection(savedCameraIP);
      } else {
        console.log(`⏸️ Auto Connect is off, skipping camera connection check`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error loading settings:', error);
  }
};

  // ================= TEST CONNECTION =================
  // const testConnection = async (ip) => {
  //   console.log(`🔍 Testing connection to: http://${ip}/status`);
  //   console.log(`⏱️ Timeout: 3000ms`);
    
  //   try {
  //     const startTime = Date.now();
  //     const response = await fetch(`http://${ip}/status`, {
  //       method: 'GET',
  //       timeout: 3000,
  //     });
  //     const elapsedTime = Date.now() - startTime;
      
  //     console.log(`📡 Response status: ${response.status}`);
  //     console.log(`⏱️ Response time: ${elapsedTime}ms`);
      
  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log('✅ Connection successful! Data:', data);
  //       console.log(`   • Status: ${data.status}`);
  //       console.log(`   • IP: ${data.ip}`);
  //       console.log(`   • Battery: ${data.batteryPercentage || 0}%`);
  //       setIsConnected(true);
  //       setError('');
  //       return true;
  //     } else {
  //       console.log(`❌ Connection failed with status: ${response.status}`);
  //       setIsConnected(false);
  //       return false;
  //     }
  //   } catch (error) {
  //     console.log('❌ Connection error:', error.message);
  //     console.log('💡 Possible reasons:');
  //     console.log('   • ESP32 is powered off');
  //     console.log('   • Wrong IP address');
  //     console.log('   • Different WiFi network');
  //     setIsConnected(false);
  //     return false;
  //   }
  // };

  
const testConnection = async (ip) => {
  const url = `http://${ip}/status`;

  console.log(`🔍 Testing connection to: ${url}`);
  console.log(`⏱️ Timeout: 5000ms`);

  try {
    const startTime = Date.now();

    // React Native fetch အတွက် timeout ကို Promise.race နဲ့လုပ်
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection timeout after 5 seconds'));
      }, 5000);
    });

    const fetchPromise = fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const response = await Promise.race([
      fetchPromise,
      timeoutPromise,
    ]);

    const elapsedTime = Date.now() - startTime;

    console.log(`📡 Response status: ${response.status}`);
    console.log(`⏱️ Response time: ${elapsedTime}ms`);

    if (response.ok) {
      const data = await response.json();

      console.log('✅ Connection successful!');
      console.log('📦 Data:', data);

      setIsConnected(true);
      setError('');

      return true;
    }

    // HTTP Error
    const errorMessage =
      `HTTP Error: ${response.status}\n\n` +
      `URL: ${url}\n\n` +
      `ESP32 returned an error response.`;

    console.log('❌', errorMessage);

    setIsConnected(false);
    setError(errorMessage);

    showModal(
      'ESP32 Connection Error',
      errorMessage,
      'error'
    );

    return false;

  } catch (error) {

    console.log('❌ Connection error:', error);
    console.log('❌ Error message:', error?.message);
    console.log('❌ Error name:', error?.name);

    let errorMessage = '';

    if (error?.message?.includes('timeout')) {

      errorMessage =
        `Connection Timeout\n\n` +
        `URL: ${url}\n\n` +
        `ESP32 did not respond within 5 seconds.\n\n` +
        `Possible reasons:\n` +
        `• ESP32 is powered off\n` +
        `• Wrong IP address\n` +
        `• Phone and ESP32 are on different WiFi\n` +
        `• ESP32 web server is not running`;

    } else if (
      error?.message?.includes('Network request failed')
    ) {

      errorMessage =
        `Network Request Failed\n\n` +
        `URL: ${url}\n\n` +
        `Possible reasons:\n` +
        `• Android blocked HTTP connection\n` +
        `• Wrong IP address\n` +
        `• Different WiFi network\n` +
        `• ESP32 is unreachable\n` +
        `• ESP32 web server is not running`;

    } else {

      errorMessage =
        `Unknown Connection Error\n\n` +
        `URL: ${url}\n\n` +
        `Name: ${error?.name || 'Unknown'}\n` +
        `Message: ${error?.message || 'Unknown error'}`;
    }

    setIsConnected(false);
    setError(errorMessage);

    // 🔥 ဒီနေရာမှာ Modal ပြမယ်
    showModal(
      'ESP32 Connection Failed',
      errorMessage,
      'error'
    );

    return false;
  }
};


// ================= TEST CAMERA CONNECTION =================
const testCameraConnection = async (ip) => {
  console.log(`🔍 Testing camera connection to: http://${ip}/status`);
  
  try {
    // ✅ React Native အတွက် timeout ကို Promise.race နဲ့ လုပ်ပါ
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 3000);
    });
    
    const fetchPromise = fetch(`http://${ip}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    // ✅ Promise.race - ဘယ်ဟာက အရင်ပြီးမလဲ
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    console.log(`📡 Camera response status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Camera connection successful!');
      setIsCameraConnected(true);
      setCameraError('');
      return true;
    } else if (response.status === 404) {
      console.log('❌ Camera status not found (404)');
      setCameraError('Camera status not found at this IP');
      setIsCameraConnected(false);
      return false;
    } else {
      console.log(`❌ Camera connection failed with status: ${response.status}`);
      setIsCameraConnected(false);
      return false;
    }
  } catch (error) {
    console.log('❌ Camera connection error:', error.message);
    
    if (error.message.includes('timeout')) {
      setCameraError('Connection timeout - please try again');
    } else if (error.message.includes('Network request failed')) {
      setCameraError('Device not reachable. Check IP and WiFi.');
    } else {
      setCameraError(error.message);
    }
    setIsCameraConnected(false);
    return false;
  }
};
  // ================= SAVE CAMERA IP =================
  const handleSaveCameraIP = async () => {
    console.log('📝 Manual Camera IP input:', manualCameraIP);
    
    if (!manualCameraIP) {
      showModal('Error', 'Please enter a Camera IP address', 'error');
      return;
    }

    if (!manualCameraIP.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      showModal('Error', 'Invalid IP address format', 'error');
      return;
    }

    console.log('✅ Camera IP format valid:', manualCameraIP);
    setIsLoadingCamera(true);
    setCameraError('');

    try {
      console.log(`🔄 Testing camera connection to ${manualCameraIP}...`);
      const connected = await testCameraConnection(manualCameraIP);
      console.log(`📊 Camera connection result: ${connected ? 'SUCCESS' : 'FAILED'}`);
      
      if (connected) {
        await AsyncStorage.setItem(STORAGE_KEYS.CAMERA_IP, manualCameraIP);
        setCameraIP(manualCameraIP);
        setIsCameraConnected(true);
        await esp32Service.setCameraIPAddress(manualCameraIP);
        console.log('✅ Camera IP saved successfully!');
        showModal('Success', `✅ Connected to Camera at ${manualCameraIP}`, 'success');
      } else {
        setCameraError('Cannot connect to Camera at this IP');
        showModal(
          'Connection Failed',
          'No Camera found at this IP address.\n\nMake sure:\n• Camera is powered on\n• Same WiFi network\n• IP address is correct',
          'error'
        );
      }
    } catch (error) {
      console.log('❌ Save Camera IP error:', error.message);
      setCameraError(error.message);
      showModal('Error', 'Failed to connect to Camera', 'error');
    } finally {
      setIsLoadingCamera(false);
    }
  };

  // ================= QUICK CONNECT BUTTONS =================
  const quickIPs = ['10.248.244.165', '10.11.128.165'];

  // const handleQuickConnect = async (ip) => {
  //   console.log(`📡 Quick connect to: ${ip}`);
  //   setManualIP(ip);
  //   setIsLoading(true);
  //   try {
  //     const connected = await testConnection(ip);
  //     if (connected) {
  //       await AsyncStorage.setItem(STORAGE_KEYS.ESP_IP, ip);
  //       setEspIP(ip);
  //       setIsConnected(true);
  //       console.log('✅ Quick connect successful!');
  //       showModal('Success', `✅ Connected to ESP32 at ${ip}`, 'success');
  //     } else {
  //       showModal('Connection Failed', `Cannot connect to ${ip}`, 'error');
  //     }
  //   } catch (error) {
  //     showModal('Error', error.message, 'error');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // ================= SAVE IP =================
  // const handleSaveIP = async () => {
  //   console.log('📝 Manual IP input:', manualIP);
    
  //   if (!manualIP) {
  //     showModal('Error', 'Please enter an IP address', 'error');
  //     return;
  //   }

  //   if (!manualIP.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
  //     showModal('Error', 'Invalid IP address format', 'error');
  //     return;
  //   }

  //   console.log('✅ IP format valid:', manualIP);
  //   setIsLoading(true);
  //   setError('');

  //   try {
  //     console.log(`🔄 Testing connection to ${manualIP}...`);
  //     const connected = await testConnection(manualIP);
  //     console.log(`📊 Connection result: ${connected ? 'SUCCESS' : 'FAILED'}`);
      
  //     if (connected) {
  //       await AsyncStorage.setItem(STORAGE_KEYS.ESP_IP, manualIP);
  //       setEspIP(manualIP);
  //       setIsConnected(true);
  //       console.log('✅ IP saved successfully!');
  //       showModal('Success', `Connected to ESP32 at ${manualIP}`, 'success');
  //     } else {
  //       setError('Cannot connect to ESP32 at this IP');
  //       console.log('❌ Failed to connect to ESP32');
  //       showModal(
  //         'Connection Failed',
  //         'No ESP32 found at this IP address\n\nMake sure:\n• ESP32 is powered on\n• Same WiFi network\n• IP address is correct',
  //         'error'
  //       );
  //     }
  //   } catch (error) {
  //     console.log('❌ Save IP error:', error.message);
  //     setError(error.message);
  //     showModal('Error', 'Failed to connect', 'error');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const handleQuickConnect = async (ip) => {
  console.log(`📡 Quick connect to: ${ip}`);

  setManualIP(ip);
  setIsLoading(true);

  try {
    const connected = await testConnection(ip);

    if (connected) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ESP_IP,
        ip
      );

      setEspIP(ip);
      setIsConnected(true);

      console.log('✅ Quick connect successful!');

      showModal(
        'Success',
        `Connected to ESP32 at ${ip}`,
        'success'
      );
    }

    // ❗ false ဖြစ်ရင် testConnection()
    // က detailed Modal ပြပြီးသား

  } catch (error) {

    showModal(
      'Error',
      error?.message || 'Failed to connect',
      'error'
    );

  } finally {
    setIsLoading(false);
  }
};

  const handleSaveIP = async () => {
  console.log('📝 Manual IP input:', manualIP);

  if (!manualIP) {
    showModal(
      'Error',
      'Please enter an IP address',
      'error'
    );
    return;
  }

  if (!manualIP.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
    showModal(
      'Error',
      'Invalid IP address format',
      'error'
    );
    return;
  }

  console.log('✅ IP format valid:', manualIP);

  setIsLoading(true);
  setError('');

  try {
    console.log(`🔄 Testing connection to ${manualIP}...`);

    const connected = await testConnection(manualIP);

    console.log(
      `📊 Connection result: ${connected ? 'SUCCESS' : 'FAILED'}`
    );

    if (connected) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ESP_IP,
        manualIP
      );

      setEspIP(manualIP);
      setIsConnected(true);

      console.log('✅ IP saved successfully!');

      showModal(
        'Success',
        `Connected to ESP32 at ${manualIP}`,
        'success'
      );
    }

    // ❗ connected === false ဖြစ်ရင်
    // testConnection() က error Modal ကို ပြပြီးသားဖြစ်လို့
    // ဒီနေရာမှာ Modal ထပ်မပြတော့ဘူး။

  } catch (error) {

    console.log(
      '❌ Save IP error:',
      error?.message
    );

    setError(error?.message || 'Failed to connect');

    showModal(
      'Error',
      error?.message || 'Failed to connect to ESP32',
      'error'
    );

  } finally {
    setIsLoading(false);
  }
};

  // ================= AUTO CONNECT TOGGLE =================
  const handleAutoConnectToggle = async (value) => {
    setAutoConnect(value);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_CONNECT, JSON.stringify(value));
    await esp32Service.setAutoConnect(value);
    
    if (!value) {
      esp32Service.stopConnectionCheck();
      console.log('⏸️ Auto Connect disabled, stopped checking');
    } else {
      console.log('▶️ Auto Connect enabled');
    }
  };

  // ================= CLEAR SETTINGS =================
  const handleClearSettings = () => {
    showModal(
      '⚠️ Clear Settings',
      'Are you sure you want to clear all settings?',
      'warning'
    );
  };

  const confirmClearSettings = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.ESP_IP);
    await AsyncStorage.removeItem(STORAGE_KEYS.CAMERA_IP);
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTO_CONNECT);
    setEspIP('');
    setManualIP('');
    setCameraIP('');
    setManualCameraIP('');
    setIsConnected(false);
    setIsCameraConnected(false);
    closeModal();
    showModal('Success', 'Settings cleared successfully', 'success');
  };

  // ================= REFRESH CONNECTION =================
  // const handleRefreshConnection = async () => {
  //   console.log('🔄 Refresh connection requested');
  //   if (espIP) {
  //     console.log(`🔄 Testing saved IP: ${espIP}`);
  //     setIsLoading(true);
  //     const connected = await testConnection(espIP);
  //     setIsLoading(false);
  //     console.log(`📊 Refresh result: ${connected ? '✅ Connected' : '❌ Disconnected'}`);
  //     if (connected) {
  //       showModal('Success', 'Connected to ESP32', 'success');
  //     } else {
  //       showModal(
  //         'Failed',
  //         `Cannot connect to ESP32 at ${espIP}\n\nMake sure:\n• ESP32 is powered on\n• Same WiFi network`,
  //         'error'
  //       );
  //     }
  //   } else {
  //     showModal('Error', 'No saved IP address', 'error');
  //   }
  // };

const handleRefreshConnection = async () => {
  console.log('🔄 Refresh connection requested');

  if (!espIP) {
    showModal(
      'Error',
      'No saved ESP32 IP address',
      'error'
    );
    return;
  }

  console.log(`🔄 Testing saved IP: ${espIP}`);

  setIsLoading(true);

  try {
    const connected = await testConnection(espIP);

    console.log(
      `📊 Refresh result: ${connected ? '✅ Connected' : '❌ Disconnected'}`
    );

    if (connected) {
      showModal(
        'Success',
        `Connected to ESP32 at ${espIP}`,
        'success'
      );
    }

    // connected === false ဖြစ်ရင်
    // testConnection() က detailed error Modal ပြပြီးသားပါ။

  } catch (error) {
    console.log('❌ Refresh error:', error?.message);

    showModal(
      'Refresh Failed',
      error?.message || 'Failed to connect to ESP32',
      'error'
    );

  } finally {
    setIsLoading(false);
  }
};

  // ================= SCAN FOR ESP32 =================
  const handleScanDevices = async () => {
    console.log('🔍 Starting ESP32 scan...');
    setIsScanning(true);
    setError('');
    
    try {
      console.log('🔍 Scanning network for ESP32 devices...');
      console.log('⏳ This may take 10-30 seconds...');
      
      const result = await wifiService.scanForESP32();
      
      console.log(`📊 Scan completed! Found ${result.devices?.length || 0} device(s)`);
      console.log('📋 Device list:', result.devices);
      
      if (result.success && result.devices.length > 0) {
        const deviceList = result.devices.map((d, i) => 
          `${i+1}. ${d.name} (${d.ip})`
        ).join('\n');
        
        console.log('✅ Devices found:');
        result.devices.forEach(d => console.log(`   • ${d.name} - ${d.ip}`));
        
        const firstDevice = result.devices[0];
        console.log(`🔄 Auto-connecting to first device: ${firstDevice.ip}`);
        setManualIP(firstDevice.ip);
        
        showModal(
          '📡 Devices Found',
          `Found ${result.devices.length} device(s):\n\n${deviceList}\n\n✅ Auto-connecting to ${firstDevice.ip}...`,
          'info'
        );
        
        await handleSaveIPFromScan(firstDevice.ip);
      } else {
        console.log('❌ No ESP32 devices found on the network');
        showModal(
          'No Devices Found',
          'No ESP32 devices found on the network.\n\nMake sure:\n• ESP32 is powered on\n• Phone and ESP32 are on same WiFi\n• ESP32 web server is running',
          'warning'
        );
      }
    } catch (error) {
      console.error('❌ Scan error:', error);
      showModal('Scan Failed', error.message, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveIPFromScan = async (ip) => {
    console.log(`📡 Connecting to scanned IP: ${ip}`);
    setManualIP(ip);
    setIsLoading(true);
    try {
      const connected = await testConnection(ip);
      if (connected) {
        await AsyncStorage.setItem(STORAGE_KEYS.ESP_IP, ip);
        setEspIP(ip);
        setIsConnected(true);
        showModal('Success', `✅ Connected to ESP32 at ${ip}`, 'success');
      } else {
        showModal('Connection Failed', `Cannot connect to ${ip}`, 'error');
      }
    } catch (error) {
      showModal('Error', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/field_background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlayLayer}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageTitle}>⚙️ Settings</Text>

            {/* ESP32 Connection Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🤖 ESP32 Connection</Text>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={[styles.statusValue, isConnected ? styles.statusConnected : styles.statusDisconnected]}>
                  {isConnected ? '✅ Connected' : '❌ Disconnected'}
                </Text>
              </View>

              {espIP && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Current IP:</Text>
                  <Text style={styles.statusValue}>{espIP}</Text>
                </View>
              )}

              <View style={styles.divider} />

              <Text style={styles.label}>Manual IP Address</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter IP (e.g. 192.168.1.15)"
                  value={manualIP}
                  onChangeText={setManualIP}
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSaveIP}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>

              {error ? (
                <Text style={styles.errorText}>⚠️ {error}</Text>
              ) : null}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.refreshButton, isLoading && styles.buttonDisabled]}
                  onPress={handleRefreshConnection}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>🔄 Refresh</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Connect Buttons */}
              <View style={styles.quickConnectRow}>
                {quickIPs.map((ip) => (
                  <TouchableOpacity
                    key={ip}
                    style={styles.quickButton}
                    onPress={() => handleQuickConnect(ip)}
                    disabled={isLoading}
                  >
                    <Text style={styles.quickButtonText}>{ip}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Scan Button */}
              <TouchableOpacity
                style={[styles.scanButton, isScanning && styles.scanButtonActive]}
                onPress={handleScanDevices}
                disabled={isScanning}
                activeOpacity={0.8}
              >
                {isScanning ? (
                  <View style={styles.scanButtonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.scanButtonText}> Scanning...</Text>
                  </View>
                ) : (
                  <Text style={styles.scanButtonText}>🔍 Scan for ESP32</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Camera Card */}
            <View style={[styles.card, styles.cameraCard]}>
              <Text style={[styles.cardTitle, styles.cameraCardTitle]}>📷 Camera</Text>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={[styles.statusValue, isCameraConnected ? styles.statusConnected : styles.statusDisconnected]}>
                  {isCameraConnected ? '✅ Connected' : '❌ Disconnected'}
                </Text>
              </View>

              {cameraIP && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Current IP:</Text>
                  <Text style={styles.statusValue}>{cameraIP}</Text>
                </View>
              )}

              <View style={styles.divider} />

              <Text style={styles.label}>Camera IP Address</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Camera IP (e.g. 192.168.1.16)"
                  value={manualCameraIP}
                  onChangeText={setManualCameraIP}
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={[styles.saveButton, styles.cameraSaveButton, isLoadingCamera && styles.buttonDisabled]}
                  onPress={handleSaveCameraIP}
                  disabled={isLoadingCamera}
                >
                  {isLoadingCamera ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>

              {cameraError ? (
                <Text style={styles.errorText}>⚠️ {cameraError}</Text>
              ) : null}

              {/* Quick Connect for Camera */}
               <View style={styles.quickConnectRow}>
                {['10.248.244.99', '10.11.128.166'].map((ip) => (
                  <TouchableOpacity
                    key={ip}
                    style={[styles.quickButton, styles.cameraQuickButton]}
                    onPress={() => {
                      setManualCameraIP(ip);
                      handleSaveCameraIP();
                    }}
                    disabled={isLoadingCamera}
                  >
                    <Text style={[styles.quickButtonText, styles.cameraQuickButtonText]}>{ip}</Text>
                  </TouchableOpacity>
                ))}
              </View> 
            </View>

            {/* Auto Connect Card */}
            <View style={styles.card}>
              <View style={styles.autoConnectRow}>
                <View style={styles.autoConnectText}>
                  <Text style={styles.cardTitle}>🔄 Auto Connect</Text>
                  <Text style={styles.autoConnectDescription}>
                    Automatically connect to ESP32 when app starts
                  </Text>
                </View>
                <Switch
                  value={autoConnect}
                  onValueChange={handleAutoConnectToggle}
                  trackColor={{ false: '#ccc', true: '#4CAF50' }}
                  thumbColor={autoConnect ? '#8BC34A' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Quick Tips Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💡 Quick Tips</Text>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  Make sure your phone and ESP32 are on the same WiFi network
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  ESP32 IP address can be found in Serial Monitor
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  You can also use "agrirobot.local" if MDNS is enabled
                </Text>
              </View>
            </View>

            {/* Danger Zone */}
            <View style={[styles.card, styles.dangerCard]}>
              <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
              
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearSettings}
              >
                <Text style={styles.clearButtonText}>🗑️ Clear All Settings</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.modalIcon}>
                  {modalType === 'success' && '✅ '}
                  {modalType === 'error' && '❌ '}
                  {modalType === 'warning' && '⚠️ '}
                  {modalType === 'info' && 'ℹ️ '}
                </Text>
                <Text style={[
                  styles.modalTitle,
                  modalType === 'success' && styles.modalTitleSuccess,
                  modalType === 'error' && styles.modalTitleError,
                  modalType === 'warning' && styles.modalTitleWarning,
                  modalType === 'info' && styles.modalTitleInfo,
                ]}>
                  {modalTitle}
                </Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#607D8B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
            </View>

            <View style={styles.modalFooter}>
              {modalType === 'warning' ? (
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={closeModal}>
                    <Text style={styles.modalButtonCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={confirmClearSettings}>
                    <Text style={styles.modalButtonConfirmText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonClose]} onPress={closeModal}>
                  <Text style={styles.modalButtonCloseText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%' },
  overlayLayer: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 90,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(3, 95, 16, 0.73)',
    borderRadius: 12,
    marginBottom: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.2)',
  },
  cardTitle: {
    color: '#8BC34A',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statusLabel: {
    color: '#B0BEC5',
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f4f8fa',
  },
  statusConnected: {
    color: '#4CAF50',
  },
  statusDisconnected: {
    color: '#f44336',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 15,
  },
  label: {
    color: '#B0BEC5',
    fontSize: 14,
    marginBottom: 8,
  },
  quickConnectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    marginTop: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#8BC34A',
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#0a1a10',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#43A047',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 8,
  },
  // ===== Camera Card =====
  cameraCard: {
    borderColor: 'rgba(33, 150, 243, 0.3)',
    borderWidth: 1,
  },
  cameraCardTitle: {
    color: '#42A5F5',
  },
  cameraSaveButton: {
    backgroundColor: '#2196F3',
  },
  cameraQuickButton: {
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  cameraQuickButtonText: {
    color: '#42A5F5',
  },
  // ===== SCAN BUTTON =====
  scanButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  scanButtonActive: {
    backgroundColor: '#e68900',
    borderColor: 'rgba(255, 152, 0, 0.5)',
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  autoConnectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoConnectText: {
    flex: 1,
    marginRight: 15,
  },
  autoConnectDescription: {
    color: '#B0BEC5',
    fontSize: 12,
    marginTop: 2,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    color: '#8BC34A',
    fontSize: 14,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    color: '#B0BEC5',
    fontSize: 13,
  },
  dangerCard: {
    borderColor: '#f44336',
    borderWidth: 1,
  },
  dangerTitle: {
    color: '#f44336',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  clearButtonText: {
    color: '#f44336',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // ===== MODAL STYLES =====
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a2e22',
    borderRadius: 16,
    width: '90%',
    maxWidth: 380,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalTitleSuccess: {
    color: '#4CAF50',
  },
  modalTitleError: {
    color: '#EF5350',
  },
  modalTitleWarning: {
    color: '#FFB74D',
  },
  modalTitleInfo: {
    color: '#42A5F5',
  },
  modalIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 16,
    paddingVertical: 4,
  },
  modalMessage: {
    color: '#B0BEC5',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 14,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonClose: {
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.3)',
  },
  modalButtonCloseText: {
    color: '#8BC34A',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalButtonCancelText: {
    color: '#B0BEC5',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonConfirm: {
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    borderWidth: 1,
    borderColor: '#EF5350',
  },
  modalButtonConfirmText: {
    color: '#EF5350',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;