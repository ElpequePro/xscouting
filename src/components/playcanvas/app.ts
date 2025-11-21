// src/app/app.ts (Actualizado)

import * as pc from "playcanvas";
import { GameManager } from "../game/GameManager";

// Extiende la interfaz de pc.Application para incluir nuestra propiedad personalizada
declare module "playcanvas" {
  interface Application {
    game: GameManager;
  }
}

export function createPcApp(canvas: HTMLCanvasElement) {
  const app = new pc.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: new pc.TouchDevice(canvas),
    keyboard: new pc.Keyboard(window),
  });

  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  // Basic scene
  app.scene.ambientLight = new pc.Color(1, 1, 1);

  // Camera
  const camera = new pc.Entity("Camera");
  camera.addComponent("camera", {
    clearColor: new pc.Color(0.05, 0.05, 0.07),
  });
  camera.setLocalPosition(0, 20, 25);
  camera.lookAt(0, 0, 0);
  app.root.addChild(camera);

  // Light
  const light = new pc.Entity("Light");
  light.addComponent("light", { type: "directional" });
  light.setLocalEulerAngles(45, 45, 0);
  app.root.addChild(light);
  
  // ✅ CORRECCIÓN 1: Suelo con color de campo (Verde Oscuro)
  const ground = new pc.Entity("Ground");
  const groundMat = new pc.StandardMaterial();
  groundMat.diffuse = new pc.Color(0.2, 0.6, 0.2); // Tono de verde
  groundMat.update();

  ground.addComponent("render", {
    type: "box",
    halfExtents: new pc.Vec3(50, 0.1, 50),
    castShadows: false,
    material: groundMat // Usamos el nuevo material verde
  });
  ground.setLocalPosition(0, -0.1, 0);
  app.root.addChild(ground);


  // Initialize game manager
  app.game = new GameManager(app);

  return app;
}