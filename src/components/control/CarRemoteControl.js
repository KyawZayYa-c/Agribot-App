import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CarRemoteControl = ({ 
  onDirectionPress, 
  onEmergencyStop,
  onSpeedChange,
  isSending = false,
  lastCommand = null,
  error = null,
  currentSpeed = 180,
}) => {
  // ✅ Local speed state for smooth updates
  const [localSpeed, setLocalSpeed] = useState(currentSpeed);
  
  // ✅ Refs for interval and current speed (to fix closure issue)
  const intervalRef = useRef(null);
  const speedRef = useRef(currentSpeed);
  
  // ✅ Update local speed and ref when prop changes
  useEffect(() => {
    setLocalSpeed(currentSpeed);
    speedRef.current = currentSpeed;
  }, [currentSpeed]);

  // ✅ Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // ✅ PanResponder for vertical swipe on speed bar
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const speedChange = Math.floor(-gestureState.dy / 2.5);
      const newSpeed = Math.min(255, Math.max(0, speedRef.current + speedChange));
      if (newSpeed !== speedRef.current) {
        speedRef.current = newSpeed;
        setLocalSpeed(newSpeed);
        onSpeedChange?.(newSpeed);
      }
    },
  });

  // ===== HELPER: Stop interval =====
  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ===== Direction Handlers (FIXED) =====
  const handleDirectionPressIn = useCallback((direction) => {
    // Clear any existing interval first
    stopInterval();
    
    // Execute immediately
    onDirectionPress?.(direction);
    
    // Start interval for continuous sending
    intervalRef.current = setInterval(() => {
      onDirectionPress?.(direction);
    }, 150);
  }, [onDirectionPress, stopInterval]);

  const handleDirectionPressOut = useCallback(() => {
    stopInterval();
  }, [stopInterval]);

  // ===== Speed Handlers (FIXED with ref) =====
  const handleSpeedUpPressIn = useCallback(() => {
    // Clear any existing interval first
    stopInterval();
    
    // Calculate new speed using ref
    const newSpeed = Math.min(255, speedRef.current + 10);
    speedRef.current = newSpeed;
    setLocalSpeed(newSpeed);
    onSpeedChange?.(newSpeed);
    
    // Start interval for continuous sending
    intervalRef.current = setInterval(() => {
      const nextSpeed = Math.min(255, speedRef.current + 10);
      if (nextSpeed !== speedRef.current) {
        speedRef.current = nextSpeed;
        setLocalSpeed(nextSpeed);
        onSpeedChange?.(nextSpeed);
      }
    }, 150);
  }, [onSpeedChange, stopInterval]);

  const handleSpeedDownPressIn = useCallback(() => {
    // Clear any existing interval first
    stopInterval();
    
    // Calculate new speed using ref
    const newSpeed = Math.max(0, speedRef.current - 10);
    speedRef.current = newSpeed;
    setLocalSpeed(newSpeed);
    onSpeedChange?.(newSpeed);
    
    // Start interval for continuous sending
    intervalRef.current = setInterval(() => {
      const nextSpeed = Math.max(0, speedRef.current - 10);
      if (nextSpeed !== speedRef.current) {
        speedRef.current = nextSpeed;
        setLocalSpeed(nextSpeed);
        onSpeedChange?.(nextSpeed);
      }
    }, 150);
  }, [onSpeedChange, stopInterval]);

  const handleSpeedPressOut = useCallback(() => {
    stopInterval();
  }, [stopInterval]);

  return (
    <View style={styles.container}>
      <Text style={styles.columnTitle}>Car Remote Control</Text>
      
      {/* Status Indicator */}
      {isSending && (
        <Text style={styles.sendingText}>⏳ Sending...</Text>
      )}
      {error && (
        <Text style={styles.errorText}>⚠️ {error}</Text>
      )}
      {lastCommand && (
        <Text style={styles.lastCommandText}>
          Last: {lastCommand.name}
          {lastCommand.params ? ` (${JSON.stringify(lastCommand.params)})` : ''}
        </Text>
      )}

      {/* D-Pad + Speed Control - SIDE BY SIDE */}
      <View style={styles.controlsRow}>

        {/* ===== Speed Control - RIGHT SIDE ===== */}
        <View style={styles.speedContainer}>
          {/* Speed Value - ON TOP OF BAR */}
          <View style={styles.speedValueBox}>
            <Text style={styles.speedValueBig}>{localSpeed}</Text>
            <Text style={styles.speedMaxLabel}>/ 255</Text>
          </View>

          {/* Vertical Slider - MIDDLE */}
          <View style={styles.verticalSliderWrapper}>
            <TouchableOpacity 
              style={styles.speedArrowBtn}
              onPressIn={handleSpeedUpPressIn}
              onPressOut={handleSpeedPressOut}
              disabled={isSending}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-up" size={16} color="#8BC34A" />
            </TouchableOpacity>
            
            <View 
              style={styles.verticalSliderTrack}
              {...panResponder.panHandlers}
            >
              <View style={styles.verticalSliderFillContainer}>
                <View 
                  style={[
                    styles.verticalSliderFill, 
                    { height: `${(localSpeed / 255) * 100}%` }
                  ]} 
                />
              </View>
              <View 
                style={[
                  styles.sliderDot,
                  { bottom: `${(localSpeed / 255) * 100}%` }
                ]} 
              />
            </View>
            
            <TouchableOpacity 
              style={styles.speedArrowBtn}
              onPressIn={handleSpeedDownPressIn}
              onPressOut={handleSpeedPressOut}
              disabled={isSending}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-down" size={16} color="#8BC34A" />
            </TouchableOpacity>
          </View>

          {/* SPEED Label - BOTTOM */}
          <Text style={styles.speedTitle}>⚡ SPEED</Text>
          <Text style={styles.speedHint}>↕ swipe</Text>
        </View>

        {/* ===== D-Pad ===== */}
        <View style={styles.dpadContainer}>
          <View style={styles.joypadOuter}>
            {/* FORWARD */}
            <TouchableOpacity 
              style={[styles.dpadBtn, styles.btnUp]}
              onPressIn={() => handleDirectionPressIn('forward')}
              onPressOut={handleDirectionPressOut}
              disabled={isSending}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-up" size={28} color="#FFFFFF" />
              <Text style={styles.dpadLabel}>FORWARD</Text>
            </TouchableOpacity>

            {/* LEFT */}
            <TouchableOpacity 
              style={[styles.dpadBtn, styles.btnLeft]}
              onPressIn={() => handleDirectionPressIn('left')}
              onPressOut={handleDirectionPressOut}
              disabled={isSending}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
              <Text style={styles.dpadLabel}>LEFT</Text>
            </TouchableOpacity>

            {/* CENTER - Car Icon */}
            <View style={styles.joypadCenter}>
              <Text style={styles.joypadCenterIcon}>🚜</Text>
            </View>

            {/* RIGHT */}
            <TouchableOpacity 
              style={[styles.dpadBtn, styles.btnRight]}
              onPressIn={() => handleDirectionPressIn('right')}
              onPressOut={handleDirectionPressOut}
              disabled={isSending}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
              <Text style={styles.dpadLabel}>RIGHT</Text>
            </TouchableOpacity>

            {/* BACKWARD */}
            <TouchableOpacity 
              style={[styles.dpadBtn, styles.btnDown]}
              onPressIn={() => handleDirectionPressIn('backward')}
              onPressOut={handleDirectionPressOut}
              disabled={isSending}
              activeOpacity={0.7}
            >
              <Text style={styles.dpadLabel}>BACKWARD</Text>
              <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Emergency Stop */}
      <TouchableOpacity 
        style={styles.emergencyBtn}
        onPress={onEmergencyStop}
        disabled={isSending}
        activeOpacity={0.7}
      >
        <Text style={styles.emergencyText}>STOP</Text>
      </TouchableOpacity>
    </View>
  );
};

// ===== STYLES (မူလအတိုင်းထားပါ) =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  sendingText: {
    color: '#FFC107',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
  },
  errorText: {
    color: '#f44336',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
  },
  lastCommandText: {
    color: '#607D8B',
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 4,
  },
  columnTitle: {
    color: '#8BC34A',
    fontSize: 11,
    fontWeight: 'bold',
    padding: 5,
    marginBottom: 4,
  },
  
  // ===== ROW: D-Pad + Speed =====
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  
  // ===== D-Pad =====
  dpadContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginRight:"15",
  },
  joypadOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(139,195,74,0.15)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joypadCenter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8BC34A',
    backgroundColor: '#0B1E13',
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joypadCenterIcon: {
    fontSize: 22,
    textAlign: 'center',
  },
  dpadBtn: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  btnUp: {
    top: 4,
    width: '100%',
  },
  btnDown: {
    bottom: 4,
    width: '100%',
  },
  btnLeft: {
    left: 4,
    height: '100%',
  },
  btnRight: {
    right: 4,
    height: '100%',
  },
  dpadLabel: {
    color: '#607D8B',
    fontSize: 7,
    fontWeight: 'bold',
  },

  // ===== Speed Control =====
  speedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight:14,
    width: 50,
    marginVertical: 20,
  },
  speedTitle: {
    color: '#607D8B',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 50,
  },
  speedValueBox: {
    alignItems: 'center',
    marginBottom: 2,
  },
  speedValueBig: {
    color: '#8BC34A',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  speedMaxLabel: {
    color: '#607D8B',
    fontSize: 8,
    marginTop: -2,
  },
  verticalSliderWrapper: {
    alignItems: 'center',
    height: 80,
    justifyContent: 'space-between',
  },
  speedArrowBtn: {
    width: 24,
    height: 16,
    borderRadius: 4,
    backgroundColor: 'rgba(139,195,74,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,195,74,0.15)',
  },
  verticalSliderTrack: {
    width: 18,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(139,195,74,0.12)',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  verticalSliderFillContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  verticalSliderFill: {
    width: '100%',
    backgroundColor: '#8BC34A',
    borderRadius: 9,
  },
  sliderDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#8BC34A',
    borderWidth: 2,
    borderColor: '#0B1E13',
    left: 2,
    shadowColor: '#8BC34A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  speedHint: {
    color: '#607D8B',
    fontSize: 6,
    marginTop: 1,
    opacity: 0.4,
  },

  // ===== Emergency Stop =====
  emergencyBtn: {
    backgroundColor: 'rgba(211, 47, 47, 0.08)',
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 5,
  },
  emergencyText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 9,
    textAlign: 'center',
  },
});

export default CarRemoteControl;