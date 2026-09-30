import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import esp32Service from '../services/esp32Service';
import wifiService from '../services/wifiService';

import ESP32ConnectionCard from '../components/settings/ESP32ConnectionCard';
import CameraConnectionCard from '../components/settings/CameraConnectionCard';
import AutoConnectCard from '../components/settings/AutoConnectCard';
import QuickTipsCard from '../components/settings/QuickTipsCard';
import DangerZoneCard from '../components/settings/DangerZoneCard';
import StatusModal from '../components/settings/StatusModal';

const STORAGE_KEYS = {
  ESP_IP: '@esp_ip',
  CAMERA_IP: '@camera_ip',
  AUTO_CONNECT: '@auto_connect',
};

const DEFAULT_ESP_IP = '10.248.244.165';
const DEFAULT_CAMERA_IP = '10.248.244.99';

const QUICK_ESP_IPS = ['10.248.244.165', '10.11.128.165'];
const QUICK_CAMERA_IPS = ['10.248.244.99', '10.11.128.166'];

const SettingsScreen = () => {
  const [espIP, setEspIP] = useState(DEFAULT_ESP_IP);
  const [cameraIP, setCameraIP] = useState(DEFAULT_CAMERA_IP);
  const [manualIP, setManualIP] = useState(DEFAULT_ESP_IP);
  const [manualCameraIP, setManualCameraIP] = useState(DEFAULT_CAMERA_IP);

  const [autoConnect, setAutoConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraConnected, setIsCameraConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info');

  useEffect(() => {
    loadSettings();
  }, []);

  const showModal = (title, message, type = 'info') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const loadSettings = async () => {
    try {
      const savedIP = await AsyncStorage.getItem(STORAGE_KEYS.ESP_IP);
      const savedCameraIP = await AsyncStorage.getItem(STORAGE_KEYS.CAMERA_IP);
      const auto = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_CONNECT);

      const isAutoOn = auto !== null ? JSON.parse(auto) : true;
      setAutoConnect(isAutoOn);

      const espIpToUse = savedIP || DEFAULT_ESP_IP;
      const cameraIpToUse = savedCameraIP || DEFAULT_CAMERA_IP;

      setEspIP(espIpToUse);
      setManualIP(espIpToUse);
      setCameraIP(cameraIpToUse);
      setManualCameraIP(cameraIpToUse);

      if (isAutoOn) {
        await testConnection(espIpToUse);
        await testCameraConnection(cameraIpToUse);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const testConnection = async (ip) => {
    const url = `http://${ip}/status`;
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Connection timeout after 5 seconds')),
          5000
        )
      );

      const fetchPromise = fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (response.ok) {
        setIsConnected(true);
        setError('');
        return true;
      }

      const errorMessage = `HTTP Error: ${response.status}\n\nURL: ${url}`;
      setIsConnected(false);
      setError(errorMessage);
      showModal('ESP32 Connection Error', errorMessage, 'error');
      return false;
    } catch (err) {
      let errorMessage = '';
      if (err?.message?.includes('timeout')) {
        errorMessage =
          `Connection Timeout\n\nURL: ${url}\n\n` +
          `ESP32 did not respond within 5 seconds.\n\n` +
          `Possible reasons:\n• ESP32 is powered off\n• Wrong IP address\n• Phone and ESP32 are on different WiFi\n• ESP32 web server is not running`;
      } else if (err?.message?.includes('Network request failed')) {
        errorMessage =
          `Network Request Failed\n\nURL: ${url}\n\n` +
          `Possible reasons:\n• Android blocked HTTP connection\n• Wrong IP address\n• Different WiFi network\n• ESP32 is unreachable\n• ESP32 web server is not running`;
      } else {
        errorMessage =
          `Unknown Connection Error\n\nURL: ${url}\n\n` +
          `Name: ${err?.name || 'Unknown'}\nMessage: ${
            err?.message || 'Unknown error'
          }`;
      }

      setIsConnected(false);
      setError(errorMessage);
      showModal('ESP32 Connection Failed', errorMessage, 'error');
      return false;
    }
  };

  const testCameraConnection = async (ip) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      );
      const fetchPromise = fetch(`http://${ip}/status`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (response.ok) {
        setIsCameraConnected(true);
        setCameraError('');
        return true;
      }
      setIsCameraConnected(false);
      return false;
    } catch (err) {
      if (err.message.includes('timeout')) {
        setCameraError('Connection timeout - please try again');
      } else if (err.message.includes('Network request failed')) {
        setCameraError('Device not reachable. Check IP and WiFi.');
      } else {
        setCameraError(err.message);
      }
      setIsCameraConnected(false);
      return false;
    }
  };

  const handleSaveIP = async () => {
    if (!manualIP) {
      showModal('Error', 'Please enter an IP address', 'error');
      return;
    }
    if (!manualIP.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      showModal('Error', 'Invalid IP address format', 'error');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const connected = await testConnection(manualIP);
      if (connected) {
        await AsyncStorage.setItem(STORAGE_KEYS.ESP_IP, manualIP);
        setEspIP(manualIP);
        setIsConnected(true);
        showModal('Success', `Connected to ESP32 at ${manualIP}`, 'success');
      }
    } catch (err) {
      setError(err?.message || 'Failed to connect');
      showModal('Error', err?.message || 'Failed to connect to ESP32', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCameraIP = async (ipFromQuick) => {
    const ipToSave = ipFromQuick || manualCameraIP;

    if (!ipToSave) {
      showModal('Error', 'Please enter a Camera IP address', 'error');
      return;
    }
    if (!ipToSave.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      showModal('Error', 'Invalid IP address format', 'error');
      return;
    }

    setIsLoadingCamera(true);
    setCameraError('');

    try {
      const connected = await testCameraConnection(ipToSave);
      if (connected) {
        await AsyncStorage.setItem(STORAGE_KEYS.CAMERA_IP, ipToSave);
        setCameraIP(ipToSave);
        setIsCameraConnected(true);
        await esp32Service.setCameraIPAddress(ipToSave);
        showModal('Success', `✅ Connected to Camera at ${ipToSave}`, 'success');
      } else {
        setCameraError('Cannot connect to Camera at this IP');
        showModal(
          'Connection Failed',
          'No Camera found at this IP address.\n\nMake sure:\n• Camera is powered on\n• Same WiFi network\n• IP address is correct',
          'error'
        );
      }
    } catch (err) {
      setCameraError(err.message);
      showModal('Error', 'Failed to connect to Camera', 'error');
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const handleQuickConnect = async (ip) => {
    setManualIP(ip);
    setIsLoading(true);
    try {
      const connected = await testConnection(ip);
      if (connected) {
        await AsyncStorage.setItem(STORAGE_KEYS.ESP_IP, ip);
        setEspIP(ip);
        setIsConnected(true);
        showModal('Success', `Connected to ESP32 at ${ip}`, 'success');
      }
    } catch (err) {
      showModal('Error', err?.message || 'Failed to connect', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshConnection = async () => {
    if (!espIP) {
      showModal('Error', 'No saved ESP32 IP address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const connected = await testConnection(espIP);
      if (connected) {
        showModal('Success', `Connected to ESP32 at ${espIP}`, 'success');
      }
    } catch (err) {
      showModal(
        'Refresh Failed',
        err?.message || 'Failed to connect to ESP32',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanDevices = async () => {
    setIsScanning(true);
    setError('');

    try {
      const result = await wifiService.scanForESP32();

      if (result.success && result.devices.length > 0) {
        const deviceList = result.devices
          .map((d, i) => `${i + 1}. ${d.name} (${d.ip})`)
          .join('\n');

        const firstDevice = result.devices[0];
        setManualIP(firstDevice.ip);

        showModal(
          '📡 Devices Found',
          `Found ${result.devices.length} device(s):\n\n${deviceList}\n\n✅ Auto-connecting to ${firstDevice.ip}...`,
          'info'
        );

        await handleSaveIPFromScan(firstDevice.ip);
      } else {
        showModal(
          'No Devices Found',
          'No ESP32 devices found on the network.\n\nMake sure:\n• ESP32 is powered on\n• Phone and ESP32 are on same WiFi\n• ESP32 web server is running',
          'warning'
        );
      }
    } catch (err) {
      showModal('Scan Failed', err.message, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveIPFromScan = async (ip) => {
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
    } catch (err) {
      showModal('Error', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoConnectToggle = async (value) => {
    setAutoConnect(value);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_CONNECT, JSON.stringify(value));
    await esp32Service.setAutoConnect(value);

    if (!value) {
      esp32Service.stopConnectionCheck();
    }
  };

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

            <ESP32ConnectionCard
              isConnected={isConnected}
              espIP={espIP}
              manualIP={manualIP}
              setManualIP={setManualIP}
              error={error}
              isLoading={isLoading}
              isScanning={isScanning}
              quickIPs={QUICK_ESP_IPS}
              onSaveIP={handleSaveIP}
              onRefresh={handleRefreshConnection}
              onQuickConnect={handleQuickConnect}
              onScan={handleScanDevices}
              styles={styles}
            />

            <CameraConnectionCard
              isCameraConnected={isCameraConnected}
              cameraIP={cameraIP}
              manualCameraIP={manualCameraIP}
              setManualCameraIP={setManualCameraIP}
              cameraError={cameraError}
              isLoadingCamera={isLoadingCamera}
              quickIPs={QUICK_CAMERA_IPS}
              onSaveCameraIP={handleSaveCameraIP}
              styles={styles}
            />

            <AutoConnectCard
              autoConnect={autoConnect}
              onToggle={handleAutoConnectToggle}
              styles={styles}
            />

            <QuickTipsCard styles={styles} />

            <DangerZoneCard
              onClearSettings={handleClearSettings}
              styles={styles}
            />
          </ScrollView>
        </View>
      </ImageBackground>

      <StatusModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={closeModal}
        onConfirm={confirmClearSettings}
        styles={styles}
      />
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
  statusLabel: { color: '#B0BEC5', fontSize: 14 },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f4f8fa',
  },
  statusConnected: { color: '#4CAF50' },
  statusDisconnected: { color: '#f44336' },
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
  buttonRow: { flexDirection: 'row', marginTop: 12 },
  buttonDisabled: { opacity: 0.6 },
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
  cameraCard: {
    borderColor: 'rgba(33, 150, 243, 0.3)',
    borderWidth: 1,
  },
  cameraCardTitle: { color: '#42A5F5' },
  cameraSaveButton: { backgroundColor: '#2196F3' },
  cameraQuickButton: { borderColor: 'rgba(33, 150, 243, 0.3)' },
  cameraQuickButtonText: { color: '#42A5F5' },
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
  autoConnectText: { flex: 1, marginRight: 15 },
  autoConnectDescription: {
    color: '#B0BEC5',
    fontSize: 12,
    marginTop: 2,
  },
  tipItem: { flexDirection: 'row', marginBottom: 8 },
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
  modalTitleSuccess: { color: '#4CAF50' },
  modalTitleError: { color: '#EF5350' },
  modalTitleWarning: { color: '#FFB74D' },
  modalTitleInfo: { color: '#42A5F5' },
  modalIcon: { fontSize: 20, marginRight: 6 },
  closeBtn: { padding: 4 },
  modalBody: { marginBottom: 16, paddingVertical: 4 },
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
  modalButtonRow: { flexDirection: 'row', gap: 10 },
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