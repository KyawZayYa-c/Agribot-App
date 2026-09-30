import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function SummaryTab({ chatHistory = [], esp32History = [], today }) {
  const totalSessions = chatHistory.length;
  const totalCommands = esp32History.length;
  
  const workSessions = esp32History.filter(item => item.command === 'work_session');
  const totalWorkTime = workSessions.reduce((acc, item) => {
    return acc + (item.params?.duration || 0);
  }, 0);
  
  const hours = Math.floor(totalWorkTime / 3600);
  const minutes = Math.floor((totalWorkTime % 3600) / 60);

  return (
    <View style={styles.container}>
      <Card style={styles.glassCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>📊 Today's Summary</Text>
          <Text style={styles.summaryDate}>{today}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="chatbubbles" size={24} color="#8CE835" />
              <Text style={styles.statNumber}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Chats</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="hardware-chip" size={24} color="#8CE835" />
              <Text style={styles.statNumber}>{totalCommands}</Text>
              <Text style={styles.statLabel}>Commands</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>{hours}h {minutes}m</Text>
              <Text style={styles.statLabel}>Work Time</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkbox" size={24} color="#4FC3F7" />
              <Text style={styles.statNumber}>{workSessions.length}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  glassCard: {
    backgroundColor: 'rgba(3, 95, 16, 0.73)',
    borderRadius: 12,
    elevation: 0,
    marginBottom: 16,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryDate: {
    color: '#90A4AE',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#90A4AE',
    fontSize: 12,
  },
});