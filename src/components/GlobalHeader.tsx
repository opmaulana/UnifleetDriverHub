import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Globe, X } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useTranslation } from '../hooks/useTranslation';

export const GlobalHeader = ({ rightComponent }: { rightComponent?: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const { t, setLanguage } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'ar', name: 'العربية' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'fr', name: 'Français' },
  ] as const;

  const selectLang = (code: 'en' | 'sw' | 'ar' | 'hi' | 'fr') => {
    setLanguage(code);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        <Text style={styles.brandText}>ASAS</Text>
        
        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={styles.langBtn} 
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Globe color={theme.colors.white} size={24} />
          </TouchableOpacity>
          
          {rightComponent || (
            <TouchableOpacity style={styles.menuBtn}>
              <Menu color={theme.colors.white} size={24} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_language')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={theme.colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.langItem} 
                  onPress={() => selectLang(item.code)}
                >
                  <Text style={styles.langName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
  },
  headerContent: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  brandText: {
    ...theme.typography.h3,
    color: theme.colors.white,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBtn: {
    padding: 8,
    marginRight: theme.spacing.xs,
  },
  menuBtn: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    maxHeight: 400,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  langItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  langName: {
    ...theme.typography.bodyLg,
    color: theme.colors.text,
  },
});
