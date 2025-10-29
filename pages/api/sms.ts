import type { NextApiRequest, NextApiResponse } from 'next'

import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

const getSupabase = () => {
  const url = process.env.SUPABASE_URL
  // Use service role key for SMS webhook to bypass RLS
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase vars')
  return createClient(url, key)
}

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).send('<Response/>')
  const { Body, From } = req.body
  if (!Body || !From) return res.status(400).send('<Response/>')

  try {
    const supabase = getSupabase()
    const { data: family } = await supabase
      .from('families')
      .select('*')
      .eq('phone', From)
      .single()

    if (!family) return res.status(200).send('<Response/>')

    const cleanQuote = Body.trim()
    await supabase.from('entries').insert({
      family_id: family.id,
      quote: cleanQuote,
      source: cleanQuote.toLowerCase().includes(family.kid_name.toLowerCase())
        ? 'prompt'
        : 'freeform',
    })

    await client.messages.create({
      body: `Saved! "${cleanQuote}" is now in ${family.kid_name}’s book.`,
      from: process.env.TWILIO_NUMBER!,
      to: From,
    })

    res.status(200).send('<Response/>')
  } catch (err) {
    console.error('SMS error:', err)
    res.status(200).send('<Response/>')
  }
}
