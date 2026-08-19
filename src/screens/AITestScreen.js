// src/screens/AITestScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity , Image, ScrollView, Platform, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import firebaseService from '../services/firebaseService';

// const BASE_URL = 'https://agribot-fruit-classifier.onrender.com';
// src/screens/AITestScreen.js
const BASE_URL = 'http://10.248.244.153:5000';

export default function AITestScreen({ onBack, initialImage = null }) {
  const [imageUri, setImageUri] = useState(initialImage);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isServerReady, setIsServerReady] = useState(false);
  const [serverWaking, setServerWaking] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const abortControllerRef = useRef(null);

  // Screen စတင်ပွင့်သည်နှင့် OnRender Server Sleep Mode ကို နှိုးခြင်း (Ping Request)
  useEffect(() => {
    let isMounted = true;

    const wakeUpServer = async () => {
      try {
        const response = await fetch(BASE_URL);
        if (response.ok && isMounted) {
          setIsServerReady(true);
        }
      } catch (err) {
        console.log('Server warming up background error:', err);
      } finally {
        if (isMounted) {
          setServerWaking(false);
        }
      }
    };

    wakeUpServer();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ initialImage ပြောင်းတိုင်း detect လုပ်မယ်
  useEffect(() => {
    if (initialImage === null) {
      // null ဆိုရင် loading state ပြမယ်
      setIsCapturing(true);
      setLoading(true);
      setImageUri(null);
      setResult(null);
      setError(null);
      console.log('📸 Waiting for capture...');
    } else if (initialImage === 'error') {
      // error signal ရရင်
      setIsCapturing(false);
      setLoading(false);
      setError('Capture failed. Please try again.');
    } else if (initialImage && typeof initialImage === 'string' && initialImage.startsWith('data:image')) {
      // ပုံ data ရရင်
      setIsCapturing(false);
      setImageUri(initialImage);
      console.log('📸 Image received, auto-predicting...');
      setTimeout(() => {
        uploadAndPredict(initialImage);
      }, 500);
    }
  }, [initialImage]);

  // Gallery မှ ပုံရွေးချယ်ခြင်း
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('ပုံရွေးချယ်ရန် Media Permission လိုအပ်ပါသည်!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      const selectedUri = pickerResult.assets[0].uri;
      setImageUri(selectedUri);
      
      if (Platform.OS === 'web' && pickerResult.assets[0].file) {
        setImageFile(pickerResult.assets[0].file);
        uploadAndPredict(pickerResult.assets[0].file);
      } else {
        uploadAndPredict(selectedUri);
      }
    }
  };

  // Camera ဖြင့် ဓာတ်ပုံရိုက်ခြင်း
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert('ဓာတ်ပုံရိုက်ရန် Camera Permission လိုအပ်ပါသည်!');
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!cameraResult.canceled && cameraResult.assets.length > 0) {
      const selectedUri = cameraResult.assets[0].uri;
      setImageUri(selectedUri);
      
      if (Platform.OS === 'web' && cameraResult.assets[0].file) {
        setImageFile(cameraResult.assets[0].file);
        uploadAndPredict(cameraResult.assets[0].file);
      } else {
        uploadAndPredict(selectedUri);
      }
    }
  };

  // ✅ Cancel Upload
  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      setError('Upload cancelled by user');
      Alert.alert('⏹️ Cancelled', 'Image upload was cancelled');
    }
  };

  // =============================================
  // ✅ Upload Function - Web + Mobile အတွက်
  // =============================================
  // const uploadAndPredict = async (fileOrUri) => {
  //   // ✅ AbortController အသစ်ဖန်တီးပါ
  //   abortControllerRef.current = new AbortController();
    
  //   setLoading(true);
  //   setResult(null);
  //   setError(null);
  //   setUploadProgress(0);

  //   try {
  //     const formData = new FormData();

  //     // ✅ Web အတွက် - File object
  //     if (Platform.OS === 'web' && fileOrUri instanceof File) {
  //       console.log('📤 Web: Uploading file directly');
  //       formData.append('image', fileOrUri, fileOrUri.name);
  //     } 
  //     // ✅ Mobile အတွက် - URI ကို သုံးပါ (base64 လည်းပါ)
  //     else if (typeof fileOrUri === 'string') {
  //       // ✅ base64 data URI ဖြစ်နေရင်
  //       if (fileOrUri.startsWith('data:image')) {
  //         console.log('📤 Mobile: Uploading from base64 data');
  //         const response = await fetch(fileOrUri);
  //         const blob = await response.blob();
  //         const filename = `capture_${Date.now()}.jpg`;
  //         const file = new File([blob], filename, { type: 'image/jpeg' });
  //         formData.append('image', file, filename);
  //       } else {
  //         // ✅ ပုံမှန် URI
  //         const filename = fileOrUri.split('/').pop() || 'photo.jpg';
  //         const match = /\.(\w+)$/.exec(filename);
  //         const type = match ? `image/${match[1]}` : 'image/jpeg';

  //         console.log('📤 Mobile: Uploading from URI:', filename);
  //         formData.append('image', {
  //           uri: fileOrUri,
  //           name: filename,
  //           type: type,
  //         });
  //       }
  //     } else {
  //       throw new Error('Unsupported file format');
  //     }

  //     console.log('📤 Sending request to:', `${BASE_URL}/predict`);

  //     const response = await axios({
  //       method: 'POST',
  //       url: `${BASE_URL}/predict`,
  //       data: formData,
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-Type': 'multipart/form-data',
  //       },
  //       timeout: 60000,
  //       signal: abortControllerRef.current.signal,
  //       onUploadProgress: (progressEvent) => {
  //         const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //         setUploadProgress(percentCompleted);
  //         console.log(`📤 Upload progress: ${percentCompleted}%`);
  //       },
  //     });

  //     console.log('📡 Response status:', response.status);
  //     console.log('📡 Response data:', response.data);

  //     if (response.data && response.data.error) {
  //       throw new Error(response.data.error);
  //     }

  //     setResult(response.data);
  //     setIsServerReady(true);

  //     // ✅ ပုံနဲ့အဖြေကို Firebase မှာ သိမ်းမယ်
  //     if (fileOrUri && typeof fileOrUri === 'string' && fileOrUri.startsWith('data:image')) {
  //       console.log('💾 Saving prediction to Firebase...');
  //       const saveResult = await firebaseService.saveAIPrediction(
  //         fileOrUri,  // base64 image
  //         response.data  // prediction result
  //       );
  //       if (saveResult.success) {
  //         console.log('✅ Prediction saved to Firebase:', saveResult.id);
  //       } else {
  //         console.log('❌ Failed to save prediction:', saveResult.error);
  //       }
  //     }

  //   } catch (err) {
  //     console.error('❌ Prediction Error:', err);
      
  //     // ✅ Cancel လုပ်လို့ဖြစ်ရင်
  //     if (err.name === 'CanceledError' || err.message?.includes('canceled')) {
  //       setError('Upload was cancelled');
  //     } else {
  //       let errorMessage = 'Python Backend သို့ ချိတ်ဆက်၍မရပါ။ Server နိုးထချိန် စောင့်ဆိုင်းပြီး ထပ်မံကြိုးစားပါ။';
        
  //       if (err.response) {
  //         console.log('Response data:', err.response.data);
  //         console.log('Response status:', err.response.status);
  //         errorMessage = err.response.data?.error || errorMessage;
  //       } else if (err.request) {
  //         console.log('No response received');
  //         errorMessage = 'Server မှ အဖြေမရရှိပါ။ ကျေးဇူးပြု၍ နောက်မှထပ်ကြိုးစားပါ။';
  //       }
        
  //       setError(errorMessage);
  //     }
  //   } finally {
  //     setLoading(false);
  //     abortControllerRef.current = null;
  //   }
  // };
  
  // src/screens/AITestScreen.js

const uploadAndPredict = async (fileOrUri) => {
  abortControllerRef.current = new AbortController();
  
  setLoading(true);
  setResult(null);
  setError(null);
  setUploadProgress(0);

  try {
    const formData = new FormData();

    let imageBase64 = null;  // ✅ Firebase အတွက် base64 သိမ်းဖို့

    // ✅ Web အတွက် - File object
    if (Platform.OS === 'web' && fileOrUri instanceof File) {
      console.log('📤 Web: Uploading file directly');
      formData.append('image', fileOrUri, fileOrUri.name);
      
      // ✅ Web အတွက် base64 ပြောင်းပါ
      const reader = new FileReader();
      imageBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(fileOrUri);
      });
    } 
    // ✅ Mobile အတွက် - URI ကို သုံးပါ
    else if (typeof fileOrUri === 'string') {
      const filename = fileOrUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      console.log('📤 Mobile: Uploading from URI:', filename);
      formData.append('image', {
        uri: fileOrUri,
        name: filename,
        type: type,
      });

      // ✅ Mobile အတွက် base64 ပြောင်းပါ (URI ကနေ)
      try {
        const response = await fetch(fileOrUri);
        const blob = await response.blob();
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        console.log('✅ Image converted to base64 for Firebase');
      } catch (err) {
        console.log('⚠️ Could not convert to base64, skipping Firebase save');
      }
    } else {
      throw new Error('Unsupported file format');
    }

    console.log('📤 Sending request to:', `${BASE_URL}/predict`);

    const response = await axios({
      method: 'POST',
      url: `${BASE_URL}/predict`,
      data: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
      signal: abortControllerRef.current.signal,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
        console.log(`📤 Upload progress: ${percentCompleted}%`);
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response data:', response.data);

    if (response.data && response.data.error) {
      throw new Error(response.data.error);
    }

    setResult(response.data);
    setIsServerReady(true);

    // ✅ ပုံနဲ့အဖြေကို Firebase မှာ သိမ်းမယ် (base64 ရှိမှသာ)
    if (imageBase64) {
      console.log('💾 Saving prediction to Firebase...');
      const saveResult = await firebaseService.saveAIPrediction(
        imageBase64,  // base64 image
        response.data  // prediction result
      );
      if (saveResult.success) {
        console.log('✅ Prediction saved to Firebase:', saveResult.id);
      } else {
        console.log('❌ Failed to save prediction:', saveResult.error);
      }
    } else {
      console.log('⚠️ No base64 image available, skipping Firebase save');
    }

  } catch (err) {
    console.error('❌ Prediction Error:', err);
    
    if (err.name === 'CanceledError' || err.message?.includes('canceled')) {
      setError('Upload was cancelled');
    } else {
      let errorMessage = 'Python Backend သို့ ချိတ်ဆက်၍မရပါ။ Server နိုးထချိန် စောင့်ဆိုင်းပြီး ထပ်မံကြိုးစားပါ။';
      
      if (err.response) {
        console.log('Response data:', err.response.data);
        console.log('Response status:', err.response.status);
        errorMessage = err.response.data?.error || errorMessage;
      } else if (err.request) {
        console.log('No response received');
        errorMessage = 'Server မှ အဖြေမရရှိပါ။ ကျေးဇူးပြု၍ နောက်မှထပ်ကြိုးစားပါ။';
      }
      
      setError(errorMessage);
    }
  } finally {
    setLoading(false);
    abortControllerRef.current = null;
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title="Fruit Classifier AI"
          subtitle="Apple vs Banana Recognition"
          titleStyle={{ color: '#8BC34A', fontWeight: 'bold' }}
          subtitleStyle={{ color: '#AAA' }}
        />

        <Card.Content style={styles.content}>
          {/* Server Status Indicator Bar */}
          <View style={styles.serverStatusContainer}>
            <View style={[styles.statusDot, { backgroundColor: isServerReady ? '#4CAF50' : '#FF9800' }]} />
            <Text style={styles.serverStatusText}>
              {serverWaking 
                ? 'Server Status: Checking/Waking up...' 
                : isServerReady 
                  ? 'Server Status: Ready (Online)' 
                  : 'Server Status: Warming up background...'}
            </Text>
          </View>

          {/* ✅ Capturing State */}
          {isCapturing ? (
            <View style={styles.capturingContainer}>
              <ActivityIndicator size="large" color="#8BC34A" />
              <Text style={styles.capturingText}>📸 Capturing image from camera...</Text>
              <Text style={styles.capturingSubText}>Please wait while we capture the image</Text>
            </View>
          ) : (
            <>
              {/* Image Preview */}
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderText}>ဓာတ်ပုံ ရွေးချယ်ပါ သို့မဟုတ် ရိုက်ယူပါ</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <Button
                  mode="contained-tonal"
                  icon="image"
                  onPress={pickImage}
                  disabled={loading}
                  style={styles.actionBtn}
                >
                  Gallery
                </Button>
                <Button
                  mode="contained-tonal"
                  icon="camera"
                  onPress={takePhoto}
                  disabled={loading}
                  style={styles.actionBtn}
                >
                  Camera
                </Button>
              </View>
            </>
          )}

          {/* ✅ Loading Indicator with Progress and Cancel */}
          {loading && !isCapturing && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#8BC34A" />
              <Text style={styles.loadingText}>Analyzing Image...</Text>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                  <Text style={styles.progressText}>{uploadProgress}%</Text>
                </View>
              )}
              {!isServerReady && (
                <Text style={styles.subLoadingText}>
                  (Server နှိုးနေဆဲဖြစ်ပါက ပထမဆုံးအကြိမ်တွင် စက္ကန့် ၃၀ အထိ ကြာမြင့်နိုင်ပါသည်)
                </Text>
              )}
              {/* ✅ Cancel Button */}
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={cancelUpload}
              >
                <Text style={styles.cancelButtonText}>⏹ Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Result Output */}
          {result && !loading && !isCapturing && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Result: {result.class}</Text>
              <Text style={styles.confidenceText}>Confidence: {result.confidence}</Text>
            </View>
          )}

          {/* Error Output */}
          {error && !loading && !isCapturing && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <Button
            mode="contained"
            onPress={onBack}
            buttonColor="#43A047"
            style={styles.backBtn}
          >
            Go Back
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0B1E13',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#162A1C',
    borderRadius: 16,
    paddingVertical: 10,
  },
  content: {
    alignItems: 'center',
  },
  serverStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#0A150D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  serverStatusText: {
    color: '#CCC',
    fontSize: 12,
  },
  placeholderBox: {
    width: '100%',
    height: 200,
    backgroundColor: '#050D08',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  actionBtn: {
    flex: 0.48,
  },
  loadingBox: {
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  loadingText: {
    color: '#CCFF90',
    marginTop: 8,
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8BC34A',
    borderRadius: 4,
  },
  progressText: {
    color: '#B0BEC5',
    fontSize: 10,
    marginTop: 4,
  },
  subLoadingText: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  cancelButtonText: {
    color: '#f44336',
    fontSize: 13,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#050D08',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8BC34A',
    marginTop: 8,
  },
  resultTitle: {
    color: '#8BC34A',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confidenceText: {
    color: '#E0E0E0',
    fontSize: 14,
    marginTop: 4,
  },
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 13,
  },
  actions: {
    justifyContent: 'center',
    marginTop: 8,
  },
  backBtn: {
    width: '100%',
  },
  // ✅ Capturing State Styles
  capturingContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e17',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.2)',
  },
  capturingText: {
    color: '#8BC34A',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  capturingSubText: {
    color: '#607D8B',
    fontSize: 12,
    marginTop: 4,
  },
});