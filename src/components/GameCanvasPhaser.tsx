// components/GameCanvas.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

// Constantes de diseño y dimensiones
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const MAP_HEIGHT = 500; // 800x500 para el mapa
const UI_HEIGHT = 100; // 800x100 para la UI inferior

// **Propiedades de los diferentes tipos de Balones (Enemigos)**
// Definimos los tipos en orden de menor a mayor HP (1 a 10)
const ENEMY_TYPES_BY_HP = [
    { type: 'WHITE', hp: 1, color: 0xFFFFFF, reward: 1, speedFactor: 1.0 },
    { type: 'RED', hp: 2, color: 0xFF0000, reward: 2, speedFactor: 1.1 },
    { type: 'BLUE', hp: 3, color: 0x0000FF, reward: 3, speedFactor: 1.2 },
    { type: 'YELLOW', hp: 4, color: 0xFFFF00, reward: 4, speedFactor: 1.3 },
    { type: 'GREEN', hp: 5, color: 0x00AA00, reward: 5, speedFactor: 1.4 },
    // Nuevos tipos hasta 10 HP
    { type: 'BLACK', hp: 6, color: 0x000000, reward: 6, speedFactor: 1.5 },
    { type: 'PINK', hp: 7, color: 0xFF69B4, reward: 7, speedFactor: 1.6 },
    { type: 'CYAN', hp: 8, color: 0x00FFFF, reward: 8, speedFactor: 1.7 },
    { type: 'ORANGE', hp: 9, color: 0xFFA500, reward: 9, speedFactor: 1.8 },
    { type: 'PURPLE', hp: 10, color: 0x800080, reward: 10, speedFactor: 1.9 },
];

const ENEMY_PROPERTIES = ENEMY_TYPES_BY_HP.reduce((acc, current) => {
    acc[current.type as keyof typeof acc] = current;
    return acc;
}, {} as Record<string, typeof ENEMY_TYPES_BY_HP[0]>);

type EnemyType = keyof typeof ENEMY_PROPERTIES;

// Helper para encontrar propiedades por HP
const getPropertiesByHP = (hp: number) =>
    ENEMY_TYPES_BY_HP.find(p => p.hp === hp) || ENEMY_TYPES_BY_HP[0];

// **Clase para Balones (Enemigos)**
class Enemy extends Phaser.GameObjects.Graphics {
    private follower: { t: number, vec: Phaser.Math.Vector2 };
    private path: Phaser.Curves.Path;
    private baseSpeed: number = 1 / 30000;
    private currentSpeed: number;

    public health: number;
    private initialType: EnemyType;
    public type: EnemyType; // Tipo actual (color/velocidad)

    public get t() {
        return this.follower.t;
    }

    constructor(scene: Phaser.Scene, x: number, y: number, path: Phaser.Curves.Path, type: EnemyType) {
        super(scene);
        scene.add.existing(this);
        scene.physics.world.enable(this);

        this.initialType = type;

        const props = ENEMY_PROPERTIES[type];

        this.health = props.hp;
        this.type = type; // Inicialmente el tipo es el que se genera
        this.currentSpeed = this.baseSpeed * props.speedFactor; // Velocidad inicial

        this.path = path;
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };

        this.path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);

        this.drawSoccerBall(props.color);
    }

    // Método para redibujar el balón con un color específico
    private drawSoccerBall(baseColor: number) {
        this.clear();
        this.lineStyle(1, 0x000000, 1);

        // Círculo base con el color del tipo de enemigo
        this.fillStyle(baseColor);
        this.fillCircle(0, 0, 15);
        this.strokeCircle(0, 0, 15);

        // Parches negros para simular el balón de fútbol
        this.fillStyle(0x000000);
        this.fillCircle(0, 0, 3);

        // Rayas o parches que indican la forma
        this.lineStyle(1.5, 0x000000, 1);
        this.lineBetween(0, -15, 10, -5);
        this.lineBetween(0, -15, -10, -5);
        this.lineBetween(-15, 0, -5, -10);
        this.lineBetween(-15, 0, -5, 10);
    }

    // LÓGICA DE CAMBIO DE COLOR Y VELOCIDAD
    private updateColor() {
        const currentHP = this.health;

        // Encontramos las propiedades del tipo de enemigo que corresponde al HP actual
        const newProps = getPropertiesByHP(currentHP);

        if (newProps) {
            this.type = newProps.type as EnemyType;
            // La velocidad cambia cuando cambia de color (cuanto más HP, más rápido)
            this.currentSpeed = this.baseSpeed * newProps.speedFactor;
            this.drawSoccerBall(newProps.color);
        }
    }

    update(...args: any[]): void {
        const gameSpeed = (this.scene as BloonsTD6Scene).gameSpeed;

        this.path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);

        this.follower.t += this.currentSpeed * gameSpeed;

        if (this.follower.t >= 1) {
            this.destroy();
            // La vida perdida es igual al HP restante del balón
            (this.scene as BloonsTD6Scene).loseLife(this.health);
        }
    }

    public takeDamage(amount: number, sourceTower: Tower) {
        this.health -= amount;

        if (this.health <= 0) {
            // Recompensa basada en el tipo de balón *inicial*
            (this.scene as BloonsTD6Scene).gainMoney(ENEMY_PROPERTIES[this.initialType].reward);
            this.destroy();
            sourceTower.balloonsPopped += ENEMY_PROPERTIES[this.initialType].hp;
        } else {
            // Si la vida es positiva, cambiamos el color y la velocidad
            this.updateColor();
            sourceTower.balloonsPopped += amount;
        }
    }
}

// **Clase para Torres**
class Tower extends Phaser.GameObjects.Graphics {
    public type: string;
    public damage: number;
    public range: number;
    private fireRate: number = 1000;
    private lastFired: number = 0;
    private turret: Phaser.GameObjects.Graphics;
    public rangeCircle: Phaser.GameObjects.Graphics;
    public readonly size: number = 15;

    public targetMode: 'FIRST' | 'LAST' | 'STRONGEST' = 'FIRST';
    public upgradeLevel: number = 0;
    public baseDamage: number;
    public baseRange: number;

    public balloonsPopped: number = 0;
    public damageDone: number = 0;

    public targetButton: Phaser.GameObjects.Text | null = null;
    public upgradeButton: Phaser.GameObjects.Text | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, type: string) {
        super(scene);
        scene.add.existing(this);

        this.type = type;
        this.setPosition(x, y);

        // --- DAÑO BASE UNIFICADO EN 1 ---
        this.damage = 1;
        this.baseDamage = 1;

        let color: number;
        switch (type) {
            case 'GK':
                this.range = 80;
                this.fireRate = 1800;
                color = 0x00AA00;
                break;
            case 'DF':
                this.range = 130;
                this.fireRate = 1800;
                color = 0x0000AA;
                break;
            case 'MF':
                this.range = 180;
                this.fireRate = 600;
                color = 0xAAAA00;
                break;
            case 'FW':
                this.range = 240;
                this.fireRate = 900;
                color = 0xAA0000;
                break;
            default:
                this.range = 100;
                this.fireRate = 1000;
                color = 0x0000FF;
        }

        this.baseRange = this.range;

        this.rangeCircle = scene.add.graphics({ fillStyle: { color: 0x0000FF, alpha: 0.15 } });
        this.rangeCircle.fillCircle(0, 0, this.range);
        this.rangeCircle.setPosition(x, y);
        this.rangeCircle.setDepth(-1);
        this.rangeCircle.setVisible(false);

        this.lineStyle(2, 0x000000, 1);
        this.fillStyle(color, 1);
        this.fillCircle(0, 0, this.size);
        this.strokeCircle(0, 0, this.size);
        this.setDepth(1);

        this.turret = scene.add.graphics({ x: this.x, y: this.y });
        this.turret.fillStyle(0xFFFFFF, 1);
        this.turret.fillRect(-3, -this.size, 6, 15);
        this.turret.setDepth(2);
    }

    update(time: number, enemies: Phaser.Physics.Arcade.Group | null) {
        const gameSpeed = (this.scene as BloonsTD6Scene).gameSpeed;
        const currentFireRate = this.fireRate / gameSpeed;

        const activeEnemies = enemies?.children.entries.filter(e => e instanceof Enemy && e.active) as Enemy[] | undefined;
        if (!activeEnemies || activeEnemies.length === 0) {
            this.turret.setRotation(0);
            return;
        }

        const enemiesInRange = activeEnemies.filter(enemy =>
            Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) < this.range
        );

        if (enemiesInRange.length === 0) {
            this.turret.setRotation(0);
            return;
        }

        // --- Lógica de Ataque ---
        if (time > this.lastFired + currentFireRate) {
            if (this.type === 'GK') {
                this.turret.setRotation(0);
                new Projectile(this.scene, this.x, this.y, null, this.damage, this, enemiesInRange);
                this.lastFired = time;
                return;
            }

            let target: Enemy | null = null;
            if (this.targetMode === 'FIRST') {
                // El que tiene el mayor 't' está más avanzado en el camino
                target = enemiesInRange.reduce((best, current) => current.t > best.t ? current : best, enemiesInRange[0]);
            } else if (this.targetMode === 'LAST') {
                // El que tiene el menor 't' está más rezagado
                target = enemiesInRange.reduce((best, current) => current.t < best.t ? current : best, enemiesInRange[0]);
            } else if (this.targetMode === 'STRONGEST') {
                // El que tiene la mayor 'health'
                target = enemiesInRange.reduce((best, current) => current.health > best.health ? current : best, enemiesInRange[0]);
            }

            if (target && target.active) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
                this.turret.setRotation(angle + Math.PI / 2);

                const aoeRadius = this.type === 'DF' ? 30 : 0;
                new Projectile(this.scene, this.x, this.y, target, this.damage, this, null, aoeRadius);
                this.lastFired = time;
            } else {
                this.turret.setRotation(0);
            }

        } else if (this.type !== 'GK') {
            // Lógica para seguir al objetivo incluso si no dispara
            let target: Enemy | null = null;
            if (this.targetMode === 'FIRST') {
                target = enemiesInRange.reduce((best, current) => current.t > best.t ? current : best, enemiesInRange[0]);
            } else if (this.targetMode === 'LAST') {
                target = enemiesInRange.reduce((best, current) => current.t < best.t ? current : best, enemiesInRange[0]);
            } else if (this.targetMode === 'STRONGEST') {
                target = enemiesInRange.reduce((best, current) => current.health > best.health ? current : best, enemiesInRange[0]);
            }
            if (target && target.active) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
                this.turret.setRotation(angle + Math.PI / 2);
            }
        }
    }

    destroy(fromScene?: boolean) {
        this.turret?.destroy(fromScene);
        this.rangeCircle?.destroy(fromScene);
        this.targetButton?.destroy(fromScene);
        this.upgradeButton?.destroy(fromScene);
        super.destroy(fromScene);
    }
}

// **Clase para Proyectiles**
class Projectile extends Phaser.GameObjects.Graphics {
    private damage: number;
    private sourceTower: Tower;
    private aoeRadius: number;
    private enemiesToHit: Enemy[] | null;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy | null, damage: number, sourceTower: Tower, enemiesToHit: Enemy[] | null = null, aoeRadius: number = 0) {
        super(scene);
        scene.add.existing(this);

        this.damage = damage;
        this.sourceTower = sourceTower;
        this.aoeRadius = aoeRadius;
        this.enemiesToHit = enemiesToHit;
        this.setPosition(x, y);
        this.setDepth(3);

        // --- Lógica de Ataque Inmediato (GK - Onda expansiva) ---
        if (this.enemiesToHit && this.enemiesToHit.length > 0) {
            this.enemiesToHit.forEach(enemy => {
                if (enemy.active && enemy.health > 0) {
                    enemy.takeDamage(this.damage, this.sourceTower);
                    this.sourceTower.damageDone += this.damage;
                }
            });

            // Simulación visual de la onda
            this.fillStyle(0x33FF33, 0.5);
            this.fillCircle(0, 0, sourceTower.range);
            scene.tweens.add({
                targets: this,
                alpha: 0,
                scale: 1.5,
                duration: 100,
                onComplete: () => this.destroy()
            });
            return;
        }

        // --- Lógica de Proyectil con Movimiento (DF, MF, FW) ---
        if (!target) {
            this.destroy();
            return;
        }

        this.fillStyle(0xFFFF00, 1);
        this.fillCircle(0, 0, 4);

        scene.tweens.add({
            targets: this,
            x: target.x,
            y: target.y,
            duration: Phaser.Math.Distance.Between(x, y, target.x, target.y) * 2 / (scene as BloonsTD6Scene).gameSpeed,
            onComplete: () => {
                const hitX = this.x;
                const hitY = this.y;

                if (this.aoeRadius > 0) {
                    this.applyAoeDamage(scene as BloonsTD6Scene, hitX, hitY);

                    const explosion = scene.add.graphics({ x: hitX, y: hitY }).setDepth(4);
                    explosion.fillStyle(0xFF8800, 0.7);
                    explosion.fillCircle(0, 0, this.aoeRadius);
                    scene.tweens.add({
                        targets: explosion,
                        alpha: 0,
                        scale: 1.2,
                        duration: 150,
                        onComplete: () => explosion.destroy()
                    });

                } else if (target.active && target.health > 0) {
                    target.takeDamage(this.damage, this.sourceTower);
                    this.sourceTower.damageDone += this.damage;
                }
                this.destroy();
            }
        });
    }

    private applyAoeDamage(scene: BloonsTD6Scene, x: number, y: number) {
        const bloonsGroup = scene.bloons;

        if (!bloonsGroup) return;

        bloonsGroup.children.each((gameObject) => {
            if (gameObject instanceof Enemy) {
                const distance = Phaser.Math.Distance.Between(x, y, gameObject.x, gameObject.y);

                if (distance < this.aoeRadius) {
                    if (gameObject.active && gameObject.health > 0) {
                        gameObject.takeDamage(this.damage, this.sourceTower);
                        this.sourceTower.damageDone += this.damage;
                    }
                }
            }
            return null;
        });
    }
}

class BloonsTD6Scene extends Phaser.Scene {
    private path: Phaser.Curves.Path | null = null;
    public bloons: Phaser.Physics.Arcade.Group | null = null;
    private towers: Phaser.GameObjects.Group | null = null;
    private nextBloonTime = 0;

    public gameSpeed: number = 1;
    private money: number = 500;
    private moneyText: Phaser.GameObjects.Text | null = null;
    private lives: number = 20;
    private livesText: Phaser.GameObjects.Text | null = null;

    private selectedTower: Tower | null = null;
    private infoPanel: Phaser.GameObjects.Graphics | null = null;
    private infoTextGroup: Phaser.GameObjects.Group | null = null;
    private speedTextGroup: Phaser.GameObjects.Group | null = null;
    private towerStatsText: Phaser.GameObjects.Group | null = null;

    private readonly TARGET_MODES: ('FIRST' | 'LAST' | 'STRONGEST')[] = ['FIRST', 'LAST', 'STRONGEST'];
    private readonly TARGET_NAMES = {
        'FIRST': 'Primero',
        'LAST': 'Último',
        'STRONGEST': 'Más Vida'
    }

    private readonly COSTS = {
        'GK': 100,
        'DF': 150,
        'MF': 200,
        'FW': 250,
    };
    private readonly TOWER_NAMES = {
        'GK': 'Goalkeeper (GK)',
        'DF': 'Defender (DF)',
        'MF': 'Midfielder (MF)',
        'FW': 'Forward (FW)',
    }

    // Lógica de generación de oleadas
    private enemyTypes: EnemyType[] = ENEMY_TYPES_BY_HP.map(e => e.type as EnemyType);
    private currentEnemyIndex: number = 0;
    private enemySpawnCount: number = 0;
    private enemiesPerType: number = 10; // 10 de cada uno

    constructor() {
        super({ key: 'BloonsTD6Scene' });
    }

    create() {
        // --- CAMPO DE FÚTBOL ---
        this.add.rectangle(0, 0, GAME_WIDTH, MAP_HEIGHT, 0x00AA00).setOrigin(0, 0).setDepth(-10);

        // Marcaje blanco
        const fieldLines = this.add.graphics({ lineStyle: { width: 3, color: 0xFFFFFF } }).setDepth(-9);
        fieldLines.strokeRect(10, 10, GAME_WIDTH - 20, MAP_HEIGHT - 20); // Límites del campo

        fieldLines.lineBetween(GAME_WIDTH / 2, 10, GAME_WIDTH / 2, MAP_HEIGHT - 10); // Línea central 

        fieldLines.strokeCircle(GAME_WIDTH / 2, MAP_HEIGHT / 2, 50); // Círculo central
        fieldLines.fillCircle(GAME_WIDTH / 2, MAP_HEIGHT / 2, 5); // Punto central

        // Áreas 
        fieldLines.lineStyle(3, 0xFFFFFF);
        fieldLines.strokeRect(10, MAP_HEIGHT / 2 - 50, 50, 100); // Área Izquierda
        fieldLines.strokeRect(GAME_WIDTH - 60, MAP_HEIGHT / 2 - 50, 50, 100); // Área Derecha

        // Porterías (Goles)
        fieldLines.lineStyle(10, 0xFFFFFF);
        fieldLines.lineBetween(5, MAP_HEIGHT / 2 - 50, 5, MAP_HEIGHT / 2 + 50); // Portería Izquierda (Inicio)
        fieldLines.lineBetween(GAME_WIDTH - 5, MAP_HEIGHT / 2 - 50, GAME_WIDTH - 5, MAP_HEIGHT / 2 + 50); // Portería Derecha (Fin)
        // -------------------------

        const uiBg = this.add.graphics();
        uiBg.fillStyle(0x333333);
        uiBg.fillRect(0, MAP_HEIGHT, GAME_WIDTH, UI_HEIGHT);
        uiBg.lineStyle(3, 0x666666);
        uiBg.strokeRect(0, MAP_HEIGHT, GAME_WIDTH, UI_HEIGHT);

        this.moneyText = this.add.text(10, 10, '', { fontSize: '20px', color: '#FFFF00', fontStyle: 'bold' }).setDepth(10);
        this.livesText = this.add.text(GAME_WIDTH - 10, 10, '', { fontSize: '20px', color: '#FF0000', fontStyle: 'bold' }).setOrigin(1, 0).setDepth(10);

        this.updateMoneyText();
        this.updateLivesText();

        this.speedTextGroup = this.add.group().setDepth(10);
        this.createSpeedControls();

        // --- PATH (CAMINO) ---
        this.path = this.add.path(5, MAP_HEIGHT / 2); // Inicia en la portería izquierda
        this.path.lineTo(150, MAP_HEIGHT / 2);
        this.path.lineTo(250, 100);
        this.path.lineTo(550, 100);
        this.path.lineTo(650, MAP_HEIGHT / 2);
        this.path.lineTo(GAME_WIDTH - 5, MAP_HEIGHT / 2); // Termina en la portería derecha

        const pathGraphics = this.add.graphics();
        pathGraphics.lineStyle(20, 0xAAFFBB, 1);
        this.path.draw(pathGraphics);
        pathGraphics.setDepth(-5);
        // -------------------------

        this.infoPanel = this.add.graphics().setDepth(10);
        this.infoTextGroup = this.add.group().setDepth(10);
        this.towerStatsText = this.add.group().setDepth(10);
        this.hideTowerInfo();

        this.bloons = this.physics.add.group({ runChildUpdate: true });
        this.towers = this.add.group();

        const selectorStartX = 420;
        const towerSelectorY = MAP_HEIGHT + UI_HEIGHT / 2;
        let xOffset = selectorStartX;
        Object.keys(this.COSTS).forEach((type: string) => {
            let color: number;
            switch (type) {
                case 'GK': color = 0x00AA00; break;
                case 'DF': color = 0x0000AA; break;
                case 'MF': color = 0xAAAA00; break;
                case 'FW': color = 0xAA0000; break;
                default: color = 0x0000FF;
            }
            this.createTowerSelector(type, xOffset, towerSelectorY, color);
            xOffset += 90;
        });

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.y < MAP_HEIGHT) {
                const towerClicked = this.towers?.children.entries.find(t => {
                    if (t instanceof Tower) {
                        const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, t.x, t.y);
                        return distance < t.size;
                    }
                    return false;
                });
                if (!towerClicked) {
                    this.deselectTower();
                }
            }
        });

        this.input.setDefaultCursor('default');
    }

    // --- Métodos de Control de Velocidad (Arrow Functions) ---
    private createSpeedControls = () => {
        this.speedTextGroup?.clear(true, true);
        const speeds = [1, 2, 4];
        let x = 10;
        const y = 40;

        const label = this.add.text(x, y, 'VELOCIDAD:', { fontSize: '14px', color: '#FFFFFF' }).setDepth(10);
        this.speedTextGroup?.add(label);
        x += label.width + 5;

        speeds.forEach((speed) => {
            const speedButton = this.add.text(x, y, `x${speed}`, {
                fontSize: '14px',
                color: this.gameSpeed === speed ? '#000000' : '#FFFFFF',
                backgroundColor: this.gameSpeed === speed ? '#00FF00' : '#666666',
                padding: { x: 5, y: 3 },
                fontStyle: 'bold'
            })
                .setInteractive()
                .setDepth(11);

            speedButton.on('pointerdown', () => this.setGameSpeed(speed));
            speedButton.on('pointerover', () => this.input.setDefaultCursor('pointer'));
            speedButton.on('pointerout', () => this.input.setDefaultCursor('default'));

            this.speedTextGroup?.add(speedButton);
            x += speedButton.width + 10;
        });
    }

    private setGameSpeed = (speed: number) => {
        this.gameSpeed = speed;
        this.createSpeedControls();
    }

    // --- Métodos de UI Superior (Dinero/Vida - Arrow Functions) ---
    private updateMoneyText = () => {
        this.moneyText?.setText(`CASH: $${this.money}`);
    }

    public gainMoney = (amount: number) => {
        this.money += amount;
        this.updateMoneyText();
    }

    private updateLivesText = () => {
        this.livesText?.setText(`LIVES: ${this.lives}`);
    }

    public loseLife = (amount: number) => {
        this.lives -= amount;
        this.updateLivesText();
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    private gameOver = () => {
        this.scene.pause();
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8).setOrigin(0, 0).setDepth(100);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'GAME OVER', { fontSize: '48px', color: 0xFF0000, fontStyle: 'bold' }).setOrigin(0.5).setDepth(101);
    }

    // --- Métodos de Panel de Info de Torre (Arrow Functions) ---

    public selectTower = (tower: Tower) => {
        this.deselectTower();
        this.selectedTower = tower;
        tower.rangeCircle.setVisible(true);

        this.createTowerButtons(tower);
        this.showTowerInfo(tower);

        this.input.setDefaultCursor('default');
    }

    private deselectTower = () => {
        if (this.selectedTower) {
            this.selectedTower.rangeCircle.setVisible(false);
            this.selectedTower.targetButton?.destroy();
            this.selectedTower.upgradeButton?.destroy();
            this.selectedTower.targetButton = null;
            this.selectedTower.upgradeButton = null;

            this.selectedTower = null;
        }
        this.hideTowerInfo();
    }

    private createTowerButtons = (tower: Tower) => {
        const targetX = 220;
        const infoY = MAP_HEIGHT + 15;

        // --- TARGETING BUTTON ---
        const targetButton = this.add.text(targetX, infoY, '', { fontSize: '14px', color: '#000000', backgroundColor: '#00FFFF', padding: { x: 5, y: 3 } })
            .setInteractive()
            .setDepth(11);

        targetButton.on('pointerover', () => this.input.setDefaultCursor('pointer'));
        targetButton.on('pointerout', () => this.input.setDefaultCursor('default'));
        targetButton.on('pointerdown', () => this.changeTarget(tower));

        tower.targetButton = targetButton;
        this.infoTextGroup?.add(targetButton);

        // --- UPGRADE BUTTON ---
        const upgradeY = infoY + 30;
        const upgradeButton = this.add.text(targetX, upgradeY, '', { fontSize: '14px', color: '#000000', backgroundColor: '#666666', padding: { x: 5, y: 3 } })
            .setInteractive()
            .setDepth(11);

        upgradeButton.on('pointerover', () => this.input.setDefaultCursor('pointer'));
        upgradeButton.on('pointerout', () => this.input.setDefaultCursor('default'));
        upgradeButton.on('pointerdown', () => {
            const upgradeCost = 100 + (tower.upgradeLevel * 50);
            if (this.money >= upgradeCost && tower.upgradeLevel < 3) {
                this.upgradeTower(tower, upgradeCost);
            }
        });

        tower.upgradeButton = upgradeButton;
        this.infoTextGroup?.add(upgradeButton);
    }

    private showTowerInfo = (tower: Tower) => {
        this.infoPanel?.clear();
        this.infoPanel?.fillStyle(0x1A1A1A, 0.9);
        this.infoPanel?.fillRect(10, MAP_HEIGHT + 5, 400, UI_HEIGHT - 10);
        this.infoPanel?.lineStyle(1, 0xAAAAAA, 1);
        this.infoPanel?.strokeRect(10, MAP_HEIGHT + 5, 400, UI_HEIGHT - 10);

        this.towerStatsText?.clear(true, true);

        const infoX = 20;
        let infoY = MAP_HEIGHT + 15;
        const fontStyle = { fontSize: '14px', color: '#FFFFFF' };

        // --- STATS DISPLAY ---
        this.towerStatsText?.add(this.add.text(infoX, infoY, `${this.TOWER_NAMES[tower.type as keyof typeof this.TOWER_NAMES]} (Lvl ${tower.upgradeLevel})`, { fontSize: '16px', color: '#FFFF00', fontStyle: 'bold' }));
        infoY += 20;
        this.towerStatsText?.add(this.add.text(infoX, infoY, `Daño: ${tower.damage} (Base: ${tower.baseDamage})`, fontStyle));
        infoY += 16;
        this.towerStatsText?.add(this.add.text(infoX, infoY, `Rango: ${tower.range}px (Base: ${tower.baseRange})`, fontStyle));
        infoY += 16;
        this.towerStatsText?.add(this.add.text(infoX, infoY, `Balones Explotados: ${tower.balloonsPopped}`, fontStyle));
        infoY += 16;
        this.towerStatsText?.add(this.add.text(infoX, infoY, `Daño Total: ${tower.damageDone}`, fontStyle));

        // --- BUTTON TEXT UPDATE ---
        if (tower.targetButton) {
            tower.targetButton.setText(`TARGET: ${this.TARGET_NAMES[tower.targetMode]}`);
        }

        if (tower.upgradeButton) {
            const upgradeCost = 100 + (tower.upgradeLevel * 50);
            const isMaxLevel = tower.upgradeLevel >= 3;
            const canAfford = this.money >= upgradeCost;

            const upgradeText = isMaxLevel
                ? `NIVEL MÁXIMO (Lvl ${tower.upgradeLevel})`
                : `MEJORAR ($${upgradeCost}) - Lvl ${tower.upgradeLevel + 1}`;

            const upgradeColor = isMaxLevel ? '#AAAAAA' : (canAfford ? '#00FF00' : '#FF0000');
            const textColor = isMaxLevel ? '#333333' : '#000000';

            tower.upgradeButton.setText(upgradeText)
                .setBackgroundColor(upgradeColor)
                .setColor(textColor)
                .disableInteractive();

            if (!isMaxLevel && canAfford) {
                tower.upgradeButton.setInteractive();
            }
        }
    }

    private hideTowerInfo = () => {
        this.infoPanel?.clear();
        this.infoTextGroup?.clear(true, true);
        this.towerStatsText?.clear(true, true);
    }

    private changeTarget = (tower: Tower) => {
        const currentIndex = this.TARGET_MODES.indexOf(tower.targetMode);
        const nextIndex = (currentIndex + 1) % this.TARGET_MODES.length;
        tower.targetMode = this.TARGET_MODES[nextIndex];
        this.showTowerInfo(tower);
    }

    private upgradeTower = (tower: Tower, cost: number) => {
        this.money -= cost;
        this.updateMoneyText();
        tower.upgradeLevel++;

        // Aplicar mejoras
        tower.damage = Math.round(tower.baseDamage * (1 + (tower.upgradeLevel * 0.5))); // Aumento del 50% por nivel
        tower.range = Math.round(tower.baseRange * (1 + (tower.upgradeLevel * 0.15)));

        // Actualizar círculo de rango
        tower.rangeCircle.clear();
        tower.rangeCircle.fillStyle(0x0000FF, 0.15);
        tower.rangeCircle.fillCircle(0, 0, tower.range);

        this.showTowerInfo(tower);
    }

    // --- Métodos de Colocación (Arrow Functions) ---

    private checkTowerOverlap = (x: number, y: number) => {
        if (!this.towers) return false;
        const minDistance = 40;
        let isOverlapping = false;
        this.towers.children.each((tower: Phaser.GameObjects.GameObject) => {
            const distance = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
            if (distance < minDistance) {
                isOverlapping = true;
                return true;
            }
            return null;
        });
        return isOverlapping;
    }

    private isOverPath = (x: number, y: number) => {
        if (!this.path) return false;
        const pathPoints = this.path.getPoints(100);
        const pathThickness = 20;

        let minDistanceToPath = Infinity;
        pathPoints.forEach(p => {
            const dist = Phaser.Math.Distance.Between(x, y, p.x, p.y);
            if (dist < minDistanceToPath) {
                minDistanceToPath = dist;
            }
        });

        return minDistanceToPath < pathThickness;
    }

    private createTowerSelector = (type: string, x: number, y: number, color: number) => {
        const cost = this.COSTS[type as keyof typeof this.COSTS] || 0;

        const selector = this.add.graphics();
        selector.lineStyle(2, 0xAAAAAA, 1);
        selector.fillStyle(0x666666);
        selector.fillRect(-35, -45, 70, 90);
        selector.setPosition(x, y);

        selector.fillStyle(color);
        selector.fillCircle(0, -10, 15);

        this.add.text(x, y + 15, type, { fontSize: '14px', color: '#FFFFFF', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(x, y + 30, `$${cost}`, { fontSize: '12px', color: '#FFFF00' }).setOrigin(0.5);

        const dragZone = this.add.zone(x, y, 70, 90).setOrigin(0.5, 0.5);
        dragZone.setInteractive({ draggable: true });
        dragZone.setDataEnabled();

        dragZone.data.set('type', type);
        dragZone.data.set('cost', cost);

        dragZone.on('pointerover', () => this.input.setDefaultCursor('grab'));
        dragZone.on('pointerout', () => this.input.setDefaultCursor('default'));

        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            if (gameObject === dragZone) {
                const tempTower = new Tower(this, gameObject.x, gameObject.y, type);
                tempTower.alpha = 0.8;
                tempTower.rangeCircle.setVisible(true);

                const halo = this.add.graphics().setDepth(10);

                gameObject.data.set('dragVisual', tempTower);
                gameObject.data.set('halo', halo);

                this.input.setDefaultCursor('grabbing');
            }
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
            if (gameObject === dragZone) {
                const dragVisual = gameObject.data.get('dragVisual') as Tower;
                const halo = gameObject.data.get('halo') as Phaser.GameObjects.Graphics;
                const currentCost = gameObject.data.get('cost');

                if (dragVisual && halo) {
                    dragVisual.setPosition(dragX, dragY);
                    dragVisual.rangeCircle.setPosition(dragX, dragY);

                    const canAfford = this.money >= currentCost;

                    const canPlace = dragX < GAME_WIDTH
                        && dragY < MAP_HEIGHT
                        && dragY > 0
                        && !this.checkTowerOverlap(dragX, dragY)
                        && !this.isOverPath(dragX, dragY)
                        && canAfford;

                    const feedbackColor = canPlace ? 0x00FF00 : 0xFF0000;
                    halo.clear();
                    halo.lineStyle(3, feedbackColor, 1);
                    halo.strokeCircle(dragX, dragY, dragVisual.size + 5);

                    dragVisual.rangeCircle.clear();
                    dragVisual.rangeCircle.fillStyle(feedbackColor, 0.15);
                    dragVisual.rangeCircle.fillCircle(0, 0, dragVisual.range);
                }
            }
        });

        this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            if (gameObject === dragZone) {
                const dragVisual = gameObject.data.get('dragVisual') as Tower;
                const halo = gameObject.data.get('halo') as Phaser.GameObjects.Graphics;

                dragVisual?.destroy();
                halo?.destroy();

                this.input.setDefaultCursor('default');

                const type = gameObject.data.get('type');
                const cost = gameObject.data.get('cost');
                const x = pointer.x;
                const y = pointer.y;

                const canPlace = x < GAME_WIDTH
                    && y < MAP_HEIGHT
                    && y > 0
                    && type
                    && !this.checkTowerOverlap(x, y)
                    && !this.isOverPath(x, y)
                    && this.money >= cost;

                if (canPlace) {
                    this.addTower(x, y, type);
                    this.money -= cost;
                    this.updateMoneyText();
                }
            }
        });
    }

    // Phaser Hooks (Se dejan como métodos normales)
    update(time: number, delta: number) {
        // Aumento del tiempo de espera para que no salgan tan continuamente
        const baseSpawnDelay = 1500; // 1.5 segundos entre enemigos
        const waveTransitionDelay = 3000; // 3 segundos entre oleadas (tipos)

        if (time > this.nextBloonTime) {
            if (this.path) {
                const currentType = this.enemyTypes[this.currentEnemyIndex];
                this.addEnemy(this.path, currentType);

                this.enemySpawnCount++;
                if (this.enemySpawnCount >= this.enemiesPerType) {
                    this.enemySpawnCount = 0;
                    this.currentEnemyIndex = (this.currentEnemyIndex + 1) % this.enemyTypes.length;
                    this.nextBloonTime = time + waveTransitionDelay / (this.gameSpeed || 1);
                } else {
                    this.nextBloonTime = time + baseSpawnDelay / (this.gameSpeed || 1);
                }
            }
        }

        this.towers?.children.each((tower: Phaser.GameObjects.GameObject) => {
            if (tower instanceof Tower) {
                tower.update(time, this.bloons);
            }
            return null;
        });

        if (this.selectedTower) {
            this.showTowerInfo(this.selectedTower);
        }
    }

    private addTower = (x: number, y: number, type: string) => {
        const tower = new Tower(this, x, y, type);
        this.towers?.add(tower);

        tower.setInteractive(new Phaser.Geom.Circle(0, 0, tower.size), Phaser.Geom.Circle.Contains);

        tower.on('pointerover', () => this.input.setDefaultCursor('pointer'));
        tower.on('pointerout', () => this.input.setDefaultCursor('default'));

        tower.on('pointerdown', () => {
            this.selectTower(tower);
        });

        return tower;
    }

    private addEnemy = (path: Phaser.Curves.Path, type: EnemyType) => {
        const enemy = new Enemy(this, 0, 0, path, type);
        this.bloons?.add(enemy, true);
    }
}

// 1. Configuración básica del juego
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'phaser-game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: BloonsTD6Scene,
    antialias: true
};

const GameCanvas: React.FC = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameRef.current) {
            gameRef.current = new Phaser.Game(config);
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div
            id="phaser-game"
            className="w-full max-w-4xl mx-auto border-4 border-gray-700 shadow-xl mt-4"
        >
        </div>
    );
};

export default GameCanvas;