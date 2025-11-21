// page.tsx (Corregido)

"use client";

import { useEffect, useRef } from "react";
// ✅ CORRECCIÓN CRÍTICA: Cambiado de 'import type' a 'import * as pc'
import * as pc from "playcanvas";
import { createPcApp } from "@/components/playcanvas/app";

export default function TowerDefensePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<pc.Application | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    // Previene la reinicialización en StrictMode y si el canvas no está listo
    if (!canvas || appRef.current) {
      return;
    }

    // Inicializa la aplicación de PlayCanvas
    // (Asumimos que createPcApp devuelve pc.Application)
    // Inicializa la aplicación de PlayCanvas
    const app = createPcApp(canvas);
    
    // Gestión del redimensionamiento
    const handleResize = () => app.resizeCanvas(); // Esta es la llamada clave
    window.addEventListener("resize", handleResize);
    
    appRef.current = app;

    // Inicia el bucle de renderizado
    app.start();

    // Ejemplo: Añadir una torre al hacer clic
    const handleMouseDown = (event: MouseEvent) => {
      // Solo si se hace clic con el botón izquierdo
      if (event.button === 0) {
        // pc.Vec3 ya está disponible gracias a la importación superior
        app.game.addTower(new pc.Vec3(0, 0, 0)); // Añade una torre en el origen
      }
    };
    canvas.addEventListener("mousedown", handleMouseDown);

    // Función de limpieza para destruir la app cuando el componente se desmonte
    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", handleMouseDown);

      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
      }
    };
  }, []); // El array vacío asegura que esto se ejecute solo una vez

  // page.tsx (Revisión de Estilos)
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        // ✅ CRÍTICO: Asegura que el canvas se estira para llenar el div.
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}