// screens/AIChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Platform,
  StatusBar,
  ActivityIndicator,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Avatar } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { callGeminiProxy } from '../services/geminiProxyService';
import firebaseService from '../services/firebaseService';
// ✅ react-native-keyboard-controller ကို import လုပ်ပါ
import {
  KeyboardController,
  KeyboardProvider,        // ✅ ဒီဟာကို ထည့်ပါ
  KeyboardAvoidingView,
  useKeyboardHandler,
} from 'react-native-keyboard-controller';

const backgroundImage = require('../../assets/field_background.jpg');
const { height: screenHeight } = Dimensions.get('window');

const AITextRenderer = ({ text }) => {
  if (!text) return <Text style={styles.messageText}>အဖြေမရှိပါ။</Text>;

  const lines = text.split('\n');

  return (
    <View style={styles.aiMessageContainer}>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('# ')) {
          return (
            <View key={index} style={styles.heading1Wrapper}>
              <Text style={styles.heading1Text}>
                🔹 {trimmedLine.replace('# ', '')}
              </Text>
              <View style={styles.headingLine} />
            </View>
          );
        }

        if (trimmedLine.startsWith('## ')) {
          return (
            <Text key={index} style={styles.heading2Text}>
              🔸 {trimmedLine.replace('## ', '')}
            </Text>
          );
        }

        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          const content = trimmedLine.replace(/^[-*]\s+/, '');
          return (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>{parseBoldText(content)}</Text>
            </View>
          );
        }

        if (trimmedLine.length > 0) {
          return (
            <Text key={index} style={styles.normalLineText}>
              {parseBoldText(trimmedLine)}
            </Text>
          );
        }

        return <View key={index} style={{ height: 6 }} />;
      })}
    </View>
  );
};

const parseBoldText = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={styles.boldText}>
          {part.substring(2, part.length - 2)}
        </Text>
      );
    }
    return part;
  });
};

export default function AIChatScreen({ onBack, sessionId: initialSessionId }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(initialSessionId || null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const quickActions = [
    { icon: 'leaf', label: '🌾 သီးနှံအကြံပြုချက်', id: 'crop', placeholder: 'ဘယ်မြေမှာ ဘာစိုက်ရမလဲ?' },
    { icon: 'bug', label: '🦠 ရောဂါလမ်းညွှန်', id: 'disease', placeholder: 'အရွက်ဝါနေတယ် ဘာလုပ်ရမလဲ?' },
    { icon: 'shield-bug', label: '🐛 ပိုးမွှားကာကွယ်ရေး', id: 'pest', placeholder: 'စပါးပိုးကျနေတယ် ဘယ်လိုကုသမလဲ?' },
    { icon: 'sprout', label: '🌱 ဓာတ်မြေဩဇာလမ်းညွှန်', id: 'fertilizer', placeholder: 'မြေဩဇာ ဘယ်လိုရွေးချယ်ရမလဲ?' },
    { icon: 'book-open-variant', label: '📖 စိုက်ပျိုးရေးလမ်းညွှန်', id: 'farming', placeholder: 'စပါး ဘယ်လိုစိုက်ရမလဲ?' },
    { icon: 'help-circle', label: '❓ မေးခွန်းအားလုံး', id: 'general', placeholder: 'စိုက်ပျိုးရေးနဲ့ပတ်သက်တာမေးပါ...' },
  ];

  const scrollViewRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates?.height || 0);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      if (initialSessionId) {
        setSessionId(initialSessionId);
        const result = await firebaseService.getChatSession(initialSessionId);
        if (result.success && result.data) {
          const loadedMessages = result.data.messages || [];
          const formattedMessages = loadedMessages.map((msg, index) => ({
            id: index + 1,
            sender: msg.sender || 'user',
            text: msg.text || msg.message || '',
            time: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          }));
          setMessages(formattedMessages);
        } else {
          await createNewSession();
        }
      }
    };
    
    loadSession();
  }, [initialSessionId]);

  const createNewSession = async () => {
    try {
      const result = await firebaseService.startChatSession();
      if (result.success) {
        setSessionId(result.sessionId);
        return result.sessionId;
      } else {
        const fallbackId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
        setSessionId(fallbackId);
        return fallbackId;
      }
    } catch (error) {
      const fallbackId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
      setSessionId(fallbackId);
      return fallbackId;
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    const currentFeature = selectedFeature || 'general';
    const currentMessage = message;
    
    setMessage('');
    setSelectedFeature(null);
    setIsLoading(true);

    Keyboard.dismiss();

    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await createNewSession();
      }

      if (currentSessionId) {
        await firebaseService.addMessageToSession(currentSessionId, currentMessage, 'user');
      }

      const response = await callGeminiProxy(currentMessage, currentFeature, currentSessionId);
      
      let aiReply = 'ကျေးဇူးပြု၍ နောက်မှထပ်ကြိုးစားပါ။';
      
      if (response && response.success) {
        aiReply = response.reply || aiReply;
      } else {
        aiReply = response?.reply || 'AI မှ အဖြေမရရှိပါ။ ကျေးဇူးပြု၍ နောက်မှထပ်ကြိုးစားပါ။';
      }
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, aiMessage]);

      if (currentSessionId && response && response.success) {
        await firebaseService.addMessageToSession(currentSessionId, aiReply, 'ai');
      }

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 2,
        sender: 'ai',
        text: 'တစ်ခုခု အဆင်မပြေဖြစ်နေပါတယ်။ ကျေးဇူးပြု၍ နောက်မှထပ်ကြိုးစားပါ။',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.id === 'general') {
      setSelectedFeature(null);
    } else {
      setSelectedFeature(action.id);
    }
  };

  // ✅ KeyboardProvider နဲ့ wrap လုပ်ပါ
  return (
    <KeyboardProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
          <View style={styles.overlay}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerLeft}>
                <Avatar.Icon size={36} icon="robot" backgroundColor="#8BC34A" color="#0B1E13" />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Agri-AI Assistant</Text>
                  <View style={styles.poweredByContainer}>
                    <Text style={styles.poweredByText}>Powered by </Text>
                    <Text style={styles.geminiText}>Gemini</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.headerRight} activeOpacity={0.7}>
                <Ionicons name="settings-outline" size={24} color="#8BC34A" />
              </TouchableOpacity>
            </View>

            <View style={styles.headerBottomBar} />

            {/* KeyboardAvoidingView */}
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
              <View style={{ flex: 1 }}>
                <ScrollView
                  ref={scrollViewRef}
                  style={styles.chatContainer}
                  contentContainerStyle={[
                    styles.chatContent,
                    isKeyboardVisible && { paddingBottom: keyboardHeight + 60 },
                  ]}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  scrollEventThrottle={16}
                >
                  {messages.length === 0 && (
                    <View style={styles.introCardContainer}>
                      <View style={styles.introCardGradient}>
                        <View style={styles.botIconCircle}>
                          <MaterialCommunityIcons name="robot" size={32} color="#CCFF90" />
                        </View>
                        <Text style={styles.introTitle}>မင်္ဂလာပါဗျာ 🙏</Text>
                        <Text style={styles.introSubtitle}>
                          ကျွန်တော်ကတော့ စိုက်ပျိုးရေးဆိုင်ရာ ကိစ္စရပ်တွေကို အကောင်းဆုံး ကူညီဖြေကြားပေးမယ့် {"\n"}
                          <Text style={{ color: '#CCFF90', fontWeight: 'bold' }}>Agri-AI Assistant</Text> ဖြစ်ပါတယ်ခင်ဗျာ။
                        </Text>
                        <View style={styles.introDivider} />
                        <Text style={styles.introHint}>
                          အောက်က ကဏ္ဍခွဲလေးတွေကို ရွေးချယ်ပြီးဖြစ်စေ၊ သိလိုသမျှကို စာရိုက်၍ဖြစ်စေ လွတ်လပ်စွာ မေးမြန်းနိုင်ပါတယ်ဗျာ။
                        </Text>
                      </View>
                    </View>
                  )}

                  {messages.map((msg) => (
                    <View
                      key={msg.id}
                      style={[
                        styles.messageWrapper,
                        msg.sender === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper,
                      ]}
                    >
                      <View
                        style={[
                          styles.messageBubble,
                          msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                        ]}
                      >
                        {msg.sender === 'user' ? (
                          <Text style={styles.messageText}>{msg.text}</Text>
                        ) : (
                          <AITextRenderer text={msg.text} />
                        )}
                        <Text style={styles.messageTime}>{msg.time}</Text>
                      </View>
                    </View>
                  ))}

                  {isLoading && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#8BC34A" />
                      <Text style={styles.loadingText}>စဉ်းစားနေပါသည်...</Text>
                    </View>
                  )}
                </ScrollView>

                {/* Quick Actions */}
                {!selectedFeature && (
                  <View style={styles.quickActionsWrapper}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.quickActionsContent}
                    >
                      {quickActions.map((action, index) => (
                        <TouchableOpacity 
                          key={index} 
                          style={styles.quickActionBtn}
                          activeOpacity={0.7}
                          onPress={() => handleQuickAction(action)}
                        >
                          <Text style={styles.quickActionText}>
                            {action.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Input Area */}
                <View 
                  style={[
                    styles.inputAreaContainer,
                    { 
                      paddingBottom: isKeyboardVisible 
                        ? 8 
                        : Math.max(insets.bottom, 12) 
                    }
                  ]}
                >
                  {selectedFeature && (
                    <View style={styles.inputCategoryBar}>
                      <View style={styles.inputCategoryBadge}>
                        <Ionicons name="bookmark" size={12} color="#0B1E13" style={{ marginRight: 4 }} />
                        <Text style={styles.inputCategoryText}>
                          {quickActions.find(a => a.id === selectedFeature)?.label}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => setSelectedFeature(null)}
                          style={styles.inputCategoryClose}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="close-circle" size={16} color="#0B1E13" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View style={styles.inputWrapper}>
                    <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
                      <Ionicons name="attach" size={24} color="#AEDB9F" />
                    </TouchableOpacity>

                    <TextInput
                      ref={inputRef}
                      style={styles.input}
                      placeholder={selectedFeature ? quickActions.find(a => a.id === selectedFeature)?.placeholder : "စိုက်ပျိုးရေးနဲ့ပတ်သက်တာမေးပါ..."}
                      placeholderTextColor="#AEDB9F"
                      value={message}
                      onChangeText={setMessage}
                      multiline
                      returnKeyType="send"
                      editable={!isLoading}
                      onSubmitEditing={() => {
                        if (message.trim() && !isLoading) {
                          sendMessage();
                        }
                      }}
                      onFocus={() => {
                        setTimeout(() => {
                          scrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 300);
                      }}
                    />

                    <TouchableOpacity 
                      style={[styles.sendBtn, (!message.trim() || isLoading) && styles.sendBtnDisabled]} 
                      onPress={sendMessage} 
                      activeOpacity={0.7}
                      disabled={!message.trim() || isLoading}
                    >
                      <Ionicons name="send" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.disclaimer}>
                    AI ရဲ့ အဖြေတွေက သတင်းအချက်အလက်အတွက်သာ ဖြစ်ပါတယ်
                  </Text>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </ImageBackground>
      </View>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  // ... styles အကုန်လုံး အတူတူပါ ...
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(11, 30, 19, 0.85)',
  },
  backBtn: {
    padding: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  headerTextContainer: {
    marginLeft: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  poweredByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poweredByText: {
    color: '#B0BEC5',
    fontSize: 11,
  },
  geminiText: {
    color: '#AEDB9F',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerRight: {
    padding: 4,
  },
  headerBottomBar: {
    height: 1.5,
    backgroundColor: 'rgba(139, 195, 74, 0.2)',
    width: '100%',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContent: {
    paddingVertical: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  introCardContainer: {
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  introCardGradient: {
    backgroundColor: 'rgba(11, 30, 19, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.3)',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  botIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.3)',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 13.5,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 20,
  },
  introDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    width: '80%',
    marginVertical: 12,
  },
  introHint: {
    fontSize: 12,
    color: '#AEDB9F',
    textAlign: 'center',
    lineHeight: 16,
  },
  messageWrapper: {
    marginBottom: 14,
    width: '100%',
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '88%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: 'rgba(76, 175, 80, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  messageTime: {
    color: '#B0BEC5',
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  aiMessageContainer: {
    width: '100%',
  },
  heading1Wrapper: {
    marginTop: 10,
    marginBottom: 6,
    width: '100%',
  },
  heading1Text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CCFF90',
    lineHeight: 26,
  },
  headingLine: {
    height: 1,
    backgroundColor: 'rgba(204, 255, 144, 0.3)',
    marginTop: 4,
    width: '100%',
  },
  heading2Text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#AEDB9F',
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
    paddingLeft: 4,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#CCFF90',
    marginRight: 8,
    lineHeight: 24,
  },
  bulletText: {
    fontSize: 15.5,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 24,
  },
  normalLineText: {
    fontSize: 15.5,
    color: '#FFFFFF',
    lineHeight: 24,
    marginVertical: 2,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#FFF59D',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 16,
  },
  loadingText: {
    color: '#AEDB9F',
    fontSize: 13,
    marginLeft: 8,
  },
  quickActionsWrapper: {
    paddingVertical: 4,
  },
  quickActionsContent: {
    paddingHorizontal: 16,
  },
  quickActionBtn: {
    backgroundColor: 'rgba(11, 30, 19, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.25)',
    marginRight: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  inputAreaContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    backgroundColor: 'rgba(11, 30, 19, 0.85)',
  },
  inputCategoryBar: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 4,
  },
  inputCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFF90',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inputCategoryText: {
    color: '#0B1E13',
    fontSize: 11,
    fontWeight: 'bold',
  },
  inputCategoryClose: {
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 6,
  },
  attachBtn: {
    padding: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 6,
    paddingHorizontal: 6,
    maxHeight: 90,
  },
  sendBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 10,
    margin: 2,
  },
  sendBtnDisabled: {
    backgroundColor: '#546E7A',
    opacity: 0.4,
  },
  disclaimer: {
    color: '#90A4AE',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
});