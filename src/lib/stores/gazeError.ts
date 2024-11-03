import { get, writable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { gazeState, GazeState } from './gazeInput';

export const gazeErrors = writable<string[]>([]);

export const handleGazeError = (event: Event) => {
  const error = event instanceof ErrorEvent ? event.error : event;
  const message: string = error instanceof Error ? error.message : error.toString();

  toast.error(message);

  gazeErrors.update((errorMessages) => [...errorMessages, message]);

  if (get(gazeState) == GazeState.CONNECTING) {
    gazeState.set(GazeState.DISCONNECTED);
  }
};