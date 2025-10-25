// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const supabase = await createClient();
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirige a dashboard o donde quieras
    return NextResponse.redirect(new URL("/dashboard", request.url));
}
