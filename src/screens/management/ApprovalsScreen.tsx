import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../../theme/theme';
import { Check, X, ShieldAlert } from 'lucide-react-native';
import { Card } from '../../components/Card';
import { supabase } from '../../lib/supabase';

export const ApprovalsScreen = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'PENDING');
      
      if (error) throw error;
      setApprovals(data || []);
    } catch (err: any) {
      console.error('Error fetching approvals:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'APPROVED' })
        .eq('id', id);
        
      if (error) throw error;
      setApprovals(approvals.filter(a => a.id !== id));
      Alert.alert('Success', 'Access approved.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'REJECTED' })
        .eq('id', id);
        
      if (error) throw error;
      setApprovals(approvals.filter(a => a.id !== id));
      Alert.alert('Rejected', 'Access request denied.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <Text style={styles.headerSubtitle}>Manage access requests for all ASAS portals</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : approvals.length === 0 ? (
          <View style={styles.emptyState}>
            <ShieldAlert color={theme.colors.border} size={48} />
            <Text style={styles.emptyText}>No pending approvals</Text>
          </View>
        ) : (
          approvals.map((req) => (
            <Card key={req.id} style={styles.approvalCard}>
              <View style={styles.infoContainer}>
                <Text style={styles.nameText}>{req.full_name}</Text>
                <Text style={styles.phoneText}>{req.phone_number}</Text>
                <View style={styles.badgeContainer}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{req.role === 'DRIVER' ? 'Drivers Hub' : req.role}</Text>
                  </View>
                  {req.vehicle_number && (
                    <View style={[styles.badge, { marginLeft: 8, backgroundColor: '#E3F2FD', borderColor: '#90CAF9' }]}>
                      <Text style={[styles.badgeText, { color: '#1565C0' }]}>{req.vehicle_number}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleReject(req.id)}
                >
                  <X color={theme.colors.error} size={24} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleApprove(req.id)}
                >
                  <Check color={theme.colors.white} size={24} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    paddingTop: 60,
  },
  headerTitle: {
    ...theme.typography.h1,
    color: theme.colors.white,
    fontSize: 28,
  },
  headerSubtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  approvalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: 2,
  },
  phoneText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeText: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: theme.colors.error + '15', // light red
  },
  approveBtn: {
    backgroundColor: theme.colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...theme.typography.bodyLg,
    color: theme.colors.textSecondary,
    marginTop: 16,
  }
});
