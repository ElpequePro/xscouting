'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Loader2, Zap, Trophy, Shield, XCircle, Search } from 'lucide-react';
import Image from 'next/image';

// ----------------------------------------------------------------------
// 1. Definición de Tipos de Datos
// ----------------------------------------------------------------------

interface Card {
    name: string;
    image: string;
    trait1: string;
    trait2: string;
    elixir: number;
    priority: number;
}

interface Trait {
    name: string;
    description: string;
    image: string;
    levels: Array<{ units: number; effect: string }>;
}

interface Combo {
    name: string;
    count: number;
    is_max: boolean;
}

interface CalculationResult {
    completion_names: string[];
    completion_elixir: number;
    final_combos: Combo[];
    success: boolean;
    error?: string;
}

interface InputState {
    numTroops: number;
    currentTeam: string[];
    desiredTraits: string[];
    version: string;
}

// ----------------------------------------------------------------------
// 2. Funciones de Carga y Conversión
// ----------------------------------------------------------------------

/**
 * Convierte el nombre legible (e.g., "P.E.K.K.A", "Spear Goblin")
 * al formato de nombre de archivo (e.g., "pekka", "spear-goblin").
 */
const cardNameToFileName = (displayName: string): string => {
    if (!displayName) return '';
    return displayName
        .toLowerCase()
        .replace(/\./g, '')
        .replace(/\s+/g, '-');
};

/** Llama a la API para obtener Cartas y Traits para una versión. */
const fetchVersionData = async (version: string): Promise<{ cards: Card[], traits: Record<string, Trait> }> => {
    const response = await fetch(`/api/games/merge-tactics/data?version=${version}`);
    if (!response.ok) {
        throw new Error('Failed to fetch data for version ' + version);
    }
    const data = await response.json();
    return { cards: data.cards || [], traits: data.traits || {} };
};

/** Llama al endpoint de Python para calcular la sinergia. */
const calculateSynergy = async (data: InputState): Promise<CalculationResult> => {
    // CAMBIO AQUÍ: La ruta ahora es directa a la API de Python en Vercel
    const response = await fetch('/api/merge-tactics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            numTroops: data.numTroops,
            current_team_names: data.currentTeam,
            desired_traits: data.desiredTraits,
            version: data.version,
        }),
    });

    const responseText = await response.text();
    try {
        const result: CalculationResult = JSON.parse(responseText);

        if (!response.ok || !result.success) {
            const errorMessage = result.error || 'Ocurrió un error desconocido en el servidor.';
            throw new Error(errorMessage);
        }
        return result;
    } catch (e) {
        // Captura el error <!DOCTYPE...
        throw new Error(`El servidor devolvió un error inesperado o un JSON no válido. Respuesta: "${responseText.substring(0, 100)}..."`);
    }
};


// ----------------------------------------------------------------------
// 3. Componentes de UI (Visuales - ¡Actualizados!)
// ----------------------------------------------------------------------

function TraitIcon({ name, isSelected = false, onClick }:
    { name?: string | null, isSelected?: boolean, onClick?: () => void }) { // 1. Permitir null en tipos

    // 2. "Guard clause": Si no hay nombre, no renderizar nada
    if (!name) return null;

    const traitFileName = cardNameToFileName(name);

    // ⭐ CORRECCIÓN: Volvemos a usar la extensión .webp por defecto para los traits, 
    // ya que el formato .webp parece estar dando problemas de carga.
    const imagePath = `/images/games/merge-tactics/traits/${traitFileName}.webp`;

    const borderClasses = isSelected ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-gray-500';

    return (
        <div
            onClick={onClick}
            title={name}
            className={`relative w-7 h-7 rounded-full border-2 ${borderClasses} overflow-hidden bg-gray-700 
                        shadow-md transition-all cursor-pointer ${onClick ? 'hover:scale-105' : ''}`}
        >
            <Image
                src={imagePath}
                alt={`${name} trait icon`}
                layout="fill"
                objectFit="cover"
            />
        </div>
    );
}

function CardBlock({ card, isSelected, onClick, currentTeamCount, numTroops, availableTraits }:
    { card: Card, isSelected: boolean, onClick: () => void, currentTeamCount: number, numTroops: number, availableTraits: Record<string, Trait> }) {

    const cardFileName = cardNameToFileName(card.name);
    const cardImagePath = `/images/games/merge-tactics/troops/${cardFileName}.webp`;

    const ElixirBadge = (
        // La gota de elixir usa .webp
        <div className="absolute top-[-10px] left-[-10px] z-20 w-10 h-10 flex items-center justify-center">
            {/* Imagen de fondo de la gota de elixir */}
            <Image
                src="/images/games/merge-tactics/elixir.webp"
                alt="Elixir Cost"
                width={40}
                height={40}
                className="absolute"
            />
            {/* Número de elixir superpuesto */}
            <div className="relative text-sm font-extrabold text-white z-30 pt-1">
                {card.elixir}
            </div>
        </div>
    );

    const isDisabled = !isSelected && currentTeamCount >= numTroops;

    // Ratio 4:5 (W:H).
    const baseClasses = "relative w-[110px] h-[138px] rounded-xl shadow-xl transition-all duration-200 z-10 overflow-hidden";
    const statusClasses = isDisabled
        ? 'opacity-40 cursor-not-allowed border-red-500'
        : isSelected
            ? 'border-4 border-green-400 scale-[1.03] cursor-pointer bg-green-900/40 shadow-green-500/50'
            : 'border-2 border-gray-600 hover:border-indigo-400 hover:shadow-lg cursor-pointer bg-gray-700/80';

    const CardImageArea = (
        <div className="h-full w-full absolute inset-0 scale-150">
            <Image
                src={cardImagePath}
                alt={card.name}
                layout="fill"
                objectFit="cover"
            />
            {/* Degradado oscuro en la parte inferior para contrastar el texto */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>
    );

    const trait1Data = card.trait1 ? availableTraits[card.trait1] : null;
    const trait2Data = card.trait2 ? availableTraits[card.trait2] : null;

    const CardContent = (
        <div className="absolute inset-0 p-1.5 flex flex-col justify-end z-10">
            {/* Traits */}
            <div className="flex justify-center space-x-1 w-full mb-1">
                {trait1Data && <TraitIcon name={trait1Data.name} />}
                {trait2Data && <TraitIcon name={trait2Data.name} />}
            </div>
            {/* Nombre */}
            <p className="text-xs font-bold text-white truncate w-full text-center mb-1">{card.name}</p>
        </div>
    );

    return (
        <div
            onClick={isDisabled ? undefined : onClick}
            className={`${baseClasses} ${statusClasses}`}
        >
            {ElixirBadge}
            {CardImageArea}
            {CardContent}

            {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-red-400 font-bold text-sm z-30">
                    Equipo Lleno
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// 4. Componente Cliente Principal
// ----------------------------------------------------------------------

export function MergeTacticsCalculator({ availableVersions }: { availableVersions: string[] }) {
    const defaultVersion = availableVersions.length > 0 ? availableVersions[availableVersions.length - 1] : '3';

    const [inputs, setInputs] = useState<InputState>({
        numTroops: 6,
        currentTeam: [],
        desiredTraits: [],
        version: defaultVersion,
    });
    const [availableCards, setAvailableCards] = useState<Card[]>([]);
    const [availableTraits, setAvailableTraits] = useState<Record<string, Trait>>({});
    const [results, setResults] = useState<CalculationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Efecto para Cargar Datos de Versión ---
    useEffect(() => {
        if (inputs.version) {
            setAvailableCards([]);
            setAvailableTraits({});
            setError(null);
            setIsLoading(true);

            fetchVersionData(inputs.version)
                .then(data => {
                    setAvailableCards(data.cards);
                    setAvailableTraits(data.traits);
                    setInputs(prev => ({
                        ...prev,
                        currentTeam: prev.currentTeam.filter(name => data.cards.some(c => c.name === name)),
                        desiredTraits: prev.desiredTraits.filter(name => name in data.traits)
                    }));
                })
                .catch(err => {
                    setError(`Error al cargar datos v${inputs.version}: ${err.message}`);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [inputs.version]);


    // --- Handlers de Estado ---

    const handleVersionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setInputs(prev => ({ ...prev, version: e.target.value }));
    }, []);

    const handleSetTroops = useCallback((size: number) => {
        setInputs(prev => ({ ...prev, numTroops: size }));
    }, []);

    const handleToggleCard = useCallback((cardName: string) => {
        setInputs(prev => {
            const isSelected = prev.currentTeam.includes(cardName);
            if (isSelected) {
                return { ...prev, currentTeam: prev.currentTeam.filter(name => name !== cardName) };
            } else if (prev.currentTeam.length < prev.numTroops) {
                return { ...prev, currentTeam: [...prev.currentTeam, cardName] };
            }
            return prev;
        });
    }, [inputs.numTroops]);

    const handleToggleTrait = useCallback((traitName: string) => {
        setInputs(prev => {
            const isSelected = prev.desiredTraits.includes(traitName);
            if (isSelected) {
                return { ...prev, desiredTraits: prev.desiredTraits.filter(name => name !== traitName) };
            } else {
                return { ...prev, desiredTraits: [...prev.desiredTraits, traitName] };
            }
        });
    }, []);


    // --- Lógica de Cálculo ---

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults(null);
        setIsLoading(true);

        if (inputs.numTroops <= 0 || inputs.numTroops > 10) {
            setError('El tamaño del equipo debe ser entre 1 y 10.');
            setIsLoading(false);
            return;
        }

        try {
            const result = await calculateSynergy(inputs);
            setResults(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error de comunicación con el cálculo de Python.');
        } finally {
            setIsLoading(false);
        }
    }, [inputs]);

    const currentTeamCount = inputs.currentTeam.length;

    // --- Helpers de Renderizado (Mantenidos) ---
    const renderCombos = (combos: Combo[]) => (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b border-gray-600 pb-1">✨ Combos Obtenidos:</h3>
            {combos.length === 0 ? (
                <p className="text-gray-500">No se encontraron combos activos.</p>
            ) : (
                <ul className="list-none p-0 space-y-1">
                    {combos.sort((a, b) => b.count - a.count).map(combo => (
                        <li key={combo.name} className="flex items-center text-sm">
                            <span className={`font-bold mr-2 ${combo.is_max ? 'text-yellow-500' : 'text-blue-400'}`}>
                                {combo.is_max ? <Trophy className="w-4 h-4 inline mr-1" /> : <Shield className="w-4 h-4 inline mr-1" />}
                                x{combo.count}
                            </span>
                            <span className={combo.is_max ? 'text-yellow-400 font-medium' : 'text-gray-200'}>
                                {combo.name}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    const renderResults = (data: CalculationResult) => {
        const totalChars = currentTeamCount + data.completion_names.length;

        return (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-green-600/50">
                <h2 className="text-2xl font-bold text-green-400 mb-4">🏆 Mejor Compleción Encontrada</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-gray-600 pb-1">👤 Personajes a Añadir:</h3>
                        {data.completion_names.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {data.completion_names.map(name => (
                                    <span key={name} className="bg-green-700/50 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                                        {name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No se requiere añadir personajes.</p>
                        )}

                        <h3 className="text-lg font-semibold border-b border-gray-600 pb-1 pt-4">📊 Estadísticas:</h3>
                        <p className="flex items-center">
                            <Zap className="w-5 h-5 text-purple-400 mr-2" />
                            Coste de Elixir de Compleción: <span className="font-bold ml-2 text-purple-300">{data.completion_elixir} 💧</span>
                        </p>
                        <p className="flex items-center">
                            <Trophy className="w-5 h-5 text-green-400 mr-2" />
                            Tamaño Total del Equipo: <span className="font-bold ml-2 text-green-300">{totalChars} / {inputs.numTroops}</span>
                        </p>
                    </div>
                    <div>
                        {renderCombos(data.final_combos)}
                    </div>
                </div>
            </div>
        );
    };

    // --- Estructura JSX Principal ---

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-extrabold text-center text-cyan-400 mb-6 border-b border-gray-700 pb-2">
                    Merge Tactics - Calculadora de Sinergia
                </h1>

                {/* --- Formulario y Controles --- */}
                <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 mb-8">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

                        {/* 1. Selector de Versión */}
                        <div>
                            <label htmlFor="version" className="block text-sm font-medium text-gray-300 mb-1">
                                Versión de Datos
                            </label>
                            <select
                                id="version"
                                name="version"
                                value={inputs.version}
                                onChange={handleVersionChange}
                                className="block w-full rounded-md border-gray-600 bg-gray-700 text-white p-2"
                                disabled={availableVersions.length === 0 || isLoading}
                            >
                                {availableVersions.length === 0 ? (
                                    <option value="">No hay versiones disponibles</option>
                                ) : (
                                    availableVersions.map(v => (
                                        <option key={v} value={v}>Versión {v}</option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* 2. Botones de Tamaño de Equipo */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Tamaño del Equipo ({inputs.numTroops})
                            </label>
                            <div className="flex gap-2">
                                {[5, 6, 7].map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => handleSetTroops(size)}
                                        disabled={isLoading}
                                        className={`flex-1 py-2 rounded-md text-sm font-medium transition duration-150
                                ${inputs.numTroops === size
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            } disabled:opacity-50`}
                                    >
                                        {size} Personajes
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- Selección Visual de Traits Deseados --- */}
                    <div className='border-t border-gray-700 pt-4'>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Traits Deseados (Opcional)</h3>
                        <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-gray-700/30 rounded-lg">
                            {Object.keys(availableTraits).map(traitName => (
                                <TraitIcon
                                    key={traitName}
                                    name={traitName}
                                    isSelected={inputs.desiredTraits.includes(traitName)}
                                    onClick={() => handleToggleTrait(traitName)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* --- Selección Visual de Personajes Actuales (Card Pool) --- */}
                    <div className='border-t border-gray-700 pt-4'>
                        <h2 className="text-xl font-bold text-gray-100 mb-2 border-b border-gray-600 pb-1">
                            Pool de Cartas
                        </h2>
                        <p className="text-sm text-gray-400 mb-3">Selecciona tu equipo actual ({currentTeamCount} / {inputs.numTroops})</p>

                        <div className="grid grid-cols-auto-fill-minmax-100 gap-3 max-h-[500px] overflow-y-auto p-3 bg-gray-700/30 rounded-lg">
                            {availableCards.map(card => (
                                <CardBlock
                                    key={card.name}
                                    card={card}
                                    isSelected={inputs.currentTeam.includes(card.name)}
                                    onClick={() => handleToggleCard(card.name)}
                                    currentTeamCount={currentTeamCount}
                                    numTroops={inputs.numTroops}
                                    availableTraits={availableTraits}
                                />
                            ))}
                            {availableCards.length === 0 && !isLoading && (
                                <p className="text-gray-500 col-span-full text-center p-4">Cargando datos o no hay cartas disponibles para la versión {inputs.version}.</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || inputs.numTroops <= currentTeamCount || inputs.numTroops === 0 || availableCards.length === 0}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed transition duration-150"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Search className="mr-2 h-5 w-5" />
                        )}
                        {isLoading ? 'Calculando Sinergia (Esto puede tardar)...' : 'Buscar Mejor Compleción'}
                    </button>
                </form>

                {/* Sección de Mensajes */}
                {error && (
                    <div className="bg-red-900/50 p-4 rounded-lg text-red-300 flex items-start mb-4">
                        <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="font-medium">Error: {error}</p>
                    </div>
                )}

                {/* Sección de Resultados */}
                {results && results.success && renderResults(results)}
            </div>
        </div>
    );
}