import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

const MapView = ({ style, children }: any) => (
  <View style={[style, styles.container]}>
    <Text style={styles.text}>Map View Placeholder (Web)</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
  },
});

export default MapView;
