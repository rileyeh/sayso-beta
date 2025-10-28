import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { format, isAfter, subDays } from 'date-fns'

export default function Dashboard() {
  const [entries, setEntries] = useState<any[]>([])
  const [family, setFamily] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: familyData } = await supabase.from('families').select('*').limit(1).single()
      setFamily(familyData)

      const { data } = await supabase
        .from('entries')
        .select('*')
        .eq('family_id', familyData?.id)
        .order('date', { ascending: false })

      setEntries(data || [])

      const thirtyDaysAgo = subDays(new Date(), 30)
      const count = data?.filter(e => isAfter(new Date(e.date), thirtyDaysAgo)).length || 0
      document.getElementById('tracker')!.innerText = `You've saved ${count} moments this month ✨`
    }
    fetchData()
  }, [])

  if (!family) return <div className="min-h-screen bg-sayso-cream p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-sayso-cream p-6">
      <h1 className="text-4xl font-playfair text-center mb-6">
        <span className="font-bold text-sayso-red">say</span>
        <span className="font-light text-sayso-red">so</span> {family.kid_name}'s Little Voice
      </h1>
      <p id="tracker" className="text-center text-sayso-brown mb-6"></p>
      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-center text-sayso-brown">No quotes yet! Your first prompt arrives Monday.</p>
        ) : (
          entries.map(e => (
            <div key={e.id} className="bg-white p-6 rounded-xl shadow">
              <p className="text-xl font-caveat text-sayso-brown italic">"{e.quote}"</p>
              <p className="text-sm text-sayso-brown/70">{format(new Date(e.date), 'MMM d, yyyy')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
