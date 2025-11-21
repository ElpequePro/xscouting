import fs from 'fs/promises'; // Módulo nativo de Node.js (Server-side only)
import path from 'path';      // Módulo nativo de Node.js (Server-side only)
import { MergeTacticsCalculator } from './calculator'; // Importamos el Client Component

// --- Función de Servidor para Leer Versiones ---

/**
 * Lee la carpeta de datos y extrae las versiones disponibles.
 * Esta función se ejecuta en el servidor.
 */
async function getAvailableVersions(): Promise<string[]> {
  // Construye la ruta absoluta a la carpeta de datos
  const dataDirPath = path.join(process.cwd(), 'src', 'data', 'merge-tactics');
  
  try {
    const files = await fs.readdir(dataDirPath);
    
    const versions = new Set<string>();
    
    files.forEach(file => {
      // Busca archivos 'cards-vX.json' o 'traits-vX.json' y extrae el número de versión (X)
      const match = file.match(/-(v(\d+))\./); 
      if (match) {
        versions.add(match[2]);
      }
    });

    // Convierte el Set a un array y lo ordena (ej: ['1', '2', '3'])
    return Array.from(versions).sort((a, b) => parseInt(a) - parseInt(b));

  } catch (error) {
    // Es común que falle si no se encuentra la carpeta en el entorno de despliegue,
    // por eso devolvemos un array vacío para evitar errores fatales.
    console.error("Error al leer la carpeta de datos:", error);
    return [];
  }
}

// --- Componente de Página (Server Component) ---

export default async function MergeTacticsPage() {
    // 1. Obtener las versiones disponibles en el servidor
    const availableVersions = await getAvailableVersions();
    
    // 2. Renderizar el componente cliente, pasándole las versiones como props
    return (
        <MergeTacticsCalculator availableVersions={availableVersions} />
    );
}

// NOTA: El componente MergeTacticsPage NO tiene la directiva "use client".
// Solo tiene importaciones de Node.js (fs, path) y es asíncrono, por lo que
// se ejecuta completamente en el servidor.