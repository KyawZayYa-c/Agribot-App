import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const backgroundImage = require('../../assets/field_background.jpg');

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

        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          const content = trimmedLine.replace(/^[-*]\s+/, '');
          return (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>✦</Text>
              <Text style={styles.bulletText}>{content}</Text>
            </View>
          );
        }

        if (trimmedLine.length > 0) {
          const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
          return (
            <Text key={index} style={styles.normalLineText}>
              {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <Text key={i} style={styles.boldText}>
                      {part.substring(2, part.length - 2)}
                    </Text>
                  );
                }
                return part;
              })}
            </Text>
          );
        }

        return <View key={index} style={{ height: 6 }} />;
      })}
    </View>
  );
};

export default function ChatDetailScreen({ chat, onBack }) {

  if (!chat) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Text style={styles.errorText}>Chat not found</Text>
      </SafeAreaView>
    );
  }

  // ✅ Get messages
  const messages = chat.messages || [];
  const exchangeCount = Math.ceil(messages.length / 2);
  
  // ✅ Check if it's a prediction
  const hasImage = chat?.image && 
    typeof chat.image === 'string' && 
    chat.image.length > 100;
  
  const isPrediction = hasImage && chat?.result && 
    (chat.result.class || chat.result.soil_name);

  // ✅ Get prediction data
  const resultData = chat.result || {};
  const soilName = resultData.soil_name || resultData.class || 'Unknown';
  const confidence = resultData.confidence || 'N/A';
  const crops = resultData.crops || [];
  const advice = resultData.advice || [];
  const soilDescription = resultData.soil_description || '';

  console.log('📊 Final isPrediction:', isPrediction);
  console.log('📊 soilName:', soilName);
  console.log('📊 crops count:', crops.length);

  // ✅ Convert to pairs (for chat only)
  const getPairs = () => {
    const pairs = [];
    for (let i = 0; i < messages.length; i += 2) {
      pairs.push({
        user: messages[i]?.sender === 'user' ? messages[i] : null,
        ai: messages[i + 1]?.sender === 'ai' ? messages[i + 1] : null,
      });
    }
    return pairs;
  };

  const pairs = getPairs();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlayLayer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#8CE835" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {isPrediction ? '📸 AI Detection' : '💬 Conversation'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={styles.content}>
            
            {/* ✅ Prediction Image */}
            {isPrediction && hasImage ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: chat.image }} 
                  style={styles.fullImage}
                  resizeMode="cover"
                  onError={(e) => {
                    console.log('❌ Image load error:', e.nativeEvent.error);
                  }}
                  onLoad={() => console.log('✅ Image loaded successfully!')}
                />
              </View>
            ) : null}
            
            {/* ✅ Prediction Result */}
            {isPrediction && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>🔬 Detection Result</Text>
                <Text style={styles.resultText}>🌍 {soilName}</Text>
                
                {confidence && confidence !== 'N/A' && (
                  <Text style={styles.confidenceText}>Confidence: {confidence}</Text>
                )}
                
                {chat.timestamp && (
                  <Text style={styles.timeText}>
                    📅 {new Date(chat.timestamp).toLocaleString()}
                  </Text>
                )}

                {/* ✅ Crops List */}
                {crops && crops.length > 0 && (
                  <>
                    <Text style={styles.detailSectionTitle}>🌱 စိုက်ပျိုးနိုင်သော သီးနှံများ</Text>
                    {crops.map((crop, index) => (
                      <Text key={index} style={styles.detailListItem}>• {crop}</Text>
                    ))}
                  </>
                )}

                {/* ✅ Soil Description */}
                {soilDescription && (
                  <>
                    <Text style={styles.detailSectionTitle}>📖 မြေအကြောင်း</Text>
                    <Text style={styles.detailDescription}>{soilDescription}</Text>
                  </>
                )}

                {/* ✅ Advice List */}
                {advice && advice.length > 0 && (
                  <>
                    <Text style={styles.detailSectionTitle}>💡 စိုက်ပျိုးရန် အကြံပြုချက်များ</Text>
                    {advice.map((item, index) => (
                      <Text key={index} style={styles.detailListItem}>• {item}</Text>
                    ))}
                  </>
                )}
              </View>
            )}
            
            {/* ✅ Session Info - isPrediction မဟုတ်မှသာပြမယ် */}
            {!isPrediction && (
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionCount}>
                  💬 {exchangeCount} exchanges
                </Text>
                <Text style={styles.sessionTime}>
                  {chat.updatedAt ? new Date(chat.updatedAt).toLocaleString() : 'Just now'}
                </Text>
              </View>
            )}

            {/* ✅ Messages  */}
            {pairs.map((pair, index) => (
              <View key={index} style={styles.conversationPair}>
                {/* User Message */}
                {pair.user && (
                  <View style={styles.userMessageContainer}>
                    <View style={styles.userBubble}>
                      <Text style={styles.userMessageText}>
                        {pair.user.text || pair.user.message}
                      </Text>
                      <Text style={styles.userTime}>
                        {pair.user.timestamp ? new Date(pair.user.timestamp).toLocaleTimeString() : ''}
                      </Text>
                    </View>
                    <View style={styles.userAvatar}>
                      <Ionicons name="person" size={18} color="#0B1E13" />
                    </View>
                  </View>
                )}

                {/* AI Message */}
                {pair.ai && (
                  <View style={styles.aiMessageContainer}>
                    <View style={styles.aiAvatar}>
                      <Ionicons name="hardware-chip" size={18} color="#0B1E13" />
                    </View>
                    <View style={styles.aiBubble}>
                      <AITextRenderer text={pair.ai.text || pair.ai.reply || pair.ai.message} />
                      <Text style={styles.aiTime}>
                        {pair.ai.timestamp ? new Date(pair.ai.timestamp).toLocaleTimeString() : ''}
                      </Text>
                    </View>
                  </View>
                )}

                {index < pairs.length - 1 && <View style={styles.messageDivider} />}
              </View>
            ))}
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1E13',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayLayer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1E13',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(11, 30, 19, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(140, 232, 53, 0.1)',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    color: '#8CE835',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: { width: 40 },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#0a0e17',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 16,
  },
  resultContainer: {
    backgroundColor: 'rgba(3, 95, 16, 0.73)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resultLabel: {
    color: '#607D8B',
    fontSize: 12,
    marginBottom: 4,
  },
  resultText: {
    color: '#8BC34A',
    fontSize: 24,
    fontWeight: 'bold',
  },
  confidenceText: {
    color: '#B0BEC5',
    fontSize: 14,
    marginTop: 4,
  },
  timeText: {
    color: '#455A64',
    fontSize: 12,
    marginTop: 8,
  },
  detailSectionTitle: {
    color: '#CCFF90',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  detailListItem: {
    color: '#B0BEC5',
    fontSize: 14,
    paddingVertical: 2,
    paddingLeft: 8,
  },
  detailDescription: {
    color: '#B0BEC5',
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 8,
    marginBottom: 4,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(140, 232, 53, 0.05)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(140, 232, 53, 0.1)',
  },
  sessionCount: {
    color: '#8CE835',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sessionTime: {
    color: '#607D8B',
    fontSize: 12,
  },
  conversationPair: {
    marginBottom: 16,
  },
  userMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: 'rgba(76, 175, 80, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
    marginRight: 8,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  userTime: {
    color: '#90A4AE',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4FC3F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8CE835',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  aiTime: {
    color: '#90A4AE',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 12,
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
    marginVertical: 4,
    paddingLeft: 4,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#43ea0b',
    marginRight: 10,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  bulletText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 24,
  },
  bulletBoldText: {
    fontWeight: 'bold',
    color: '#8BC34A',
    fontSize: 15,
    lineHeight: 24,
  },
  normalLineText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 24,
    marginVertical: 2,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#CCFF90',
    fontSize: 15,
  },
  messageText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  aiMessageContainer: {
    width: '100%',
  },
});