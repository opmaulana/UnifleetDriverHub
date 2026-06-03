export type ReportFormat = 'CSV' | 'PDF' | 'XLSX';

export type FilterType =
  | 'scope'               // Fleet vs Specific Vehicle picker
  | 'daterange'           // Quick & Custom Time period selector
  | 'select'              // Select standard options
  | 'multiselect'         // Multi-select list options
  | 'toggle'              // Standard on/off switches
  | 'number'              // Speed/time threshold inputs
  | 'entity_picker'       // Searchable bottom sheet lists (geofences, drivers, routes)
  ;

export interface FilterDefinition {
  id: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: any }[]; // Used for 'select' or 'multiselect'
  entityType?: 'vehicle' | 'driver' | 'geofence' | 'route' | 'trip_status'; // Used for 'entity_picker'
  unit?: string; // e.g., 'km/h', 'minutes', 'liters'
  icon?: string; // Lucide icon name to display on the filter card
}

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide React Native icon name
  supportedFormats: ReportFormat[];
  filters: FilterDefinition[];
}

export const reportDefinitions: ReportDefinition[] = [
  {
    id: 'fleet_performance',
    title: 'Fleet Performance',
    description: 'Comprehensive performance analysis per vehicle in the selected period, with active days, operating speed, and daily averages.',
    icon: 'TrendingUp',
    supportedFormats: ['CSV', 'PDF'],
    filters: [
      {
        id: 'time_period',
        label: 'Time Period',
        type: 'daterange',
        required: true,
        defaultValue: { preset: '30_days' }
      },
      {
        id: 'scope',
        label: 'Report Scope',
        type: 'scope',
        required: true,
        defaultValue: { type: 'entire_fleet', selectedVehicles: [] }
      },
      {
        id: 'min_operating_days',
        label: 'Minimum Operating Days',
        type: 'number',
        placeholder: 'e.g. 5',
        defaultValue: 1,
        unit: 'days',
        icon: 'Calendar'
      },
      {
        id: 'idle_duration_threshold',
        label: 'Idle Duration Threshold',
        type: 'number',
        placeholder: 'e.g. 15',
        defaultValue: 15,
        unit: 'mins',
        icon: 'Clock'
      }
    ]
  },
  {
    id: 'geofence_report',
    title: 'Geofence Report',
    description: 'Detailed summary of vehicle entries, exits, and dwell times inside mapped geofences, with total dwell duration.',
    icon: 'MapPin',
    supportedFormats: ['CSV', 'PDF'],
    filters: [
      {
        id: 'time_period',
        label: 'Time Period',
        type: 'daterange',
        required: true,
        defaultValue: { preset: 'till_date' }
      },
      {
        id: 'scope',
        label: 'Report Scope',
        type: 'scope',
        required: true,
        defaultValue: { type: 'entire_fleet', selectedVehicles: [] }
      },
      {
        id: 'geofence_picker',
        label: 'Select Geofences',
        type: 'entity_picker',
        entityType: 'geofence',
        placeholder: 'Select specific geofences',
        defaultValue: [],
        required: false,
        icon: 'Layers'
      },
      {
        id: 'min_dwell_time',
        label: 'Minimum Dwell Time',
        type: 'number',
        placeholder: 'e.g. 10',
        defaultValue: 10,
        unit: 'mins',
        icon: 'Timer'
      }
    ]
  },
  {
    id: 'geofence_list',
    title: 'Geofence List',
    description: 'Canonical geofence master list with site type, size band, area, coordinates, and current occupancy count.',
    icon: 'Layers',
    supportedFormats: ['CSV', 'PDF'],
    filters: [
      {
        id: 'site_type',
        label: 'Site Type Filter',
        type: 'select',
        defaultValue: 'all',
        options: [
          { label: 'All Types', value: 'all' },
          { label: 'Depot', value: 'depot' },
          { label: 'Customer Site', value: 'customer' },
          { label: 'Way-point', value: 'waypoint' },
          { label: 'Rest Stop', value: 'rest_stop' }
        ],
        icon: 'Filter'
      },
      {
        id: 'size_band',
        label: 'Size Band Filter',
        type: 'select',
        defaultValue: 'all',
        options: [
          { label: 'All Sizes', value: 'all' },
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' }
        ],
        icon: 'SlidersHorizontal'
      }
    ]
  },
  {
    id: 'all_tracker_list',
    title: 'All Tracker List',
    description: 'Navixy tracker registry joined to vehicle master names — tracker labels, device models, SIM card details, and live states.',
    icon: 'Cpu',
    supportedFormats: ['CSV', 'PDF'],
    filters: [
      {
        id: 'tracker_status',
        label: 'Connection Status',
        type: 'select',
        defaultValue: 'all',
        options: [
          { label: 'All Trackers', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Offline', value: 'offline' }
        ],
        icon: 'WifiOff'
      },
      {
        id: 'show_sim_details',
        label: 'Include SIM details',
        type: 'toggle',
        defaultValue: true,
        icon: 'FileText'
      }
    ]
  },
  {
    id: 'night_drivers',
    title: 'Night Drivers',
    description: 'Vehicles ranked by total overnight operating hours. Identifies drivers operating during high-risk night windows.',
    icon: 'Moon',
    supportedFormats: ['CSV', 'PDF'],
    filters: [
      {
        id: 'time_period',
        label: 'Time Period',
        type: 'daterange',
        required: true,
        defaultValue: { preset: '30_days' }
      },
      {
        id: 'scope',
        label: 'Report Scope',
        type: 'scope',
        required: true,
        defaultValue: { type: 'entire_fleet', selectedVehicles: [] }
      },
      {
        id: 'night_window',
        label: 'High-Risk Night Window',
        type: 'select',
        defaultValue: '10_4',
        options: [
          { label: '10 PM - 4 AM', value: '10_4' },
          { label: '11 PM - 5 AM', value: '11_5' },
          { label: '12 AM - 6 AM', value: '12_6' }
        ],
        icon: 'Moon'
      },
      {
        id: 'min_night_duration',
        label: 'Min Night Duration',
        type: 'number',
        placeholder: 'e.g. 2',
        defaultValue: 2,
        unit: 'hours',
        icon: 'Timer'
      }
    ]
  },
  {
    id: 'speed_violators',
    title: 'Speed Violators',
    description: 'Vehicles exceeding speed limits, ranked by incident count with max speed, average speed, and total duration.',
    icon: 'AlertTriangle',
    supportedFormats: ['CSV', 'PDF'],
    filters: [
      {
        id: 'time_period',
        label: 'Time Period',
        type: 'daterange',
        required: true,
        defaultValue: { preset: '30_days' }
      },
      {
        id: 'scope',
        label: 'Report Scope',
        type: 'scope',
        required: true,
        defaultValue: { type: 'entire_fleet', selectedVehicles: [] }
      },
      {
        id: 'speed_threshold',
        label: 'Speed Threshold Limit',
        type: 'number',
        placeholder: 'e.g. 80',
        defaultValue: 80,
        unit: 'km/h',
        icon: 'AlertTriangle'
      },
      {
        id: 'min_incident_duration',
        label: 'Min Breach Duration',
        type: 'number',
        placeholder: 'e.g. 10',
        defaultValue: 10,
        unit: 'seconds',
        icon: 'Clock'
      }
    ]
  },
  {
    id: 'fuel_expense',
    title: 'Fuel Expense',
    description: 'Daily fuel costs and consumption split by movement and idling. Sourced from telemetry records.',
    icon: 'Database',
    supportedFormats: ['CSV', 'PDF'],
    filters: [
      {
        id: 'time_period',
        label: 'Time Period',
        type: 'daterange',
        required: true,
        defaultValue: { preset: '30_days' }
      },
      {
        id: 'scope',
        label: 'Report Scope',
        type: 'scope',
        required: true,
        defaultValue: { type: 'entire_fleet', selectedVehicles: [] }
      },
      {
        id: 'fuel_price_per_liter',
        label: 'Fuel Price (per Liter)',
        type: 'number',
        placeholder: 'e.g. 3200',
        defaultValue: 3200,
        unit: 'TSH',
        icon: 'Database'
      },
      {
        id: 'include_idle_loss',
        label: 'Include Idling Fuel Loss',
        type: 'toggle',
        defaultValue: true,
        icon: 'Clock'
      }
    ]
  },
  {
    id: 'below_average',
    title: 'Below Average',
    description: 'Identification of vehicles and drivers operating below fleet performance, safety, and fuel efficiency benchmarks.',
    icon: 'BarChart2',
    supportedFormats: ['CSV', 'PDF'],
    filters: [
      {
        id: 'time_period',
        label: 'Time Period',
        type: 'daterange',
        required: true,
        defaultValue: { preset: '30_days' }
      },
      {
        id: 'scope',
        label: 'Report Scope',
        type: 'scope',
        required: true,
        defaultValue: { type: 'entire_fleet', selectedVehicles: [] }
      },
      {
        id: 'benchmark_metric',
        label: 'Benchmark Metric',
        type: 'select',
        defaultValue: 'fuel_efficiency',
        options: [
          { label: 'Fuel Efficiency', value: 'fuel_efficiency' },
          { label: 'Uptime / Operating Days', value: 'uptime' },
          { label: 'Safety Violations Score', value: 'safety' }
        ],
        icon: 'Filter'
      }
    ]
  },
  {
    id: 'above_average',
    title: 'Above Average',
    description: 'Outstanding performers exceeding fleet averages in fuel economy, uptime, and safety compliance benchmarks.',
    icon: 'BarChart2',
    supportedFormats: ['CSV', 'PDF'],
    filters: [
      {
        id: 'time_period',
        label: 'Time Period',
        type: 'daterange',
        required: true,
        defaultValue: { preset: '30_days' }
      },
      {
        id: 'scope',
        label: 'Report Scope',
        type: 'scope',
        required: true,
        defaultValue: { type: 'entire_fleet', selectedVehicles: [] }
      },
      {
        id: 'benchmark_metric',
        label: 'Benchmark Metric',
        type: 'select',
        defaultValue: 'fuel_efficiency',
        options: [
          { label: 'Fuel Efficiency', value: 'fuel_efficiency' },
          { label: 'Uptime / Operating Days', value: 'uptime' },
          { label: 'Safety Violations Score', value: 'safety' }
        ],
        icon: 'Filter'
      }
    ]
  }
];
