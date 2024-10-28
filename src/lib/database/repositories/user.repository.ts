import { db } from '../database';
import type { User } from '../models/User';

const userRepository = {
  async getAll(): Promise<User[]> {
    try {
      const users = await db.users.toArray();

      return users;
    } catch (e) {
      console.error(e);

      return [];
    }
  },
  async getLastUser(): Promise<User | null> {
    try {
      const user = await db.users.orderBy('timestamp').last();

      return user ?? null;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async create(data: User): Promise<string | null> {
    try {
      const id = await db.users.add({
        ...data
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async read(id: string): Promise<User | null> {
    try {
      const user = await db.users.get(id);

      return user ?? null;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async getByIdentifier(identifier: string): Promise<User | null> {
    try {
      const user = await db.users.where('identifier').equals(identifier).first();

      return user ?? null;
    } catch (e) {
      console.error(e);

      return null
    }
  },
  csvHeader(): string {
    return 'id,identifier,startedWith,resolution.width,resolution.height,resolution.innerWidth,resolution.innerHeight,userAgent,timestamp';
  },
  async toCsv(data: User): Promise<string> {
    return `${data.id},${data.identifier},${data.startedWith},${data.resolution.width},${data.resolution.height},${data.resolution.innerWidth},${data.resolution.innerHeight},"${data.userAgent}",${data.timestamp}`;
  },
};

export default userRepository;