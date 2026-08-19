// components/History/ChatListTab.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Image,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function ChatListTab({
  activeTab,
  filteredChats,
  loading,
  onChatPress,
  onDeleteChat,
  isPrediction = false,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localChats, setLocalChats] = useState(filteredChats);

  // ✅ filteredChats ပြောင်းတိုင်း Local copy ကို Update
  React.useEffect(() => {
    setLocalChats(filteredChats);
  }, [filteredChats]);

  const getTitle = () => {
    if (isPrediction) return '📸 AI Detection History';
    if (activeTab === 'all') return '💬 All Conversations';
    if (activeTab === 'ai') return '🤖 AI Responses';
    if (activeTab === 'user') return '👤 My Questions';
    return '';
  };

  const getEmptyText = () => {
    if (isPrediction) return 'No AI detection history yet. Capture an image from Control Screen!';
    if (activeTab === 'all') return 'No chat history yet. Start a conversation with AI!';
    if (activeTab === 'ai') return 'No AI responses yet.';
    if (activeTab === 'user') return 'No questions asked yet.';
    return '';
  };

  // const getDisplayData = (item) => {
  //   // ✅ AI Prediction အတွက်
  //   if (isPrediction) {
  //   // ✅ result ထဲက class ကိုယူပြီး soil_name ကိုပြမယ်
  //   const resultData = item.result || {};
  //   // ✅ soil_name ရှိရင် ပြမယ်၊ မရှိရင် class ကိုပြမယ်
  //   const displayClass = resultData.soil_name || resultData.class || 'Unknown';
    
  //   return {
  //     displayText: `🌍 ${displayClass}`,
  //     sender: 'ai',
  //     timestamp: item.timestamp,
  //     count: 1,
  //     pairCount: 0,
  //     isSession: false,
  //     id: item.id,
  //     image: item.image,
  //     crops: resultData.crops || [],
  //     advice: resultData.advice || [],
  //     soilDescription: resultData.soil_description || '',
  //     soilName: displayClass,
  //   };
  // }

  //   // ✅ Chat Session အတွက်
  //   if (item.messages && item.messages.length > 0) {
  //     const lastMsg = item.messages[item.messages.length - 1];
  //     const displayText = lastMsg.text || lastMsg.message || 'No message';
  //     const sender = lastMsg.sender || 'unknown';
  //     const timestamp = lastMsg.timestamp || item.updatedAt || item.createdAt;
      
  //     const userMessages = item.messages.filter(m => m.sender === 'user' || m.sender === 'You');
  //     const aiMessages = item.messages.filter(m => m.sender === 'ai' || m.sender === 'AI');
  //     const pairCount = Math.min(userMessages.length, aiMessages.length);
      
  //     return {
  //       displayText,
  //       sender,
  //       timestamp,
  //       count: item.messages.length,
  //       pairCount: pairCount,
  //       isSession: true,
  //       sessionId: item.id || item.sessionId,
  //       id: item.id || item.sessionId,
  //       image: item.image,
  //     };
  //   }
    
  //   return {
  //     displayText: item.text || item.message || 'No message',
  //     sender: item.sender || 'unknown',
  //     timestamp: item.timestamp || item.updatedAt || Date.now(),
  //     count: 1,
  //     pairCount: 0,
  //     isSession: false,
  //     sessionId: item.id || null,
  //     id: item.id,
  //     image: item.image,
  //   };
  // };


  // components/History/ChatListTab.js - getDisplayData function ကိုပြင်ပါ

const getDisplayData = (item) => {
  // ✅ AI Prediction အတွက်
  if (isPrediction) {
    const resultData = item.result || {};
    // ✅ soil_name ရှိရင် ပြမယ်၊ မရှိရင် class ကိုပြမယ်
    const displayClass = resultData.soil_name || resultData.class || 'Unknown';
    
    return {
      displayText: `🌍 ${displayClass}`,
      sender: 'ai',
      timestamp: item.timestamp,
      count: 1,
      pairCount: 0,
      isSession: false,
      id: item.id,
      image: item.image,
      crops: resultData.crops || [],
      advice: resultData.advice || [],
      soilDescription: resultData.soil_description || '',
      soilName: displayClass,
    };
  }

  // ✅ Chat Session အတွက်
  if (item.messages && item.messages.length > 0) {
    const lastMsg = item.messages[item.messages.length - 1];
    const displayText = lastMsg.text || lastMsg.message || 'No message';
    const sender = lastMsg.sender || 'unknown';
    const timestamp = lastMsg.timestamp || item.updatedAt || item.createdAt;
    
    const userMessages = item.messages.filter(m => m.sender === 'user' || m.sender === 'You');
    const aiMessages = item.messages.filter(m => m.sender === 'ai' || m.sender === 'AI');
    const pairCount = Math.min(userMessages.length, aiMessages.length);
    
    return {
      displayText: displayText,
      sender: sender,
      timestamp: timestamp,
      count: item.messages.length,
      pairCount: pairCount,
      isSession: true,
      sessionId: item.id || item.sessionId,
      id: item.id || item.sessionId,
      image: item.image,
    };
  }
  
  // ✅ Single message အတွက်
  return {
    displayText: item.text || item.message || 'No message',
    sender: item.sender || 'unknown',
    timestamp: item.timestamp || item.updatedAt || Date.now(),
    count: 1,
    pairCount: 0,
    isSession: false,
    sessionId: item.id || null,
    id: item.id,
    image: item.image,
  };
};
  const handleLongPress = (item) => {
    console.log('📌 Long press on item:', item.id);
    setSelectedItem(item);
    setModalVisible(true);
  };

  // ✅ Delete Confirm
  const confirmDelete = async () => {
    if (selectedItem && onDeleteChat) {
      const idToDelete = selectedItem.id || selectedItem.sessionId;
      console.log('🗑️ Deleting with ID:', idToDelete);
      
      setIsDeleting(true);
      setModalVisible(false);
      
      try {
        const deletePromise = onDeleteChat(idToDelete, selectedItem.isSession);
        const delayPromise = new Promise(resolve => setTimeout(resolve, 300));
        
        await Promise.all([deletePromise, delayPromise]);
        
        setLocalChats(prev => prev.filter(item => {
          const itemId = item.id || item.sessionId;
          return itemId !== idToDelete;
        }));
        
      } catch (error) {
        console.error('❌ Delete error:', error);
      } finally {
        setIsDeleting(false);
        setSelectedItem(null);
      }
    }
  };

  // ✅ Render Item
  // const renderItem = ({ item, index }) => {
  //   const data = getDisplayData(item);
  //    const hasImage = isPrediction && data.image;
    
  //    return (
  //   <TouchableOpacity
  //     key={item.id || index}
  //     onPress={() => {
  //       // ✅ Prediction ဆိုရင် ပုံနဲ့အဖြေကိုပြမယ်
  //       if (isPrediction && hasImage) {
  //         onChatPress && onChatPress({
  //           ...item,
  //           image: data.image,
  //           result: item.result
  //         });
  //       } else {
  //         onChatPress && onChatPress(item);
  //       }
  //     }}
  //     onLongPress={() => handleLongPress(item)}
  //     activeOpacity={0.7}
  //     delayLongPress={500}
  //   >
  //     <Card style={styles.glassCardSmall}>
  //       <Card.Content style={styles.smallCardContent}>
  //         {/* ✅ Prediction ဆိုရင် ပုံသေးလေးပြမယ် */}
  //         {isPrediction && hasImage ? (
  //           <Image 
  //             source={{ uri: data.image }} 
  //             style={styles.thumbnailImage}
  //             resizeMode="cover"
  //           />
  //         ) : (
  //           <View style={styles.iconCircle}>
  //             <Ionicons
  //               name={isPrediction ? 'scan' : (data.sender === 'ai' ? 'hardware-chip' : 'person')}
  //               size={20}
  //               color={isPrediction ? '#8BC34A' : (data.sender === 'ai' ? '#8CE835' : '#4FC3F7')}
  //             />
  //           </View>
  //         )}
  //         <View style={styles.chatTexts}>
  //           <Text style={styles.chatMessage} numberOfLines={2}>
  //             {data.displayText || 'No data'}
  //           </Text>
  //           <Text style={styles.chatTime}>
  //             {isPrediction ? '🤖 AI Detection' : (data.sender === 'ai' ? '🤖 AI' : '🧑 You')}
  //             {data.pairCount > 0 && ` · ${data.pairCount} Q&A`}
  //             {data.count > 0 && !data.pairCount && ` · ${data.count} messages`}
  //             {' · '}
  //             {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Just now'}
  //           </Text>
  //         </View>
  //       </Card.Content>
  //     </Card>
  //   </TouchableOpacity>
  // );
  // };
  

const renderItem = ({ item, index }) => {
  const data = getDisplayData(item);
  const hasImage = isPrediction && data.image;

  return (
    <TouchableOpacity
      key={item.id || index}
      onPress={() => {
        if (isPrediction && hasImage) {
          onChatPress && onChatPress({
            ...item,
            image: data.image,
            result: {
              ...item.result,
              soil_name: data.soilName,
              crops: data.crops,
              advice: data.advice,
              soil_description: data.soilDescription,
            }
          });
        } else {
          onChatPress && onChatPress(item);
        }
      }}
      onLongPress={() => handleLongPress(item)}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      <Card style={styles.glassCardSmall}>
        <Card.Content style={styles.smallCardContent}>
          {isPrediction && hasImage ? (
            <Image 
              source={{ uri: data.image }} 
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.iconCircle}>
              <Ionicons
                name={isPrediction ? 'scan' : (data.sender === 'ai' ? 'hardware-chip' : 'person')}
                size={20}
                color={isPrediction ? '#8BC34A' : (data.sender === 'ai' ? '#8CE835' : '#4FC3F7')}
              />
            </View>
          )}
          <View style={styles.chatTexts}>
            <Text style={styles.chatMessage} numberOfLines={2}>
              {data.displayText || 'No data'}
            </Text>
            <Text style={styles.chatTime}>
              {isPrediction ? '🤖 AI Detection' : (data.sender === 'ai' ? '🤖 AI' : '🧑 You')}
              {data.pairCount > 0 && ` · ${data.pairCount} Q&A`}
              {data.count > 0 && !data.pairCount && ` · ${data.count} messages`}
              {' · '}
              {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Just now'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

  // ✅ Delete လုပ်နေရင် loading ကိုမပြဘူး
  const showLoading = loading && !isDeleting;
  const showEmpty = !showLoading && localChats.length === 0 && !isDeleting;

  return (
    <>
      <Text style={styles.subTitle}>{getTitle()}</Text>

      {/* ✅ Loading - Delete လုပ်နေရင် မပြဘူး */}
      {showLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8CE835" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : showEmpty ? (
        <Card style={styles.glassCardSmall}>
          <Card.Content>
            <Text style={styles.emptyText}>{getEmptyText()}</Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={localChats}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalIcon}>
                  <Ionicons name="trash-outline" size={48} color="#E53935" />
                </View>
                <Text style={styles.modalTitle}>Delete Conversation?</Text>
                <Text style={styles.modalMessage}>
                  This action cannot be undone. All messages in this conversation will be permanently deleted.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalDeleteButton]}
                    onPress={confirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalDeleteText}>Delete</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ✅ Loading Overlay - Delete လုပ်နေစဉ် */}
      {isDeleting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#8CE835" />
            <Text style={styles.loadingOverlayText}>Deleting...</Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  subTitle: {
    color: '#8CE835',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  glassCardSmall: {
    backgroundColor: 'rgba(3, 95, 16, 0.73)',
    borderRadius: 10,
    elevation: 0,
    marginBottom: 10,
  },
  smallCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTexts: {
    marginLeft: 10,
    flex: 1,
  },
  thumbnailImage: {
  width: 50,
  height: 50,
  borderRadius: 8,
  marginRight: 10,
},
  chatMessage: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '400',
  },
  chatTime: {
    color: '#607D8B',
    fontSize: 10,
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 10,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a2a1f',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(140, 232, 53, 0.2)',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMessage: {
    color: '#90A4AE',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalCancelText: {
    color: '#90A4AE',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDeleteButton: {
    backgroundColor: '#E53935',
  },
  modalDeleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingBox: {
    backgroundColor: '#1a2a1f',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(140, 232, 53, 0.2)',
  },
  loadingOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
  },
});