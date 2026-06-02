import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

function getSafeNextPath(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/home_page";

  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/home_page";
  }

  return next;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const next = getSafeNextPath(request);
  const callbackUrl = new URL("/api/auth/callback", request.url);
  callbackUrl.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "google_oauth");
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(data.url);
}
