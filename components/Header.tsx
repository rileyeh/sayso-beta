import { useEffect, useState } from 'react'

import { supabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/router'

export default function Header() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = supabaseBrowser()

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
      if (event === 'SIGNED_OUT') {
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    const supabase = supabaseBrowser()
    await supabase.auth.signOut()
    router.push('/')
  }

  // Don't show header on loading or if not authenticated
  if (loading || !isAuthenticated) {
    return null
  }

  return (
    <header className='w-full border-b border-sayso-brown/20 bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center'>
            <h1 className='text-2xl font-playfair'>
              <span className='font-bold text-sayso-red'>say</span>
              <span className='font-light text-sayso-red'>so</span>
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className='px-4 py-2 text-sm font-medium text-sayso-brown hover:text-sayso-red border border-sayso-brown/30 rounded-lg hover:border-sayso-red/50 transition-colors'
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
