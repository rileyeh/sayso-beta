import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/router'

export default function Onboard() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [kidName, setKidName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const supabase = createSupabaseClient()

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data } = await supabase.from('families').select('id').eq('email', email).maybeSingle()
    if (data) {
      router.push('/dashboard')
    } else {
      setStep(2)
    }
    setLoading(false)
  }

  const handleDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('families').insert({ email, phone, kid_name: kidName })
    if (error) {
      setMessage('Oops! Try again.')
    } else {
      setStep(3)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-sayso-cream flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-5xl font-playfair mb-6">
          <span className="font-bold text-sayso-red">say</span>
          <span className="font-light text-sayso-red">so</span>
        </h1>

        {step === 1 && (
          <form onSubmit={handleEmail} className="space-y-6">
            <p className="text-lg text-sayso-brown">Let’s save your kid’s voice! ✨</p>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 text-lg bg-sayso-cream/50 rounded-xl"
              required
            />
            <button type="submit" disabled={loading} className="w-full text-lg">
              {loading ? 'Checking...' : 'Next →'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleDetails} className="space-y-6">
            <p className="text-lg text-sayso-brown">Almost there! Tell us about your little one.</p>
            <input
              type="tel"
              placeholder="Phone (e.g., +15551234567)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 text-lg bg-sayso-cream/50 rounded-xl"
              required
            />
            <input
              type="text"
              placeholder="Kid’s name"
              value={kidName}
              onChange={(e) => setKidName(e.target.value)}
              className="w-full p-4 text-lg bg-sayso-cream/50 rounded-xl"
              required
            />
            <button type="submit" disabled={loading} className="w-full text-lg">
              {loading ? 'Saving...' : 'Start Saving Quotes!'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-2xl font-caveat text-sayso-brown animate-fade-in">
              Welcome, {kidName}! 🎉
            </p>
            <p className="text-sayso-brown">Your first prompt arrives Monday. Redirecting...</p>
          </div>
        )}

        {message && <p className="mt-4 text-sayso-red">{message}</p>}
      </div>
    </div>
  )
}
