// src/entities/Projectile.ts
import * as pc from "playcanvas";
import { Enemy } from "./Enemy";

export class Projectile {
  app: pc.Application;
  entity: pc.Entity;

  speed = 12;
  target: Enemy;
  isDead = false; 

  constructor(app: pc.Application, startPos: pc.Vec3, target: Enemy) {
    this.app = app;
    this.target = target;

    this.entity = this.createEntity();
    this.entity.setPosition(startPos);

    app.root.addChild(this.entity);
  }

  createEntity() {
    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(1, 1, 0);
    mat.update();

    const entity = new pc.Entity("Projectile");
    
    // ✅ CORRECCIÓN: Usar la primitiva 'sphere' directamente
    entity.addComponent("render", {
      type: "sphere",
      material: mat
    });

    // Ajustar escala para que el radio sea 0.2 (escala de 0.4 en PlayCanvas)
    entity.setLocalScale(0.4, 0.4, 0.4);

    return entity;
  }

  update(dt: number) {
    if (this.isDead || this.target.isDead) { 
      this.destroy(); 
      return;
    }

    const pos = this.entity.getPosition();
    const targetPos = this.target.entity.getPosition();

    const dir = targetPos.clone().sub(pos).normalize();
    pos.add(dir.mulScalar(dt * this.speed));
    this.entity.setPosition(pos);

    if (pos.distance(targetPos) < 0.4) {
      this.target.hit(1);
      this.destroy();
    }
  }
  
  destroy() {
      if (!this.isDead) {
          this.isDead = true;
          this.entity.destroy();
      }
  }
}