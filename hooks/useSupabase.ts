// hooks/useSupabase.ts
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export const useSupabase = () => {
  const [client, setClient] = useState<any>(null)

  useEffect(() => {
    setClient(createSupabaseClient())
  }, [])

  return client
}
