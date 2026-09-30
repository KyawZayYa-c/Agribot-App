import { View, Text } from 'react-native';

const TIPS = [
  'Make sure your phone and ESP32 are on the same WiFi network',
  'ESP32 IP address can be found in Serial Monitor',
  'You can also use "agrirobot.local" if MDNS is enabled',
];

const QuickTipsCard = ({ styles }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>💡 Quick Tips</Text>

      {TIPS.map((tip, index) => (
        <View key={index} style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}
    </View>
  );
};

export default QuickTipsCard;