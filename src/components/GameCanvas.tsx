// src/components/GameCanvas.tsx

"use client";

import { useRef, useEffect } from "react";
// Importamos la función de inicialización de PlayCanvas
import { createPcApp } from "./playcanvas/app"; 
import * as pc from "playcanvas";

// Definimos las dimensiones del canvas
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let app: pc.Application | null = null;
    
    // 1. Definir resizeCanvas DENTRO del useEffect, pero FUERA del try/catch
    const resizeCanvas = () => {
        // Solo redimensionamos si la aplicación de PlayCanvas existe
        if (app) {
             app.resizeCanvas(canvas.parentElement?.clientWidth || CANVAS_WIDTH, 
                              canvas.parentElement?.clientHeight || CANVAS_HEIGHT);
        }
    };
    
    try {
        // 2. Inicializar la aplicación PlayCanvas
        app = createPcApp(canvas); 
        app.start();

        // 3. Establecer listener de redimensionamiento
        resizeCanvas(); // Llamada inicial (ahora app ya está asignado)
        window.addEventListener("resize", resizeCanvas);

    } catch (error) {
        console.error("Error al inicializar la aplicación PlayCanvas:", error);
    }
    
    // 4. Función de limpieza (resizeCanvas ahora está correctamente en ámbito)
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (app) {
        app.destroy(); // Destruye la instancia de PlayCanvas Application
      }
    };
  }, []); 

  return (
    <canvas 
        ref={canvasRef} 
        id="playcanvas-canvas" 
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
    />
  );
}