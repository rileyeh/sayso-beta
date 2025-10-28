// pages/dashboard.tsx
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { format, isAfter, subDays } from 'date-fns'

export default function Dashboard() {
  const [entries, setEntries] = useState<any[]>([])
  const [family, setFamily] = useState<any>(null)
  const [supabase, setSupabase] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Create client only in browser
  useEffect(() => {
    setSupabase(createSupabaseClient())
  }, [])

  // Fetch data once client ready
  useEffect(() => {
    if (!supabase) return

    const fetchData = async () => {
      setLoading(true)
      const { data: familyData, error: famErr } = await supabase
        .from('families')
        .select('*')
        .limit(1)
        .single()

      if (famErr || !familyData) {
        console.error('Family fetch error:', famErr)
        setLoading(false)
        return
      }

      setFamily(familyData)

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('family_id', familyData.id)
        .order('date', { ascending: false })

      if (error) console.error('Entries error:', error)

      const entriesData = data || []
      setEntries(entriesData)

      const thirtyDaysAgo = subDays(new Date(), 30)
      const count = entriesData.filter((e: any) =>
        isAfter(new Date(e.date), thirtyDaysAgo)
      ).length

      document.getElementById('tracker')!.innerText = `You’ve saved ${count} moments this month ✨`
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return <div className="min-h-screen bg-sayso-cream p-6">Loading...</div>
  }

  if (!family) {
    return <div className="min-h-screen bg-sayso-cream p-6">No family found.</div>
  }

  return (
    <div className="min-h-screen bg-sayso-cream p-6">
      <h1 className="text-4xl font-playfair text-center mb-6">
        <span className="font-bold text-sayso-red">say</span>
        <span className="font-light text-sayso-red">so</span> {family.kid_name}’s Little Voice
      </h1>
      <p id="tracker" className="text-center text-sayso-brown mb-6"></p>
      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-center text-sayso-brown">No quotes yet! Your first prompt arrives Monday.</p>
        ) : (
          entries.map(e => (
            <div key={e.id} className="bg-white p-6 rounded-xl shadow">
              <p className="text-xl font-caveat text-sayso-brown italic">“{e.quote}”</p>
              <p className="text-sm text-sayso-brown/70">{format(new Date(e.date), 'MMM d, yyyy')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
