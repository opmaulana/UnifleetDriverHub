import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Camera, Upload, User } from 'lucide-react-native';
import { useStore } from '../store/useStore';

export const ProfileSetupScreen = ({ navigation }: any) => {
  const login = useStore(state => state.login);
  const [name, setName] = useState('');
  const [vehicle, setVehicle] = useState('');

  const handleComplete = () => {
    login('0700000000');
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Profile</Text>
          <Text style={styles.subtitle}>Set up your driver identity</Text>
        </View>

        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoPlaceholder}>
            <View style={styles.photoIcon}>
              <Camera color={theme.colors.white} size={24} />
            </View>
            <User color={theme.colors.border} size={80} />
          </TouchableOpacity>
          <Text style={styles.photoText}>Upload Profile Photo</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Vehicle Number"
            placeholder="KDJ 432L"
            value={vehicle}
            onChangeText={setVehicle}
          />
        </View>

        <Text style={styles.sectionTitle}>Documents</Text>
        <Card style={styles.documentCard}>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>Driving License</Text>
            <Text style={styles.documentStatus}>Not uploaded</Text>
          </View>
          <TouchableOpacity style={styles.uploadBtn}>
            <Upload color={theme.colors.primary} size={20} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.documentCard}>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>Vehicle Insurance</Text>
            <Text style={styles.documentStatus}>Not uploaded</Text>
          </View>
          <TouchableOpacity style={styles.uploadBtn}>
            <Upload color={theme.colors.primary} size={20} />
          </TouchableOpacity>
        </Card>

        <Button
          title="Complete Setup"
          onPress={handleComplete}
          style={styles.completeBtn}
          disabled={!name || !vehicle}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    marginVertical: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  photoIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  photoText: {
    ...theme.typography.labelSm,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    fontWeight: '600',
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    ...theme.typography.bodyMd,
    fontWeight: '600',
    color: theme.colors.text,
  },
  documentStatus: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  uploadBtn: {
    padding: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  completeBtn: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
});
