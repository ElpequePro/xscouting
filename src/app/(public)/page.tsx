// app/(public)/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();

  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  if (user) redirect("/dashboard"); // si ya está logueado, redirige

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-900 to-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">⚽ XScouting</h1>
      <p className="text-lg mb-8 text-gray-300 text-center max-w-md">
        Crea tus tácticas, descubre jóvenes promesas y sigue los partidos en
        vivo. Todo en un solo lugar.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2 rounded-md bg-green-600 hover:bg-green-700 transition"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="px-6 py-2 rounded-md bg-gray-200 text-gray-900 hover:bg-gray-300 transition"
        >
          Registrarse
        </Link>
      </div>
    </main>
  );
}
