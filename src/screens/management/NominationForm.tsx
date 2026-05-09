import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const NominationForm = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color={theme.colors.white} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nomination Form</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Assign Vehicle</Text>
        <Input label="Vehicle Plate Number" placeholder="Enter plate number" />
        
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Trip Details</Text>
        <Input label="Pickup Location" placeholder="Enter pickup" />
        <Input label="Dropoff Location" placeholder="Enter dropoff" />
        
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Driver Details</Text>
        <Input label="Driver Name" placeholder="Assign driver" />
        
        <Button 
          title="Submit Nomination" 
          onPress={() => navigation.goBack()} 
          style={styles.submitBtn} 
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: theme.colors.primary },
  headerContent: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { ...theme.typography.h3, color: theme.colors.white },
  content: { padding: theme.spacing.lg },
  sectionTitle: { ...theme.typography.labelLg, color: theme.colors.text, marginBottom: theme.spacing.md },
  submitBtn: { marginTop: theme.spacing.xxl },
});
