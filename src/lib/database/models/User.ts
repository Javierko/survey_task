export interface User {
  id: string;
  resolution: {
    width: number;
    height: number;
    innerWidth: number;
    innerHeight: number;
  };
  userAgent: string;
  timestamp: number;
};
