// pages/index.tsx
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/onboard')
  }, [router])

  return (
    <div className="min-h-screen bg-sayso-cream flex items-center justify-center">
      <div className="text-3xl text-sayso-red animate-pulse">✨ Redirecting...</div>
    </div>
  )
}
