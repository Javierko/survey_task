import { createGazeInput, type GazeDataPoint, type GazeInput, type GazeInputConfig } from '@473783/develex-core';
import { get, writable } from 'svelte/store';
import { surveyUserId } from './surveyTask';
import pointRepository from '$lib/database/repositories/point.repository';

export enum GazeState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR
};

export const gazeInput = writable<GazeInput<GazeInputConfig> | null>(null);
export const gazeState = writable<GazeState>(GazeState.DISCONNECTED);
export const gazeValidation = writable(true);

export const setupGazeInput = async (config: GazeInputConfig, mouseEvent: MouseEvent, window: Window) => {
  if (get(gazeInput)) {
    return;
  }

  gazeState.set(GazeState.CONNECTING);

  const newGazeInput = createGazeInput<GazeInputConfig>(config);
  newGazeInput.setWindowCalibration(mouseEvent, window);

  await newGazeInput.connect();

  newGazeInput.on("data", onDataRecieve);

  gazeInput.set(newGazeInput);
  gazeState.set(GazeState.CONNECTED);
};

export const closeGazeInput = async () => {
  const currentGazeInput = get(gazeInput);

  if (currentGazeInput) {
    currentGazeInput.off("data", onDataRecieve);

    await currentGazeInput.stop();
    await currentGazeInput.disconnect();

    gazeInput.set(null);
    gazeState.set(GazeState.DISCONNECTED);
  }
};

const onDataRecieve = async (point: GazeDataPoint) => {
  const userId = get(surveyUserId);

  if (!userId) {
    return;
  }

  await pointRepository.create({
    ...point,
    userId: userId
  });
};