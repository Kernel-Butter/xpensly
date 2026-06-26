import {
  Tractor, Droplets, Leaf, FlaskConical, Users,
  Fuel, Wrench, ReceiptText, HardHat, Package,
  ShoppingBag, Utensils, Settings, LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Tractor, Droplets, Leaf, FlaskConical, Users,
  Fuel, Wrench, ReceiptText, HardHat, Package,
  ShoppingBag, Utensils, Settings,
}

type Props = {
  iconName: string
  size?: number
  className?: string
}

export function CategoryIcon({ iconName, size = 20, className }: Props) {
  const Icon = iconMap[iconName] ?? Settings
  return <Icon size={size} className={className} />
}
