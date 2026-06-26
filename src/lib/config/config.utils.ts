import type { BusinessConfig, Category, CategoryId } from '@/types'
import { defaultConfigs } from './business-configs'

export function getCategoryById(config: BusinessConfig, id: string): Category | undefined {
  return config.categories.find((c) => c.id === id)
}

export function getWageCategories(config: BusinessConfig): Category[] {
  return config.categories.filter((c) => c.isWageType)
}

export function buildDefaultConfig(type: BusinessConfig['type']): BusinessConfig {
  return defaultConfigs[type]
}

export function getCategoryColor(config: BusinessConfig, categoryId: string): string {
  return getCategoryById(config, categoryId)?.color ?? '#6b7280'
}

export function toCategoryId(id: string): CategoryId {
  return id as CategoryId
}
