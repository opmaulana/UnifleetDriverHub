import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Search, Check } from 'lucide-react-native';
import { ReusableBottomSheet } from './ReusableBottomSheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = Platform.OS === 'web' ? 400 : SCREEN_HEIGHT * 0.45;

interface GenericEntityPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  entityType: 'driver' | 'geofence' | 'route' | 'trip_status';
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export const GenericEntityPickerSheet = ({
  visible,
  onClose,
  title,
  entityType,
  selectedValues,
  onChange,
}: GenericEntityPickerSheetProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mocked entity lists sourcing from standard operational databases
  const entities = useMemo(() => {
    if (entityType === 'geofence') {
      return [
        { id: 'geo_1', label: 'Depot A - Dar es Salaam', description: 'Central Operations Yard' },
        { id: 'geo_2', label: 'Mining Shore Terminal', description: 'Bulk Loading Zone' },
        { id: 'geo_3', label: 'Mbeya Border Post', description: 'Transit Check Point' },
        { id: 'geo_4', label: 'Transit Corridor North', description: 'Highway Geofence Zone' },
        { id: 'geo_5', label: 'Kigoma Port Yard', description: 'Secondary Storage' },
        { id: 'geo_6', label: 'Chalinze Junction Rest', description: 'Authorized Rest Stop' },
      ];
    }
    if (entityType === 'driver') {
      return [
        { id: 'drv_1', label: 'Joseph Mchunu', description: 'Senior Operator · Heavy Cargo' },
        { id: 'drv_2', label: 'Edward Soko', description: 'Transporter · Corridor A' },
        { id: 'drv_3', label: 'Ally Hassan', description: 'Shift A Driver · City Delivery' },
        { id: 'drv_4', label: 'Fatuma Juma', description: 'Regional Operator · Coastal Route' },
        { id: 'drv_5', label: 'Hamisi Ali', description: 'Night Shift Driver · Corridor B' },
      ];
    }
    if (entityType === 'route') {
      return [
        { id: 'rt_1', label: 'Dar - Morogoro - Mbeya', description: 'Standard Transit Corridor' },
        { id: 'rt_2', label: 'Coastal Corridor Link', description: 'High Risk Night Route' },
        { id: 'rt_3', label: 'Tanga - Arusha Route', description: 'Specialized Mining Delivery' },
      ];
    }
    return [
      { id: 'status_act', label: 'Active', description: 'Vehicle currently on active trip' },
      { id: 'status_com', label: 'Completed', description: 'Trips successfully finished' },
      { id: 'status_dev', label: 'Deviated', description: 'Trips with active route breaches' },
    ];
  }, [entityType]);

  const filteredEntities = useMemo(() => {
    return entities.filter(
      (e) =>
        e.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entities, searchQuery]);

  const toggleSelection = (id: string) => {
    if (selectedValues.includes(id)) {
      onChange(selectedValues.filter((v) => v !== id));
    } else {
      onChange([...selectedValues, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === entities.length) {
      onChange([]);
    } else {
      onChange(entities.map((e) => e.id));
    }
  };

  const selectedCountText = `${selectedValues.length} selected`;

  return (
    <ReusableBottomSheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.container}>
        {/* Search Input */}
        <View style={styles.searchBar}>
          <Search size={18} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${entityType}...`}
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Stats and Action header */}
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{selectedCountText}</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSelectAll}>
            <Text style={styles.actionText}>
              {selectedValues.length === entities.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {filteredEntities.length > 0 ? (
            filteredEntities.map((item) => {
              const isChecked = selectedValues.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemRow, isChecked && styles.itemRowSelected]}
                  onPress={() => toggleSelection(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.leftWrapper}>
                    <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                      {isChecked && <Check size={12} color="#ffffff" strokeWidth={3} />}
                    </View>
                    <View style={styles.textWrapper}>
                      <Text style={styles.label}>{item.label}</Text>
                      <Text style={styles.description}>{item.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results match your search</Text>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
          <Text style={styles.applyBtnText}>Apply Selection</Text>
        </TouchableOpacity>
      </View>
    </ReusableBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SHEET_HEIGHT,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111827',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C0392B',
  },
  listContainer: {
    flex: 1,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 8,
  },
  itemRowSelected: {
    borderColor: '#fecaca',
    backgroundColor: '#fff5f5',
  },
  leftWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: '#C0392B',
    backgroundColor: '#C0392B',
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: '#C0392B',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C0392B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
