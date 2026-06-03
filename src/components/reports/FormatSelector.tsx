import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, Check } from 'lucide-react-native';
import { ReportFormat } from '../../config/reportDefinitions';
import { theme } from '../../theme/theme';

interface FormatSelectorProps {
  supportedFormats: ReportFormat[];
  selectedFormat: ReportFormat;
  onChange: (format: ReportFormat) => void;
}

export const FormatSelector = ({
  supportedFormats,
  selectedFormat,
  onChange,
}: FormatSelectorProps) => {
  const formatsList: {
    format: ReportFormat;
    title: string;
    subtitle: string;
    extension: string;
  }[] = [
    {
      format: 'CSV',
      title: 'CSV Spreadsheet',
      subtitle: 'Excel compatible',
      extension: '.csv',
    },
    {
      format: 'PDF',
      title: 'PDF Document',
      subtitle: 'Printable report',
      extension: '.pdf',
    },
    {
      format: 'XLSX',
      title: 'XLSX Spreadsheet',
      subtitle: 'Native Excel format',
      extension: '.xlsx',
    },
  ];

  // Filter formats based on support in definition
  const visibleFormats = formatsList.filter((f) =>
    supportedFormats.includes(f.format)
  );

  return (
    <View style={styles.container}>
      {visibleFormats.map((item) => {
        const isSelected = selectedFormat === item.format;
        return (
          <TouchableOpacity
            key={item.format}
            style={[styles.card, isSelected && styles.cardActive]}
            onPress={() => onChange(item.format)}
            activeOpacity={0.7}
          >
            {/* Custom Checkbadge */}
            {isSelected && (
              <View style={styles.checkBadge}>
                <Check size={8} color="#ffffff" strokeWidth={3} />
              </View>
            )}

            {/* Icon */}
            <View style={[styles.iconCircle, isSelected && styles.iconCircleActive]}>
              <FileText size={20} color={isSelected ? '#C0392B' : '#9ca3af'} />
            </View>

            {/* Labels */}
            <Text style={[styles.title, isSelected && styles.titleActive]}>
              {item.title}
            </Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    position: 'relative',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardActive: {
    borderColor: '#C0392B',
    backgroundColor: '#fff5f5',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C0392B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircleActive: {
    backgroundColor: '#fee2e2',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    lineHeight: 16,
  },
  titleActive: {
    color: '#C0392B',
  },
  subtitle: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
    marginTop: 2,
  },
});
