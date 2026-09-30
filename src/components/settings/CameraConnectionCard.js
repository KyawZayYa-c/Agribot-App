import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

const CameraConnectionCard = ({
  isCameraConnected,
  cameraIP,
  manualCameraIP,
  setManualCameraIP,
  cameraError,
  isLoadingCamera,
  quickIPs,
  onSaveCameraIP,
  styles,
}) => {
  return (
    <View style={[styles.card, styles.cameraCard]}>
      <Text style={[styles.cardTitle, styles.cameraCardTitle]}>📷 Camera</Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text
          style={[
            styles.statusValue,
            isCameraConnected
              ? styles.statusConnected
              : styles.statusDisconnected,
          ]}
        >
          {isCameraConnected ? '✅ Connected' : '❌ Disconnected'}
        </Text>
      </View>

      {cameraIP ? (
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Current IP:</Text>
          <Text style={styles.statusValue}>{cameraIP}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      <Text style={styles.label}>Camera IP Address</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Camera IP (e.g. 192.168.1.16)"
          value={manualCameraIP}
          onChangeText={setManualCameraIP}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
        <TouchableOpacity
          style={[
            styles.saveButton,
            styles.cameraSaveButton,
            isLoadingCamera && styles.buttonDisabled,
          ]}
          onPress={() => onSaveCameraIP()}
          disabled={isLoadingCamera}
        >
          {isLoadingCamera ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {cameraError ? (
        <Text style={styles.errorText}>⚠️ {cameraError}</Text>
      ) : null}

      <View style={styles.quickConnectRow}>
        {quickIPs.map((ip) => (
          <TouchableOpacity
            key={ip}
            style={[styles.quickButton, styles.cameraQuickButton]}
            onPress={() => {
              setManualCameraIP(ip);
              onSaveCameraIP(ip);
            }}
            disabled={isLoadingCamera}
          >
            <Text
              style={[styles.quickButtonText, styles.cameraQuickButtonText]}
            >
              {ip}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default CameraConnectionCard;