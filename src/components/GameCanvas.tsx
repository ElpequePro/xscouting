// components/GameCanvas.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

// **Clase crucial para el movimiento en BTD6**
class Enemy extends Phaser.GameObjects.Image {
    private follower: { t: number, vec: Phaser.Math.Vector2 };
    private path: Phaser.Curves.Path;
    private speed: number = 1 / 20000; // Velocidad de movimiento a lo largo de la curva
    public health: number = 3; // Vida (resistencia al ataque)

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, path: Phaser.Curves.Path) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.world.enable(this);

        this.path = path;
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
    }

    update(...args: any[]): void {
        // Mueve el enemigo a lo largo de la ruta
        this.path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);

        // Aumenta el parámetro 't' (de 0 a 1) para avanzar en la ruta
        this.follower.t += this.speed;

        // Comprueba si el enemigo ha llegado al final (gol)
        if (this.follower.t >= 1) {
            this.setActive(false);
            this.setVisible(false);
            // Aquí se resta vida al usuario o se termina la "ola de ataque"
            this.destroy();
        }
    }

    // Método para manejar el daño
    public takeDamage(amount: number) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy(); // El enemigo es derrotado (la oleada se rompe)
        }
    }
}

class TDTacticsScene extends Phaser.Scene {
    private path: Phaser.Curves.Path | null = null;
    private enemies: Phaser.Physics.Arcade.Group | null = null;
    private towers: Phaser.GameObjects.Group | null = null;
    private nextEnemyTime = 0;

    constructor() {
        super({ key: 'TDTacticsScene' });
    }

    preload() {
        // Carga de activos de ejemplo
        this.load.image('ball', '/assets/football.png');      // Proyectil
        this.load.image('opponent', '/assets/opponent_icon.png'); // Enemigo (Bloon)
        this.load.image('defender_tower', '/assets/defender_icon.png'); // Torre (Táctica o Jugador clave)
        // Nota: Tendrías que almacenar estas imágenes en el directorio `public/assets` de Next.js.
    }

    create() {
        // 1. **Definir la Ruta (El Campo)**
        this.path = this.add.path(50, 300); // Punto de inicio
        this.path.lineTo(750, 300); // Línea recta a lo largo del campo
        // Puedes dibujar la ruta para depuración:
        const graphics = this.add.graphics();
        graphics.lineStyle(3, 0xffffff, 1);
        this.path.draw(graphics);

        // 2. **Crear Grupos de Juego**
        this.enemies = this.physics.add.group({
            runChildUpdate: true // Esto permite que la lógica individual del enemigo se ejecute
        });
        this.towers = this.add.group();

        // 3. **Posicionar Torres (Tácticas del Usuario)**
        // Estas posiciones se basarían en el diseño de tácticas del usuario
        this.addTower(200, 200, 'defender_tower', 'CB1'); // Central 1
        this.addTower(200, 400, 'defender_tower', 'CB2'); // Central 2

        // 4. **Añadir lógica de Colisión: Proyectiles vs. Enemigos**
        // Necesitarás un grupo para los proyectiles (ej. `this.projectiles = this.physics.add.group()`)
        // this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, undefined, this);
    }

    update(time: number, delta: number) {
        // 5. **Generación de Enemigos (Olas de Ataque)**
        if (time > this.nextEnemyTime) {
            if (this.path) {
                this.addEnemy(this.path);
                this.nextEnemyTime = time + 1000; // Generar un enemigo cada 1 segundo
            }
        }
    }

    // --- Métodos de Ayuda ---

    // Añade una torre a una posición específica
    private addTower(x: number, y: number, key: string, name: string) {
        const tower = this.towers?.create(x, y, key);
        tower.setInteractive();
        // Lógica de ataque de la torre (ej. apuntar al enemigo más cercano)
        // Aquí podrías basar la velocidad de disparo en la estadística de "Intercepción" o "Plase" del jugador.
        return tower;
    }

    // Añade un enemigo que sigue la ruta
    private addEnemy(path: Phaser.Curves.Path) {
        // La clase `Enemy` es crucial para la lógica de BTD6 (movimiento a lo largo de la ruta)
        const enemy = new Enemy(this, 0, 0, 'opponent', path);
        this.enemies?.add(enemy, true);
        // La velocidad de movimiento se basaría en la estadística de 'Velocidad' del equipo oponente.
    }

    // Función de colisión (manejo de daño)
    private hitEnemy(projectile: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
        // Lógica de daño
        // projectile.destroy();
        // (enemy as Enemy).takeDamage(1);
    }
}

// 1. Configuración básica del juego
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Usará WebGL si es posible, si no Canvas
    width: 800,
    height: 600,
    parent: 'phaser-game', // ID del contenedor donde se insertará el canvas
    physics: {
        default: 'arcade', // Un sistema de física simple, ideal para TD
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: TDTacticsScene
};

const GameCanvas: React.FC = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameRef.current) {
            gameRef.current = new Phaser.Game(config);
        }

        // 3. Limpieza: Destruir el juego de Phaser cuando el componente se desmonte
        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    // 4. El div con el ID de contenedor
    return (
        <div
            id="phaser-game"
            className="w-full max-w-4xl mx-auto border-4 border-green-700 shadow-xl mt-4"
        >
            {/* El canvas de Phaser se insertará aquí */}
        </div>
    );
};

export default GameCanvas;
