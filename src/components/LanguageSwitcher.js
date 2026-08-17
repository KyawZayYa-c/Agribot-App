import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'my' : 'en');
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={toggleLanguage}
      activeOpacity={0.8}
    >
      <View style={styles.switchContainer}>
        <View style={[styles.switchTrack, language === 'my' && styles.switchTrackActive]}>
          <View 
            style={[
              styles.switchThumb, 
              language === 'my' && styles.switchThumbActive
            ]} 
          />
        </View>
        <View style={styles.labelsContainer}>
          <Text style={[styles.labelText, language === 'en' && styles.activeLabel]}>
            EN
          </Text>
          <Text style={styles.dividerText}>|</Text>
          <Text style={[styles.labelText, language === 'my' && styles.activeLabel]}>
            မြန်မာ
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
    marginRight: 8,
  },
  switchTrackActive: {
    backgroundColor: '#8BC34A',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    transform: [{ translateX: 0 }],
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  labelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    color: '#B0BEC5',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activeLabel: {
    color: '#8BC34A',
    fontWeight: '700',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 12,
    marginHorizontal: 4,
  },
});

export default LanguageSwitcher;