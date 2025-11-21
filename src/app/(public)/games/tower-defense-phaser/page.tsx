"use client";

// Importamos el componente del juego hecho con Phaser
import GameCanvas from "@/components/GameCanvasPhaser";

export default function TowerDefensePhaserPage() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "auto", // Cambiamos a auto para permitir scroll si es necesario
        background: "#0a192f", // Un fondo oscuro que combine con el juego
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start", // Alinea el juego en la parte superior
      }}
    >
      {/* Renderizamos el componente del juego de Phaser */}
      <GameCanvas />
    </div>
  );
}

