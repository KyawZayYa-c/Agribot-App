import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Components
import LoadingIndicator from '../components/common/LoadingIndicator';
import ConnectionStatusCard from '../components/dashboard/ConnectionStatusCard';
import TelemetryCard from '../components/dashboard/TelemetryCard';

// Hooks
import { useDashboard } from '../hooks/useDashboard';

const backgroundImage = require('../../assets/field_background.jpg');

export default function DashboardScreen({ onNavigate }) {
  const { loading, isConnected, isConnecting, telemetry, todayWorkTime, error } = useDashboard();

  // Get today's date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ✅ Show loading only on first load
  if (loading && isConnecting) {
    return <LoadingIndicator message="Loading Dashboard..." />;
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlayLayer}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageTitle}>🚜 Dashboard</Text>

            {/* Show error if any (but don't crash) */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Connection Status */}
            <Text style={styles.sectionTitle}>● Connection Status</Text>
            <ConnectionStatusCard isConnected={isConnected} />

            {/* Telemetry Overview */}
            <Text style={styles.sectionTitle}>● Telemetry Overview</Text>
            <TelemetryCard telemetry={telemetry} todayWorkTime={todayWorkTime} />

            {/* Start Auto Mode */}
            <Button 
              mode="contained"
              icon="play"
              contentStyle={styles.buttonContent}
              style={styles.autoButton}
              labelStyle={styles.buttonLabel}
              onPress={() => {
                console.log('🚀 Auto Mode Started');
                onNavigate('control', { startWork: true });
              }}
            >
              Start Mode
            </Button>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%' },
  overlayLayer: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 90,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#8BC34A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 10,
  },
  autoButton: {
    borderRadius: 25,
    marginTop: 10,
    backgroundColor: 'rgba(3, 95, 16, 0.73)',
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.2)',
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
});