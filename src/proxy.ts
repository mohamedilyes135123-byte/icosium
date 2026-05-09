import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // RBAC Routing Guard Logic
  const path = request.nextUrl.pathname;

  // QUICK DEBUG BYPASS
  const bypassRole = request.cookies.get('testing_bypass')?.value;
  if (bypassRole && path.startsWith(`/${bypassRole}`)) {
    return supabaseResponse;
  }

  // Protect Portal Routes
  if (
    path.startsWith('/patient') || 
    path.startsWith('/doctor') || 
    path.startsWith('/pharmacy') || 
    path.startsWith('/lab') || 
    path.startsWith('/admin')
  ) {
    if (!user) {
      // Redirect unauthenticated users to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Role-based verification (Assuming role is stored in user_metadata)
    const role = user.user_metadata?.role;
    
    // Exact match constraint strictly prevents mixing
    if (path.startsWith(`/${role}`) === false) {
       // Stop them if a patient tries to access /doctor, etc.
       const url = request.nextUrl.clone()
       url.pathname = '/unauthorized'
       return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

