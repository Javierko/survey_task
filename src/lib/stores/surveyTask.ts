import { writable } from "svelte/store";

export enum SurveyState {
    None,
    Started
};

export interface SurveyOptionClick {
    aoiId: string;
    x: number;
    y: number;
    value: number;
    timestamp: number;
};

export const surveyState = writable<SurveyState>(SurveyState.None);
export const surveySlide = writable(0);
export const surveyQuestion = writable(new Set([0]));
export const surveyStage = writable(0);
export const surveyCurrentType = writable<"many" | "one">("many");