import { saveToLocalStorage } from '@/services/localStorageService';
import { get, writable } from 'svelte/store';

export enum SurveyState {
	None,
	Demographic,
	Started,
	Middle,
	TypeSwitched,
	Finished
}

export interface SurveyOptionClick {
	aoiId: string;
	x: number;
	y: number;
	value: number;
	timestamp: number;
}

export type SurveyStartedWithType = 'many' | 'one';

export interface SurveyManager {
	state: SurveyState;
	slide: number;
	type: SurveyStartedWithType;
}

export const surveyUserToken = writable<string | null>(null);
export const surveyQuestion = writable(new Set([0]));

const createSurveyManager = () => {
	const { subscribe, set, update } = writable<SurveyManager>({
		state: SurveyState.None,
		slide: 0,
		type: 'many'
	});

	return {
		subscribe,
		set,
		update,
		reset: () => set({ state: SurveyState.None, slide: 0, type: 'many' }),
		setState: (state: SurveyState) => update((prev) => ({ ...prev, state })),
		setSlide: (slide: number) => update((prev) => ({ ...prev, slide })),
		setType: (type: SurveyStartedWithType) => update((prev) => ({ ...prev, type })),
		switchType: () => update((prev) => ({ ...prev, type: prev.type === 'many' ? 'one' : 'many' })),
		save: () => {
			const manager = get(surveyManager);

			saveToLocalStorage(
				'surveyManager',
				{
					state: manager.state,
					slide: manager.slide,
					type: manager.type
				},
				3600
			);
		}
	};
};

export const surveyManager = createSurveyManager();
