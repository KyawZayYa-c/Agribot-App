// components/History/HistoryTabBar.js
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const tabs = [
  { key: 'summary', label: 'Summary', icon: 'stats-chart' },
  { key: 'all', label: 'All', icon: 'chatbubbles' },
  { key: 'esp32', label: 'Robot', icon: 'hardware-chip' },
  { key: 'ai-predict', label: 'AI Detect', icon: 'scan' },
  { key: 'ai', label: 'AI Chat', icon: 'chatbubble' },
  { key: 'user', label: 'User', icon: 'person' },
];

export default function HistoryTabBar({ activeTab, onTabPress }) {
  const scrollViewRef = useRef(null);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.key ? '#8CE835' : '#aaa'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollView: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 4,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 4,
    minWidth: 70,
  },
  activeTab: {
    backgroundColor: 'rgba(140, 232, 53, 0.15)',
  },
  tabText: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#8CE835',
  },
});