import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const supabase = createSupabaseClient()
      const { data: existing } = await supabase
        .from('families')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existing) {
        setMessage('You’re already in! Check your phone.')
        setLoading(false)
        return
      }

      // In real app: send magic link or onboard
      setMessage('Check your email for setup link!')
    } catch (err) {
      setMessage('Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sayso-cream flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-playfair text-center mb-2">
          <span className="font-bold text-sayso-red">say</span>
          <span className="font-light text-sayso-red">so</span>
        </h1>
        <p className="text-center text-sayso-brown mb-6">Save your kid’s little voice — one text at a time.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-sayso-brown/20 rounded-lg"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sayso-red text-white py-3 rounded-lg font-medium"
          >
            {loading ? 'Sending...' : 'Get Started'}
          </button>
        </form>
        
        {message && <p className="mt-4 text-center text-sayso-brown">{message}</p>}
      </div>
    </div>
  )
}
