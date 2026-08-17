// screens/ControlScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  StatusBar, 
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  Image,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Components
import ControlHeader from '../components/control/ControlHeader';
import CarRemoteControl from '../components/control/CarRemoteControl';
import LiveCameraView from '../components/control/LiveCameraView';
import CameraControlTab from '../components/control/CameraControlTab';
import OtherStatusControls from '../components/control/OtherStatusControls';
import BottomMetricsBar from '../components/control/BottomMetricsBar';
import GlassCard from '../components/common/GlassCard';
import esp32Service from '../services/esp32Service';
import firebaseService from '../services/firebaseService';

import { useControlState } from '../hooks/useControlState';
import { useCamera } from '../hooks/useCamera';
import { useCarControl } from '../hooks/useCarControl';
import { useWorkTime } from '../hooks/useWorkTime';

const { width, height } = Dimensions.get('window');

const ControlScreen = ({ onBack, routeParams = null , onOpenAITest }) => {
  const [controlView, setControlView] = useState('camera');
  const [isOrientationLocked, setIsOrientationLocked] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(180);

  const [pumpState, setPumpState] = useState(false);
  const [seedMotorState, setSeedMotorState] = useState(false);
  const [seedMotorSpeed, setSeedMotorSpeed] = useState(120);
  const [rakeAngle, setRakeAngle] = useState(0);

  const [batteryLevel, setBatteryLevel] = useState(0);
  const [signalStrength, setSignalStrength] = useState(3);
  const [isEspConnected, setIsEspConnected] = useState(false);

  // ✅ Modal states
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
  fetchESP32Status();
  
  const interval = setInterval(() => {
    if (!isCapturing) {
      fetchESP32Status();
    }
  }, 5000);

  return () => clearInterval(interval);
}, [fetchESP32Status, isCapturing]);
  const [captureMode, setCaptureMode] = useState(false);

  const {
    isRunning: isWorkRunning,
    workTime,
    startWork,
    stopWork,
    formatTime,
    getMinutes,
    resetWork,
  } = useWorkTime();

  useEffect(() => {
    if (routeParams?.startWork) {
      console.log('🚀 Starting work from Dashboard...');
      resetWork();  
      setTimeout(() => {
        startWork();
      }, 50);
    }
  }, [routeParams?.startWork]);

  const {
    autoMode,
    ploughing,
    seedDropper,
    soilCoverer,
    estimatedTime,
    toggleAutoMode,
    togglePloughing,
    toggleSeedDropper,
    toggleSoilCoverer,
  } = useControlState();

  const {
    isVideoLoading,
    videoError,
    isVideoVisible,
    videoStreamUrl,
    panAngle,
    tiltAngle,   
    handleCameraCommand,
    resetServos: resetCameraServos,
    reloadVideo,
    toggleVideoVisibility,
  } = useCamera();

  const {
    isSending,
    lastCommand,
    error: carError,
    moveForward,
    moveBackward,
    moveLeft,
    moveRight,
    stopRobot,
    emergencyStop,
  } = useCarControl();

//   const handleCapturePhoto = async () => {
//   if (isCapturing) return;
//   setIsCapturing(true);
  
//   // ✅ Capture mode ကို true လုပ်ပြီး Live Stream ကို ရပ်မယ်
//   setCaptureMode(true);
//   console.log('📷 Capture mode: ON - Stream paused');

//   try {
//     console.log('📸 Capturing photo...');
    
//     const result = await firebaseService.capturePhoto('esp32-cam');
    
//     console.log('📊 Result:', result);
    
//     if (result.success) {
//       // ✅ ပုံကို သိမ်းပြီး Modal မှာပြမယ်
//       setCapturedImageUri(result.uri);
//       setShowImageModal(true);
      
//       // ✅ ပုံသိမ်းပြီးရင် Live Stream ကို ပြန် reload လုပ်မယ်
//       setTimeout(() => {
//         setCaptureMode(false);
//         reloadVideo();
//         console.log('📷 Capture mode: OFF - Stream resumed');
//       }, 500);
//     } else {
//       Alert.alert('Capture Failed', result.error);
//       setCaptureMode(false);
//     }
//   } catch (err) {
//     console.error('❌ Capture error:', err);
//     Alert.alert('Error', err.message || 'Something went wrong');
//     setCaptureMode(false);
//   } finally {
//     setIsCapturing(false);
//   }
// };

// screens/ControlScreen.js

const handleCapturePhoto = async () => {
  if (isCapturing) return;
  setIsCapturing(true);
  
  // ✅ ပထမဆုံး AITestScreen ကိုသွားမယ်
  if (onOpenAITest) {
    // AITestScreen ကိုသွားပြီး loading state ပြဖို့ signal ပို့မယ်
    onOpenAITest(null);  // null ပို့ပြီး loading ပြခိုင်းမယ်
  }
  
  setCaptureMode(true);
  console.log('📷 Capture mode: ON - Stream paused');

  try {
    console.log('📸 Capturing photo...');
    
    const result = await firebaseService.capturePhoto('esp32-cam');
    
    console.log('📊 Result:', result);
    
    if (result.success) {
      // ✅ ပုံရိုက်ပြီးရင် AITestScreen ကို update လုပ်မယ်
      // (AITestScreen ကို ပြန်ဖွင့်ဖို့မလိုဘူး၊ ပုံ data ကိုပို့မယ်)
      
      // AITestScreen ကို ပြန်ခေါ်ပြီး ပုံ data ကိုပို့မယ်
      if (onOpenAITest) {
        onOpenAITest(result.uri);  // ပုံ data ကိုပို့
      }
      
      setTimeout(() => {
        setCaptureMode(false);
        reloadVideo();
        console.log('📷 Capture mode: OFF - Stream resumed');
      }, 500);
    } else {
      Alert.alert('Capture Failed', result.error);
      setCaptureMode(false);
      // AITestScreen ကို ပိတ်မယ်
      if (onOpenAITest) {
        onOpenAITest('error');  // error signal ပို့
      }
    }
  } catch (err) {
    console.error('❌ Capture error:', err);
    Alert.alert('Error', err.message || 'Something went wrong');
    setCaptureMode(false);
    if (onOpenAITest) {
      onOpenAITest('error');
    }
  } finally {
    setIsCapturing(false);
  }
};

  // const fetchESP32Status = useCallback(async () => {
  //   try {
  //     console.log('🔍 Fetching ESP32 status...');
      
  //     const batteryResult = await esp32Service.getBatteryStatus();
  //     console.log('📊 Battery result:', batteryResult);
      
  //     if (batteryResult.success && batteryResult.data) {
  //       const percentage = batteryResult.data.percentage || 0;
  //       setBatteryLevel(percentage);
  //       console.log(`🔋 Battery: ${percentage}%`);
  //       console.log(`⚡ Voltage: ${batteryResult.data.voltage || 0}V`);
  //       console.log(`🔌 Charging: ${batteryResult.data.isCharging ? 'YES' : 'NO'}`);
  //     } else {
  //       console.log('❌ Battery data not available:', batteryResult?.error);
  //     }

  //     const statusResult = await esp32Service.getStatus();
  //     if (statusResult.success) {
  //       setIsEspConnected(true);
  //       console.log('✅ ESP32 Connected');
  //     } else {
  //       setIsEspConnected(false);
  //       console.log('❌ ESP32 Disconnected');
  //     }
  //   } catch (error) {
  //     console.log('❌ Fetch status error:', error.message);
  //     setIsEspConnected(false);
  //   }
  // }, []);

  // screens/ControlScreen.js

const fetchESP32Status = useCallback(async () => {
  try {
    console.log('🔍 Fetching ESP32 status...');
    
    // ✅ ESP32 Connection ကိုပဲ စစ်ပါ
    const statusResult = await esp32Service.getStatus();
    if (statusResult.success) {
      setIsEspConnected(true);
      console.log('✅ ESP32 Connected');
    } else {
      setIsEspConnected(false);
      console.log('❌ ESP32 Disconnected');
    }
  } catch (error) {
    console.log('❌ Fetch status error:', error.message);
    setIsEspConnected(false);
  }
}, []);

// ✅ useEffect ကို ပြန်ထည့်ပါ
useEffect(() => {
  fetchESP32Status();
  
  const interval = setInterval(() => {
    if (!isCapturing) {
      fetchESP32Status();
    }
  }, 5000);

  return () => clearInterval(interval);
}, [fetchESP32Status, isCapturing]);
  
  useEffect(() => {
    fetchESP32Status();
    
    const interval = setInterval(() => {
      fetchESP32Status();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchESP32Status]);

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
        );
        setIsOrientationLocked(true);
      } catch (error) {
        console.log('Orientation lock error:', error);
        setIsOrientationLocked(true);
      }
    };

    lockOrientation();

    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  if (!isOrientationLocked) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleSpeedChange = (newSpeed) => {
    setCurrentSpeed(newSpeed);
    console.log(`⚡ Speed changed to: ${newSpeed}`);
    esp32Service.setDriveSpeed(newSpeed);
  };

  const handleResetServos = resetCameraServos;

  const toggleWorkTime = async () => {
    if (isWorkRunning) {
      console.log('⏹️ Stopping work... Current time:', workTime);
      
      const currentWorkTime = workTime;
      const formattedTime = formatTime(currentWorkTime);
      
      await firebaseService.logCommand('work_session', {
        duration: currentWorkTime,
        durationFormatted: formattedTime,
        startedAt: new Date(Date.now() - currentWorkTime * 1000).toISOString(),
        endedAt: new Date().toISOString(),
      });
      console.log(`📊 Work session saved: ${formattedTime}`);
      
      await stopWork();
    } else {
      console.log('▶️ Starting work...');
      await startWork();
    }
  };

  const handleCarDirection = async (direction) => {
    console.log(`🎯 Car direction: ${direction}`);
    
    try {
      let result;
      switch (direction) {
        case 'forward':
          result = await moveForward();
          break;
        case 'backward':
          result = await moveBackward();
          break;
        case 'left':
          result = await moveLeft();
          break;
        case 'right':
          result = await moveRight();
          break;
        default:
          console.log(`❌ Unknown direction: ${direction}`);
          return;
      }
      
      if (result.success) {
        console.log(`✅ ${direction} command sent successfully`);
      } else {
        console.log(`❌ ${direction} command failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${direction} error:`, error);
    }
  };

  const handleEmergencyStop = async () => {
    console.log('🆘 Emergency Stop triggered!');
    try {
      const result = await emergencyStop();
      console.log('📊 Emergency Stop Result:', result);
    } catch (error) {
      console.log('❌ Emergency Stop error:', error);
    }
  };

  const handleClose = async () => {
    if (isWorkRunning) {
      const workMinutes = getMinutes(workTime);
      await firebaseService.logCommand('work_session', {
        duration: workTime,
        durationFormatted: formatTime(workTime),
        startedAt: new Date(Date.now() - workTime * 1000).toISOString(),
        endedAt: new Date().toISOString(),
      });
      console.log(`📊 Work session saved: ${formatTime(workTime)}`);
      await stopWork();
    }
    onBack();
  };

  // ✅ Capture Photo with Modal
  // const handleCapturePhoto = async () => {
  //   console.log('📸 Capturing photo...');
    
  //   try {
  //     const result = await firebaseService.capturePhoto('esp32-cam');
      
  //     console.log('📊 Result:', result);
      
  //     if (result?.success) {
  //       // ✅ Modal မှာပြဖို့ base64 ကို သိမ်းပါ
  //       setCapturedImageUri(result.uri);
  //       setShowImageModal(true);
  //     } else {
  //       Alert.alert('❌ Error', result?.error || 'Capture failed');
  //     }
  //   } catch (error) {
  //     console.log('❌ Capture error:', error);
  //     Alert.alert('❌ Error', error.message || 'Something went wrong');
  //   }
  // };

//   const handleCapturePhoto = async () => {
//   if (isCapturing) return;
//   setIsCapturing(true);

//   try {
//     console.log('📸 Capturing photo...');
    
//     // ✅ Live Stream ကို ခေတ္တရပ်ဖို့ WebView ကို ပြောမယ်
//     // (WebView ကို ref နဲ့ ထိန်းထားပြီး reload လုပ်မယ်)
    
//     const result = await firebaseService.capturePhoto('esp32-cam');
    
//     console.log('📊 Result:', result);
    
//     if (result.success) {
//       // ✅ ပုံကို သိမ်းပြီး Modal မှာပြမယ်
//       setCapturedImageUri(result.uri);
//       setShowImageModal(true);
      
//       // ✅ ပုံသိမ်းပြီးရင် Live Stream ကို ပြန် reload လုပ်မယ်
//       // (WebView reload ကို နောက်မှ လုပ်မယ်)
//     } else {
//       Alert.alert('Capture Failed', result.error);
//     }
//   } catch (err) {
//     console.error('❌ Capture error:', err);
//     Alert.alert('Error', err.message || 'Something went wrong');
//   } finally {
//     setIsCapturing(false);
//   }
// };

  const handleTogglePump = async () => {
    const newState = !pumpState;
    setPumpState(newState);
    console.log(`💧 Pump: ${newState ? 'ON' : 'OFF'}`);
    await esp32Service.setPump(newState);
  };

  const handleToggleSeedMotor = async () => {
    const newState = !seedMotorState;
    setSeedMotorState(newState);
    console.log(`🌱 Seed Motor: ${newState ? 'ON' : 'OFF'}`);
    await esp32Service.setGear(newState);
  };

  const handleSeedMotorSpeedChange = async (speed) => {
    const roundedSpeed = Math.round(speed);
    setSeedMotorSpeed(roundedSpeed);
    console.log(`⚙️ Seed Speed: ${roundedSpeed}`);
    await esp32Service.setGearSpeed(roundedSpeed);
  };

  const handleRakeAngleChange = async (angle) => {
    const roundedAngle = Math.round(angle);
    setRakeAngle(roundedAngle);
    console.log(`🎯 Rake Angle: ${roundedAngle}°`);
    await esp32Service.setRakeAngle(roundedAngle);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      <ControlHeader onBack={handleClose} />

      <View style={styles.mainLayout}>
        <View style={[styles.column, styles.columnLeft]}>
          <GlassCard>
            <CarRemoteControl 
              onDirectionPress={handleCarDirection}
              onEmergencyStop={handleEmergencyStop}
              onSpeedChange={handleSpeedChange}
              currentSpeed={currentSpeed} 
              isSending={isSending}
              lastCommand={lastCommand}
              error={carError}
            />
          </GlassCard>
        </View>

        <View style={[styles.column, styles.columnRight]}>
          <View style={styles.rightTopRow}>
            <View style={[styles.column, styles.columnRightinLeft]}>
              <GlassCard style={{ padding: 6 }}>
                <LiveCameraView
                  videoStreamUrl={videoStreamUrl}
                  isVideoVisible={isVideoVisible}
                  onToggleVisibility={toggleVideoVisibility}
                  onReload={reloadVideo}
                  isLoading={isVideoLoading}
                  hasError={videoError}
                />
              </GlassCard>
            </View>

            <View style={[styles.column, styles.columnRightinRight]}>
              <GlassCard style={{ paddingRight: 10, paddingLeft: 6, paddingTop: 6 }}>
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tabButton,
                      { backgroundColor: controlView === 'camera' ? '#8BC34A' : 'transparent' }
                    ]}
                    onPress={() => setControlView('camera')}
                  >
                    <Text style={controlView === 'camera' ? styles.tabTextActive : styles.tabTextInactive}>
                      Camera
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tabButton,
                      { backgroundColor: controlView === 'other' ? '#8BC34A' : 'transparent' }
                    ]}
                    onPress={() => setControlView('other')}
                  >
                    <Text style={controlView === 'other' ? styles.tabTextActive : styles.tabTextInactive}>
                      Other
                    </Text>
                  </TouchableOpacity>
                </View>

                {controlView === 'camera' ? (
                  <CameraControlTab
                    onCapture={handleCapturePhoto}
                    onCommand={handleCameraCommand}
                    onResetServos={handleResetServos}
                    panAngle={panAngle}  
                    tiltAngle={tiltAngle}  
                    captureMode={captureMode}
                  />
                ) : (
                  <OtherStatusControls
                    pumpState={pumpState}
                    onTogglePump={handleTogglePump}
                    seedMotorState={seedMotorState}
                    onToggleSeedMotor={handleToggleSeedMotor}
                    seedMotorSpeed={seedMotorSpeed}
                    onSeedMotorSpeedChange={handleSeedMotorSpeedChange}
                    rakeAngle={rakeAngle}
                    onRakeAngleChange={handleRakeAngleChange}
                  />
                )}
              </GlassCard>
            </View>
          </View>

          <View style={styles.bottomFullRow}>
            <GlassCard>
              <BottomMetricsBar 
                workTime={formatTime(workTime)}
                signalStrength={isEspConnected ? 3 : 0} 
                batteryLevel={batteryLevel}
                isWorkRunning={isWorkRunning}
                onToggleWorkTime={toggleWorkTime}
                isEspConnected={isEspConnected}
              />
            </GlassCard>
          </View>
        </View>
      </View>

      {/* ✅ Image Preview Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📸 Captured Image</Text>
              <TouchableOpacity onPress={() => setShowImageModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Image */}
            {capturedImageUri ? (
              <Image 
                source={{ uri: capturedImageUri }} 
                style={styles.capturedImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>No image captured</Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.closeModalBtn}
                onPress={() => setShowImageModal(false)}
              >
                <Text style={styles.closeModalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1E13',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8BC34A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: width * 0.03,
    paddingBottom: 8,
    gap: 8,
  },
  column: {
    height: '100%',
  },
  columnLeft: {
    marginLeft: 10,
    width: '33%',
  },
  columnRight: {
    width: '65.5%',
    height: '100%',
    flexDirection: 'column',
    gap: 8,
  },
  rightTopRow: {
    flexDirection: 'row',
    height: '78%',
    gap: 8,
  },
  columnRightinLeft: {
    width: '50%',
    height: '100%',
  },
  columnRightinRight: {
    width: '50%',
    height: '100%',
  },
  bottomFullRow: {
    height: '20%',
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 2,
    alignSelf: 'center',
    width: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 3,
    alignItems: 'center',
    borderRadius: 18,
  },
  tabTextActive: {
    color: '#000',
    fontSize: 11,
    fontWeight: '600',
  },
  tabTextInactive: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '600',
  },

  // ===== MODAL STYLES =====
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a2e22',
    borderRadius: 16,
    width: '95%',
    maxHeight: '80%',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    color: '#8BC34A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  capturedImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginVertical: 12,
    backgroundColor: '#0a0e17',
  },
  noImageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#607D8B',
    fontSize: 14,
  },
  modalFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  closeModalBtn: {
    backgroundColor: '#8BC34A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#0B1E13',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ControlScreen;