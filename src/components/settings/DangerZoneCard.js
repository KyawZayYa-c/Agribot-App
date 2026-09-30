import { View, Text, TouchableOpacity } from 'react-native';

const DangerZoneCard = ({ onClearSettings, styles }) => {
  return (
    <View style={[styles.card, styles.dangerCard]}>
      <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>

      <TouchableOpacity style={styles.clearButton} onPress={onClearSettings}>
        <Text style={styles.clearButtonText}>🗑️ Clear All Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DangerZoneCard;