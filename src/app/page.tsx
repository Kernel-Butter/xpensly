import { redirect } from 'next/navigation'

// Root redirects to app dashboard — middleware handles auth protection
export default function RootPage() {
  redirect('/')
}
