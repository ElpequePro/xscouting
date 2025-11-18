// app/td-game/page.tsx (Ejemplo en Next.js App Router)
'use client';

import dynamic from 'next/dynamic';

// Importación dinámica, deshabilitando la renderización en el servidor (SSR: false)
const DynamicGameCanvas = dynamic(
  () => import('@/components/GameCanvas'),
  { ssr: false }
);

const TDGamePage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">⚽ Simulación Táctica (BTD6 Style)</h1>
      <DynamicGameCanvas />
    </div>
  );
};

export default TDGamePage;
