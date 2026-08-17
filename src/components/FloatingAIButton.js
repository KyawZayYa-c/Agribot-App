// components/FloatingAIButton.js
import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { checkGeminiHealth } from '../services/geminiProxyService';

export default function FloatingAIButton({ onPress }) {

  const handlePress = async () => {
    console.log('🤖 AI Button pressed...');
    
    // ✅ 1. Health Check ကို Background မှာခေါ် (Server ကိုနှိုး)
    //    ဒါက Promise ဖြစ်ပေမယ့် await မလုပ်ဘူး (Block မဖြစ်စေရန်)
    checkGeminiHealth().then(isHealthy => {
      console.log(`📊 Server health: ${isHealthy ? '✅ OK' : '⚠️ Waking up...'}`);
    }).catch(() => {
      console.log('⚠️ Health check failed, but continuing...');
    });
    
    // ✅ 2. AIChatScreen ကို တန်းသွား (sessionId = null)
    //    Session ID ကို AIChatScreen က ပထမဆုံးမေးခွန်းမှ ဖန်တီးမယ်
    if (onPress) {
      onPress(null); // sessionId = null
    }
  };

  return (
    <TouchableOpacity
      style={styles.fabContainer}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.fab}>
        <Image
          source={require('../../assets/ai-avatar.png')}
          style={styles.fabImage}
          resizeMode="cover"
        />
        <View style={styles.glowRing} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 5,
    bottom: 90,
    elevation: 10,
    zIndex: 999,
  },
  fab: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabImage: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: 'transparent',
  },
  glowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(139, 195, 74, 0.1)',
    opacity: 0.5,
  },
});