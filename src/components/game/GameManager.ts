// src/game/GameManager.ts (Actualizado)
import * as pc from "playcanvas";
import { Path } from "./Path";
import { Enemy } from "../entities/Enemy";
import { Tower } from "../entities/Tower";
import { Projectile } from "../entities/Projectile"; // Importación necesaria

export class GameManager {
  app: pc.Application;
  path: Path;

  enemies: Enemy[] = [];
  towers: Tower[] = [];
  projectiles: Projectile[] = []; // ✅ Lista de proyectiles

  money = 150;
  lives = 20;
  wave = 1;

  spawnTimer = 0;
  spawnInterval = 1.2;

  constructor(app: pc.Application) {
    this.app = app;

    // Define un camino 2D en el plano XY (Z se mantiene en 0)
    this.path = new Path([
      new pc.Vec3(-10, 10, 0),
      new pc.Vec3(-10, 5, 0),
      new pc.Vec3(0, 5, 0),
      new pc.Vec3(0, 10, 0),
      new pc.Vec3(10, 10, 0),
      new pc.Vec3(10, 0, 0),
      new pc.Vec3(0, 0, 0),
    ]);

    // ✅ NEW: Llama a la función de visualización del camino
    this.visualizePath();

    app.on("update", (dt) => this.update(dt));
  }

  // ✅ Nueva función para dibujar el camino en 3D
  visualizePath() {
    // Material para el camino (ej. color gris claro)
    const pathMat = new pc.StandardMaterial();
    pathMat.diffuse = new pc.Color(0.4, 0.6, 1.0); // Un color azul para que sea más visible
    pathMat.update();

    for (let i = 0; i < this.path.points.length - 1; i++) {
      const p1 = this.path.points[i];
      const p2 = this.path.points[i + 1];

      const segment = new pc.Entity(`PathSegment${i}`);

      // Calcular punto medio y distancia
      const midPoint = p1.clone().add(p2).divScalar(2);
      const distance = p1.distance(p2);

      segment.addComponent("render", {
        type: "box",
        material: pathMat
      });

      // Escalar y posicionar
      segment.setLocalScale(distance, 0.2, 0.2); // Ancho basado en la distancia, alto y profundidad fijos
      segment.setLocalPosition(midPoint);

      // Orientar la caja para que mire hacia el siguiente punto
      segment.lookAt(p2, pc.Vec3.FORWARD); // Usamos FORWARD para alinear en el plano XY

      this.app.root.addChild(segment);
    }
  }

  update(dt: number) {
    this.spawnTimer += dt;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }

    // Update all enemies
    for (let e of this.enemies) e.update(dt);
    // Remove dead enemies
    this.enemies = this.enemies.filter((e) => !e.isDead);

    // Update towers
    for (let t of this.towers) t.update(dt, this.enemies);

    // ✅ Actualizar y limpiar proyectiles
    for (let p of this.projectiles) p.update(dt);
    this.projectiles = this.projectiles.filter((p) => !p.isDead);
  }

  spawnEnemy() {
    const enemy = new Enemy(this.app, this.path);
    this.enemies.push(enemy);
  }

  addTower(worldPos: pc.Vec3) {
    const tower = new Tower(this.app, worldPos);
    this.towers.push(tower);
  }

  // ✅ Método para añadir un proyectil
  addProjectile(projectile: Projectile) {
    this.projectiles.push(projectile);
  }
}