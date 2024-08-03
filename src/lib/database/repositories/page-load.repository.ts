import { db } from '../database';
import type { PageLoad } from '../models/PageLoad';

const pageLoadRepository = {
  async create(data: PageLoad): Promise<number | null> {
    try {
      const id = await db.pageLoads.add({
        ...data,
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async readMany(userId: string): Promise<PageLoad[] | null> {
    try {
      const pageLoads = await db.pageLoads.where('userId').equals(userId).toArray();

      return pageLoads;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  csvHeader(): string {
    return 'id,userId,slide,timestamp';
  },
  async toCsv(data: PageLoad[]): Promise<string> {
    return data.map(x => `${x.id},${x.userId},${x.slide},${x.timestamp}`).join("\n");
  }
};

export default pageLoadRepository;