// screens/HistoryScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Alert,
} from 'react-native';
import firebaseService from '../services/firebaseService';

import HistoryTabBar from '../components/History/HistoryTabBar';
import SummaryTab from '../components/History/SummaryTab';
import ChatListTab from '../components/History/ChatListTab';
import ESP32HistoryTab from '../components/History/ESP32HistoryTab';

export default function HistoryScreen({ onChatPress }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [chatHistory, setChatHistory] = useState([]);
  const [esp32History, setEsp32History] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      fetchAllHistory();
    }
  }, []);

  const fetchAllHistory = async () => {
    try {
      setLoading(true);
      console.log('📂 Fetching all history...');
      
      const chatResult = await firebaseService.getAllChatSessions();
      if (chatResult.success) {
        setChatHistory(chatResult.data);
        console.log(`✅ Loaded ${chatResult.data.length} chat sessions`);
      }

      const esp32Result = await firebaseService.getESP32CommandHistory(50);
      if (esp32Result.success) {
        setEsp32History(esp32Result.data);
        console.log(`✅ Loaded ${esp32Result.data.length} ESP32 command logs`);
      }

      const aiResult = await firebaseService.getAIPredictionHistory(50);
      if (aiResult.success) {
        setAiPredictions(aiResult.data);
        console.log(`✅ Loaded ${aiResult.data.length} AI predictions`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (id, isSession) => {
    console.log(`🗑️ Deleting chat ID: ${id}, isSession: ${isSession}`);
    
    if (!id) {
      Alert.alert('Error', 'Cannot delete: No ID found');
      return;
    }
    
    try {
      const response = await firebaseService.deleteChatSession(id);
      if (response.success) {
        await fetchAllHistory();
        Alert.alert('Success', 'Conversation deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
      Alert.alert('Error', 'Failed to delete conversation');
    }
  };

  const handleDeletePrediction = async (id) => {
    console.log(`🗑️ Deleting AI prediction ID: ${id}`);
    
    if (!id) {
      Alert.alert('Error', 'Cannot delete: No ID found');
      return;
    }
    
    try {
      const response = await firebaseService.deleteAIPrediction(id);
      if (response.success) {
        await fetchAllHistory();
        Alert.alert('Success', 'Prediction deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete prediction');
      }
    } catch (error) {
      console.error('❌ Error deleting prediction:', error);
      Alert.alert('Error', 'Failed to delete prediction');
    }
  };

  const getFilteredChats = () => {
    if (activeTab === 'all') return chatHistory;
    if (activeTab === 'ai') {
      return chatHistory.filter(item => {
        if (item.messages && item.messages.length > 0) {
          const lastMsg = item.messages[item.messages.length - 1];
          return lastMsg.sender === 'ai';
        }
        return false;
      });
    }
    if (activeTab === 'user') {
      return chatHistory.filter(item => {
        if (item.messages && item.messages.length > 0) {
          const lastMsg = item.messages[item.messages.length - 1];
          return lastMsg.sender === 'user';
        }
        return false;
      });
    }
    return [];
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // const handleChatPress = (chat) => {
  //   if (onChatPress) {
  //     onChatPress(chat);
  //   }
  // };

  const handleChatPress = (chat) => {
  if (onChatPress) {
    // ✅ Prediction data ပါရင် ပုံပါအောင်ပို့
    if (chat.result && chat.image) {
      onChatPress({
        ...chat,
        image: chat.image,
        result: chat.result,
      });
    } else {
      onChatPress(chat);
    }
  }
};

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/field_background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlayLayer}>
          {/* ✅ ScrollView ကိုဖယ်ပြီး View နဲ့ အစားထိုးပါ */}
          <View style={styles.scrollContent}>
            <Text style={styles.pageTitle}>📊 Analytics & History</Text>

            <HistoryTabBar activeTab={activeTab} onTabPress={setActiveTab} />

            {activeTab === 'summary' ? (
              <SummaryTab 
                chatHistory={chatHistory} 
                esp32History={esp32History} 
                today={today} 
              />
            ) : activeTab === 'esp32' ? (
              <ESP32HistoryTab history={esp32History} loading={loading} />
            ) : activeTab === 'ai-predict' ? (
              <ChatListTab
                activeTab="ai-predict"
                filteredChats={aiPredictions}
                loading={loading}
                 onChatPress={handleChatPress}
                onDeleteChat={handleDeletePrediction}
                isPrediction={true}
              />
            ) : (
              <ChatListTab
                activeTab={activeTab}
                filteredChats={getFilteredChats()}
                loading={loading}
                onChatPress={handleChatPress}
                onDeleteChat={handleDeleteChat}
                isPrediction={false}
              />
            )}
          </View>
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
    flex: 1,  // ✅ flex: 1 ထည့်ပါ
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
    marginBottom: 12,
  },
});