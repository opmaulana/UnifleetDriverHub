import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  ScrollView,
} from 'react-native';
import { theme, playfairBold, playfairBoldStyle } from '../theme/theme';
import { Globe, X, Check } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

const LANGUAGES = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'sw' as const, name: 'Kiswahili', flag: '🇹🇿' },
];

export const IntentSelectionScreen = ({ route, navigation }: any) => {
  const rawName = route?.params?.visitorName || 'User';
  const trimmedName = rawName.trim();
  const visitorName = trimmedName ? (trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1)) : 'User';
  const { isAuthenticated, user } = useStore();
  const { t, language, setLanguage } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const options = [
    {
      id: 'drivers',
      title: t('asas_drivers'),
      description: t('asas_drivers_desc'),
      onPress: async () => {
        if (isAuthenticated && user?.role === 'DRIVER') {
          try {
            // Check real-time status from Supabase
            const { data, error } = await supabase
              .from('profiles')
              .select('approval_status')
              .eq('id', user.driver_id)
              .single();
              
            if (!error && data) {
              user.approval_status = data.approval_status;
              // update store
              useStore.getState().setUser(user);
            }
          } catch (e) {}

          if (user.approval_status === 'PENDING') {
            navigation.navigate('ApprovalPending');
          } else {
            navigation.navigate('Main');
          }
        } else {
          navigation.navigate('DriversIntro');
        }
      },
    },
    {
      id: 'operators',
      title: t('asas_live_ops'),
      description: t('asas_live_ops_desc'),
      onPress: () => navigation.navigate('OpsIntro'),
    },
    {
      id: 'management',
      title: t('asas_management'),
      description: t('asas_management_desc'),
      onPress: () => navigation.navigate('ManagementIntro'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.topBrand}>ASAS Mobile</Text>

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>ASAS Mobile</Text>
          <Text style={styles.heroTagline}>
            Total fleet control,{"\n"}right in your pocket.
          </Text>
          <Text style={styles.heroSubtitle}>Let’s get you started.</Text>
        </View>

        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeTitle}>
            {t('welcome_name')}<Text style={styles.welcomeName}>{visitorName || 'User'}</Text>,
          </Text>
          <Text style={styles.welcomeDesc}>{t('welcome_desc')}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={option.onPress}
              activeOpacity={0.8}
              style={styles.optionCard}
            >
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Language Selector */}
        <TouchableOpacity
          style={styles.langSelector}
          onPress={() => setLangModalVisible(true)}
          activeOpacity={0.7}
        >
          <Globe color={theme.colors.primary} size={18} />
          <Text style={styles.langSelectorText}>
            {currentLang.flag}  {currentLang.name}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={langModalVisible}
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_language')}</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <X color="#261816" size={22} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.langItem,
                    language === item.code && styles.langItemActive,
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setLangModalVisible(false);
                  }}
                >
                  <Text style={styles.langFlag}>{item.flag}</Text>
                  <Text
                    style={[
                      styles.langName,
                      language === item.code && styles.langNameActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {language === item.code && (
                    <Check color={theme.colors.primary} size={18} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 24 : 48,
    paddingBottom: 48,
  },
  topBrand: {
    ...playfairBoldStyle,
    color: theme.colors.primary,
    fontSize: 30,
    letterSpacing: -1,
    marginBottom: 32,
  },
  heroContent: {
    marginBottom: 32,
  },
  heroTitle: {
    ...playfairBoldStyle,
    color: theme.colors.primary,
    fontSize: 62,
    lineHeight: 70,
    letterSpacing: -2,
    marginBottom: 24,
  },
  heroTagline: {
    ...playfairBoldStyle,
    color: theme.colors.text,
    fontSize: 38,
    lineHeight: 48,
    letterSpacing: -1.2,
    marginBottom: 24,
  },
  heroSubtitle: {
    color: '#4A4A4A',
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 30,
  },
  welcomeBox: {
    backgroundColor: '#FFF8F8',
    borderWidth: 1.5,
    borderColor: '#FFD0CE',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  welcomeTitle: {
    ...playfairBoldStyle,
    fontSize: 22,
    color: '#000000',
    marginBottom: 8,
  },
  welcomeName: {
    color: theme.colors.primary,
  },
  welcomeDesc: {
    fontSize: 15,
    color: '#4A4A4A',
    lineHeight: 22,
    fontWeight: '400',
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 28,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  optionTitle: {
    ...playfairBoldStyle,
    fontSize: 22,
    color: '#000000',
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    color: '#7E7E7E',
    lineHeight: 20,
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  langSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: 400,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#261816',
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    gap: 12,
  },
  langItemActive: {
    backgroundColor: theme.colors.primary + '10',
  },
  langFlag: {
    fontSize: 22,
  },
  langName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#261816',
  },
  langNameActive: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
