import { get, writable } from "svelte/store";

export enum SurveyState {
    None,
    Started,
    TypeSwitched,
    Finished
};

export interface SurveyOptionClick {
    aoiId: string;
    x: number;
    y: number;
    value: number;
    timestamp: number;
};

export type SurveyStartedWithType = "many" | "one";

export const surveyUserToken = writable<string | null>(null);
export const surveyState = writable<SurveyState>(SurveyState.None);
export const surveySlide = writable(0);
export const surveyQuestion = writable(new Set([0]));
export const surveyStage = writable(0);
export const surveyCurrentType = writable<SurveyStartedWithType>("many");

export const switchCurrentType = (): SurveyStartedWithType => {
    surveyCurrentType.update((prev) => prev === "many" ? "one" : "many");
    
    return get(surveyCurrentType);
  };
  