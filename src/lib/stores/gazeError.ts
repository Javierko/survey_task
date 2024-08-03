import { writable } from 'svelte/store';
import { GazeState, gazeState } from './gazeInput';

export const gazeErrors = writable<string[]>([]);

export const handleGazeError = (event: Event) => {
  const error = event instanceof ErrorEvent ? event.error : event;
  const message: string = error instanceof Error ? error.message : error.toString();

  gazeErrors.update((errorMessages) => [...errorMessages, message]);
  gazeState.set(GazeState.ERROR);
};