// pages/index.tsx
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/onboard')  // replace = no back button to old page
  }, [router])

  return null
}
