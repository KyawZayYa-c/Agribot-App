// App.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import DashboardScreen from './src/screens/DashboardScreen';
import ControlScreen from './src/screens/ControlScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AIChatScreen from './src/screens/AIChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BottomNavBar from './src/components/BottomNavBar';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import FloatingAIButton from './src/components/FloatingAIButton';
import AITestScreen from './src/screens/AITestScreen';
import { LanguageProvider } from './src/context/LanguageContext';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#43A047',
    background: '#0B1E13',
  },
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  // ✅ State for control params
  const [controlParams, setControlParams] = useState(null);
  const [showAITest, setShowAITest] = useState(false);
  const [aiTestImage, setAiTestImage] = useState(null);

  const openAITest = (imageUri) => {
    setAiTestImage(imageUri);
    setShowAITest(true);
  };

  const closeAITest = () => {
    setShowAITest(false);
    setAiTestImage(null);
  };

  const openAIChat = (sessionId) => {
    setCurrentSessionId(sessionId);
    setShowAIChat(true);
  };

  const closeAIChat = () => {
    setShowAIChat(false);
  };

  const openChatDetail = (chat) => {
    setSelectedChat(chat);
  };

  const closeChatDetail = () => {
    setSelectedChat(null);
  };

  const renderScreen = () => {
    if (selectedChat) {
      return <ChatDetailScreen chat={selectedChat} onBack={closeChatDetail} />;
    }

    if (showAIChat) {
      return (
        <AIChatScreen 
          onBack={closeAIChat} 
          sessionId={currentSessionId} 
        />
      );
    }

    if (showAITest) {
      return <AITestScreen 
        onBack={closeAITest} 
        initialImage={aiTestImage}  
      />;
    }

    switch (currentTab) {
      case 'dashboard':
        return <DashboardScreen 
          onNavigate={(screen, params) => {
            setCurrentTab(screen);
            if (params) {
              setControlParams(params);
            }
          }} 
        />;
      case 'control':
        return <ControlScreen 
          onBack={() => {
            setCurrentTab('dashboard');
            setControlParams(null);
          }} 
          routeParams={controlParams}
          onOpenAITest={openAITest}
        />;
      case 'history':
        return <HistoryScreen onChatPress={openChatDetail} />;
      case 'aitest':
        return <AITestScreen onBack={() => setCurrentTab('dashboard')} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  // ✅ shouldShowBottomNav - selectedChat ရှိရင် မပြပါနဲ့
  const shouldShowBottomNav = !showAIChat && 
    currentTab !== 'control' && 
    !selectedChat &&  // ✅ ဒါကို ထည့်ပါ
    currentTab !== 'aitest';

  // ✅ shouldShowAIFloatingButton - selectedChat ရှိရင် မပြပါနဲ့
  const shouldShowAIFloatingButton = !showAIChat && 
    currentTab !== 'control' && 
    currentTab !== 'aitest' &&
    currentTab !== 'settings' &&
    currentTab !== 'history' &&
    !selectedChat;  // ✅ ဒါကို ထည့်ပါ

  return (
    <PaperProvider theme={theme}>
      <LanguageProvider>
        <View style={styles.container}>
          {renderScreen()}

          {shouldShowAIFloatingButton && (
            <FloatingAIButton onPress={openAIChat} />
          )}

          {shouldShowBottomNav && (
            <BottomNavBar activeTab={currentTab} onTabPress={setCurrentTab} />
          )}
        </View>
      </LanguageProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1E13',
  },
});