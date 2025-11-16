'use client';

import { createClient } from "@/lib/supabase/component";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Page() {
    const router = useRouter();

    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) router.push("/");
        });
    }, []);

    return (
        <>
            <h1>Dashboard</h1>
            <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} className="cursor-pointer bg-blue-500 px-3 py-1">Logout</button>

            <Link href={'/analysis'}>Analysis</Link>
            <Link href={'/blob'}>Blob</Link>
            <Link href={'/community'}>Community</Link>
            <Link href={'/game'}>Game</Link>
            <Link href={'/players'}>Players</Link>
            <Link href={'/profile'}>Profile</Link>
            <Link href={'/redis'}>Redis</Link>
            <Link href={'/statistics'}>Statistics</Link>
            <Link href={'/supabase'}>Supabase</Link>
            <Link href={'/tactics'}>Tactics</Link>
            <Link href={'/teams'}>Teams</Link>
            <Link href={'/transfer-market'}>Transfer Market</Link>
        </>
    );
}