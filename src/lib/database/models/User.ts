export interface User {
  id: string;
  identifier: string;
  age: number;
  gender: string;
  experience: string;
  startedWith: SurveyStartType;
  resolution: {
    width: number;
    height: number;
    innerWidth: number;
    innerHeight: number;
  };
  userAgent: string;
  timestamp: number;
};

export type SurveyStartType = "one" | "many";
