// components/control/ControlHeader.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ControlHeader = ({ onBack, isConnected = true }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.connectedIndicator}>
          <View style={styles.greenDot} />
          <Text style={styles.connectionText}>Connected</Text>
        </View>
        <Ionicons name="wifi" size={16} color="#8BC34A" style={styles.wifiIcon} />
      </View>
      
      <Text style={styles.headerTitle}>Remote Control</Text>
      
      <View style={styles.headerRight}>
        <MaterialCommunityIcons name="battery-outline" size={18} color="#8BC34A" />
        <Ionicons name="ellipsis-vertical" size={18} color="#FFFFFF" style={styles.menuIcon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 39,
    paddingVertical: 8,
    backgroundColor: '#0B1E13',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  connectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 195, 74, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.2)',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8BC34A',
    marginRight: 4,
  },
  connectionText: {
    color: '#8BC34A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  wifiIcon: {
    marginLeft: 6,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginLeft: 8,
  },
});

export default ControlHeader;