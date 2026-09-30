import { View, Text, Switch } from 'react-native';

const AutoConnectCard = ({ autoConnect, onToggle, styles }) => {
  return (
    <View style={styles.card}>
      <View style={styles.autoConnectRow}>
        <View style={styles.autoConnectText}>
          <Text style={styles.cardTitle}>🔄 Auto Connect</Text>
          <Text style={styles.autoConnectDescription}>
            Automatically connect to ESP32 when app starts
          </Text>
        </View>
        <Switch
          value={autoConnect}
          onValueChange={onToggle}
          trackColor={{ false: '#ccc', true: '#4CAF50' }}
          thumbColor={autoConnect ? '#8BC34A' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

export default AutoConnectCard;