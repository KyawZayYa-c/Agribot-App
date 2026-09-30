import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ConnectionStatusCard = ({ isConnected }) => {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <MaterialCommunityIcons name="tractor" size={28} color="#8BC34A" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>Vehicle</Text>
            <Text style={[styles.statusText, isConnected ? styles.connected : styles.disconnected]}>
              ● {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Ionicons name="cloud-outline" size={28} color="#8BC34A" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>Server</Text>
            <Text style={styles.statusText}>● Connected</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(3, 95, 16, 0.73)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.2)',
    padding: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textGroup: {
    marginLeft: 12,
  },
  label: {
    color: '#B0BEC5',
    fontSize: 12,
    fontWeight: '400',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  connected: {
    color: '#8BC34A',
  },
  disconnected: {
    color: '#EF5350',
  },
});

export default ConnectionStatusCard;