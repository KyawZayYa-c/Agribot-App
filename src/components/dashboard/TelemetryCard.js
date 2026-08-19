// components/dashboard/TelemetryCard.js
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const TelemetryCard = ({ telemetry, todayWorkTime }) => {
  
  // ✅ Firebase ကနေပြန်လာတာကို Console Log နဲ့ပြ
  useEffect(() => {
    if (todayWorkTime) {
      console.log('📊 TelemetryCard received todayWorkTime:', todayWorkTime);
      console.log(`   ✅ Today's Work: ${todayWorkTime.formatted}`);
      console.log(`   ⏱️ Total Seconds: ${todayWorkTime.totalSeconds}`);
      console.log(`   📅 Hours: ${todayWorkTime.hours}h ${todayWorkTime.minutes}m`);
    }
  }, [todayWorkTime]);

  // ✅ Data array - ESP32 API ကနေလာတဲ့ Data တွေကိုသုံး
  const telemetryItems = [
    // {
    //   id: 'battery',
    //   icon: <MaterialCommunityIcons name="battery-charging" size={24} color="#8BC34A" />,
    //   label: 'Battery',
    //   value: `${telemetry.battery || 0}%`,
    //   subLabel: telemetry.battery > 80 ? 'Good' : telemetry.battery > 20 ? 'Medium' : 'Low',
    //   progress: (telemetry.battery || 0) / 100,
    //   showProgress: true,
    // },
    // {
    //   id: 'seed',
    //   icon: <MaterialCommunityIcons name="seed" size={24} color="#8BC34A" />,
    //   label: 'Seed Level',
    //   value: `${telemetry.seedLevel || 0}%`,
    //   subLabel: 'Remaining',
    //   progress: (telemetry.seedLevel || 0) / 100,
    //   showProgress: true,
    // },
    // {
    //   id: 'distance',
    //   icon: <Ionicons name="location-outline" size={24} color="#8BC34A" />,
    //   label: 'Distance',
    //   value: `${telemetry.distance || 0} km`,
    //   subLabel: 'Today',
    //   showProgress: false,
    // },
    {
      id: 'time',
      icon: <Ionicons name="time-outline" size={24} color="#8BC34A" />,
      label: 'Working Time',
      // ✅ todayWorkTime ကနေယူပြီးပြ
      value: todayWorkTime?.formatted || telemetry.workingTime || '00:00',
      subLabel: 'Today',
      showProgress: false,
    },
  ];

  const row1 = telemetryItems.slice(0, 2);
  const row2 = telemetryItems.slice(2, 4);

  const renderCard = (item) => (
    <View key={item.id} style={styles.halfCard}>
      <View style={styles.telemetryHeader}>
        {item.icon}
        <Text style={styles.label}>{item.label}</Text>
      </View>
      <Text style={styles.valueText}>{item.value}</Text>
      <Text style={styles.subLabel}>{item.subLabel}</Text>
      {item.showProgress && (
        <ProgressBar 
          progress={item.progress} 
          color="#8BC34A" 
          style={styles.progressBar} 
        />
      )}
    </View>
  );

  return (
    <>
      <View style={styles.row}>
        {row1.map(renderCard)}
      </View>
      <View style={styles.row}>
        {row2.map(renderCard)}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  halfCard: {
    flex: 1,
    backgroundColor: 'rgba(3, 95, 16, 0.73)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.2)',
    padding: 14,
  },
  label: {
    color: '#B0BEC5',
    fontSize: 12,
    fontWeight: '400',
  },
  subLabel: {
    color: '#78909C',
    fontSize: 11,
    marginTop: 2,
  },
  telemetryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});

export default TelemetryCard;