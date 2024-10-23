import { db } from '../database';
import type { Point } from '../models/Point';

const pointRepository = {
  async getAll(): Promise<Point[]> {
    try {
      const points = await db.points.toArray();

      return points;
    } catch (e) {
      console.error(e);

      return [];
    }
  },
  async create(data: Point): Promise<string | null> {
    try {
      const id = await db.points.add({
        ...data
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async read(id: string): Promise<Point | null> {
    try {
      const point = await db.points.get(id);

      return point ?? null;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async readMany(userId: string): Promise<Point[] | null> {
    try {
      const points = await db.points.where('userId').equals(userId).toArray();

      return points;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  csvHeader(): string {
    return 'id,userId,sessionId,timestamp,x,xL,xR,xLScreenRelative,xRScreenRelative,y,yL,yR,yLScreenRelative,yRScreenRelative,validityL,validityR,parseValidity,pupilDiameterL,pupilDiameterR';
  },
  async toCsv(data: Point[]): Promise<string> {
    return data.map(x => `${x.id},${x.userId},${x.sessionId},${x.timestamp},${x.x},${x.xL},${x.xR},${x.xLScreenRelative},${x.xRScreenRelative},${x.y},${x.yL},${x.yR},${x.yLScreenRelative},${x.yRScreenRelative},${x.validityL},${x.validityR},${x.parseValidity},${x.pupilDiameterL},${x.pupilDiameterR}`).join("\n");
  },
};

export default pointRepository;