'use client';

import { createBrowserClient } from "@supabase/ssr";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) router.push("/");
        });
    }, []);

    return (
        <>
            <h1>Dashboard</h1>
            <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} className="cursor-pointer bg-blue-500 px-3 py-1">Logout</button>
        </>
    );
}