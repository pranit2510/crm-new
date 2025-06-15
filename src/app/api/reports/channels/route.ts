import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function GET (req: NextRequest) {
  const month   = req.nextUrl.searchParams.get('month') ?? ''
  const supabase= createServerComponentClient({ cookies })
  const { data, error } = await supabase
    .from('channels_report')
    .select('*')
    .eq('month', month)
    .order('channel')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
