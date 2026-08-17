// components/control/CameraControlTab.js
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CameraControlTab = ({
  onCommand,
  onCapture,
  onResetServos,
  captureDisabled = false,
  panAngle = 90,
  tiltAngle = 90,
  captureMode = false,
}) => {
  const intervalRef = useRef(null);

  const handlePressIn = (direction) => {
    onCommand?.(direction);
    intervalRef.current = setInterval(() => {
      onCommand?.(direction);
    }, 200);
  };

  const handlePressOut = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onCommand?.('stop');
  };

  const handleCapture = () => {
    if (captureDisabled) {
      console.log('⛔ Capture disabled - Camera not connected');
      return;
    }
    onCapture?.();
  };

  const handleResetServos = () => {
    console.log('🔄 Reset Servos button pressed');
    onResetServos?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.angleDisplayContainer}>
        <View style={styles.angleItem}>
          <Text style={styles.angleLabel}>Pan</Text>
          <Text style={styles.angleValue}>{panAngle}°</Text>
        </View>
        <View style={styles.angleDivider} />
        <View style={styles.angleItem}>
          <Text style={styles.angleLabel}>Tilt</Text>
          <Text style={styles.angleValue}>{tiltAngle}°</Text>
        </View>
      </View>

      <View style={styles.cameraDpadContainer}>
        <View style={styles.cameraJoypadOuter}>
          <TouchableOpacity
            style={[styles.cameraDpadBtn, styles.cameraBtnUp]}
            onPressIn={() => handlePressIn('up')}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-up" size={24} color="#FFFFFF" />
            <Text style={styles.cameraDpadLabel}>UP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraDpadBtn, styles.cameraBtnLeft]}
            onPressIn={() => handlePressIn('left')}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            <Text style={styles.cameraDpadLabel}>LEFT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cameraDpadBtn,
              styles.cameraBtnCenter,
              captureDisabled && styles.centerDisabled,
            ]}
            onPress={handleCapture}
            disabled={captureDisabled}
            activeOpacity={captureDisabled ? 1 : 0.7}
          >
            <Ionicons
              name="camera"
              size={28}
              color={captureDisabled ? '#455A64' : '#8BC34A'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraDpadBtn, styles.cameraBtnRight]}
            onPressIn={() => handlePressIn('right')}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            <Text style={styles.cameraDpadLabel}>RIGHT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraDpadBtn, styles.cameraBtnDown]}
            onPressIn={() => handlePressIn('down')}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
            <Text style={styles.cameraDpadLabel}>DOWN</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomButtonsRow}>
        <TouchableOpacity
          style={[
            styles.bottomButton,
            styles.captureButton,
            captureDisabled && styles.buttonDisabled,
          ]}
          onPress={handleCapture}
          disabled={captureDisabled}
          activeOpacity={captureDisabled ? 1 : 0.8}
        >
          <Ionicons
            name="camera"
            size={18}
            color={captureDisabled ? '#455A64' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.bottomButtonText,
              captureDisabled && styles.disabledText,
            ]}
          >
            {captureDisabled ? 'OFFLINE' : 'Soil Detect'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomButton, styles.resetButton]}
          onPress={handleResetServos}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.bottomButtonText}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    paddingHorizontal: 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  angleDisplayContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 12,
    marginTop: 9,
    width: '100%',
    justifyContent: 'center',
  },
  angleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  angleLabel: {
    color: '#607D8B',
    fontSize: 10,
    fontWeight: '500',
    marginRight: 4,
  },
  angleValue: {
    color: '#8BC34A',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  angleDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 4,
  },
  cameraDpadContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    marginBottom: 49,
  },
  cameraJoypadOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(139,195,74,0.15)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraDpadBtn: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  cameraBtnUp: {
    top: 6,
    width: '100%',
  },
  cameraBtnDown: {
    bottom: 6,
    width: '100%',
  },
  cameraBtnLeft: {
    left: 6,
    height: '100%',
  },
  cameraBtnRight: {
    right: 6,
    height: '100%',
  },
  cameraBtnCenter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#8BC34A',
    backgroundColor: '#0B1E13',
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDisabled: {
    borderColor: '#455A64',
    backgroundColor: '#1a2a1a',
  },
  cameraDpadLabel: {
    color: '#607D8B',
    fontSize: 7,
    fontWeight: 'bold',
    marginTop: 1,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 1,
    width: '100%',
    paddingHorizontal: 10,
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 20,
    gap: 6,
    flex: 1,
    maxWidth: 80,
  },
  captureButton: {
    backgroundColor: '#8BC34A',
  },
  resetButton: {
    backgroundColor: '#455A64',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonDisabled: {
    backgroundColor: '#1a2a1a',
    borderWidth: 1,
    borderColor: '#455A64',
  },
  bottomButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  disabledText: {
    color: '#455A64',
  },
});

export default CameraControlTab;