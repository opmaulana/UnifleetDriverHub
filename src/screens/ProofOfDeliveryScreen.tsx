import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Camera, PenTool, CheckCircle, ChevronLeft } from 'lucide-react-native';
import { useStore } from '../store/useStore';

export const ProofOfDeliveryScreen = ({ navigation }: any) => {
  const { updateTripStatus } = useStore();
  const [recipient, setRecipient] = useState('');

  const handleComplete = () => {
    updateTripStatus('completed');
    navigation.navigate('TripSummary');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={theme.colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proof of Delivery</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Step 1: Take Photo</Text>
        <TouchableOpacity style={styles.cameraBox}>
          <Camera size={48} color={theme.colors.textSecondary} />
          <Text style={styles.cameraLabel}>Capture delivery photo</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Step 2: Recipient Details</Text>
        <Input
          placeholder="Recipient Name"
          value={recipient}
          onChangeText={setRecipient}
        />

        <Text style={styles.sectionTitle}>Step 3: Signature</Text>
        <View style={styles.signatureBox}>
          <View style={styles.signatureCanvas}>
             <PenTool size={32} color={theme.colors.border} />
             <Text style={styles.signatureHint}>Draw signature here</Text>
          </View>
          <TouchableOpacity style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Complete Delivery"
          onPress={handleComplete}
          style={styles.submitBtn}
          disabled={!recipient}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.labelLg,
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    fontWeight: '700',
  },
  cameraBox: {
    height: 200,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLabel: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  signatureBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  signatureCanvas: {
    height: 150,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  signatureHint: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  clearBtn: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  clearText: {
    ...theme.typography.labelSm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
  },
});
