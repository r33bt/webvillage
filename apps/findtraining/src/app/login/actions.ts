'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function sendMagicLink(formData: FormData) {
  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
    redirect('/login?error=invalid-email')
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('[login] signInWithOtp error:', error.message)
    redirect('/login?error=send-failed')
  }

  redirect('/login?sent=1')
}
