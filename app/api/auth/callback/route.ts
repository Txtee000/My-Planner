import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

function getSafeNextPath(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/home_page/day";   

  if (!next.startsWith("/") || next.startsWith("//")) { // ป้องกันการโจมตีแบบ open redirect
    return "/home_page/login";
  }

  return next;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafeNextPath(request);
  const redirectUrl = new URL(next, request.url);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback", request.url));
}

