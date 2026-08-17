// components/dashboard/SoilDetectionCard.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const SoilDetectionCard = ({
  isDetecting,
  detectedSoil,
  showResult,
  onDetect,
  onClose,
  onSpeak,
}) => {
  return (
    <>
      {/* Detection Button */}
      <TouchableOpacity 
        style={styles.actionCard} 
        onPress={onDetect}
        activeOpacity={0.8}
        disabled={isDetecting}
      >
        <View style={styles.actionCardContent}>
          <MaterialCommunityIcons name="camera" size={32} color="#8BC34A" />
          <View style={styles.actionCardTexts}>
            <Text style={styles.actionCardTitle}>
              {isDetecting ? '⏳ Detecting...' : '🔬 Soil Detection'}
            </Text>
            <Text style={styles.actionCardSub}>
              {isDetecting ? 'Please wait...' : 'Detect soil type & get crop recommendations'}
            </Text>
          </View>
          {isDetecting ? (
            <ActivityIndicator size="small" color="#8BC34A" />
          ) : (
            <Ionicons name="chevron-forward" size={24} color="#8BC34A" />
          )}
        </View>
      </TouchableOpacity>

      {/* Result Card */}
      {showResult && detectedSoil && (
        <Card style={styles.resultCard}>
          <Card.Content>
            {/* Header */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{detectedSoil.icon}</Text>
              <View style={styles.resultHeaderTexts}>
                <Text style={styles.resultTitle}>Soil Type Detected</Text>
                <Text style={styles.confidenceText}>
                  Confidence: {(detectedSoil.confidence * 100).toFixed(0)}%
                </Text>
              </View>
              <TouchableOpacity 
                onPress={onClose}
                style={styles.closeResultBtn}
              >
                <Ionicons name="close" size={20} color="#607D8B" />
              </TouchableOpacity>
            </View>
            
            {/* Soil Name */}
            <Text style={styles.soilName}>{detectedSoil.name}</Text>
            
            {/* Description */}
            <Text style={styles.soilDescription}>{detectedSoil.description}</Text>
            
            {/* Recommended Crops */}
            <Text style={styles.cropTitle}>✅ သင့်တော်သော သီးနှံများ:</Text>
            <View style={styles.cropContainer}>
              {detectedSoil.crops.map((crop, index) => (
                <View key={index} style={styles.cropTag}>
                  <Text style={styles.cropText}>🌾 {crop}</Text>
                </View>
              ))}
            </View>

            {/* Audio Button */}
            <TouchableOpacity 
              style={styles.audioBtn}
              onPress={() => onSpeak(`${detectedSoil.name}။ ${detectedSoil.description}`)}
            >
              <Ionicons name="play-circle" size={20} color="#8BC34A" />
              <Text style={styles.audioBtnText}>🔊 Listen Voice Guide</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: 'rgba(3, 95, 16, 0.73)',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.2)',
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCardTexts: {
    flex: 1,
    marginLeft: 12,
  },
  actionCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionCardSub: {
    color: '#B0BEC5',
    fontSize: 12,
    marginTop: 2,
  },
  resultCard: {
    backgroundColor: 'rgba(3, 95, 16, 0.85)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.3)',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  resultHeaderTexts: {
    flex: 1,
  },
  resultTitle: {
    color: '#8BC34A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confidenceText: {
    color: '#607D8B',
    fontSize: 11,
  },
  closeResultBtn: {
    padding: 4,
  },
  soilName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  soilDescription: {
    color: '#B0BEC5',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  cropTitle: {
    color: '#8BC34A',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cropContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10,
  },
  cropTag: {
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.2)',
  },
  cropText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 195, 74, 0.1)',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.2)',
    marginTop: 2,
  },
  audioBtnText: {
    color: '#8BC34A',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SoilDetectionCard;