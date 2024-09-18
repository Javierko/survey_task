import type { GazeDataPointWithFixation } from '@473783/develex-core';

export interface Fixation {
  id?: number;
  userId: string;
  fixationId: number;
  aois: string;
  duration: number;
  gazeData: GazeDataPointWithFixation;
  type: 'fixationObjectProgress' | 'fixationObjectEnd' | 'fixationObjectStart';
  timestamp: number;
};