import { db } from '../database';
import type { Fixation } from '../models/Fixation';

const fixationRepository = {
	async create(data: Fixation): Promise<number | null> {
		try {
			const id = await db.fixations.add({
				...data
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
		return 'id,userId,fixationId,aois,duration,x,y,type,timestamp';
	},
	async toCsv(data: Fixation[]): Promise<string> {
		return data
			.map(
				(x) =>
					`${x.id},${x.userId},${x.fixationId},${x.aois},${x.duration},${x.x},${x.y},${x.type},${x.timestamp}`
			)
			.join('\n');
	}
};

export default fixationRepository;
