"use client";

import { createClient } from "@/lib/supabase/component";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa"

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function LoginPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) router.replace("/dashboard")
        })
    }, [])


    const handleOAuthLogin = async (provider: "google" | "github") => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo:
                    process.env.NODE_ENV === "development"
                        ? "http://localhost:3000/api/auth/callback"
                        : "https://xscouting.vercel.app/api/auth/callback",
            },
        });
        if (error) {
            alert(error.message);
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
            <h1 className="text-3xl font-bold mb-6">Iniciar sesión</h1>
            <div className="flex flex-col gap-4 w-64">
                <button
                    onClick={() => handleOAuthLogin("google")}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-200 transition cursor-pointer"
                >
                    <FaGoogle />
                    Google
                </button>

                <button
                    onClick={() => handleOAuthLogin("github")}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition cursor-pointer"
                >
                    <FaGithub />
                    GitHub
                </button>
            </div>
        </main>
    );
}
