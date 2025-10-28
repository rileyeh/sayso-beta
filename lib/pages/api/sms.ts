// lib/pages/api/sms.ts  (or pages/api/sms.ts – full file)

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

// Create Supabase client **inside handler** (runtime only – never at build)
const getSupabase = () => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase env vars in API route')
  }

  return createClient(url, key)
}

// Twilio client – safe at runtime
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('<Response/>')
  }

  const { Body, From } = req.body

  if (!Body || !From) {
    return res.status(400).send('<Response/>')
  }

  try {
    const supabase = getSupabase()

    // Find family by phone
    const { data: family, error: famErr } = await supabase
      .from('families')
      .select('*')
      .eq('phone', From)
      .single()

    if (famErr || !family) {
      console.warn('No family found for:', From)
      return res.status(200).send('<Response/>')
    }

    const cleanQuote = Body.trim()

    // Insert entry
    const { error: insertErr } = await supabase.from('entries').insert({
      family_id: family.id,
      quote: cleanQuote,
      source: cleanQuote.toLowerCase().includes(family.kid_name.toLowerCase()) ? 'prompt' : 'freeform'
    })

    if (insertErr) {
      console.error('Insert error:', insertErr)
      // Still reply so SMS doesn’t hang
    }

    // Auto-reply via Twilio
    await client.messages.create({
      body: `Saved! "${cleanQuote}" is now in ${family.kid_name}’s book.`,
      from: process.env.TWILIO_NUMBER!,
      to: From
    })

    res.status(200).send('<Response/>')
  } catch (err) {
    console.error('SMS handler error:', err)
    res.status(200).send('<Response/>') // Always 200 for Twilio webhook
  }
}
