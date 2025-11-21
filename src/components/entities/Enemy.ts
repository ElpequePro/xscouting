// src/entities/Enemy.ts (Actualizado)
import * as pc from "playcanvas";
import { Path } from "../game/Path";

export class Enemy {
  app: pc.Application;
  entity: pc.Entity;
  path: Path;

  t = 0;
  speed = .1;
  radius = .5;
  isDead = false;

  hp = 1;

  constructor(app: pc.Application, path: Path) {
    this.app = app;
    this.path = path;

    this.entity = this.createEntity();
    app.root.addChild(this.entity);
  }

  createEntity() {
    const mat = new pc.StandardMaterial();
    // Establecer un color distinto para el enemigo (Rojo)
    mat.diffuse = new pc.Color(1, 0.3, 0.3);
    mat.update();

    const entity = new pc.Entity("Enemy");
    
    // ✅ CORRECCIÓN 1: Usar la primitiva 'sphere' directamente
    entity.addComponent("render", {
      type: "sphere",
      material: mat,
      castShadows: true, // Permitir sombras para mayor profundidad
      receiveShadows: true,
    });


    // ✅ CORRECCIÓN 2: Asegurar la escala correcta (radio 0.6 requiere escala 1.2)
    entity.setLocalScale(this.radius * 2, this.radius * 2, this.radius * 2);

    return entity;
  }

  update(dt: number) {
    if (this.isDead) {
      this.entity.destroy();
      return;
    }

    this.t += dt * this.speed;

    if (this.t >= 1) {
      // Enemy reached the end
      this.isDead = true;
      this.app.game.lives -= 1; // Asumiendo que esta lógica existe en GameManager
      return;
    }

    const pos = this.path.getPointAt(this.t);
    this.entity.setPosition(pos);
  }

  hit(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.isDead = true;
    }
  }
}