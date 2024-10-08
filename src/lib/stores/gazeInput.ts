import { createGazeInput, type GazeDataPoint, type GazeInput, type GazeInputConfig, type GazeInputConfigDummy, type GazeInputConfigGazePoint } from '@473783/develex-core';
import { get, writable } from 'svelte/store';
import { SurveyState, surveyState, surveyUserId } from './surveyTask';
import pointRepository from '$lib/database/repositories/point.repository';

export enum GazeState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR
};

export const dummyConfig: GazeInputConfigDummy = {
  tracker: 'dummy',
  fixationDetection: 'idt',
  frequency: 30,
  precisionMinimalError: 0.5,
  precisionMaximumError: 1.5,
  precisionDecayRate: 0.5
};

export const gazePointConfig: GazeInputConfigGazePoint = {
  tracker: 'opengaze',
  fixationDetection: 'idt',
  uri: 'ws://localhost:13892'
};

export const gazeInput = writable<GazeInput<GazeInputConfig> | null>(null);
export const gazeState = writable<GazeState>(GazeState.DISCONNECTED);
export const gazeValidation = writable(false);
export const gazeStopTimeout = writable<number | null>(null);
export const gazeStop = writable(false);
export const gazeLatestConfig = writable<GazeInputConfig | null>(null);

export const setupGazeInput = async (config: GazeInputConfig, mouseEvent: MouseEvent, window: Window) => {
  if (get(gazeInput)) {
    return;
  }

  gazeState.set(GazeState.CONNECTING);
  gazeLatestConfig.set(config);

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

    await currentGazeInput.disconnect();

    gazeInput.set(null);
    gazeState.set(GazeState.DISCONNECTED);
  }
};

const onDataRecieve = async (point: GazeDataPoint) => {
  const userId = get(surveyUserId);
  const state = get(surveyState);

  if (!userId || state == SurveyState.Finished || state == SurveyState.PitStop) {
    return;
  }

  await pointRepository.create({
    ...point,
    userId: userId
  });
};