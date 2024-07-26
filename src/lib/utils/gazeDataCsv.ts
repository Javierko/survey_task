import type { ETGazeData } from '$lib/core/ETGazeData/ETGazeData';

export const gazeDataCsvHeader = 'id,userId,x,y,fixStart,fixDuration,isValid,isNewFix,timestamp';

export const exportGazeDataToCsv = (data: ETGazeData[]) => {
  return data.map(x => `${x.fixID},${x.userId},${x.x},${x.y},${x.fixStart},${x.fixDuration},${x.isValid},${x.isNewFix},${x.timestamp}`).join("\n");
};