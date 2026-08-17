// components/control/OtherStatusControls.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const OtherStatusControls = ({
  // ===== NEW CONTROLS =====
  pumpState = false,
  onTogglePump,
  seedMotorState = false,
  onToggleSeedMotor,
  seedMotorSpeed = 120,
  onSeedMotorSpeedChange,
  rakeAngle = 0,
  onRakeAngleChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Status - Running */}
      <View style={styles.statusRowItem}>
        <Text style={styles.statusLabel}>Status</Text>
        <View style={styles.statusRunningRow}>
          <MaterialCommunityIcons name="play-circle" size={16} color="#8BC34A" />
          <Text style={styles.statusRunning}>Running</Text>
        </View>
      </View>
      
      {/* ===== WATER PUMP ===== */}
      <View style={styles.switchRow}>
        <MaterialCommunityIcons name="water-pump" size={20} color="#2196F3" />
        <Text style={styles.switchLabel}>Water Pump</Text>
        <View style={styles.switchContainer}>
          <Text style={[styles.switchStatusText, { color: pumpState ? '#2196F3' : '#607D8B' }]}>
            {pumpState ? 'ON' : 'OFF'}
          </Text>
          <TouchableOpacity onPress={onTogglePump} style={styles.toggleContainer}>
            <View style={[styles.toggleTrack, pumpState ? styles.toggleActiveBlue : styles.toggleInactive]}>
              <View style={[styles.toggleThumb, pumpState ? styles.toggleThumbActive : styles.toggleThumbInactive]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== SEED MOTOR ===== */}
      <View style={styles.switchRow}>
        <MaterialCommunityIcons name="seed" size={20} color="#FF9800" />
        <Text style={styles.switchLabel}>Seed Motor</Text>
        <View style={styles.switchContainer}>
          <Text style={[styles.switchStatusText, { color: seedMotorState ? '#FF9800' : '#607D8B' }]}>
            {seedMotorState ? 'ON' : 'OFF'}
          </Text>
          <TouchableOpacity onPress={onToggleSeedMotor} style={styles.toggleContainer}>
            <View style={[styles.toggleTrack, seedMotorState ? styles.toggleActiveOrange : styles.toggleInactive]}>
              <View style={[styles.toggleThumb, seedMotorState ? styles.toggleThumbActive : styles.toggleThumbInactive]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Seed Motor Speed Slider */}
      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>Speed: {seedMotorSpeed}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          value={seedMotorSpeed}
          onValueChange={onSeedMotorSpeedChange}
          minimumTrackTintColor="#FF9800"
          maximumTrackTintColor="#455A64"
          thumbTintColor="#FF9800"
          disabled={!seedMotorState}
        />
        <View style={styles.sliderRange}>
          <Text style={styles.sliderRangeText}>0</Text>
          <Text style={styles.sliderRangeText}>255</Text>
        </View>
      </View>

      {/* ===== RAKE (မြေထွန်ခြစ်) ===== */}
      <View style={styles.switchRow}>
        <MaterialCommunityIcons name="tractor-variant" size={20} color="#8BC34A" />
        <Text style={styles.switchLabel}>Rake Angle</Text>
        <View style={styles.switchContainer}>
          <Text style={[styles.switchStatusText, { color: '#8BC34A' }]}>
            {rakeAngle}°
          </Text>
        </View>
      </View>

      {/* Rake Slider */}
      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>Angle: {rakeAngle}°</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={160}
          value={rakeAngle}
          onValueChange={onRakeAngleChange}
          minimumTrackTintColor="#8BC34A"
          maximumTrackTintColor="#455A64"
          thumbTintColor="#8BC34A"
        />
        <View style={styles.sliderRange}>
          <Text style={styles.sliderRangeText}>0°</Text>
          <Text style={styles.sliderRangeText}>160°</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 6,
  },
  statusRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 6,
    marginBottom: 4,
  },
  statusLabel: {
    color: '#8BC34A',
    fontSize: 11,
    fontWeight: '400',
  },
  statusRunningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusRunning: {
    color: '#8BC34A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 3,
    justifyContent: 'space-between',
  },
  switchLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    flex: 1,
    marginLeft: 6,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchStatusText: {
    fontSize: 9,
    fontWeight: 'bold',
    marginRight: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTrack: {
    width: 32,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#43A047',
  },
  toggleActiveBlue: {
    backgroundColor: '#2196F3',
  },
  toggleActiveOrange: {
    backgroundColor: '#FF9800',
  },
  toggleInactive: {
    backgroundColor: '#455A64',
  },
  toggleThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  toggleThumbInactive: {
    alignSelf: 'flex-start',
  },
  // ===== SLIDER STYLES =====
  sliderRow: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 6,
    paddingVertical: 1,
    paddingHorizontal: 6,
    marginBottom: 3,
  },
  sliderLabel: {
    color: '#B0BEC5',
    fontSize: 9,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 28,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
  },
  sliderRangeText: {
    color: '#607D8B',
    fontSize: 8,
  },
});

export default OtherStatusControls;