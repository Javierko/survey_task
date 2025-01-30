import type { SurveyStartedWithType } from "@/stores/surveyTask";

export interface Participant {
    Token: string;
    StartedWith: SurveyStartedWithType;
};