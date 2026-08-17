import React, { useState } from 'react';
import { View, Button, Text, Image, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker'; 

export default function PlantScannerScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickAndClassify = async () => {
    // 1. ImagePicker ဖြင့် ဓာတ်ပုံရွေးခြင်း
    const resultPicker = await launchImageLibrary({ mediaType: 'photo' });
    if (resultPicker.didCancel || !resultPicker.assets?.[0]) return;

    const imageAsset = resultPicker.assets[0];
    setSelectedImage(imageAsset.uri);
    setLoading(true);

    setLoading(false);

    if (res) {
      // Backend Controller မှ ပြန်လာသည့် Response (ဥပမာ res.disease သို့မဟုတ် res) ကို ပြပေးခြင်း
      setResult(res.disease || res);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200, marginBottom: 20 }} />
      )}
      
      <Button title="ဓာတ်ပုံရွေးပြီး ရောဂါစစ်ဆေးမည်" onPress={handlePickAndClassify} />

      {loading && <ActivityIndicator size="large" color="#00ff00" style={{ marginTop: 20 }} />}
      
      {result ? <Text style={{ marginTop: 20, fontSize: 18 }}>ရလဒ်: {result}</Text> : null}
    </View>
  );
}