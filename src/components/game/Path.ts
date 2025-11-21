import * as pc from "playcanvas";

export class Path {
  points: pc.Vec3[];

  constructor(points: pc.Vec3[]) {
    this.points = points;
  }

  getPointAt(t: number): pc.Vec3 {
    const count = this.points.length - 1;
    const scaled = t * count;
    const i = Math.floor(scaled);

    if (i >= count) return this.points[count].clone();

    const a = this.points[i];
    const b = this.points[i + 1];
    const localT = scaled - i;

    return new pc.Vec3().lerp(a, b, localT);
  }
}
