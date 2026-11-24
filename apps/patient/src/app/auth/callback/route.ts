import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure new Google users have role: 'patient'
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.role !== 'patient') {
        await supabase.auth.updateUser({
          data: {
            role: 'patient',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'مريض',
          }
        });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth-failed`);
}
