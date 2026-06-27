import type { BusinessConfig, Category } from '@/types'

function cat(overrides: Omit<Category, 'id'> & { id: string }): Category {
  return overrides as Category
}

export const agricultureConfig: BusinessConfig = {
  type: 'agriculture',
  labels: { context: 'Field', period: 'Crop season', quantity: 'Acres' },
  currency: 'PKR',
  units: ['acres', 'bigha', 'kanal', 'marla', 'bags', 'litres', 'kg', 'hours', 'days'],
  categories: [
    cat({ id: 'tractor',    name: 'Tractor',     icon: 'Tractor',       color: '#f59e0b', subItems: ['Disc', 'Z/L', 'Hall', 'K/D'], unitLabel: 'acres',  isWageType: false }),
    cat({ id: 'water',      name: 'Water',        icon: 'Droplets',      color: '#3b82f6', subItems: ['W (pump)', 'WL (labour)'],     unitLabel: 'hours',  isWageType: false }),
    cat({ id: 'fertilizer', name: 'Fertilizer',   icon: 'Leaf',          color: '#22c55e', subItems: ['DAP', 'Urea'],                 unitLabel: 'bags',   isWageType: false }),
    cat({ id: 'pesticide',  name: 'Pesticides',   icon: 'FlaskConical',  color: '#a855f7',                                                                  isWageType: false }),
    cat({ id: 'wages',      name: 'Wages',        icon: 'Users',         color: '#f97316',                                                                  isWageType: true  }),
  ],
}

export const transportConfig: BusinessConfig = {
  type: 'transport',
  labels: { context: 'Vehicle', period: 'Weekly run', quantity: 'Trips' },
  currency: 'PKR',
  units: ['km', 'trips', 'litres', 'hours', 'days'],
  categories: [
    cat({ id: 'fuel',        name: 'Fuel',        icon: 'Fuel',         color: '#f59e0b', unitLabel: 'litres', isWageType: false }),
    cat({ id: 'maintenance', name: 'Maintenance', icon: 'Wrench',       color: '#3b82f6',                     isWageType: false }),
    cat({ id: 'driver',      name: 'Driver wage', icon: 'Users',        color: '#f97316', unitLabel: 'days',   isWageType: true  }),
    cat({ id: 'toll',        name: 'Tolls',       icon: 'ReceiptText',  color: '#a855f7', unitLabel: 'trips',  isWageType: false }),
  ],
}

const emptyConfig = (
  type: BusinessConfig['type'],
  context: string,
  period: string,
  quantity: string,
): BusinessConfig => ({ type, labels: { context, period, quantity }, currency: 'PKR', units: ['units', 'hours', 'days', 'kg'], categories: [] })

export const defaultConfigs: Record<BusinessConfig['type'], BusinessConfig> = {
  agriculture:  agricultureConfig,
  transport:    transportConfig,
  construction: emptyConfig('construction', 'Site',     'Project', 'Sq ft'),
  shop:         emptyConfig('shop',         'Branch',   'Month',   'Units'),
  restaurant:   emptyConfig('restaurant',   'Branch',   'Month',   'Portions'),
  custom:       emptyConfig('custom',       'Location', 'Period',  'Units'),
}
