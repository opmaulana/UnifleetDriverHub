import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { FilterDefinition } from '../../config/reportDefinitions';
import { VehicleSelectorSheet } from './VehicleSelectorSheet';
import { DateSelectorSheet, DateRangeValue } from './DateSelectorSheet';
import { GenericEntityPickerSheet } from './GenericEntityPickerSheet';
import { theme } from '../../theme/theme';

interface FilterCardProps {
  definition: FilterDefinition;
  value: any;
  onChange: (value: any) => void;
}

export const FilterCard = ({ definition, value, onChange }: FilterCardProps) => {
  const [vehicleSheetOpen, setVehicleSheetOpen] = useState(false);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [genericSheetOpen, setGenericSheetOpen] = useState(false);

  // Dynamic Lucide Icon mapping
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={18} color="#4b5563" style={{ marginRight: 8 }} />;
  };

  const getActiveIconColor = (iconName?: string, active = false) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={18} color={active ? '#C0392B' : '#9ca3af'} />;
  };

  // Render 1: Report Scope Selector
  const renderScope = () => {
    const scopeType = value?.type || 'entire_fleet';
    const selectedVehicles = value?.selectedVehicles || [];

    const handleSelectScope = (type: 'entire_fleet' | 'specific_vehicle') => {
      onChange({ ...value, type });
      if (type === 'specific_vehicle' && selectedVehicles.length === 0) {
        setVehicleSheetOpen(true);
      }
    };

    return (
      <View style={styles.scopeWrapper}>
        {/* Entire Fleet */}
        <TouchableOpacity
          style={[styles.scopeRow, scopeType === 'entire_fleet' && styles.scopeRowActive]}
          onPress={() => handleSelectScope('entire_fleet')}
          activeOpacity={0.7}
        >
          <View style={[styles.radioCircle, scopeType === 'entire_fleet' && styles.radioCircleActive]}>
            {scopeType === 'entire_fleet' && <View style={styles.radioInner} />}
          </View>
          <View style={[styles.scopeIconContainer, { backgroundColor: '#fef2f2' }]}>
            {getActiveIconColor('Truck', scopeType === 'entire_fleet')}
          </View>
          <View style={styles.scopeTextDetails}>
            <Text style={[styles.scopeTitle, scopeType === 'entire_fleet' && styles.scopeTitleActive]}>
              Entire Fleet
            </Text>
            <Text style={styles.scopeSubtitle}>Include all vehicles in your fleet</Text>
          </View>
        </TouchableOpacity>

        {/* Specific Vehicle */}
        <TouchableOpacity
          style={[styles.scopeRow, scopeType === 'specific_vehicle' && styles.scopeRowActive]}
          onPress={() => handleSelectScope('specific_vehicle')}
          activeOpacity={0.7}
        >
          <View style={[styles.radioCircle, scopeType === 'specific_vehicle' && styles.radioCircleActive]}>
            {scopeType === 'specific_vehicle' && <View style={styles.radioInner} />}
          </View>
          <View style={[styles.scopeIconContainer, { backgroundColor: '#eff6ff' }]}>
            {getActiveIconColor('BookOpen', scopeType === 'specific_vehicle')}
          </View>
          <View style={styles.scopeTextDetails}>
            <Text style={[styles.scopeTitle, scopeType === 'specific_vehicle' && styles.scopeTitleActive]}>
              Specific Vehicle
            </Text>
            <Text style={styles.scopeSubtitle}>Select one or more vehicles</Text>
          </View>
        </TouchableOpacity>

        {/* Selected Vehicle Chips and Picker Action */}
        {scopeType === 'specific_vehicle' && (
          <View style={styles.chipsContainer}>
            <TouchableOpacity
              style={styles.pickerTriggerBtn}
              onPress={() => setVehicleSheetOpen(true)}
            >
              <Text style={styles.pickerTriggerBtnText}>
                {selectedVehicles.length > 0
                  ? `Edit Selection (${selectedVehicles.length} vehicles)`
                  : 'Tap to Select Vehicles'}
              </Text>
            </TouchableOpacity>

            {selectedVehicles.length > 0 && (
              <View style={styles.chipsWrapper}>
                {selectedVehicles.map((vId: string) => (
                  <View key={vId} style={styles.chip}>
                    <Text style={styles.chipText}>{vId}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        onChange({
                          ...value,
                          selectedVehicles: selectedVehicles.filter((id: string) => id !== vId),
                        });
                      }}
                    >
                      <Text style={styles.chipClose}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <VehicleSelectorSheet
          visible={vehicleSheetOpen}
          onClose={() => setVehicleSheetOpen(false)}
          selectedVehicles={selectedVehicles}
          onChange={(newVehicles) => {
            onChange({ ...value, selectedVehicles: newVehicles });
          }}
        />
      </View>
    );
  };

  // Render 2: Date Selector
  const renderDateRange = () => {
    const preset = value?.preset || '30_days';
    const startDate = value?.startDate;
    const endDate = value?.endDate;

    const quickFilters: { label: string; preset: DateRangeValue['preset'] }[] = [
      { label: 'MTD', preset: 'MTD' },
      { label: 'Today', preset: 'today' },
      { label: 'Yesterday', preset: 'yesterday' },
      { label: '7 Days', preset: '7_days' },
      { label: '30 Days', preset: '30_days' },
    ];

    const getFormattedRangeText = () => {
      if (preset === 'till_date') return 'Till Date (All history)';
      if (startDate && endDate) {
        return `${startDate} to ${endDate}`;
      }
      return 'Select customized period';
    };

    return (
      <View style={styles.dateWrapper}>
        {/* Preset pill row */}
        {definition.id === 'time_period' && (
          <View style={styles.periodPillRow}>
            {quickFilters.map((q) => {
              const isActive = preset === q.preset;
              return (
                <TouchableOpacity
                  key={q.preset}
                  style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                  onPress={() => {
                    const d = new Date();
                    const getTodayStr = (offset: number) => {
                      const temp = new Date();
                      temp.setDate(temp.getDate() - offset);
                      return temp.toISOString().split('T')[0];
                    };
                    let start = getTodayStr(30);
                    let end = getTodayStr(0);

                    if (q.preset === 'today') {
                      start = getTodayStr(0);
                      end = getTodayStr(0);
                    } else if (q.preset === 'yesterday') {
                      start = getTodayStr(1);
                      end = getTodayStr(1);
                    } else if (q.preset === '7_days') {
                      start = getTodayStr(7);
                      end = getTodayStr(0);
                    } else if (q.preset === 'MTD') {
                      start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
                      end = getTodayStr(0);
                    }
                    
                    onChange({ preset: q.preset, startDate: start, endDate: end });
                  }}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {q.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Custom trigger or custom info card */}
        <TouchableOpacity
          style={[styles.customDateTrigger, preset === 'custom' && styles.customDateTriggerActive]}
          onPress={() => setDateSheetOpen(true)}
        >
          <LucideIcons.Calendar size={14} color={preset === 'custom' ? '#C0392B' : '#9ca3af'} />
          <Text style={[styles.customDateText, preset === 'custom' && styles.customDateTextActive]}>
            {preset === 'custom'
              ? `Custom: ${getFormattedRangeText()}`
              : preset === 'till_date'
              ? 'Till Date (All operations)'
              : `Period: ${quickFilters.find((q) => q.preset === preset)?.label || preset}`}
          </Text>
          <Text style={styles.customDateEdit}>Modify</Text>
        </TouchableOpacity>

        <DateSelectorSheet
          visible={dateSheetOpen}
          onClose={() => setDateSheetOpen(false)}
          value={value || { preset: '30_days' }}
          onChange={onChange}
        />
      </View>
    );
  };

  // Render 3: Standard Dropdown / Pill select choices
  const renderSelect = () => {
    const options = definition.options || [];
    return (
      <View style={styles.selectRow}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.pillBtn, isSelected && styles.pillBtnActive, { flex: 1 }]}
              onPress={() => onChange(opt.value)}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextActive, { textAlign: 'center' }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Render 4: Standard Toggle (Switch)
  const renderToggle = () => {
    return (
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Enable filter active</Text>
        <Switch
          value={value ?? definition.defaultValue}
          onValueChange={onChange}
          trackColor={{ false: '#d1d5db', true: '#fca5a5' }}
          thumbColor={value ? '#C0392B' : '#f3f4f6'}
        />
      </View>
    );
  };

  // Render 5: Numeric threshold inputs
  const renderNumber = () => {
    return (
      <View style={styles.numberWrapper}>
        <TextInput
          style={styles.numberInput}
          value={String(value ?? definition.defaultValue ?? '')}
          onChangeText={(text) => {
            const num = text.replace(/[^0-9.]/g, '');
            onChange(num ? Number(num) : 0);
          }}
          keyboardType="numeric"
          placeholder={definition.placeholder}
          placeholderTextColor="#9ca3af"
        />
        {definition.unit && (
          <View style={styles.unitBadge}>
            <Text style={styles.unitBadgeText}>{definition.unit}</Text>
          </View>
        )}
      </View>
    );
  };

  // Render 6: Searchable entity pickers (geofence, driver, routes)
  const renderEntityPicker = () => {
    const selectedList = value || [];
    const getMockLabel = (id: string) => {
      if (id.startsWith('geo_')) {
        const mapping: Record<string, string> = {
          geo_1: 'Depot A',
          geo_2: 'Mining Terminal',
          geo_3: 'Mbeya Border',
          geo_4: 'Transit Corridor',
        };
        return mapping[id] || id;
      }
      if (id.startsWith('drv_')) {
        const mapping: Record<string, string> = {
          drv_1: 'Joseph M.',
          drv_2: 'Edward S.',
          drv_3: 'Ally H.',
        };
        return mapping[id] || id;
      }
      return id;
    };

    return (
      <View style={styles.entityWrapper}>
        <TouchableOpacity
          style={styles.entityTriggerBtn}
          onPress={() => setGenericSheetOpen(true)}
        >
          <Text style={styles.entityTriggerText}>
            {selectedList.length > 0
              ? `Select ${definition.entityType}s (${selectedList.length} chosen)`
              : definition.placeholder || 'Tap to choose'}
          </Text>
        </TouchableOpacity>

        {selectedList.length > 0 && (
          <View style={styles.chipsWrapper}>
            {selectedList.map((id: string) => (
              <View key={id} style={styles.chip}>
                <Text style={styles.chipText}>{getMockLabel(id)}</Text>
                <TouchableOpacity
                  onPress={() => {
                    onChange(selectedList.filter((v: string) => v !== id));
                  }}
                >
                  <Text style={styles.chipClose}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <GenericEntityPickerSheet
          visible={genericSheetOpen}
          onClose={() => setGenericSheetOpen(false)}
          title={definition.label}
          entityType={(definition.entityType as any) || 'geofence'}
          selectedValues={selectedList}
          onChange={onChange}
        />
      </View>
    );
  };

  const getRenderer = () => {
    switch (definition.type) {
      case 'scope':
        return renderScope();
      case 'daterange':
        return renderDateRange();
      case 'select':
        return renderSelect();
      case 'toggle':
        return renderToggle();
      case 'number':
        return renderNumber();
      case 'entity_picker':
        return renderEntityPicker();
      default:
        return null;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {getIcon(definition.icon)}
        <Text style={styles.cardTitle}>{definition.label}</Text>
      </View>
      <View style={styles.cardBody}>{getRenderer()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  cardBody: {
    width: '100%',
  },
  // Scope layout
  scopeWrapper: {
    gap: 10,
  },
  scopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  scopeRowActive: {
    borderColor: '#C0392B',
    backgroundColor: '#fff5f5',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleActive: {
    borderColor: '#C0392B',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C0392B',
  },
  scopeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scopeTextDetails: {
    flex: 1,
  },
  scopeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  scopeTitleActive: {
    color: '#C0392B',
  },
  scopeSubtitle: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: 1,
  },
  chipsContainer: {
    marginTop: 6,
    gap: 8,
  },
  pickerTriggerBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  pickerTriggerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C0392B',
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C0392B',
  },
  chipClose: {
    fontSize: 14,
    fontWeight: '900',
    color: '#C0392B',
    lineHeight: 14,
  },
  // Date range layout
  dateWrapper: {
    gap: 10,
  },
  periodPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pillBtnActive: {
    backgroundColor: '#fff5f5',
    borderColor: '#fca5a5',
  },
  pillText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#C0392B',
    fontWeight: '800',
  },
  customDateTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  customDateTriggerActive: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  customDateText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '700',
    flex: 1,
    marginLeft: 6,
  },
  customDateTextActive: {
    color: '#C0392B',
  },
  customDateEdit: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C0392B',
  },
  // Dropdown list select layout
  selectRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  // Toggle layout
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 10,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  // Number inputs layout
  numberWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
  },
  numberInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    height: '100%',
  },
  unitBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4b5563',
  },
  // Entity pickers layout
  entityWrapper: {
    gap: 8,
  },
  entityTriggerBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  entityTriggerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C0392B',
  },
});
