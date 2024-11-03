import { db } from '../database';
import type { Fixation } from '../models/Fixation';

const fixationRepository = {
  async create(data: Fixation): Promise<number | null> {
    try {
      const id = await db.fixations.add({
        ...data,
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async readMany(userId: string): Promise<Fixation[] | null> {
    try {
      const fixations = await db.fixations.where('userId').equals(userId).toArray();

      return fixations;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  csvHeader(): string {
    return 'id,userId,fixationId,aois,duration,gazeData.x,gazeData.y,gazeData.xL,gazeData.yL,gazeData.xR,gazeData.yR,type,timestamp';
  },
  async toCsv(data: Fixation[]): Promise<string> {
    return data.map(x => `${x.id},${x.userId},${x.fixationId},${x.aois},${x.duration},${x.gazeData.x},${x.gazeData.y},${x.gazeData.xL},${x.gazeData.yL},${x.gazeData.xR},${x.gazeData.yR},${x.type},${x.timestamp}`).join("\n");
  }
};

export default fixationRepository;
