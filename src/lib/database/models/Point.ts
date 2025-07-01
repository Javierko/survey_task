import type { GazeDataPoint } from 'develex-js-sdk';

export interface Point extends GazeDataPoint {
	id?: number;
	userId: string;
}
