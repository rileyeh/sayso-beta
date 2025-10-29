import { useEffect, useState } from 'react'

import { supabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Handle auth callback
  useEffect(() => {
    const supabase = supabaseBrowser()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/onboard')
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/onboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSubmit = async () => {
    setLoading(true)
    setErr(null)
    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.signInWithOtp({
        email,
      })
      if (error) throw error
      alert('Check your email for the login link!')
    } catch (e: any) {
      setErr(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-6 bg-sayso-cream'>
      <div className='bg-white rounded-3xl shadow-xl p-8 max-w-md w-full'>
        <h1 className='text-5xl font-playfair text-center mb-2'>
          <span className='font-bold text-sayso-red'>say</span>
          <span className='font-light text-sayso-red'>so</span>
        </h1>
        <p className='text-center text-sayso-brown mb-6'>
          Never forget who they were.
        </p>
        <div className='space-y-4'>
          <input
            placeholder='Your email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading && email) {
                handleSubmit()
              }
            }}
            className='w-full p-3 rounded-lg border'
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !email}
            className='w-full bg-sayso-red text-white py-3 rounded-full font-medium disabled:opacity-50'
          >
            {loading ? 'Sending...' : 'Sign In'}
          </button>
          {err && <p className='text-red-600 text-sm mt-2'>{err}</p>}
        </div>
      </div>
    </div>
  )
}
