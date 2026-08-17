// components/History/ESP32HistoryTab.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function ESP32HistoryTab({ history, loading }) {
  // Get command icon
  const getCommandIcon = (command) => {
    const icons = {
      'forward': 'arrow-up-circle',
      'backward': 'arrow-down-circle',
      'left': 'arrow-back-circle',
      'right': 'arrow-forward-circle',
      'stop': 'stop-circle',
      'moveForward': 'arrow-up-circle',
      'moveBackward': 'arrow-down-circle',
      'moveLeft': 'arrow-back-circle',
      'moveRight': 'arrow-forward-circle',
      'work_session': 'time-outline',
    };
    return icons[command] || 'radio-button-on';
  };

  // Get command color
  const getCommandColor = (command) => {
    const colors = {
      'forward': '#4CAF50',
      'backward': '#FF9800',
      'left': '#2196F3',
      'right': '#2196F3',
      'stop': '#f44336',
      'work_session': '#8BC34A',
    };
    return colors[command] || '#607D8B';
  };

  // Format command name
  const getCommandName = (command) => {
    const names = {
      'forward': 'Forward',
      'backward': 'Backward',
      'left': 'Turn Left',
      'right': 'Turn Right',
      'stop': 'Stop',
      'work_session': 'Work Session',
    };
    return names[command] || command;
  };

  const renderItem = ({ item }) => {
    const command = item.command || 'unknown';
    const params = item.params || {};
    const timestamp = item.timestamp || new Date().toISOString();

    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getCommandIcon(command)} 
              size={28} 
              color={getCommandColor(command)} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.commandName}>{getCommandName(command)}</Text>
            {command === 'work_session' && params.duration && (
              <Text style={styles.durationText}>
                ⏱️ {params.durationFormatted || `${Math.floor(params.duration / 60)}m`}
              </Text>
            )}
            {command === 'setDriveSpeed' && params.speed && (
              <Text style={styles.speedText}>⚡ Speed: {params.speed}</Text>
            )}
            <Text style={styles.timeText}>
              {new Date(timestamp).toLocaleString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8CE835" />
        <Text style={styles.loadingText}>Loading ESP32 history...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="hardware-chip-outline" size={48} color="#607D8B" />
        <Text style={styles.emptyText}>No ESP32 commands yet</Text>
        <Text style={styles.emptySubText}>Commands will appear here when you use the robot</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={history}
      renderItem={renderItem}
      keyExtractor={(item) => item.id || item.timestamp}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(3, 95, 16, 0.73)',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.15)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  commandName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  durationText: {
    color: '#8BC34A',
    fontSize: 13,
    marginTop: 2,
  },
  speedText: {
    color: '#FF9800',
    fontSize: 13,
    marginTop: 2,
  },
  timeText: {
    color: '#607D8B',
    fontSize: 11,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 12,
  },
  emptySubText: {
    color: '#607D8B',
    fontSize: 13,
    marginTop: 4,
  },
});