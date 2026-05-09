import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Truck, Network, BarChart3, ChevronRight, Globe, X, Check } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { useStore } from '../store/useStore';

const LANGUAGES = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'sw' as const, name: 'Kiswahili', flag: '🇹🇿' },
  { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
  { code: 'hi' as const, name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
];

export const IntentSelectionScreen = ({ navigation }: any) => {
  const { isAuthenticated, user } = useStore();
  const { t, language, setLanguage } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const options = [
    {
      id: 'drivers',
      title: t('asas_drivers'),
      description: t('asas_drivers_desc'),
      icon: <Truck color={theme.colors.primary} size={32} />,
      onPress: () => {
        if (isAuthenticated && user?.role === 'driver') {
          if (!user.onboarding_completed) {
            navigation.navigate('ProfileSetup', { phone: user.phone });
          } else if (!user.permissions_granted) {
            navigation.navigate('BackgroundCheck', { phone: user.phone });
          } else {
            navigation.navigate('Main');
          }
        } else {
          navigation.navigate('Login');
        }
      },
    },
    {
      id: 'operators',
      title: t('asas_live_ops'),
      description: t('asas_live_ops_desc'),
      icon: <Network color={theme.colors.primary} size={32} />,
      onPress: () => navigation.navigate('OperationsFlow'),
    },
    {
      id: 'management',
      title: t('asas_management'),
      description: t('asas_management_desc'),
      icon: <BarChart3 color={theme.colors.primary} size={32} />,
      onPress: () => navigation.navigate('ManagementFlow'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brandText}>ASAS</Text>
          <Text style={styles.welcomeText}>{t('welcome_asas')}</Text>
          <Text style={styles.subtitle}>{t('select_portal')}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <Card style={styles.optionCard}>
                <View style={styles.iconBackground}>
                  {option.icon}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <ChevronRight color={theme.colors.border} size={20} />
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Language Selector */}
        <TouchableOpacity
          style={styles.langSelector}
          onPress={() => setLangModalVisible(true)}
          activeOpacity={0.7}
        >
          <Globe color={theme.colors.primary} size={20} />
          <Text style={styles.langSelectorText}>
            {currentLang.flag}  {currentLang.name}
          </Text>
          <ChevronRight color={theme.colors.border} size={16} />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('built_by')} <Text style={styles.linkText}>Unifleet Labs</Text>
          </Text>
          <Text style={styles.versionText}>V1.3</Text>
        </View>
      </View>

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
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brandText: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  welcomeText: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontSize: 28,
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    ...theme.typography.h2,
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  // ---- Language Selector ----
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  langSelectorText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },

  // ---- Modal ----
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

  // ---- Footer ----
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
  },
  linkText: {
    color: '#2196F3',
    fontWeight: '700',
  },
  versionText: {
    ...theme.typography.labelSm,
    color: theme.colors.border,
    fontSize: 10,
    marginTop: 4,
  },
});
