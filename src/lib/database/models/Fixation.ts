export interface Fixation {
	id?: number;
	userId: string;
	fixationId: number;
	aois: string;
	duration: number;
	x: number;
	y: number;
	type: 'fixationObjectProgress' | 'fixationObjectEnd' | 'fixationObjectStart';
	timestamp: string;
}
