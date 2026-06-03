import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Calendar, ChevronRight } from 'lucide-react-native';
import { ReusableBottomSheet } from './ReusableBottomSheet';
import { theme } from '../../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface DateRangeValue {
  preset: 'today' | 'yesterday' | '7_days' | '30_days' | 'MTD' | 'custom' | 'till_date';
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

interface DateSelectorSheetProps {
  visible: boolean;
  onClose: () => void;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

export const DateSelectorSheet = ({
  visible,
  onClose,
  value,
  onChange,
}: DateSelectorSheetProps) => {
  const [localPreset, setLocalPreset] = useState<DateRangeValue['preset']>(value.preset);
  
  // Format helpers
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  const getMTDStartString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const [startDateStr, setStartDateStr] = useState(
    value.startDate || getTodayString(localPreset === 'yesterday' ? 1 : localPreset === '7_days' ? 7 : 30)
  );
  const [endDateStr, setEndDateStr] = useState(
    value.endDate || getTodayString(localPreset === 'yesterday' ? 1 : 0)
  );
  const [dateError, setDateError] = useState('');

  const presets: { label: string; value: DateRangeValue['preset'] }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: '7_days' },
    { label: 'Last 30 Days', value: '30_days' },
    { label: 'Month to Date (MTD)', value: 'MTD' },
    { label: 'Till Date', value: 'till_date' },
    { label: 'Custom Range', value: 'custom' },
  ];

  const handleSelectPreset = (preset: DateRangeValue['preset']) => {
    setLocalPreset(preset);
    setDateError('');
    
    if (preset === 'today') {
      const today = getTodayString(0);
      onChange({ preset, startDate: today, endDate: today });
      onClose();
    } else if (preset === 'yesterday') {
      const yesterday = getTodayString(1);
      onChange({ preset, startDate: yesterday, endDate: yesterday });
      onClose();
    } else if (preset === '7_days') {
      onChange({ preset, startDate: getTodayString(7), endDate: getTodayString(0) });
      onClose();
    } else if (preset === '30_days') {
      onChange({ preset, startDate: getTodayString(30), endDate: getTodayString(0) });
      onClose();
    } else if (preset === 'MTD') {
      onChange({ preset, startDate: getMTDStartString(), endDate: getTodayString(0) });
      onClose();
    } else if (preset === 'till_date') {
      onChange({ preset, startDate: '2020-01-01', endDate: getTodayString(0) });
      onClose();
    }
  };

  const validateAndApplyCustom = () => {
    // Validate custom dates YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
      setDateError('Use YYYY-MM-DD date format (e.g. 2026-05-20)');
      return;
    }

    const startTimestamp = Date.parse(startDateStr);
    const endTimestamp = Date.parse(endDateStr);

    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      setDateError('Invalid dates entered');
      return;
    }

    if (startTimestamp > endTimestamp) {
      setDateError('Start Date cannot exceed End Date');
      return;
    }

    setDateError('');
    onChange({
      preset: 'custom',
      startDate: startDateStr,
      endDate: endDateStr,
    });
    onClose();
  };

  return (
    <ReusableBottomSheet
      visible={visible}
      onClose={onClose}
      title="Select Time Period"
    >
      <View style={styles.container}>
        {/* Preset options */}
        <View style={styles.presetsWrapper}>
          {presets.map((preset) => {
            const isActive = localPreset === preset.value;
            return (
              <TouchableOpacity
                key={preset.value}
                style={[styles.presetRow, isActive && styles.presetRowActive]}
                onPress={() => handleSelectPreset(preset.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.presetLabel, isActive && styles.presetLabelActive]}>
                  {preset.label}
                </Text>
                {isActive && <ChevronRight size={16} color="#C0392B" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Range Fields */}
        {localPreset === 'custom' && (
          <View style={styles.customContainer}>
            <Text style={styles.customTitle}>Specify Custom Interval</Text>
            
            <View style={styles.inputsRow}>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>FROM DATE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                  value={startDateStr}
                  onChangeText={(val) => {
                    setStartDateStr(val);
                    setDateError('');
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>TO DATE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                  value={endDateStr}
                  onChangeText={(val) => {
                    setEndDateStr(val);
                    setDateError('');
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

            <TouchableOpacity style={styles.applyBtn} onPress={validateAndApplyCustom}>
              <Text style={styles.applyBtnText}>Apply Custom Range</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ReusableBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  presetsWrapper: {
    gap: 4,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  presetRowActive: {
    backgroundColor: '#fff5f5',
  },
  presetLabel: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  presetLabelActive: {
    color: '#C0392B',
    fontWeight: '800',
  },
  customContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
    gap: 12,
  },
  customTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputBox: {
    flex: 1,
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: '#C0392B',
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
