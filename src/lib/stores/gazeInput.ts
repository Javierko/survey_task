import {
	GazeManager,
	type GazeDataPoint,
	type GazeInput,
	type GazeInputConfig,
	type GazeInputConfigDummy,
	type GazeInputConfigEyelogic,
	type GazeInputConfigGazePoint
} from 'develex-js-sdk';
import { get, writable } from 'svelte/store';
import { SurveyState, surveyState, surveyUserId } from './surveyTask';
import pointRepository from '$lib/database/repositories/point.repository';
import { addFixationEvent } from '$lib/utils/fixationEvent';

export enum GazeState {
	DISCONNECTED,
	CONNECTING,
	CONNECTED,
	ERROR
}

export const dummyConfig: GazeInputConfigDummy = {
	tracker: 'dummy',
	fixationDetection: 'idt',
	frequency: 30,
	precisionMinimalError: 0.5,
	precisionMaximumError: 1.5,
	precisionDecayRate: 0.5
};

export const gazePointConfig: GazeInputConfigGazePoint = {
	tracker: 'gazepoint',
	fixationDetection: 'device',
	uri: 'ws://localhost:13892'
};

export const eyelogicConfig: GazeInputConfigEyelogic = {
	tracker: 'eyelogic',
	fixationDetection: 'idt',
	uri: 'ws://localhost:13892'
};

export const gazeManagerStore = writable<GazeManager>(new GazeManager());

export const gazeState = writable<GazeState>(GazeState.DISCONNECTED);
export const gazeValidation = writable(false);
export const gazeStopTimeout = writable<number | null>(null);
export const gazeStop = writable(false);
export const gazeLatestConfig = writable<GazeInputConfig | null>(null);

export const setupGazeInput = async (
	config: GazeInputConfig,
	mouseEvent: MouseEvent,
	window: Window
) => {
	gazeManagerStore.update((gazeManager) => {
		gazeManager.createInput(config);
		gazeManager.setWindowCalibration(mouseEvent, window);

		return gazeManager;
	});

	gazeState.set(GazeState.CONNECTING);
	gazeLatestConfig.set(config);

	const currentGazeManager = get(gazeManagerStore);

	await currentGazeManager.open();
	await currentGazeManager.connect();

	currentGazeManager.on('inputData', onDataRecieve);
	currentGazeManager.on('fixationObjectStart', addFixationEvent);
	currentGazeManager.on('fixationObjectEnd', addFixationEvent);

	gazeState.set(GazeState.CONNECTED);
};

export const closeGazeInput = async () => {
	const currentGazeManager = get(gazeManagerStore);

	currentGazeManager.off('inputData', onDataRecieve);
	currentGazeManager.off('fixationObjectStart', addFixationEvent);
	currentGazeManager.off('fixationObjectEnd', addFixationEvent);

	currentGazeManager.off('inputData', onDataRecieve);
	currentGazeManager.off('fixationObjectStart', addFixationEvent);
	currentGazeManager.off('fixationObjectEnd', addFixationEvent);

	if (currentGazeManager.input != null) {
		await currentGazeManager.disconnect();
		await currentGazeManager.close();
	}

	gazeState.set(GazeState.DISCONNECTED);
};

const onDataRecieve = async (point: GazeDataPoint) => {
	const userId = get(surveyUserId);
	const state = get(surveyState);

	if (!userId || state == SurveyState.Finished || state == SurveyState.PitStop) {
		return;
	}

	await pointRepository.create({ ...point, userId: userId });
};
