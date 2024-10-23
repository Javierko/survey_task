import type { SurveyStartType } from '$lib/database/models/User';
import { get, writable } from 'svelte/store';

export enum SurveyState {
  None,
  Demographic,
  FirstPhase,
  PitStop,
  SecondPhase,
  Finished
};

export interface UserData {
  identifier: string;
  age: number;
  gender: string;
  experience: string;
};

export const surveyState = writable<SurveyState>(SurveyState.None);
export const surveySlide = writable(0);
export const surveyUserId = writable<string | null>(null);
export const surveyQuestion = writable(new Set([0]));
export const surveyAllowValidations = writable(true);
export const surveyUserData = writable<UserData>({
  identifier: "",
  age: 0,
  gender: "",
  experience: ""
});
export const surveyCurrentType = writable<SurveyStartType>("many");
export const surveyStage = writable(0);

export const resetSurvey = () => {
  surveySlide.set(0);
  surveyUserId.set(null);
  surveyQuestion.set(new Set([0]));
  surveyAllowValidations.set(true);
  surveyCurrentType.set("many");
  surveyState.set(SurveyState.None);
  surveyUserData.set({
    identifier: "",
    age: 0,
    gender: "",
    experience: ""
  });
};

export const switchCurrentType = (): SurveyStartType => {
  surveyCurrentType.update((prev) => prev === "many" ? "one" : "many");
  return get(surveyCurrentType);
};