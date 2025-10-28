import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [kidName, setKidName] = useState('')
  const [kidAge, setKidAge] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = async () => {
    const { error } = await supabase
      .from('families')
      .insert({ email, kid_name: kidName, kid_age: parseInt(kidAge), phone })
    if (!error) {
      alert('Check your email for login link!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-sayso-cream">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-5xl font-playfair text-center mb-2">
          <span className="font-bold text-sayso-red">say</span>
          <span className="font-light text-sayso-red">so</span>
        </h1>
        <p className="text-center text-sayso-brown mb-6">Never forget who they were.</p>
        <div className="space-y-4">
          <input placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-lg border" />
          <input placeholder="Kid’s name" value={kidName} onChange={e => setKidName(e.target.value)} className="w-full p-3 rounded-lg border" />
          <input placeholder="Kid’s age" type="number" min="1" max="12" value={kidAge} onChange={e => setKidAge(e.target.value)} className="w-full p-3 rounded-lg border" />
          <input placeholder="Your phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 rounded-lg border" />
          <button onClick={handleSubmit} className="w-full bg-sayso-red text-white py-3 rounded-full font-medium">
            Start Saving
          </button>
        </div>
      </div>
    </div>
  )
}
