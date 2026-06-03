import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Search, Check, Square, CheckSquare } from 'lucide-react-native';
import { ReusableBottomSheet } from './ReusableBottomSheet';
import { useOperationsStore } from '../../store/useOperationsStore';
import { theme } from '../../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VehicleSelectorSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedVehicles: string[];
  onChange: (vehicles: string[]) => void;
}

export const VehicleSelectorSheet = ({
  visible,
  onClose,
  selectedVehicles,
  onChange,
}: VehicleSelectorSheetProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { vehicles } = useOperationsStore();

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) =>
      v.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vehicles, searchQuery]);

  const toggleVehicle = (id: string) => {
    if (selectedVehicles.includes(id)) {
      onChange(selectedVehicles.filter((v) => v !== id));
    } else {
      onChange([...selectedVehicles, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedVehicles.length === vehicles.length) {
      onChange([]);
    } else {
      onChange(vehicles.map((v) => v.id));
    }
  };

  return (
    <ReusableBottomSheet
      visible={visible}
      onClose={onClose}
      title="Select Specific Vehicles"
    >
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.searchBar}>
          <Search size={18} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by vehicle label or ID..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick select options */}
        <View style={styles.selectionStatsRow}>
          <Text style={styles.selectionCount}>
            {selectedVehicles.length} of {vehicles.length} selected
          </Text>
          <TouchableOpacity style={styles.selectAllBtn} onPress={handleSelectAll}>
            <Text style={styles.selectAllText}>
              {selectedVehicles.length === vehicles.length
                ? 'Deselect All'
                : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable list */}
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => {
              const isChecked = selectedVehicles.includes(vehicle.id);
              const statusText = vehicle.status.toUpperCase();
              
              // Colors for statuses
              const getBadgeStyles = (status: string) => {
                if (status === 'MOVING') return { bg: '#e8f5e9', text: '#2e7d32' };
                if (status === 'OFFLINE') return { bg: '#fafafa', text: '#757575' };
                if (status.includes('IDLE')) return { bg: '#fffde7', text: '#fbc02d' };
                return { bg: '#e3f2fd', text: '#1565c0' }; // parked / stopped
              };

              const badgeColors = getBadgeStyles(statusText);

              return (
                <TouchableOpacity
                  key={vehicle.trackerId}
                  style={[styles.itemRow, isChecked && styles.itemRowSelected]}
                  onPress={() => toggleVehicle(vehicle.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.leftWrapper}>
                    <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                      {isChecked && <Check size={12} color="#ffffff" strokeWidth={3} />}
                    </View>
                    <View style={styles.textDetails}>
                      <Text style={styles.vehicleId}>{vehicle.id}</Text>
                      <Text style={styles.trackerId}>ID: {vehicle.trackerId}</Text>
                    </View>
                  </View>
                  <View
                    style={[styles.statusBadge, { backgroundColor: badgeColors.bg }]}
                  >
                    <Text style={[styles.statusText, { color: badgeColors.text }]}>
                      {statusText}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptySearch}>
              <Text style={styles.emptyText}>No vehicles match search query</Text>
            </View>
          )}
        </ScrollView>

        {/* Sticky footer close action */}
        <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
          <Text style={styles.applyBtnText}>Apply Selection</Text>
        </TouchableOpacity>
      </View>
    </ReusableBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT * 0.5,
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
  selectionStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  selectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectAllText: {
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
    justifyContent: 'space-between',
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
  textDetails: {
    gap: 2,
  },
  vehicleId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  trackerId: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptySearch: {
    paddingVertical: 40,
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
