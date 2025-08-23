import { HeaderClient } from './Component.client'

export async function Header() {
  // Use empty data since we removed the global header configuration
  // The HeaderClient should handle empty/undefined data gracefully
  return <HeaderClient data={undefined} />
}
