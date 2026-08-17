// components/common/GlassCard.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

const GlassCard = ({ children, style, ...props }) => {
  return (
    <View style={[styles.glassCard, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export default GlassCard;