// src/entities/Tower.ts
import * as pc from "playcanvas";
import { Enemy } from "./Enemy";
import { Projectile } from "./Projectile";

export class Tower {
  app: pc.Application;
  entity: pc.Entity;

  range = 6;
  fireRate = 0.8;
  fireTimer = 0;

  constructor(app: pc.Application, pos: pc.Vec3) {
    this.app = app;

    this.entity = this.createEntity();
    this.entity.setPosition(pos);

    app.root.addChild(this.entity);
  }

  createEntity() {
    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(0.3, 0.8, 1);
    mat.update();

    const mesh = pc.Mesh.fromGeometry(this.app.graphicsDevice, new pc.CylinderGeometry({
      height: 1,
      radius: 0.7,
    }));

    const entity = new pc.Entity("Tower");
    entity.addComponent("render", {
      mesh: mesh,
      material: mat
    });


    return entity;
  }

  update(dt: number, enemies: Enemy[]) {
    this.fireTimer += dt;

    if (this.fireTimer < this.fireRate) return;

    const target = enemies.find((e) =>
      e.entity.getPosition().distance(this.entity.getPosition()) <= this.range
    );

    if (!target) return;

    this.fireTimer = 0;

    // ✅ Crea el proyectil y se lo pasa al GameManager para que lo actualice
    const newProjectile = new Projectile(this.app, this.entity.getPosition().clone(), target);
    this.app.game.addProjectile(newProjectile);
  }
}