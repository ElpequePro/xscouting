// app/(public)/page.tsx
import Link from "next/link";
import { SiNextdotjs, SiReact, SiSupabase, SiTailwindcss, SiTypescript, SiUpstash, SiZod } from 'react-icons/si'

export default async function HomePage() {
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

      {/* CARDS */}
      <section>
        <div>
          <SiNextdotjs />
          <SiReact />
          <SiTypescript />
          <h3>Frontend</h3>
        </div>
        <div>
          <SiTailwindcss />
          <h3>Styling</h3>
        </div>
        <div>
          <SiSupabase />
          <h3>Database</h3>
        </div>
        <div>
          <SiUpstash />
          <h3>Cache</h3>
        </div>
        <div>
          <SiZod />
          <h3>Forms</h3>
        </div>
        <div>

        </div>
      </section>
    </main>
  );
}
