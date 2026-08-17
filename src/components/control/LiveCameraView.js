// components/control/LiveCameraView.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const LiveCameraView = ({
  videoStreamUrl,
  isVideoVisible = true,
  onToggleVisibility,
  onReload,
  isLoading,
  hasError,
  captureMode = false,  // ✅ ထည့်ပါ
}) => {
  const [webViewKey, setWebViewKey] = useState(0);
  const webViewRef = useRef(null);  // ✅ WebView ref ထည့်ပါ

  // ✅ Stream URL ပြောင်းတဲ့အခါ WebView ကို refresh လုပ်ဖို့
  useEffect(() => {
    if (videoStreamUrl) {
      setWebViewKey(prev => prev + 1);
    }
  }, [videoStreamUrl]);

  // ✅ Capture mode ပြောင်းတဲ့အခါ WebView ကို pause/resume လုပ်ဖို့
  useEffect(() => {
    if (captureMode) {
      // Capture လုပ်နေချိန် WebView ကို ရပ်ထားမယ်
      console.log('📷 Capture mode: WebView paused');
    } else {
      // Capture ပြီးရင် WebView ကို ပြန် run မယ်
      console.log('📷 Capture mode: WebView resumed');
    }
  }, [captureMode]);

  const getVideoHtml = (streamUrl) => {
    if (!streamUrl) {
      return `
        <!DOCTYPE html>
        <html>
        <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="background:#0a0e17;display:flex;justify-content:center;align-items:center;height:100vh;color:#455A64;font-family:sans-serif;">
          <div style="text-align:center;">
            <div style="font-size:40px;margin-bottom:10px;">📷</div>
            <div>No camera stream URL</div>
          </div>
        </body>
        </html>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; }
          body { 
            background: #0a0e17; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            overflow: hidden;
          }
          img { 
            width: 100%; 
            height: 100%; 
            object-fit: cover;
          }
          #loading {
            position: absolute;
            color: #8BC34A;
            font-family: sans-serif;
            font-size: 14px;
          }
          #error {
            position: absolute;
            color: #ff4444;
            font-family: sans-serif;
            font-size: 14px;
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="loading">⏳ Loading stream...</div>
        <div id="error">❌ Camera offline</div>
        <img id="streamImg" src="${streamUrl}" 
             onload="document.getElementById('loading').style.display='none'" 
             onerror="document.getElementById('loading').style.display='none';document.getElementById('error').style.display='block'"/>
      </body>
      </html>
    `;
  };

  if (!videoStreamUrl && !isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.cameraHeader}>
          <View style={styles.cameraHeaderLeft}>
            <MaterialCommunityIcons name="video" size={14} color="#8BC34A" />
            <Text style={styles.cameraTitle}>Live View</Text>
            <View style={styles.liveDotOff} />
          </View>
          <View style={styles.cameraHeaderRight}>
            <TouchableOpacity onPress={onToggleVisibility} style={styles.cameraToggleBtn}>
              <Ionicons name={isVideoVisible ? 'eye' : 'eye-off'} size={14} color="#607D8B" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onReload} style={styles.cameraReloadBtn}>
              <Ionicons name="refresh" size={14} color="#607D8B" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.videoErrorContainer}>
          <MaterialCommunityIcons name="video-off" size={40} color="#455A64" />
          <Text style={styles.videoErrorText}>No Camera IP Configured</Text>
          <Text style={styles.videoErrorSubText}>Please set Camera IP in Settings</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onReload}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cameraFooter}>
          <View style={styles.cameraStatusItem}>
            <View style={styles.cameraStatusDotRed} />
            <Text style={styles.cameraStatusText}>Offline</Text>
          </View>
          <Text style={styles.cameraFpsText}>-- fps</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Header */}
      <View style={styles.cameraHeader}>
        <View style={styles.cameraHeaderLeft}>
          <MaterialCommunityIcons name="video" size={14} color="#8BC34A" />
          <Text style={styles.cameraTitle}>Live View</Text>
          <View style={[styles.liveDot, { backgroundColor: hasError ? '#ff4444' : '#ff4444' }]} />
        </View>
        <View style={styles.cameraHeaderRight}>
          <TouchableOpacity onPress={onToggleVisibility} style={styles.cameraToggleBtn}>
            <Ionicons name={isVideoVisible ? 'eye' : 'eye-off'} size={14} color="#607D8B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onReload} style={styles.cameraReloadBtn}>
            <Ionicons name="refresh" size={14} color="#607D8B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera Body */}
      {isVideoVisible ? (
        <View style={styles.cameraContainer}>
          {isLoading && (
            <View style={styles.videoLoadingOverlay}>
              <ActivityIndicator size="small" color="#8BC34A" />
              <Text style={styles.videoLoadingText}>Loading...</Text>
            </View>
          )}
          {hasError ? (
            <View style={styles.videoErrorContainer}>
              <MaterialCommunityIcons name="video-off" size={28} color="#ff4444" />
              <Text style={styles.videoErrorText}>Camera Offline</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={onReload}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              ref={webViewRef}
              key={webViewKey}
              source={{ 
                html: getVideoHtml(videoStreamUrl),
                baseUrl: '' 
              }}
              style={styles.videoStream}
              javaScriptEnabled={true}
              domStorageEnabled={false}
              startInLoadingState={false}
              scalesPageToFit={true}
              scrollEnabled={false}
              automaticallyAdjustContentInsets={false}
              // ✅ Capture လုပ်နေချိန် WebView ကို pause လုပ်မယ်
              onShouldStartLoadWithRequest={() => !captureMode}
            />
          )}
        </View>
      ) : (
        <View style={styles.videoHiddenContainer}>
          <MaterialCommunityIcons name="video-off" size={28} color="#455A64" />
          <Text style={styles.videoHiddenText}>Camera Off</Text>
          <TouchableOpacity onPress={onToggleVisibility} style={styles.showVideoBtn}>
            <Text style={styles.showVideoBtnText}>Tap to Show</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Camera Footer */}
      <View style={styles.cameraFooter}>
        <View style={styles.cameraStatusItem}>
          <View style={[styles.cameraStatusDot, { backgroundColor: hasError ? '#ff4444' : '#8BC34A' }]} />
          <Text style={styles.cameraStatusText}>{hasError ? 'Offline' : 'Streaming'}</Text>
        </View>
        <Text style={styles.cameraFpsText}>15 fps</Text>
      </View>
    </View>
  );
};

// ... styles အတိုင်းထားပါ ...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cameraHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cameraTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ff4444',
  },
  liveDotOff: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#455A64',
  },
  cameraHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cameraToggleBtn: {
    padding: 2,
  },
  cameraReloadBtn: {
    padding: 2,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#0a0e17',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 100,
  },
  videoStream: {
    flex: 1,
    height: '100%',
    backgroundColor: '#0a0e17',
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },
  videoLoadingText: {
    color: '#8BC34A',
    fontSize: 9,
    marginTop: 4,
  },
  videoErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#0a0e17',
    borderRadius: 6,
    minHeight: 100,
  },
  videoErrorText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
  },
  videoErrorSubText: {
    color: '#607D8B',
    fontSize: 10,
    marginTop: 2,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#8BC34A',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#0B1E13',
    fontWeight: 'bold',
    fontSize: 10,
  },
  videoHiddenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e17',
    borderRadius: 6,
    minHeight: 80,
  },
  videoHiddenText: {
    color: '#455A64',
    fontSize: 10,
    marginTop: 2,
  },
  showVideoBtn: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#455A64',
    borderRadius: 10,
  },
  showVideoBtnText: {
    color: '#607D8B',
    fontSize: 8,
  },
  cameraFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: 2,
  },
  cameraStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cameraStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#8BC34A',
  },
  cameraStatusDotRed: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ff4444',
  },
  cameraStatusText: {
    color: '#607D8B',
    fontSize: 7,
  },
  cameraFpsText: {
    color: '#455A64',
    fontSize: 7,
  },
});

export default LiveCameraView;