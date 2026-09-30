import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

const ESP32ConnectionCard = ({
  isConnected,
  espIP,
  manualIP,
  setManualIP,
  error,
  isLoading,
  isScanning,
  quickIPs,
  onSaveIP,
  onRefresh,
  onQuickConnect,
  onScan,
  styles,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🤖 ESP32 Connection</Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text
          style={[
            styles.statusValue,
            isConnected ? styles.statusConnected : styles.statusDisconnected,
          ]}
        >
          {isConnected ? '✅ Connected' : '❌ Disconnected'}
        </Text>
      </View>

      {espIP ? (
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Current IP:</Text>
          <Text style={styles.statusValue}>{espIP}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      <Text style={styles.label}>Manual IP Address</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter IP (e.g. 192.168.1.15)"
          value={manualIP}
          onChangeText={setManualIP}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={onSaveIP}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.refreshButton, isLoading && styles.buttonDisabled]}
          onPress={onRefresh}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickConnectRow}>
        {quickIPs.map((ip) => (
          <TouchableOpacity
            key={ip}
            style={styles.quickButton}
            onPress={() => onQuickConnect(ip)}
            disabled={isLoading}
          >
            <Text style={styles.quickButtonText}>{ip}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.scanButton, isScanning && styles.scanButtonActive]}
        onPress={onScan}
        disabled={isScanning}
        activeOpacity={0.8}
      >
        {isScanning ? (
          <View style={styles.scanButtonContent}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.scanButtonText}> Scanning...</Text>
          </View>
        ) : (
          <Text style={styles.scanButtonText}>🔍 Scan for ESP32</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ESP32ConnectionCard;