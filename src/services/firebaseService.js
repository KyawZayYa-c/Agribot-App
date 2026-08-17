// services/firebaseService.js
import { db } from '../lib/firebase';
import * as FileSystem from 'expo-file-system';
// import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import esp32Service from './esp32Service'; 
import { 
  collection, addDoc, getDocs, getDoc, query, where, orderBy, limit, doc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

let MediaLibrary = null;

// ✅ Web မဟုတ်ရင်မှ import လုပ်ပါ
if (Platform.OS !== 'web') {
  try {
    MediaLibrary = require('expo-media-library');
    console.log('✅ MediaLibrary loaded successfully');
  } catch (e) {
    console.log('⚠️ MediaLibrary not available on this platform');
  }
}

class FirebaseService {
  constructor() {
    this.isOnline = false;
    this.offlineQueue = [];
    this.batchSize = 10;
    this.syncInterval = null;
  }

  // ================= INITIALIZATION =================

  async initialize() {
    try {
      const queue = await AsyncStorage.getItem('@offline_queue');
      if (queue) {
        this.offlineQueue = JSON.parse(queue);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
    this.startSyncInterval();
  }

  // ================= TEST DATA =================

  async addTestData() {
    const testData = {
      timestamp: new Date().toISOString(),
      command: 'test_command',
      params: {
        testValue: 'Hello Firebase!',
        number: 123,
        isTest: true,
      },
      deviceId: 'esp32_robot_001',
      testId: 'test_' + Date.now(),
    };

    try {
      const docRef = await addDoc(collection(db, 'test_logs'), testData);
      console.log('✅ Test data added with ID:', docRef.id);
      return { success: true, id: docRef.id, data: testData };
    } catch (error) {
      console.error('❌ Error adding test data:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllTestData() {
    try {
      const q = query(
        collection(db, 'test_logs'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const logs = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      console.log(`✅ Retrieved ${logs.length} test records`);
      return { success: true, data: logs };
    } catch (error) {
      console.error('❌ Error getting test data:', error);
      return { success: false, error: error.message };
    }
  }

  async clearAllTestData() {
    try {
      const q = query(collection(db, 'test_logs'));
      const snapshot = await getDocs(q);
      let deletedCount = 0;
      
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
        deletedCount++;
      }
      
      console.log(`✅ Deleted ${deletedCount} test records`);
      return { success: true, deletedCount };
    } catch (error) {
      console.error('❌ Error clearing test data:', error);
      return { success: false, error: error.message };
    }
  }

  async getTestDataById(id) {
    try {
      const docRef = doc(db, 'test_logs', id);
      const snapshot = await getDocs(query(collection(db, 'test_logs'), where('__name__', '==', id)));
      let data = null;
      snapshot.forEach(doc => {
        data = { id: doc.id, ...doc.data() };
      });
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error getting test data by ID:', error);
      return { success: false, error: error.message };
    }
  }

  // ================= BATTERY LOGGING =================

  async logBatteryStatus(batteryData) {
    const logData = {
      timestamp: new Date().toISOString(),
      voltage: batteryData.voltage || 0,
      percentage: batteryData.percentage || 0,
      isCharging: batteryData.isCharging || false,
      deviceId: 'esp32_robot_001',
    };

    try {
      const isOnline = await this.checkOnlineStatus();
      
      if (isOnline) {
        await addDoc(collection(db, 'battery_logs'), logData);
        console.log('✅ Battery data logged to Firebase');
        return { success: true };
      } else {
        this.offlineQueue.push({
          type: 'battery_log',
          data: logData,
          timestamp: Date.now(),
        });
        await this.saveOfflineQueue();
        console.log('💾 Battery data saved offline');
        return { success: true, offline: true };
      }
    } catch (error) {
      console.error('❌ Error logging battery:', error);
      this.offlineQueue.push({
        type: 'battery_log',
        data: logData,
        timestamp: Date.now(),
      });
      await this.saveOfflineQueue();
      return { success: false, error: error.message };
    }
  }

  // ================= COMMAND LOGGING =================

  async logCommand(command, params = null, result = null) {
    const logData = {
      timestamp: new Date().toISOString(),
      command: command,
      params: params,
      result: result,
      deviceId: 'esp32_robot_001',
    };

    try {
      const isOnline = await this.checkOnlineStatus();
      
      if (isOnline) {
        await addDoc(collection(db, 'command_logs'), logData);
        console.log('✅ Command logged to Firebase');
        return { success: true };
      } else {
        this.offlineQueue.push({
          type: 'command_log',
          data: logData,
          timestamp: Date.now(),
        });
        await this.saveOfflineQueue();
        console.log('💾 Command saved offline');
        return { success: true, offline: true };
      }
    } catch (error) {
      console.error('❌ Error logging command:', error);
      this.offlineQueue.push({
        type: 'command_log',
        data: logData,
        timestamp: Date.now(),
      });
      await this.saveOfflineQueue();
      return { success: false, error: error.message };
    }
  }

  // services/firebaseService.js - အောက်မှာ ထည့်ပါ

// ================= ESP32 COMMAND HISTORY =================

// ✅ Get ESP32 command history
async getESP32CommandHistory(limitCount = 50) {
  try {
    const q = query(
      collection(db, 'command_logs'),
      where('deviceId', '==', 'esp32_robot_001'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    console.log(`✅ Retrieved ${logs.length} ESP32 command logs`);
    return { success: true, data: logs };
  } catch (error) {
    console.error('❌ Error getting ESP32 command history:', error);
    return { success: false, error: error.message };
  }
}

// ✅ Get ESP32 command history by date
async getESP32CommandHistoryByDate(date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const q = query(
      collection(db, 'command_logs'),
      where('deviceId', '==', 'esp32_robot_001'),
      where('timestamp', '>=', startOfDay.toISOString()),
      where('timestamp', '<=', endOfDay.toISOString()),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    console.log(`✅ Retrieved ${logs.length} ESP32 logs for ${date.toDateString()}`);
    return { success: true, data: logs };
  } catch (error) {
    console.error('❌ Error getting ESP32 command history by date:', error);
    return { success: false, error: error.message };
  }
}

  // ================= SESSION LOGGING =================

  async startSession() {
    const sessionData = {
      startTime: new Date().toISOString(),
      deviceId: 'esp32_robot_001',
      status: 'started',
    };

    try {
      const docRef = await addDoc(collection(db, 'sessions'), sessionData);
      await AsyncStorage.setItem('@current_session_id', docRef.id);
      return { success: true, sessionId: docRef.id };
    } catch (error) {
      console.error('❌ Error starting session:', error);
      return { success: false, error: error.message };
    }
  }

  async endSession(sessionId = null) {
    if (!sessionId) {
      sessionId = await AsyncStorage.getItem('@current_session_id');
    }
    
    if (!sessionId) {
      return { success: false, error: 'No active session' };
    }

    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        endTime: new Date().toISOString(),
        status: 'ended',
      });
      await AsyncStorage.removeItem('@current_session_id');
      return { success: true };
    } catch (error) {
      console.error('❌ Error ending session:', error);
      return { success: false, error: error.message };
    }
  }

  // ================= OFFLINE SYNC =================

  async checkOnlineStatus() {
    try {
      await getDocs(query(collection(db, '_'), limit(1)));
      this.isOnline = true;
      return true;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  async saveOfflineQueue() {
    try {
      if (this.offlineQueue.length > 1000) {
        this.offlineQueue = this.offlineQueue.slice(-1000);
      }
      await AsyncStorage.setItem(
        '@offline_queue',
        JSON.stringify(this.offlineQueue)
      );
    } catch (error) {
      console.error('❌ Error saving offline queue:', error);
    }
  }

  async syncOfflineData() {
    if (this.offlineQueue.length === 0) return;

    const isOnline = await this.checkOnlineStatus();
    if (!isOnline) return;

    console.log(`🔄 Syncing ${this.offlineQueue.length} offline items...`);

    const toSync = [...this.offlineQueue];
    let syncedCount = 0;

    for (const item of toSync) {
      try {
        if (item.type === 'battery_log') {
          await addDoc(collection(db, 'battery_logs'), item.data);
        } else if (item.type === 'command_log') {
          await addDoc(collection(db, 'command_logs'), item.data);
        }
        
        const index = this.offlineQueue.indexOf(item);
        if (index > -1) {
          this.offlineQueue.splice(index, 1);
          syncedCount++;
        }
      } catch (error) {
        console.error('❌ Error syncing item:', error);
      }
    }

    await this.saveOfflineQueue();
    console.log(`✅ Synced ${syncedCount} items`);
  }

  startSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = setInterval(() => {
      this.syncOfflineData();
    }, 60000);
  }

  // ================= QUERIES =================

  async getBatteryHistory(limitCount = 100) {
    try {
      const q = query(
        collection(db, 'battery_logs'),
        where('deviceId', '==', 'esp32_robot_001'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const logs = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: logs };
    } catch (error) {
      console.error('❌ Error getting battery history:', error);
      return { success: false, error: error.message };
    }
  }

  async getCommandHistory(limitCount = 100) {
    try {
      const q = query(
        collection(db, 'command_logs'),
        where('deviceId', '==', 'esp32_robot_001'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const logs = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: logs };
    } catch (error) {
      console.error('❌ Error getting command history:', error);
      return { success: false, error: error.message };
    }
  }

  // ================= GET TODAY WORK TIME =================
  async getTodayWorkTime() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowISO = tomorrow.toISOString();
      
      const q = query(
        collection(db, 'command_logs'),
        where('command', '==', 'work_session'),
        where('timestamp', '>=', todayISO),
        where('timestamp', '<', tomorrowISO)
      );
      
      const snapshot = await getDocs(q);
      
      let totalSeconds = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.params && data.params.duration) {
          totalSeconds += data.params.duration;
        }
      });
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const formattedTime = `${hours}h ${minutes}m`;
      
      console.log(`📊 Today's work time: ${formattedTime} (${totalSeconds}s)`);
      
      return {
        success: true,
        data: {
          totalSeconds: totalSeconds,
          hours: hours,
          minutes: minutes,
          formatted: formattedTime,
        }
      };
    } catch (error) {
      console.error('❌ Error getting today work time:', error);
      return { success: false, error: error.message };
    }
  }

  // ================= CHAT SESSION MANAGEMENT =================

  // ✅ Start new chat session
  async startChatSession() {
    try {
      const sessionData = {
        sessionId: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        deviceId: 'esp32_robot_001',
      };
      
      const docRef = await addDoc(collection(db, 'chat_sessions'), sessionData);
      console.log('✅ New chat session created:', docRef.id);
      return { success: true, sessionId: docRef.id, data: sessionData };
    } catch (error) {
      console.error('❌ Error starting chat session:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Get chat session by ID
  async getChatSession(sessionId) {
    try {
      const docRef = doc(db, 'chat_sessions', sessionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      }
      return { success: false, error: 'Session not found' };
    } catch (error) {
      console.error('❌ Error getting chat session:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Add message to chat session
  async addMessageToSession(sessionId, message, sender = 'user') {
    try {
      const docRef = doc(db, 'chat_sessions', sessionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Session not found' };
      }
      
      const currentData = docSnap.data();
      const messages = currentData.messages || [];
      
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: sender,
        timestamp: new Date().toISOString(),
      };
      
      messages.push(newMessage);
      
      await updateDoc(docRef, {
        messages: messages,
        updatedAt: new Date().toISOString(),
      });
      
      console.log(`✅ Message added to session ${sessionId}`);
      return { success: true, message: newMessage };
    } catch (error) {
      console.error('❌ Error adding message to session:', error);
      return { success: false, error: error.message };
    }
  }




  // ✅ Get all chat sessions (for history)
  async getAllChatSessions() {
    try {
      const q = query(
        collection(db, 'chat_sessions'),
        where('deviceId', '==', 'esp32_robot_001'),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const sessions = [];
      snapshot.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
      console.log(`✅ Retrieved ${sessions.length} chat sessions`);
      return { success: true, data: sessions };
    } catch (error) {
      console.error('❌ Error getting chat sessions:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Delete chat session
  async deleteChatSession(sessionId) {
    try {
      await deleteDoc(doc(db, 'chat_sessions', sessionId));
      console.log(`✅ Chat session ${sessionId} deleted`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting chat session:', error);
      return { success: false, error: error.message };
    }
  }


  // services/firebaseService.js - အောက်ဆုံးမှာ ထည့်ပါ

// ================= CAPTURE PHOTO =================

// ✅ ESP32-CAM ကနေ ပုံရိုက်ပြီး ဖုန်းထဲမှာ သိမ်းမယ်
// async capturePhoto(deviceId = 'esp32-cam') {
//   console.log(`📸 Capturing photo from ${deviceId}...`);
  
//   try {
//     // 1. Camera IP ကိုယူပါ
//     const cameraIP = await esp32Service.getSavedCameraIP();
//     if (!cameraIP) {
//       return { success: false, error: 'Camera IP not configured' };
//     }
    
//     console.log(`📷 Camera IP: ${cameraIP}`);
    
//     // 2. ESP32-CAM ကို /capture ခေါ်ပါ
//     const response = await fetch(`http://${cameraIP}/capture`, {
//       method: 'GET',
//       timeout: 10000,
//     });
    
//     console.log(`📡 Response status: ${response.status}`);
    
//     if (!response.ok) {
//       return { success: false, error: `HTTP ${response.status}` };
//     }
    
//     // 3. Image data ကို blob အနေနဲ့ယူပါ
//     const imageBlob = await response.blob();
//     console.log(`📷 Image size: ${imageBlob.size} bytes`);
    
//     // 4. Blob ကို base64 ပြောင်းပါ
//     const reader = new FileReader();
//     const base64Data = await new Promise((resolve, reject) => {
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = reject;
//       reader.readAsDataURL(imageBlob);
//     });
    
//     // 5. ဖိုင်နာမည်သတ်မှတ်ပါ
//     const filename = `capture_${Date.now()}.jpg`;
//     const fileUri = `${FileSystem.documentDirectory}${filename}`;
    
//     // 6. Base64 ကို file အဖြစ်သိမ်းပါ
//     await FileSystem.writeAsStringAsync(fileUri, base64Data.split(',')[1], {
//       encoding: FileSystem.EncodingType.Base64,
//     });
    
//     console.log(`✅ Photo saved to: ${fileUri}`);
    
//     // 7. Media Library မှာ သိမ်းပါ (Android/iOS)
//     if (Platform.OS !== 'web') {
//       try {
//         const { status } = await MediaLibrary.requestPermissionsAsync();
//         if (status === 'granted') {
//           const asset = await MediaLibrary.createAssetAsync(fileUri);
//           await MediaLibrary.saveToLibraryAsync(asset);
//           console.log('✅ Photo saved to gallery');
//         }
//       } catch (mediaError) {
//         console.log('⚠️ Media library error:', mediaError.message);
//       }
//     }
    
//     // 8. Result ပြန်ပေးပါ
//     return {
//       success: true,
//       uri: fileUri,
//       filename: filename,
//       base64: base64Data,
//     };
    
//   } catch (error) {
//     console.error('❌ Capture photo error:', error);
//     return { success: false, error: error.message };
//   }
  // }
  
// services/firebaseService.js - capturePhoto ကို ဒီလိုပြင်ပါ

// firebaseService.js
async capturePhoto(deviceId = 'esp32-cam') {
  try {
    const cameraIP = await esp32Service.getSavedCameraIP();
    if (!cameraIP) return { success: false, error: 'Camera IP not configured' };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`http://${cameraIP}/capture`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'image/jpeg',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    // Blob အစား ArrayBuffer ယူပြီး Base64 ပြောင်းခြင်း
    const buffer = await response.arrayBuffer();
    const base64 = bufferToBase64(buffer);
    const base64Uri = `data:image/jpeg;base64,${base64}`;

    return { 
      success: true, 
      uri: base64Uri,
      filename: `capture_${Date.now()}.jpg`,
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ArrayBuffer to Base64 Helper


// ===== GET LATEST PHOTO =====
async getLatestPhoto(deviceId = 'esp32-cam') {
  try {
    // Documents directory ထဲက နောက်ဆုံးပုံကိုရှာပါ
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    const photoFiles = files
      .filter(f => f.startsWith('capture_') && f.endsWith('.jpg'))
      .sort()
      .reverse();
    
    if (photoFiles.length === 0) {
      return { success: false, error: 'No photos found' };
    }
    
    const latestFile = photoFiles[0];
    const uri = `${FileSystem.documentDirectory}${latestFile}`;
    
    console.log(`📷 Latest photo: ${latestFile}`);
    return { success: true, uri, filename: latestFile };
  } catch (error) {
    console.error('❌ Get latest photo error:', error);
    return { success: false, error: error.message };
  }
}

// ===== SAVE PHOTO TO GALLERY =====
async savePhotoToGallery(uri) {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Permission denied' };
    }
    
    const asset = await MediaLibrary.createAssetAsync(uri);
    await MediaLibrary.saveToLibraryAsync(asset);
    
    console.log('✅ Photo saved to gallery');
    return { success: true };
  } catch (error) {
    console.error('❌ Save to gallery error:', error);
    return { success: false, error: error.message };
  }
  }
  

  // services/firebaseService.js - အောက်ဆုံးမှာ ထည့်ပါ

// ================= AI PREDICTION HISTORY =================

// ✅ Save AI prediction with image to Firebase
async saveAIPrediction(imageBase64, predictionResult) {
  try {
    const data = {
      timestamp: new Date().toISOString(),
      image: imageBase64,  // base64 image data
      result: predictionResult,
      deviceId: 'esp32_robot_001',
    };
    
    const docRef = await addDoc(collection(db, 'ai_predictions'), data);
    console.log('✅ AI prediction saved to Firebase with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Error saving AI prediction:', error);
    return { success: false, error: error.message };
  }
}

// ✅ Get all AI prediction history
async getAIPredictionHistory(limitCount = 50) {
  try {
    const q = query(
      collection(db, 'ai_predictions'),
      where('deviceId', '==', 'esp32_robot_001'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const predictions = [];
    snapshot.forEach(doc => {
      predictions.push({ id: doc.id, ...doc.data() });
    });
    console.log(`✅ Retrieved ${predictions.length} AI predictions`);
    return { success: true, data: predictions };
  } catch (error) {
    console.error('❌ Error getting AI prediction history:', error);
    return { success: false, error: error.message };
  }
}

// ✅ Delete AI prediction by ID
async deleteAIPrediction(id) {
  try {
    await deleteDoc(doc(db, 'ai_predictions', id));
    console.log(`✅ AI prediction ${id} deleted`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting AI prediction:', error);
    return { success: false, error: error.message };
  }
  }
  
  // services/firebaseService.js - အောက်ဆုံးမှာ ထည့်ပါ

// ================= AI PREDICTION HISTORY =================

// ✅ Save AI prediction with image to Firebase
async saveAIPrediction(imageBase64, predictionResult) {
  try {
    const data = {
      timestamp: new Date().toISOString(),
      image: imageBase64,  // base64 image data
      result: predictionResult,
      deviceId: 'esp32_robot_001',
    };
    
    const docRef = await addDoc(collection(db, 'ai_predictions'), data);
    console.log('✅ AI prediction saved to Firebase with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Error saving AI prediction:', error);
    return { success: false, error: error.message };
  }
}

// ✅ Get all AI prediction history
async getAIPredictionHistory(limitCount = 50) {
  try {
    const q = query(
      collection(db, 'ai_predictions'),
      where('deviceId', '==', 'esp32_robot_001'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const predictions = [];
    snapshot.forEach(doc => {
      predictions.push({ id: doc.id, ...doc.data() });
    });
    console.log(`✅ Retrieved ${predictions.length} AI predictions`);
    return { success: true, data: predictions };
  } catch (error) {
    console.error('❌ Error getting AI prediction history:', error);
    return { success: false, error: error.message };
  }
}

// ✅ Delete AI prediction by ID
async deleteAIPrediction(id) {
  try {
    await deleteDoc(doc(db, 'ai_predictions', id));
    console.log(`✅ AI prediction ${id} deleted`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting AI prediction:', error);
    return { success: false, error: error.message };
  }
}
}

function bufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const firebaseService = new FirebaseService();
export default firebaseService;