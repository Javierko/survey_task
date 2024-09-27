import type { SurveyStartType } from '$lib/database/models/User';
import { get, writable } from 'svelte/store';

export enum SurveyState {
  FirstPhase,
  PitStop,
  SecondPhase,
  Finished
};

export const surveyState = writable<SurveyState>(SurveyState.FirstPhase);
export const surveySlide = writable(0);
export const surveyUserId = writable<string | null>(null);
export const surveyQuestion = writable(new Set([0]));
export const surveyAllowValidations = writable(true);
export const surveyIdentifier = writable<string>("");
export const surveyStartWithOnes = writable<boolean>(false);
export const surveyCurrentType = writable<SurveyStartType>("many");

export const resetSurvey = () => {
  surveySlide.set(0);
  surveyUserId.set(null);
  surveyQuestion.set(new Set([0]));
  surveyAllowValidations.set(true);
  surveyIdentifier.set("");
  surveyStartWithOnes.update((prev) => prev ? false : true);
  surveyCurrentType.set(get(surveyStartWithOnes) ? "one" : "many");
  surveyState.set(SurveyState.FirstPhase);
};

export const switchCurrentType = (): SurveyStartType => {
  surveyCurrentType.update((prev) => prev === "many" ? "one" : "many");
  return get(surveyCurrentType);
};