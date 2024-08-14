import { writable } from 'svelte/store';

export const surveySlide = writable(0);
export const surveyUserId = writable<string | null>(null);
export const surveyFinished = writable(false);
export const surveyQuestion = writable(new Set([0]));
export const surveyAllowValidations = writable(true);

export const resetSurvey = () => {
  surveySlide.set(0);
  surveyUserId.set(null);
  surveyFinished.set(false);
  surveyQuestion.set(new Set([0]));
  surveyAllowValidations.set(true);
};