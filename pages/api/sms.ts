import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { Body, From } = req.body
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
    source: cleanQuote.toLowerCase().includes(family.kid_name.toLowerCase()) ? 'prompt' : 'freeform'
  })

  await client.messages.create({
    body: `Saved! "${cleanQuote}" is now in ${family.kid_name}’s book.`,
    from: process.env.TWILIO_NUMBER,
    to: From
  })

  res.send('<Response/>')
}
