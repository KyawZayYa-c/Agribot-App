import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';

export default function BottomNavBar({ activeTab, onTabPress }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'view-dashboard' },
    // { id: 'control', label: 'Control', icon: 'controller-classic' },
    { id: 'aitest', label: 'AI Test', icon: 'brain' },
    { id: 'history', label: 'History', icon: 'chart-bar' },
    { id: 'settings', label: 'Settings', icon: 'cog' },
  ];

  const isControlMode = activeTab === 'control';

  return (
    <View style={[styles.navBar, isControlMode && styles.navBarControlMode]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity 
            key={tab.id} 
            style={styles.tabItem} 
            onPress={() => onTabPress(tab.id)}
          >
            <Avatar.Icon 
              size={isControlMode ? 28 : 36} 
              icon={tab.icon} 
              backgroundColor="transparent" 
              color={isActive ? '#8BC34A' : '#80a9bf'} 
            />
            <Text style={[styles.tabLabel, { color: isActive ? '#8BC34A' : '#607D8B' }, isControlMode && styles.tabLabelControlMode]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    backgroundColor: '#0B1E13',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 94,        
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 0,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: -2,
  },
  tabLabelControlMode: {
    fontSize: 11,
  }
});