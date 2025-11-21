import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Define las rutas base donde se encuentran tus archivos JSON
const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'merge-tactics');

/**
 * Función auxiliar para leer y devolver el contenido de un JSON.
 */
async function loadJsonData(version: string, type: 'cards' | 'traits') {
    const filename = `${type}-v${version}.json`;
    const filePath = path.join(DATA_DIR, filename);

    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (e) {
        // En caso de error, devuelve un array/objeto vacío para evitar fallos.
        console.error(`Error loading data for v${version}/${type}:`, e);
        return type === 'cards' ? [] : {};
    }
}

/**
 * Maneja la petición GET para obtener todos los datos de una versión específica.
 * Ruta: /api/games/merge-tactics/data?version=X
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const version = searchParams.get('version');

    if (!version) {
        return NextResponse.json({ error: 'Missing version parameter' }, { status: 400 });
    }

    try {
        const [cards, traits] = await Promise.all([
            loadJsonData(version, 'cards'),
            loadJsonData(version, 'traits'),
        ]);

        return NextResponse.json({ cards, traits }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to load specific version data.' },
            { status: 500 }
        );
    }
}