import type { SurveyStartedWithType } from '@/stores/surveyTask';

export interface Participant {
	IdentityId: string;
	Token: string;
	StartedWith: SurveyStartedWithType;
}
