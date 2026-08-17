// components/control/BottomMetricsBar.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const BottomMetricsBar = ({
  workTime = '00:00',
  signalStrength = 0,
  batteryLevel = 0,
  isWorkRunning = false,
  onToggleWorkTime,
  isEspConnected = false,
}) => {
  const totalBars = 4;

  const getSignalText = (strength) => {
    if (strength >= 3) return 'Strong';
    if (strength >= 2) return 'Good';
    if (strength >= 1) return 'Weak';
    return 'No Signal';
  };

  // ✅ Get signal color based on strength
  const getSignalColor = (strength) => {
    if (strength >= 3) return '#4CAF50';
    if (strength >= 2) return '#FFC107';
    if (strength >= 1) return '#FF9800';
    return '#f44336';
  };

  // ✅ Get battery color based on level
  const getBatteryColor = (level) => {
    if (level > 50) return '#4CAF50';
    if (level > 20) return '#FFC107';
    return '#f44336';
  };

  return (
    <View style={styles.bottomMetricsRow}>
      {/* Work Time */}
      {/* Work Time */}
<TouchableOpacity 
  style={styles.bottomMetricCard}
  onPress={onToggleWorkTime}
  activeOpacity={0.7}
>
  <Ionicons 
    name="time-outline" 
    size={24} 
    color={isWorkRunning ? '#FF9800' : '#8BC34A'} 
  />
  <View style={styles.bottomMetricTexts}>
    <View style={styles.workTimeHeader}>
      <Text style={styles.bottomMetricLabel}>Work Time</Text>
      <View style={styles.workTimeToggle}>
        <Text style={[styles.workTimeToggleText, { color: isWorkRunning ? '#FF9800' : '#8BC34A' }]}>
          {isWorkRunning ? '⏹' : '▶'}
        </Text>
      </View>
    </View>
    <View style={styles.workTimeRow}>
      <View style={[styles.workIndicator, isWorkRunning ? styles.workActive : styles.workInactive]} />
      <Text style={[styles.bottomMetricValue, { color: isWorkRunning ? '#FF9800' : '#FFFFFF' }]}>
        {workTime}
      </Text>
    </View>
  </View>
</TouchableOpacity>

      {/* Signal */}
      <View style={styles.bottomMetricCard}>
        <Ionicons 
          name="cellular-outline" 
          size={24} 
          color={signalStrength > 0 ? '#43A047' : '#f44336'} 
        />
        <View style={styles.bottomMetricTexts}>
          <Text style={styles.bottomMetricLabel}>Signal</Text>
          <View style={styles.signalBarsSmall}>
            {[...Array(totalBars)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.signalBarSmall,
                  { height: (index + 1) * 3 + 3 },
                  index < signalStrength 
                    ? styles.signalBarActiveSmall 
                    : styles.signalBarInactiveSmall,
                ]}
              />
            ))}
          </View>
          <Text style={[styles.bottomMetricValue, { color: getSignalColor(signalStrength), fontSize: 11 }]}>
            {getSignalText(signalStrength)}
          </Text>
        </View>
      </View>

      {/* Battery */}
      <View style={styles.bottomMetricCard}>
       <MaterialCommunityIcons 
  name={batteryLevel > 20 ? "battery" : "battery-alert"} 
  size={24} 
  color={getBatteryColor(batteryLevel)} 
/>
        <View style={styles.bottomMetricTexts}>
          <Text style={styles.bottomMetricLabel}>Battery</Text>
          <View style={styles.batteryContainerSmall}>
            <View 
              style={[
                styles.batteryFillSmall, 
                { 
                  width: `${Math.min(batteryLevel, 100)}%`,
                  backgroundColor: getBatteryColor(batteryLevel)
                }
              ]} 
            />
          </View>
          <Text style={[styles.bottomMetricValue, { color: getBatteryColor(batteryLevel), fontSize: 14 }]}>
            {Math.round(batteryLevel)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '100%',
    paddingHorizontal: 10,
    gap: 8,
  },
  bottomMetricCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 195, 74, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.25)',
    borderRadius: 10,
    height: '80%',
  },
  bottomMetricTexts: {
    marginLeft: 8,
  },
  bottomMetricLabel: {
    color: '#607D8B',
    fontSize: 8,
  },
  bottomMetricValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  workTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  workActive: {
    backgroundColor: '#FF9800',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  workTimeHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  },
  workTimeToggle: {
  marginLeft: 8,
},
workTimeToggleText: {
  fontSize: 14,
  fontWeight: 'bold',
},
  workInactive: {
    backgroundColor: '#455A64',
  },
  signalBarsSmall: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    gap: 1,
    marginVertical: 2,
  },
  signalBarSmall: {
    width: 3,
    borderRadius: 1,
  },
  signalBarActiveSmall: {
    backgroundColor: '#8BC34A',
  },
  signalBarInactiveSmall: {
    backgroundColor: '#455A64',
  },
  batteryContainerSmall: {
    height: 8,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 2,
  },
  batteryFillSmall: {
    height: '100%',
    borderRadius: 4,
  },
});

export default BottomMetricsBar;